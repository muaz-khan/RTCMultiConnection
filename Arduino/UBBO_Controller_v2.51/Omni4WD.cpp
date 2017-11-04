/*

 This file is licensed under the Creative Commons 4.0 International (CC BY-NC-SA 4.0). https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode
 
 File: Omni4WD.cpp
 Date: 01/04/2015
 Owner: AXYN Robotique
 
 Release note:
 
 - v1.0  20150401 Creation
 - v1.1  20150507 Code Adaptation to plateform specification
 */

#include "Omni4WD.h"


Omni4WD::Omni4WD(MotorWheel* wheelUL,MotorWheel* wheelLL,
                 MotorWheel* wheelLR,MotorWheel* wheelUR,unsigned int wheelspan):
        _wheelUL(wheelUL),_wheelLL(wheelLL),
        _wheelLR(wheelLR),_wheelUR(wheelUR),_wheelspan(wheelspan) {
    setSwitchMotorsStat(MOTORS_FB);
    _curStat = _nextStat = STAT_STOP;
    _curSpeedMMPS = _nextSpeedMMPS = 0;
    acceleration = deceleration = 1.0f;    
}
unsigned char Omni4WD::getSwitchMotorsStat() const {
    return _switchMotorsStat;
}
unsigned char Omni4WD::setSwitchMotorsStat(unsigned char switchMotorsStat) {
    if(MOTORS_FB<=switchMotorsStat && switchMotorsStat<=MOTORS_BF)
        _switchMotorsStat=switchMotorsStat;
    return getSwitchMotorsStat();
}
unsigned char Omni4WD::switchMotors() {
    if(getSwitchMotorsStat()==MOTORS_FB) {
        setSwitchMotorsStat(MOTORS_BF);
    }
    else {
        setSwitchMotorsStat(MOTORS_FB);
    }
    MotorWheel* temp=_wheelUL;
    _wheelUL=_wheelLR;
    _wheelLR=temp;
    temp=_wheelLL;
    _wheelLL=_wheelUR;
    _wheelUR=temp;

    return getSwitchMotorsStat();
}
unsigned char Omni4WD::switchMotorsReset() {
    if(getSwitchMotorsStat()==MOTORS_BF) switchMotors();
    return getSwitchMotorsStat();
}
void Omni4WD::setAllMotorPWM(int UL, int LL, int LR, int UR){
    doMovement(STAT_STOP, 0, false);
    _wheelUL->runPWM(abs(UL),UL > 0 ? DIR_FORWARD : DIR_BACKWARD);
    _wheelLL->runPWM(abs(LL),LL > 0 ? DIR_FORWARD : DIR_BACKWARD);
    _wheelLR->runPWM(abs(LR),LR > 0 ? DIR_FORWARD : DIR_BACKWARD);
    _wheelUR->runPWM(abs(UR),UR > 0 ? DIR_FORWARD : DIR_BACKWARD);
}

unsigned int Omni4WD::getWheelspan() const {
    return _wheelspan;
}

unsigned char Omni4WD::getStat() const {
    return _curStat;
}
unsigned char Omni4WD::setStat(unsigned char stat) {
    if(STAT_UNKNOWN<=stat && stat<=STAT_TURN_UPRIGHT)
        return _curStat=stat;
    else
        return STAT_UNKNOWN;
}
void Omni4WD::setAcceleration(float accel){ acceleration = accel; }
void Omni4WD::setDeceleration(float decel){ deceleration = decel; }
float Omni4WD::getAcceleration(){ return acceleration; }
float Omni4WD::getDeceleration(){ return deceleration; }

