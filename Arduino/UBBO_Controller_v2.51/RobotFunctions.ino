/////////////
// Robot Functions
///////////


int getProximitySensorStatus(int pin){ // read proxy sensors using correct type (analog / digital) and put it in cache
    // return true = nothing detected
    static unsigned long lastTime = 0;
    if(lastTime == 0 || lastTime < millis() - 50) { // run only every X millis
        if(FRONT_PROX_SENSOR_IS_ANALOG) {FRONT_PROX_SENSOR_VALUE = analogRead(FRONT_PROX_SENSOR_PIN) > FRONT_PROX_SENSOR_ANALOG_DISTANCE;}else{FRONT_PROX_SENSOR_VALUE = digitalRead(FRONT_PROX_SENSOR_PIN) == 1;}
        if(LEFT_PROX_SENSOR_IS_ANALOG) {LEFT_PROX_SENSOR_VALUE = analogRead(LEFT_PROX_SENSOR_PIN) > LEFT_PROX_SENSOR_ANALOG_DISTANCE;}else{LEFT_PROX_SENSOR_VALUE = digitalRead(LEFT_PROX_SENSOR_PIN) == 1;}
        if(BACK_PROX_SENSOR_IS_ANALOG) {BACK_PROX_SENSOR_VALUE = analogRead(BACK_PROX_SENSOR_PIN) > BACK_PROX_SENSOR_ANALOG_DISTANCE;}else{BACK_PROX_SENSOR_VALUE = digitalRead(BACK_PROX_SENSOR_PIN) == 1;}
        if(RIGHT_PROX_SENSOR_IS_ANALOG) {RIGHT_PROX_SENSOR_VALUE = analogRead(RIGHT_PROX_SENSOR_PIN) > RIGHT_PROX_SENSOR_ANALOG_DISTANCE;}else{RIGHT_PROX_SENSOR_VALUE = digitalRead(RIGHT_PROX_SENSOR_PIN) == 1;}
        lastTime = millis();
    }
    switch (pin) { // get value
        case FRONT_PROX_SENSOR_PIN: return FRONT_PROX_SENSOR_VALUE;
        case LEFT_PROX_SENSOR_PIN: return LEFT_PROX_SENSOR_VALUE;
        case BACK_PROX_SENSOR_PIN: return BACK_PROX_SENSOR_VALUE;
        case RIGHT_PROX_SENSOR_PIN: return RIGHT_PROX_SENSOR_VALUE;
    }
    return false;
}

void checkProximitySensors()
{
    // for first call of the function
    static boolean bFirstCall = true;
    static boolean bPreviousFrontProxSensorStatus = false;
    static boolean bPreviousBackProxSensorStatus = false;
    static boolean bPreviousLeftProxSensorStatus = false;
    static boolean bPreviousRightProxSensorStatus = false;

    //Do the job only if proximity detection is set
    if (bProximityDetection)
    {
        boolean bFrontProxSensorStatus = getProximitySensorStatus(FRONT_PROX_SENSOR_PIN);
        boolean bBackProxSensorStatus = getProximitySensorStatus(BACK_PROX_SENSOR_PIN);
        boolean bLeftProxSensorStatus = getProximitySensorStatus(LEFT_PROX_SENSOR_PIN);
        boolean bRightProxSensorStatus = getProximitySensorStatus(RIGHT_PROX_SENSOR_PIN);
        static unsigned long lastSentStatusAt = 0;


        //Send sensor status at first call
        if(bFirstCall || millis() - 200 > lastSentStatusAt) { // anti flood
            if (bFirstCall)
            {
                sendSensorStatus(FRONT_PROX_SENSOR_ID,bFrontProxSensorStatus);
                sendSensorStatus(BACK_PROX_SENSOR_ID,bBackProxSensorStatus);
                sendSensorStatus(LEFT_PROX_SENSOR_ID,bLeftProxSensorStatus);
                sendSensorStatus(RIGHT_PROX_SENSOR_ID,bRightProxSensorStatus);
                bFirstCall = false;
            }
            else //Send satuts only if changed
            {
                if (bPreviousFrontProxSensorStatus != bFrontProxSensorStatus) { sendSensorStatus(FRONT_PROX_SENSOR_ID,bFrontProxSensorStatus); lastSentStatusAt = millis();}
                if (bPreviousBackProxSensorStatus != bBackProxSensorStatus) { sendSensorStatus(BACK_PROX_SENSOR_ID,bBackProxSensorStatus); lastSentStatusAt = millis();}
                if (bPreviousLeftProxSensorStatus != bLeftProxSensorStatus) { sendSensorStatus(LEFT_PROX_SENSOR_ID,bLeftProxSensorStatus); lastSentStatusAt = millis();}
                if (bPreviousRightProxSensorStatus != bRightProxSensorStatus) { sendSensorStatus(RIGHT_PROX_SENSOR_ID,bRightProxSensorStatus); lastSentStatusAt = millis();}
            }
            bPreviousFrontProxSensorStatus = bFrontProxSensorStatus;
            bPreviousBackProxSensorStatus = bBackProxSensorStatus;
            bPreviousLeftProxSensorStatus = bLeftProxSensorStatus;
            bPreviousRightProxSensorStatus = bRightProxSensorStatus;
        }

        //Check during movement and stop if necessary
        if ((byPreviousCmd == GO_FORWARD) && !bFrontProxSensorStatus && ((iPreviousAngle > 23) && (iPreviousAngle < 158))) //
        {
            //dbg_println("Stop movement! Obstacle front");
            byCmd = STOP;
        }
        else if ((byPreviousCmd == GO_BACKWARD) && !bBackProxSensorStatus  && ((iPreviousAngle > 203) && (iPreviousAngle < 338)))//
        {
            //dbg_println("Stop movement! Obstacle Back");
            byCmd = STOP;
        }
        else if ((byPreviousCmd == TRANSLATE_LEFT) && !bLeftProxSensorStatus)
        {
            //dbg_println("Stop movement! Obstacle front");
            byCmd = STOP;
        }
        else if ((byPreviousCmd == TRANSLATE_RIGHT) && !bRightProxSensorStatus)
        {
            //dbg_println("Stop movement! Obstacle right");
            byCmd = STOP;
        }
    }
}

