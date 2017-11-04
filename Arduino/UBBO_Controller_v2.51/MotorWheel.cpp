/*

 This file is licensed under the Creative Commons 4.0 International (CC BY-NC-SA 4.0). https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode
 
 File: MotorWheel.cpp
 Date: 01/04/2015
 Owner: AXYN Robotique
 
 Release note:
 - V1.1	201104
 1. motorwheel library version 1.1,compatible with maple.
 
 - V1.1.1	201110
 1. Add Acceleration
 
 - V1.2	201207
 1. Double CPR from 12 to 24, Interrupt Type from RISING to CHANGE.
 2. Reduce default sample time from 10ms to 5ms.
 3. Compatible with Namiki 22CL-3501PG80:1, by "#define _NAMIKI_MOTOR" before "#include ...".
 
 - V1.3	201209
 1. R2WD::delayMS(), Omni3WD::delayMS(), Omni4WD::delayMS() are re-implemented, more exactly.
 2. getSpeedRPM(), setSpeedRPM(), getSpeedMMPS(), setSpeedMMPS() are plug-minus/direction sensitive now.
 3. Acceleration is disabled.
 
 - V1.4	201209	Not Released
 1. Increase CPR from 24 to 48 for Faulhaber 2342.
 
 - V1.5	201209	Omni4WD is re-implemented, and now return value of Omni4WD::getSpeedMMPS() is correct.
 
 - v1.6  20150401 Correction to adapt code to plateform specification
 */

/*#ifndef DEBUG_FAX
 #define DEBUG_FAX
 #endif*/

#include "MotorWheel.h"

Motor::Motor(unsigned char _pinPWM,unsigned char _pinDir,
             unsigned char _pinIRQ,unsigned char _pinIRQB,
             struct ISRVars* _isr)
        :
        PID(&speedRPMInput,&speedRPMOutput,&speedRPMDesired,KC,TAUI,TAUD),
        pinPWM(_pinPWM),pinDir(_pinDir),isr(_isr) {
    debug();

    isr->pinIRQ=_pinIRQ;
    isr->pinIRQB=_pinIRQB;

    /*for maple*/
#if defined(BOARD_maple) || defined(BOARD_maple_native) || defined(BOARD_maple_mini)
    pinMode(pinPWM,PWM);
  pinMode(pinDir,OUTPUT);
  pinMode(isr->pinIRQ,INPUT_FLOATING);

  /*for arduino*/
#else
    pinMode(pinPWM,OUTPUT);
    pinMode(pinDir,OUTPUT);
    pinMode(isr->pinIRQ,INPUT);

#endif
    if(isr->pinIRQB!=PIN_UNDEFINED) {
        pinMode(isr->pinIRQB,INPUT);
    }

    PIDDisable();
}

void Motor::setupInterrupt() {
    /*for maple*/
#if defined(BOARD_maple) || defined(BOARD_maple_native) || defined(BOARD_maple_mini)
    attachInterrupt(isr->pinIRQ,isr->ISRfunc,TRIGGER);	// RISING --> CHANGE 201207

  /*for arduino*/
#elif defined(__AVR_ATmega1280__) || defined(__AVR_ATmega2560__)
    if(isr->pinIRQ==2 || isr->pinIRQ==3) attachInterrupt(isr->pinIRQ-2,isr->ISRfunc,TRIGGER);
  else
  {
    if (isr->pinIRQ==18)
      attachInterrupt(5,isr->ISRfunc,TRIGGER);
    else if ( isr->pinIRQ==19 )
      attachInterrupt(4,isr->ISRfunc,TRIGGER);
    else if ( isr->pinIRQ==20 )
      attachInterrupt(3,isr->ISRfunc,TRIGGER);
    else if( isr->pinIRQ==21 )
      attachInterrupt(2,isr->ISRfunc,TRIGGER);
    else
      PCattachInterrupt(isr->pinIRQ,isr->ISRfunc,TRIGGER);	// RISING --> CHANGE 201207
  }
#else
    if(isr->pinIRQ==2 || isr->pinIRQ==3) attachInterrupt(isr->pinIRQ-2,isr->ISRfunc,TRIGGER);
    else {
        PCattachInterrupt(isr->pinIRQ,isr->ISRfunc,TRIGGER);	// RISING --> CHANGE 201207
    }
#endif
}

unsigned char Motor::getPinPWM() const {
    debug();
    return pinPWM;
}
unsigned char Motor::getPinDir() const {
    debug();
    return pinDir;
}
unsigned char Motor::getPinIRQ() const {
    debug();
    return isr->pinIRQ;
}
unsigned char Motor::getPinIRQB() const {
    debug();
    return isr->pinIRQB;
}