// To implememt Omni4WD::move(), MotorWheel::setSpeedMMPS() was re-written as plus-minus/direction sensitive.
int Omni4WD::move(int speedMMPS,float rad,float omega) {
    wheelULSetSpeedMMPS((speedMMPS*sin(rad)+speedMMPS*cos(rad)-omega*getWheelspan()));
    wheelLLSetSpeedMMPS(speedMMPS*sin(rad)-speedMMPS*cos(rad)-omega*getWheelspan());
    wheelLRSetSpeedMMPS((speedMMPS*sin(rad)+speedMMPS*cos(rad)+omega*getWheelspan()));
    wheelURSetSpeedMMPS((speedMMPS*sin(rad)-speedMMPS*cos(rad)+omega*getWheelspan()));
    return getSpeedMMPS();
}
/*

        PI/2
   PI/4  |   3PI/4
        \ /
   0  -- + --   PI
        / \
 7PI/4   |   5PI/4
       3PI/4
 
 */

void Omni4WD::_doMovement(int action, int speedMMPS){ // private
      int moveSpeed = 0; 
      float moveAngle = 0; 
      float moveOmega = 0; 
      switch(action) {
        case STAT_STOP:
          break;
        case STAT_MOVE_FORWARD:
          moveSpeed = speedMMPS;
          moveAngle = PI/2;
          break;
        case STAT_MOVE_BACKWARD:
          moveSpeed = speedMMPS;
          moveAngle = PI*3/2;
          break;
        case STAT_TURN_LEFT:
          moveSpeed = speedMMPS;
          break;
        case STAT_TURN_RIGHT:
          moveSpeed = speedMMPS;
          moveAngle = PI;
          break;
        case STAT_TURN_DOWNLEFT:
          moveSpeed = speedMMPS;
          moveAngle = PI*5/3;
          break;
        case STAT_TURN_UPRIGHT:
          moveSpeed = speedMMPS;
          moveAngle = PI*2/3;
          break;
        case STAT_TURN_UPLEFT:
          moveSpeed = speedMMPS;
          moveAngle = PI/3;
          break;
        case STAT_TURN_DOWNRIGHT:
          moveSpeed = speedMMPS;
          moveAngle = PI*4/3;
          break;
        case STAT_TRANSLATE_LEFT:
          moveOmega = -speedMMPS/(sqrt(pow(getWheelspan()/2,2)*2));
          break;
        case STAT_TRANSLATE_RIGHT:
          moveOmega = speedMMPS/(sqrt(pow(getWheelspan()/2,2)*2));
          break;
        case STAT_UNKNOWN:  // Not implemented yet
          break;
    }
    move(moveSpeed, moveAngle, moveOmega);
}
void Omni4WD::doMovement(int action, int speedMMPS, bool withAccel){
    if(withAccel){ // save request for acceleration
      _nextSpeedMMPS = speedMMPS;
      _nextStat = action;
      PIDRegulate();      
    }else{ // do it now and clear current acceleration
      _curSpeedMMPS = _nextSpeedMMPS = speedMMPS;
      _nextStat = _curStat = action;
      _doMovement(action, speedMMPS);
      if(action == STAT_STOP)disableMotorPin();
    }
}

float Omni4WD::getSpeedRad() const {	// Omega
    unsigned char stat=getStat();
    switch(stat) {
        case STAT_STOP:
        case STAT_MOVE_FORWARD:
        case STAT_MOVE_BACKWARD:
        case STAT_TURN_LEFT:
        case STAT_TURN_RIGHT:
        case STAT_TURN_DOWNLEFT:
        case STAT_TURN_UPRIGHT:
        case STAT_TURN_UPLEFT:
        case STAT_TURN_DOWNRIGHT:
            return 0;
            break;
        case STAT_TRANSLATE_LEFT:
        case STAT_TRANSLATE_RIGHT:
            return wheelULGetSpeedMMPS()/sqrt(pow(getWheelspan()/2,2)*2*2);
            break;
        case STAT_UNKNOWN:	// Not implemented yet
            break;
    }
    return 0;
}
int Omni4WD::getSpeedMMPS() const {
    unsigned char stat=getStat();
    switch(stat) {
        case STAT_STOP:
        case STAT_MOVE_FORWARD:
        case STAT_MOVE_BACKWARD:
        case STAT_TURN_LEFT:
        case STAT_TURN_RIGHT:
            return abs(wheelULGetSpeedMMPS());
            break;
        case STAT_TURN_DOWNLEFT:
        case STAT_TURN_UPRIGHT:
            return abs(wheelULGetSpeedMMPS()/sqrt(2));
            break;
        case STAT_TURN_UPLEFT:
        case STAT_TURN_DOWNRIGHT:
            return abs(wheelLLGetSpeedMMPS()/sqrt(2));
            break;
        case STAT_TRANSLATE_LEFT:
        case STAT_TRANSLATE_RIGHT:
            return abs(getSpeedRad()*sqrt(pow(getWheelspan()/2,2)*2));
            break;
        case STAT_UNKNOWN:	// Not implemented yet
            break;
    }
    return 0;
}

