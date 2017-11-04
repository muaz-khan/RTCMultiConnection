


boolean isDocked()
{
  return digitalRead(DOCKED_DIGITAL_PIN);
}
    // 16.42v => 878 // violet
    // 16.36v => 865
    // 16.71v => 895
    
    // 15.99v => 881 !!??? Orange
    // 16.19v => 892
    // 16.37v => 903
    // 16.64v => 916
    // 16.67v => 916 // 13:50
    // 16.65v => 912 // 14:00
    // 16.62v => 909 // 14:30
    // 16.58v => 907 // 15:00 flip relay =>
    // 16.61v => 911 // 15:00
    // 16.64v => 912 // 15:10
    
void alarmDockStationVoltage()
{
  // use relay to warn us about voltage error
  if ((DOCK_RELAY_PIN > 0) && (analogRead(BATTERY_VOLTAGE_PIN) < BATTERY_VOLTAGE_ALARM))
  {
      for(int i=0; i<10; i++)
      {
          digitalWrite(DOCK_RELAY_PIN, true);
          delay(100);
          digitalWrite(DOCK_RELAY_PIN, false);
          delay(100);
      }
  }
}
void checkDockStationCharger()
{
    // compute avg voltage filter
    if(fBatteryVoltage == 0.0f)
    {
      fBatteryVoltage = analogRead(BATTERY_VOLTAGE_PIN);
    }else
    { // filter
      fBatteryVoltage += (analogRead(BATTERY_VOLTAGE_PIN) - fBatteryVoltage) * 0.01f;
    }
    //Serial.println(fBatteryVoltage);


    // power off charger ?
    static unsigned long lastTimeRun = 0, lastTimeCheck = 0;
    if((DOCK_RELAY_PIN > 0) && (fBatteryVoltage > 0.0f) && (lastTimeRun + DOCK_RELAY_DURATION < millis()))
    {
      lastTimeRun = millis();
      digitalWrite(DOCK_RELAY_PIN, LOW);
      static float fBatteryVoltageRef = 0.0f;
      dbg_print("Bat Voltage : ");
      dbg_println(fBatteryVoltage);
      
      if(lastTimeCheck + DOCK_RELAY_INTERVAL < lastTimeRun)
      {
        lastTimeCheck = lastTimeRun;
        if ((fBatteryVoltageRef == 0.0f) || (fBatteryVoltage > fBatteryVoltageRef))
        { // charging
          fBatteryVoltageRef = fBatteryVoltage;
        }else if(fBatteryVoltage <= (fBatteryVoltageRef - DOCK_THRESHOLD_DISCHARGE))
        { // cut relay
          if(isDocked())digitalWrite(DOCK_RELAY_PIN, HIGH);
          fBatteryVoltageRef = fBatteryVoltage;
        }
      }
    }

    // auto dock station ?
    static unsigned long lastActivity = 0;
    static bool tryed = false;    
    if ((!tryed) && (fBatteryVoltage < AUTO_DOCK_MIN_VOLTAGE) && (fBatteryVoltage > BATTERY_VOLTAGE_ALARM) && ((lastActivity + AUTO_DOCK_IDLE_TIME) < millis()))
    {
      tryed = true;
      backToDockStation();
    }
    if ((byCmd != 0) && (byCmd != STOP))
    {
      lastActivity = millis(); // reset timer
      tryed = false;
    }
}
void setBits(int &target, int bits, bool state)
{
  if(state)
  {
    target |= bits;
  }
  else
  {
    target &= ~bits;
  }
}
void backToDockStation()
{
    int speed_factor = -120;
    unsigned long short_estimation_time = 400;
    
    int moveSpeed = speed_factor;
    int status = 0; // bits : 1=left_signal 2=right_signal 4= 8=proximity 16=left_is_prefered 32=forwarded 64=use_proximity 128=stop loop
    if(isDocked()) status |= 128;
    char nbNoContactError = 0;
    FastIRReceiver::start();
    byCmd = 0; //reset bycmd to catch new GO_HOME signal
    
    Ubbo.setAcceleration(2.0f);
    Ubbo.setDeceleration(2.0f);

   
     //first loop to check for error once the dock is reached, and to prevent function if already docked
    while (!(status & 128)) 
    {
        Ubbo.doMovement(Omni4WD::STAT_STOP);

        status = 0;
        if(bProximityDetection && BACK_PROX_SENSOR_IS_ANALOG) status |= 64;

        unsigned long proxymityAt = 0;
        unsigned long center_proximity_timer = 0;
        unsigned long maxScanTime = 0;
        unsigned long maxTranslateTime = 0;
        unsigned long maxTranslateScanTime = 0;
        unsigned long maxMoveTime = 0;
        
        //as long as dock not reached and (cmd is stop or 0)
        while (!isDocked() && (byCmd == STOP || byCmd == 0) && !(status & 128))
        {
          
            unsigned long now = millis();//record current time (for only one system call to millis)
            unsigned long timeOutAt = now - short_estimation_time;
            serialEvent2();//check if new signal (stop, move forward etc.)

            // check proxymity sensor
            //if(!digitalRead(BACK_PROX_SENSOR_PIN)){
            if(analogRead(BACK_PROX_SENSOR_PIN) < 60)
            {
              proxymityAt = now;
              setBits(status, 8, true);
            }
            
            // status
            if (proxymityAt < timeOutAt){ status &= ~8; }//forget proximity
            setBits(status, 1, infrared_dock_sensor_center.signalAtMillis[0] > timeOutAt);
            setBits(status, 2, infrared_dock_sensor_center.signalAtMillis[1] > timeOutAt);
            setBits(status, 32, center_proximity_timer > timeOutAt);
          
            // speed function of proximity
            if((status & 64) && !(status & 8))
            {
              moveSpeed = speed_factor * 2;
            }
            else
            {
              moveSpeed = speed_factor;
            }

            // define prefered rotation direction
            if (status & 3)
            { //left or right received from center receptor then
                if ((status & 32))
                { // if center has been sensed recently
                    setBits(status, 16, (status & 2));
                } 
                else 
                {
                    setBits(status, 16, !(status & 2));
                }
            }
            else if(!(status & 32))
            { // if center has not been sensed recently
                 setBits(status, 16, infrared_dock_sensor_left.lastSignalAt < infrared_dock_sensor_right.lastSignalAt); // most recent signal
            }
            
            // do action
            if((status & 64) && !(status & 8) && (status & 7))
            { // use proximity sensor && no current proximity && at least one IR signal received, so fast forward
                Ubbo.doMovement(Omni4WD::STAT_MOVE_FORWARD, moveSpeed);
                maxTranslateScanTime = maxTranslateTime = maxScanTime = 0; // reset timeOuts;
            }
            else if ((status & 3) == 3)
            { // we received both, right and left
                Ubbo.doMovement(Omni4WD::STAT_MOVE_FORWARD, moveSpeed);
                center_proximity_timer = now;
                maxTranslateScanTime = maxTranslateTime = maxScanTime = 0; // reset timeOuts;
            } 
            else if ((status & 3) && !(status & 32))
            { // we one (right or left) && !(center has been sensed recently)
                Ubbo.doMovement((status & 1) ? Omni4WD::STAT_TRANSLATE_RIGHT : Omni4WD::STAT_TRANSLATE_LEFT, moveSpeed);
                if(!maxTranslateTime) maxTranslateTime = now + DOCK_TRANSLATE_TO; // set maxTranslateTime to time out
                if(!maxTranslateScanTime) maxTranslateScanTime = now + DOCK_TRANSLATE_SCAN_TO; // set maxTranslateScanTime to time out
                setBits(status, 128, (status & 128) | maxTranslateTime < now); // translate too long, quit
                setBits(status, 128, (status & 128) | maxTranslateScanTime < now); // translateScan too long, quit
                maxScanTime = 0; // reset timeOuts;
            } 
            else 
            { // rotate
                Ubbo.doMovement((status & 16) ? Omni4WD::STAT_TURN_RIGHT : Omni4WD::STAT_TURN_LEFT, moveSpeed);
                if(!maxScanTime) maxScanTime = now + DOCK_SCAN_TO; // set maxScanTime to time out
                if(!maxTranslateScanTime) maxTranslateScanTime = now + DOCK_TRANSLATE_SCAN_TO; // set maxTranslateScanTime to time out
                setBits(status, 128, (status & 128) | maxScanTime < now); // scan too long, quit
                setBits(status, 128, (status & 128) | maxTranslateScanTime < now); // translateScan too long, quit
                maxTranslateTime = 0; // reset timeOuts;
            }
            
            if(!maxMoveTime) maxMoveTime = now + DOCK_MOVE_TO; // set maxMoveTime to time out
            setBits(status, 128, (status & 128) | maxMoveTime < now); // scan too long, quit

            Ubbo.PIDRegulate();
        }

        if(byCmd == GO_BACK_DOCKSTATION){byCmd = 0; setBits(status, 128, true);} // if GO_HOME is recieved one more time, stop and return;

        if (!(status & 128) && (isDocked() || byCmd == STOP || byCmd == 0))
        { // check dock state if no exit signals
            //press contact with dockstation with PWM
            Ubbo.setAllMotorPWM(-20,-20,-20,-20);
            delay(1000); // wait 
            // stop and wait
            Ubbo.doMovement(Omni4WD::STAT_STOP, 0, false);
            Ubbo.delayMS(1000); // wait
            if(!isDocked())
            { //double check. if there is an error, roll back and redo
                if(++nbNoContactError > 3)
                { // too many errors
                  setBits(status, 128, true);
                }
                else
                {
                  Ubbo.doMovement(Omni4WD::STAT_MOVE_FORWARD, 120);
                  Ubbo.delayMS(3000);
                }
            }
            else
            {
              setBits(status, 128, true); // ok, we can exit
            }
        }
        else 
        {//if no error, get out of loop
            setBits(status, 128, true);
        }
    }
    
    Ubbo.doMovement(Omni4WD::STAT_STOP, 0, false);
    Ubbo.setAcceleration(fAcceleration);
    Ubbo.setDeceleration(fDeceleration);
    // stop IRReceiver interrupt
    FastIRReceiver::stop();
}