unsigned int Motor::runPWM(unsigned int PWM,bool dir,bool saveDir) {
    debug();
    speedPWM=PWM;
    if(saveDir) desiredDirection=dir;
    analogWrite(pinPWM,PWM);
    //FAX digitalWrite(pinDir,dir);
    digitalWrite(pinDir,DIR_INVERSE(dir));
    return PWM;
}
unsigned int Motor::advancePWM(unsigned int PWM) {
    debug();
    return runPWM(PWM,DIR_FORWARD);
}
unsigned int Motor::backoffPWM(unsigned int PWM) {
    debug();
    return runPWM(PWM,DIR_BACKWARD);
}
unsigned int Motor::getPWM() const {
    debug();
    return speedPWM;
}
bool Motor::setDesiredDir(bool dir) {
    debug();
    //runPWM(getPWM(),dir);	// error
    desiredDirection=dir;
    return getDesiredDir();
}
bool Motor::getDesiredDir() const {
    debug();
    return desiredDirection;
}
bool Motor::reverseDesiredDir() {
    debug();
    runPWM(getPWM(),!getDesiredDir());
    return getDesiredDir();
}

bool Motor::getCurrDir() const {
    return isr->currDirection;
}
bool Motor::setCurrDir() {
    if(getPinIRQB()!=PIN_UNDEFINED)
        return isr->currDirection=digitalRead(isr->pinIRQB);
    return false;
}

unsigned int Motor::setSpeedRPM(int speedRPM,bool dir) {
    debug();
    PIDSetSpeedRPMDesired(speedRPM);
    if(speedRPM != 0)setDesiredDir(dir); // only set dir if speed != 0 // solve bounce only in 1 direction
    return abs(getSpeedRPM());
}
// direction sensitive 201208
int Motor::getSpeedRPM() const {
    debug();
    if(getCurrDir()==DIR_FORWARD)
        return SPEEDPPS2SPEEDRPM(isr->speedPPS);
    return -SPEEDPPS2SPEEDRPM(isr->speedPPS);
}
int Motor::setSpeedRPM(int speedRPM) {
    debug();
    if(speedRPM>=0) return setSpeedRPM(speedRPM,DIR_FORWARD);
    else return setSpeedRPM(abs(speedRPM),DIR_BACKWARD);
}

void Motor::disableMotorPin(){
  digitalWrite(pinPWM, 0);
}

bool Motor::PIDGetStatus() const {
    debug();
    return pidCtrl;
}
bool Motor::PIDEnable(float kc,float taui,float taud,unsigned int sampleTime) {
    debug();
    setupInterrupt();
    PIDSetup(kc,taui,taud,sampleTime);
    return pidCtrl=true;
}
bool Motor::PIDDisable() {
    debug();

    return pidCtrl=false;
}
bool Motor::PIDReset() {
    debug();
    if(PIDGetStatus()==false) return false;
    PID::Reset();
    return true;
}

bool Motor::PIDSetup(float kc,float taui,float taud,unsigned int sampleTime) {
    debug();
    PID::SetTunings(kc,taui,taud);
    PID::SetInputLimits(0,MAX_SPEEDRPM);
    PID::SetOutputLimits(0,MAX_SPEEDRPM);
    PID::SetSampleTime(sampleTime);
    PID::SetMode(AUTO);
    return true;
}
unsigned int Motor::PIDSetSpeedRPMDesired(unsigned int speedRPM) {
    debug();
    if(speedRPM>MAX_SPEEDRPM) speedRPMDesired=MAX_SPEEDRPM;
    else speedRPMDesired=speedRPM;
    return PIDGetSpeedRPMDesired();
}
unsigned int Motor::PIDGetSpeedRPMDesired() const {
    debug();
    return speedRPMDesired;
}

bool Motor::PIDRegulate(bool doRegulate) {
    debug();
    if(PIDGetStatus()==false) return false;
    if(getPinIRQB()!=PIN_UNDEFINED && getDesiredDir()!=getCurrDir()) {
        speedRPMInput=-SPEEDPPS2SPEEDRPM(isr->speedPPS);
    }
    else {
        speedRPMInput=SPEEDPPS2SPEEDRPM(isr->speedPPS);
    }

    PID::Compute();
    if(doRegulate && PID::JustCalculated()) {
        speed2DutyCycle+=speedRPMOutput;

        if(speed2DutyCycle>=MAX_SPEEDRPM) speed2DutyCycle=MAX_SPEEDRPM;
        else if(speed2DutyCycle<=-MAX_SPEEDRPM)  speed2DutyCycle=-MAX_SPEEDRPM;
        if(speed2DutyCycle>=0) {
            runPWM(map(speed2DutyCycle,0,MAX_SPEEDRPM,0,MAX_PWM),getDesiredDir(),false);
        }
        else {
            runPWM(map(abs(speed2DutyCycle),0,MAX_SPEEDRPM,0,MAX_PWM),!getDesiredDir(),false);
        }
        return true;
    }
    return false;
}