unsigned int Omni4WD::wheelULSetSpeedMMPS(unsigned int speedMMPS,bool dir) {
    return _wheelUL->setSpeedMMPS(speedMMPS,dir);
}
int Omni4WD::wheelULSetSpeedMMPS(int speedMMPS) { // direction sensitive, 201208
    return _wheelUL->setSpeedMMPS(speedMMPS);
}
int Omni4WD::wheelULGetSpeedMMPS() const {
    return _wheelUL->getSpeedMMPS();
}
unsigned int Omni4WD::wheelLLSetSpeedMMPS(unsigned int speedMMPS,bool dir) {
    return _wheelLL->setSpeedMMPS(speedMMPS,dir);
}
int Omni4WD::wheelLLSetSpeedMMPS(int speedMMPS) { // direction sensitive, 201208
    return _wheelLL->setSpeedMMPS(speedMMPS);
}
int Omni4WD::wheelLLGetSpeedMMPS() const {
    return _wheelLL->getSpeedMMPS();
}
unsigned int Omni4WD::wheelLRSetSpeedMMPS(unsigned int speedMMPS,bool dir) {
    return _wheelLR->setSpeedMMPS(speedMMPS,dir);
}
int Omni4WD::wheelLRSetSpeedMMPS(int speedMMPS) { // direction sensitive, 201208
    return _wheelLR->setSpeedMMPS(speedMMPS);
}
int Omni4WD::wheelLRGetSpeedMMPS() const {
    return _wheelLR->getSpeedMMPS();
}
unsigned int Omni4WD::wheelURSetSpeedMMPS(unsigned int speedMMPS,bool dir) {
    return _wheelUR->setSpeedMMPS(speedMMPS,dir);
}
int Omni4WD::wheelURSetSpeedMMPS(int speedMMPS) { // direction sensitive, 201208
    return _wheelUR->setSpeedMMPS(speedMMPS);
}
int Omni4WD::wheelURGetSpeedMMPS() const {
    return _wheelUR->getSpeedMMPS();
}
bool Omni4WD::PIDEnable(float kc,float taui,float taud,unsigned int interval) {
    return _wheelUL->PIDEnable(kc,taui,taud,interval) &&
           _wheelLL->PIDEnable(kc,taui,taud,interval) &&
           _wheelLR->PIDEnable(kc,taui,taud,interval) &&
           _wheelUR->PIDEnable(kc,taui,taud,interval);
}
bool Omni4WD::PIDDisable() {
    setStat(STAT_UNKNOWN);
    _wheelUL->PIDDisable();
    _wheelUL->runPWM(0,DIR_FORWARD);
    _wheelLL->PIDDisable();
    _wheelLL->runPWM(0,DIR_FORWARD);
    _wheelLR->PIDDisable();
    _wheelLR->runPWM(0,DIR_FORWARD);
    _wheelUR->PIDDisable();
    _wheelUR->runPWM(0,DIR_FORWARD);
    return false;
}

void Omni4WD::disableMotorPin(){
    _wheelUL->disableMotorPin();
    _wheelLL->disableMotorPin();
    _wheelLR->disableMotorPin();
    _wheelUR->disableMotorPin();
}

