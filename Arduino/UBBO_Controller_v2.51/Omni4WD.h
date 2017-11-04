/*

 This file is licensed under the Creative Commons 4.0 International (CC BY-NC-SA 4.0). https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode

 File: Omni4WD.h
 Date: 01/04/2015
 Owner: AXYN Robotique

 Release note:

 - v1.0  20150401 Creation
 - v1.1  20150507 Code Adaptation to plateform specification

 */

#include "MotorWheel.h"

#ifndef Omni4WD_H
#define Omni4WD_H


/*
	Mecanum4WD
 			  Front MOTORS_FB
 	wheelUL	\\		// wheelUR


 	wheelLL	//		\\ wheelLR
 			  Back MOTORS_BF
*/


/*
	Omni4WD
 			  Front MOTORS_FB
 	wheelUL	//		\\ wheelUR


 	wheelLL	\\		// wheelLR
 			  Back MOTORS_BF
*/
#ifndef WHEELSPAN
#define WHEELSPAN 300
#endif
class Omni4WD {
public:
    Omni4WD(MotorWheel* wheelUL,MotorWheel* wheelLL,
            MotorWheel* wheelLR,MotorWheel* wheelUR,unsigned int wheelspan=WHEELSPAN);
    unsigned char switchMotors();
    unsigned char switchMotorsReset();

    int move(int speedMMPS,float rad,float omega = 0);
    void doMovement(int action, int speedMMPS=0, bool withAccel = true);

    void setAcceleration(float accel);
    void setDeceleration(float decel);
    float getAcceleration();
    float getDeceleration();

    float getSpeedRad() const;
    int getSpeedMMPS() const;

    int wheelULGetSpeedMMPS() const;
    unsigned int wheelULSetSpeedMMPS(unsigned int speedMMPS,bool dir);
    int wheelULSetSpeedMMPS(int speedMMPS);
    int wheelLLGetSpeedMMPS() const;
    unsigned int wheelLLSetSpeedMMPS(unsigned int speedMMPS,bool dir);
    int wheelLLSetSpeedMMPS(int speedMMPS);
    int wheelURGetSpeedMMPS() const;
    unsigned int wheelURSetSpeedMMPS(unsigned int speedMMPS,bool dir);
    int wheelURSetSpeedMMPS(int speedMMPS);
    int wheelLRGetSpeedMMPS() const;
    unsigned int wheelLRSetSpeedMMPS(unsigned int speedMMPS,bool dir);
    int wheelLRSetSpeedMMPS(int speedMMPS);

    void setAllMotorPWM(int UL, int LL, int LR, int UR);

    bool PIDEnable(float kc=KC,float taui=TAUI,float taud=TAUD,unsigned int interval=1000);
    bool PIDDisable();		// 201209
    bool PIDReset();   // 201611 FAX
    bool PIDGetStatus();	// 201209
    float PIDGetP_Param();	// 201210
    float PIDGetI_Param();	// 201210
    float PIDGetD_Param();	// 201210
    bool PIDRegulate();
    void delayMS(unsigned int ms=100, bool debug=false);
    void debugger(bool wheelULDebug=true,bool wheelLLDebug=true,
                  bool wheelLRDebug=true,bool wheelURDebug=true) const;

    enum {
        STAT_UNKNOWN,
        STAT_STOP,

        STAT_MOVE_FORWARD,
        STAT_MOVE_BACKWARD,

        STAT_TURN_LEFT,
        STAT_TURN_RIGHT,

        STAT_TRANSLATE_LEFT,
        STAT_TRANSLATE_RIGHT,

        STAT_TURN_UPLEFT,
        STAT_TURN_DOWNLEFT,
        STAT_TURN_DOWNRIGHT,
        STAT_TURN_UPRIGHT,
    };
    unsigned char getStat() const;

    enum {
        MOTORS_FB,	// FrontBack
        MOTORS_BF,	// BackFront
    };
    unsigned char getSwitchMotorsStat() const;
    unsigned int getWheelspan() const;
    void disableMotorPin();

private:
    MotorWheel* _wheelUL;	// UPLEFT
    MotorWheel* _wheelLL;	// DownLeft
    MotorWheel* _wheelLR;	// DownRight
    MotorWheel* _wheelUR;	// UpRight

    void _doMovement(int action, int speedMMPS);

    unsigned int _wheelspan;  // 201208

    float acceleration;
    float deceleration;

    unsigned char _curStat, _nextStat;
    float _curSpeedMMPS;
    int _nextSpeedMMPS;
    unsigned char setStat(unsigned char Stat);

    unsigned char _switchMotorsStat;
    unsigned char setSwitchMotorsStat(unsigned char switchMotorsStat);

    Omni4WD();
};

#endif