void moveRobot(int iReqValue)
{
//    Forward   | 90
//   |
//   180 - - + - - 0
//   |
//        Backward   | 270

    boolean bMove = false;
    // map value received from 0->127 to 0->180.
    int iAngle = map(iReqValue,0,255,0,360);

    //dbg_print("iReqValue: ");
    //dbg_print(iReqValue);
    //dbg_print(" - iAngle: ");
    //dbg_println(iAngle);

    //dbg_print("byCmd: ");
    //dbg_print(byCmd);
    //dbg_print(". byPreviousCmd: ");
    //dbg_println(byPreviousCmd);
    /*
    //Check front proximity sensor
    if ((bProximityDetection) && ((getProximitySensorStatus(FRONT_PROX_SENSOR_PIN) == 0) && (byCmd == GO_FORWARD)) && ((iAngle > 23) && (iAngle < 158)) )
    {
        Ubbo.doMovement(Omni4WD::STAT_STOP);
        //dbg_println("Stop");
        //dbg_println("Forbidden movement! Obstacle Front");
    }
    //Check back proximity sensor
    else if ((bProximityDetection) && ((getProximitySensorStatus(BACK_PROX_SENSOR_PIN) == 0) && (byCmd == GO_BACKWARD)) && ((iAngle > 203) && (iAngle < 338)) )
    {
        Ubbo.doMovement(Omni4WD::STAT_STOP);
        //dbg_println("Stop");
        //dbg_println("Forbidden movement! Obstacle Back");
    }
    else
    {*/
        //Turn Right
        if (((iAngle >= 0) && (iAngle < 23)) && (( byCmd != byPreviousCmd) || !((iPreviousAngle >= 0) && (iPreviousAngle < 23))))
        {
            Ubbo.doMovement(Omni4WD::STAT_TURN_RIGHT, iSpeedTurn);
            bMove = true;
            //dbg_print("turn right angle: ");
            //dbg_println(iAngle);
        }
        //Turn up right
        else if (((iAngle >= 23) && (iAngle < 68)) && (( byCmd != byPreviousCmd) || !((iPreviousAngle >= 23) && (iPreviousAngle < 68))))
        {
            Ubbo.doMovement(Omni4WD::STAT_TURN_UPRIGHT, iSpeedMediumTurn);
            bMove = true;
            //dbg_print("turn up right angle: ");
            //dbg_println(iAngle);
        }
        //Go Forward
        else if (((iAngle >= 68) && (iAngle < 113)) && (( byCmd != byPreviousCmd) || !((iPreviousAngle >= 68) && (iPreviousAngle < 113))))
        {
            Ubbo.doMovement(Omni4WD::STAT_MOVE_FORWARD, iSpeed);
            bMove = true;
            //dbg_print("Forward angle: ");
            //dbg_print(iAngle);
        }
        else if (((iAngle >= 113) && (iAngle <=158)) && (( byCmd != byPreviousCmd) || !((iPreviousAngle >= 113) && (iPreviousAngle <= 158))))
        {
            Ubbo.doMovement(Omni4WD::STAT_TURN_UPLEFT, iSpeedMediumTurn);
            bMove = true;
            //dbg_print("turn up left angle: ");
            //dbg_println(iAngle);
        }
        else if (((iAngle > 158) && (iAngle <=203)) && (( byCmd != byPreviousCmd) || !((iPreviousAngle > 158) && (iPreviousAngle <= 203))))
        {
            Ubbo.doMovement(Omni4WD::STAT_TURN_LEFT, iSpeedTurn);
            bMove = true;
            //dbg_print("turn left angle: ");
            //dbg_println(iAngle);
        }
        else if (((iAngle >= 203) && (iAngle < 248)) && (( byCmd != byPreviousCmd) || !((iPreviousAngle >= 203) && (iPreviousAngle < 248))))
        {
            Ubbo.doMovement(Omni4WD::STAT_TURN_DOWNLEFT, iSpeedMediumTurn);
            bMove = true;
            //dbg_print("turn down left angle: ");
            //dbg_println(iAngle);
        }
        else if (((iAngle >= 248) && (iAngle < 293)) && (( byCmd != byPreviousCmd) || !((iPreviousAngle >= 248) && (iPreviousAngle < 293))))
        {
            Ubbo.doMovement(Omni4WD::STAT_MOVE_BACKWARD, iSpeed);
            bMove = true;
            //dbg_print("Backward angle: ");
            //dbg_println(iAngle);
        }
        else if (((iAngle >= 293) && (iAngle <=338)) && (( byCmd != byPreviousCmd) || !((iPreviousAngle >= 293) && (iPreviousAngle <= 338))))
        {
            Ubbo.doMovement(Omni4WD::STAT_TURN_DOWNRIGHT, iSpeedMediumTurn);
            bMove = true;
            //dbg_print("turn  dow right angle: ");
            //dbg_println(iAngle);
        }
        else if (((iAngle > 338) && (iAngle <=360)) && (( byCmd != byPreviousCmd) || !((iPreviousAngle > 338) && (iPreviousAngle < 360))))
        {
            Ubbo.doMovement(Omni4WD::STAT_TURN_RIGHT, iSpeedTurn);
            bMove = true;
            //dbg_print("turn right angle: ");
            //dbg_println(iAngle);
        }
    //}

    if (bMove)
    {
        //update Previous values
        iPreviousAngle = iAngle;
        byPreviousCmd = byCmd;
    }
}