bool Omni4WD::PIDReset() {
    setStat(STAT_UNKNOWN);
    _wheelUL->PIDReset();
    _wheelUL->runPWM(0,DIR_FORWARD);
    _wheelLL->PIDReset();
    _wheelLL->runPWM(0,DIR_FORWARD);
    _wheelLR->PIDReset();
    _wheelLR->runPWM(0,DIR_FORWARD);
    _wheelUR->PIDReset();
    _wheelUR->runPWM(0,DIR_FORWARD);
    return true;
}


bool Omni4WD::PIDGetStatus() {
    return _wheelUL->PIDGetStatus() && _wheelLL->PIDGetStatus() && _wheelLR->PIDGetStatus() && _wheelUR->PIDGetStatus();
}
float Omni4WD::PIDGetP_Param() {
    return _wheelUL->GetP_Param();
}
float Omni4WD::PIDGetI_Param() {
    return _wheelUL->GetI_Param();
}
float Omni4WD::PIDGetD_Param() {
    return _wheelUL->GetD_Param();
}
bool Omni4WD::PIDRegulate() {
    unsigned long tm = millis();
    static unsigned long lastRegulateAt = tm;
    unsigned long elapsed = tm - lastRegulateAt;
    lastRegulateAt = tm;
    float accel = acceleration * elapsed;
    float decel = deceleration * elapsed;
    
    if(_curStat != STAT_UNKNOWN && _nextStat != STAT_UNKNOWN){

       // speeding up
      if(_curStat == _nextStat && _nextStat != STAT_STOP && round(_curSpeedMMPS) != _nextSpeedMMPS){
        // accelerate to _nextSpeedMMPS
        if(_curSpeedMMPS < _nextSpeedMMPS){
          _curSpeedMMPS += accel;
          if(_curSpeedMMPS > _nextSpeedMMPS || round(accel * 100) == 0) _curSpeedMMPS = _nextSpeedMMPS;
        }
        if(_curSpeedMMPS > _nextSpeedMMPS){
          _curSpeedMMPS -= accel;
          if(_curSpeedMMPS < _nextSpeedMMPS || round(accel * 100) == 0) _curSpeedMMPS = _nextSpeedMMPS;
        }
        _doMovement(_nextStat, _curSpeedMMPS);        
      }

      // slow down to stop
      if(_curStat != _nextStat){
        // decelerate
        if(_curSpeedMMPS < 0){
          _curSpeedMMPS += decel;
          if(_curSpeedMMPS > 0 || round(decel * 100) == 0) _curSpeedMMPS = 0;
        }
        if(_curSpeedMMPS > 0){
          _curSpeedMMPS -= decel;
          if(_curSpeedMMPS < 0 || round(decel * 100) == 0) _curSpeedMMPS = 0;
        }

        _doMovement(_curStat, _curSpeedMMPS);
        
        if(round(_curSpeedMMPS) == 0){ // slow to stop complete
          _curStat = _nextStat;
        }
      }
    }
    
    if (round(_curSpeedMMPS) == 0){
      disableMotorPin();
      return 0;
    }
    return _wheelUL->PIDRegulate() && _wheelLL->PIDRegulate() && _wheelLR->PIDRegulate() && _wheelUR->PIDRegulate();
}

void Omni4WD::delayMS(unsigned int ms,bool debug) {		// 201209
    for(unsigned long endTime=millis()+ms;millis()<endTime;)
    {
        PIDRegulate();
        if(debug && (millis()%500==0)) debugger();
        if(endTime-millis()>=SAMPLETIME) delay(SAMPLETIME);
        else delay(endTime-millis());
    }
}

void Omni4WD::debugger(bool wheelULDebug,bool wheelLLDebug,bool wheelLRDebug,bool wheelURDebug) const {
    if(wheelULDebug) _wheelUL->debugger();
    if(wheelLLDebug) _wheelLL->debugger();
    if(wheelLRDebug) _wheelLR->debugger();
    if(wheelURDebug) _wheelUR->debugger();
}