int Motor::getSpeedPPS() const {
    return isr->speedPPS;
}
long Motor::getCurrPulse() const {
    return isr->pulses;
}
long Motor::setCurrPulse(long _pulse) {
    isr->pulses=_pulse;
    return getCurrPulse();
}
long Motor::resetCurrPulse() {
    return setCurrPulse(0);
}

void Motor::delayMS(unsigned int ms,bool debug) {
    for(unsigned long endTime=millis()+ms;millis()<endTime;) {
        PIDRegulate();
        if(debug && (millis()%500==0)) debugger();
        if(endTime-millis()>=SAMPLETIME) delay(SAMPLETIME);
        else delay(endTime-millis());
    }
}

// to reduce the binary for Atmega168 (16KB), Serial output is disabled
void Motor::debugger() const {
    debug()

#ifdef DEBUG_FAX
    if(!Serial.available()) Serial.begin(Baudrate);

  Serial.print("DesiredDir -> ");
  Serial.println(desiredDirection);
  Serial.print("currDir ->");
  Serial.println(isr->currDirection);

  Serial.print("PWM    -> ");
  Serial.println(speedPWM,DEC);
  Serial.print("Input  -> ");
  Serial.println(speedRPMInput,DEC);
  Serial.print("Output -> ");
  Serial.println(speedRPMOutput,DEC);
  Serial.print("Desired-> ");
  Serial.println(speedRPMDesired,DEC);


#endif

}


GearedMotor::GearedMotor(unsigned char _pinPWM,unsigned char _pinDir,
                         unsigned char _pinIRQ,unsigned char _pinIRQB,
                         struct ISRVars* _isr,unsigned int ratio):
        Motor(_pinPWM,_pinDir,_pinIRQ,_pinIRQB,_isr),_ratio(ratio) {
    debug();
}
unsigned int GearedMotor::getRatio() const {
    return _ratio;
}
unsigned int GearedMotor::setRatio(unsigned int ratio) {
    _ratio=ratio;
    return getRatio();
}

float GearedMotor::getGearedSpeedRPM() const {
    debug();
    return (float)Motor::getSpeedRPM()/getRatio();
}
float GearedMotor::setGearedSpeedRPM(float gearedSpeedRPM,bool dir) {
    debug();
    Motor::setSpeedRPM(abs(round(gearedSpeedRPM*_ratio)),dir);
    return getGearedSpeedRPM();
}
float GearedMotor::setGearedSpeedRPM(float gearedSpeedRPM) {
    debug();
    Motor::setSpeedRPM(round(gearedSpeedRPM*_ratio));
    return getGearedSpeedRPM();
}

MotorWheel::MotorWheel(unsigned char _pinPWM,unsigned char _pinDir,
                       unsigned char _pinIRQ,unsigned char _pinIRQB,
                       struct ISRVars* _isr,
                       unsigned int ratio,unsigned int cirMM):
        GearedMotor(_pinPWM,_pinDir,_pinIRQ,_pinIRQB,_isr,ratio),_cirMM(cirMM) {
    debug();

}
unsigned int MotorWheel::getCirMM() const {
    return _cirMM;
}
unsigned int MotorWheel::setCirMM(unsigned int cirMM) {
    if(cirMM>0) _cirMM=cirMM;
    return getCirMM();
}

int MotorWheel::getSpeedCMPM() const {
    debug();
    return int(GearedMotor::getGearedSpeedRPM()*getCirMM()/10);
}
int MotorWheel::setSpeedCMPM(unsigned int cm,bool dir) {
    debug();
    GearedMotor::setGearedSpeedRPM(cm*10.0/getCirMM(),dir);
    return getSpeedCMPM();
}

int MotorWheel::setSpeedCMPM(int cm) {
    debug();
    GearedMotor::setGearedSpeedRPM(cm*10.0/getCirMM());
    return getSpeedCMPM();
}

int MotorWheel::getSpeedMMPS() const {
    debug();
    return int(getSpeedCMPM()/6);//(mm/sec)/(cm/min) = 6
}

int MotorWheel::setSpeedMMPS(unsigned int mm,bool dir) {
    debug();
    setSpeedCMPM(mm*6,dir);
    return getSpeedMMPS();
}
// direction sensitive, 201208
int MotorWheel::setSpeedMMPS(int mm) {
    debug();
    setSpeedCMPM(mm*6);
    return getSpeedMMPS();
}