void  moveTablet(int iReqValue)
{
    int iPos;
    byte iReqPos;

    // map value received from 0->127 to 0->180.
    iReqPos = map(iReqValue,0,127,0,180);
    //dbg_print ("Move tablet to ");
    //dbg_println (iReqPos);
    Serial3.write(STX);
    Serial3.write(iReqPos);
    Serial3.write(ETX);
}

void sendVersionStatus()
{
    HardwareSerial &mySerial = Serial2;

    byte byStatus = VERSION_STATUS;
    byte byDataSize = 0x02;

    mySerial.print(byStatus,HEX);
    mySerial.print(byDataSize,HEX);
    printHex8(mySerial,VER_HIGH_BYTE);
    printHex8(mySerial,VER_LOW_BYTE);
    mySerial.print(END_OF_FRAME_1,HEX);
    mySerial.print(END_OF_FRAME_2,HEX);
    mySerial.println(END_OF_FRAME_3,HEX);
}

void sendBatteryStatus()
{
    HardwareSerial &mySerial = Serial2;

    byte byStatus = BATTERY_STATUS;
    byte byDataSize = 0x01;
    int iBatteryVoltage = 0;

    iBatteryVoltage = map(fBatteryVoltage,0,1023,0,100);

    mySerial.print(byStatus,HEX);
    mySerial.print(byDataSize,HEX);
    printHex8(mySerial,iBatteryVoltage);
    mySerial.print(END_OF_FRAME_1,HEX);
    mySerial.print(END_OF_FRAME_2,HEX);
    mySerial.println(END_OF_FRAME_3,HEX);
}

void sendSensorStatus(int iSensorId, byte byStatus)
{
    byte byCmd = SENSOR_STATUS;
    byte byDataSize = 0x02;

    //delay(100);
    Serial2.print(byCmd,HEX);
    Serial2.print(byDataSize,HEX);
    Serial2.print(iSensorId,HEX);
    //Reverse status 0: no detection 1: detection
    Serial2.print(!byStatus,HEX);
    Serial2.print(END_OF_FRAME_1,HEX);
    Serial2.print(END_OF_FRAME_2,HEX);
    Serial2.println(END_OF_FRAME_3,HEX);

    dbg_print("Send sensor status id : ");
    dbg_print(iSensorId);
    dbg_print(" state : ");
    dbg_println(byStatus);
}
