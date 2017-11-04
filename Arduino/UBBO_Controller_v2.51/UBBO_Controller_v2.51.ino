/*

   This file is licensed under the Creative Commons 4.0 International (CC BY-NC-SA 4.0). https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode

   File: UBBO_Controller
   Version: 2.5.0
   Date: 16/06/2017
   Owner: AXYN Robotique
   This software is known to work with Arduino 1.0.6 and does not seem to work with Arduino 1.6.x.

   Release note:

   - V1.0     - 08/01/2015 FAX: First delivery
   - V1.1     - 29/01/2015 FAX: Add the keys A,Z,E,Q,S,D,W,X,C for control
   - V1.2     - 05/03/2015 FAX: Suppress the serial status + decrease the distance of the movement from 160 to 50
   - V1.3     - 01/04/2015 FAX: Add log - low speed for rotation and translation
   - V1.3.2   - 29/04/2015 ABI: Correction of Nexus Bug reduce speed in library and sources
   - V1.3.3   - 07/05/2015 FAX: Formalisation of last corrections
   - V1.4     - 07/05/2015 FAX: free the pin 18,19 for I2C
   - V1.5     - 07/05/2015 FAX: Management of the proximity sensors
   - V1.6     - 07/05/2015 FAX: Changing pinout for simplification
   - V1.7     - 03/02/2016 FAX: Bug Correction on ADK + Serial/BT protocole enhancement
   - V1.8     - 10/02/2016 FAX: Bug Correction on new protocol - New sensors - Increase serial buffer in HardwareSerial.cpp 64->256
   - V1.9     - 14/02/2016 FAX: Enhance protocol and movement  - Disable NoInterrups/Interrups in PID lib to avoid tablet servo vibration
   - V2.0     - 16/02/2016 FAX: Official Delivery
   - V2.1     - 14/03/2016 ABI: I/O Use corrections in comment
   - V2.1.2   - 01/06/2016 FAX: sensor status sent via COM3 (bluetooth) to be managed by tablet
   - V2.2     - 22/07/16 RAPH : splitted version - Motors pins edited
   - V2.2.1   - 02/08/16 FAX : Motors pins reversed
   - V2.3     - 31/10/16 PAG : Wheels reversed frow WW to X - Electronic update - Improvement of code semantic
   - V2.3.1   - 31/10/16 FAX : Update of wiring informations
   - V2.3.2   - 04/11/2016 PAG: Last little mouvement after stop request suppressed
   - V2.3.2.1 - 04/02/2017 JAY: Reverse Wheel 2 & 3 in the software instead of electronics
   - V2.4.0   - 28/02/2017 JAY: Can be compiled with arduino 1.6.12, Serial issues fixed
   - V2.4.1   - 21/03/2017 JAY: Add DockStation relay
   - V2.4.2   - 10/04/2017 JAY: Add analog / digital sensor mix in Definition.h
   - V2.4.3   - 02/05/2017 JAY: Add auto return to dock station
        Add EEPROM config
        Fix multiple "go home" issue
        Add AntiFlood proxy sensors to web app
        fix serial bug on millis()
   - V2.4.4   - 02/05/2017 JAY: fix acceleration
        clear oldCode
   - V2.5     - 02/05/2017 FAX: JAY code validated
        Rotation speed reduced
   - v2.51    - 27/07/2017 FAX: Add Battery and Version status return functions
        Set the standard sensor configuration (front, left, right : Sick IR sensor, back: Ultrasound


   I/O Use
   -------

   Pin 0: NC
   Pin 1: NC
   Pin 2: (E1 ASM 1) PWM wheel Front Right
   Pin 3: (M1 ASM 1) DIR wheel Front Right
   Pin 4: NC
   Pin 5: (E2 ASM 1) PWM wheel Back Right
   Pin 6: (M2 ASM 1) DIR wheel Back Right
   Pin 7: NC
   Pin 8: (E1 ASM 2) PWM wheel Back Left
   Pin 9: (M1 ASM 2) DIR wheel Back Left
   Pin 10: NC
   Pin 11: (E2 ASM 2) PWM wheel Front Left
   Pin 12: (M2 ASM 2) DIR wheel Front Left
   Pin 13: NC
   Pin 14: Serial 3 for Arduino Servo controller
   Pin 15: NC
   Pin 16 : (Internal) RX Carte bluetooth (Serial 2)
   Pin 17 : (Internal) TX Carte bluetooth
   Pin 18 : (4 motor 1)Encoder signal B wheel Front Right
   Pin 19 : (4 motor 2)Encoder signal B wheel Back Left
   Pin 20 : (3 motor 3) Encoder signal A wheel Back Right
   Pin 21 : (3 motor 4) Encoder signal A wheel Front Left
   Pin 22 : NC
   Pin 23 : NC
   Pin 24 : NC
   Pin 25 : NC
   Pin 26 : NC
   Pin 27 : NC
   Pin 28 : Dock station IR detection front left
   Pin 29 : Dock station IR detection front center
   Pin 30 : Dock station IR detection front right
   Pin 31 : (3 motor 1) Encoder signal A wheel Front Right
   Pin 32 : (3 motor 2) Encoder signal A wheel Back Left
   Pin 33 : (4 motor 3) Encoder signal B wheel Back Right
   Pin 34 : (4 motor 4) Encoder signal B wheel Front Left
   Pin 39 : Dock relay Pin
   Pin 40 : Docked Digital Pin
   Pin A0 : Battery Voltage Pin

   M1 Red Wire: ((+)1 ASM 1)
   M1 black Wire: ((-)1 ASM 1)
   M2 Red Wire: ((+)2 ASM 1)
   M2 black Wire: ((-)2 ASM 1)
   M3 Red Wire: ((-)1 ASM 2)
   M3 black Wire: ((+)1 ASM 2)
   M4 Red Wire: ((-)2 ASM 2)
   M4 black Wire: ((+)2 ASM 2)


 ************************************************************************************
   Back View           IR back (Pin 26)
   ------------------------------
 |      |
   M3 ( back left)|      |M2 (back right)
 |      |
 |       |
 |       |
   IR left ( Pin 27)|        |IR right (Pin 25)
 |      |
 |       |
 |       |
 |       |
    -------------------------------
 |       |
   M4 (front left)|      |M1 (front right)
 |      |
    -------------------------------
        IR front (Pin 24)
 ************************************************************************************

   /////////////////////////
   Arduino Servo controller
   ////////////////////////
   Pin 11: Servomotor for Tablet
 */

#include "MotorWheel.h"
#include "Omni4WD.h"
#include "PID.h"
#include "PinChangeInt.h"
#include "PinChangeIntConfig.h"

#include "Definitions.h"

//#define DEBUG

// internal data
boolean bDataReceived = false;  // whether the data is received
unsigned long ulTimeSensor; //Time in milliseconds
unsigned long ulTimeSensorStart; //Time in milliseconds
int iTempoSensor; // Tempo counter
int iTempoSensorMax = 250; // Tempo for sensor check
boolean bTimeoutSensorDetected = false; //Timeout detection state

//Protocol variables
String sData = "";   // a string to hold incoming data
int iMessageSize = 0;
int iNbVar= 0;
byte byCmd = 0;
byte byPosition = 0;
byte byPreviousCmd = 0;
int iPreviousAngle = 0;
byte byMessage[MAX_VAR]; // a char to hold incoming data
byte byVarType[MAX_VAR];
byte byVarValue[MAX_VAR];

//Timer data
unsigned long ulTime; //Time in milliseconds
unsigned long ulTimeStart; //Time in milliseconds
int iTempo; // Tempo counter
int iTempoMax = 1500; // Tempo until no key is pressed
boolean bTimeoutDetected = false; //Timeout detection state

// Declaration of Motors and encoders (pinouts)
irqISR(irq1,isr1);
MotorWheel wheel1(MOTOR1_ENABLE_PIN, MOTOR1_DIRECTION_PIN, MOTOR1_IRQ_PIN, MOTOR1_IRQB_PIN,&irq1);

irqISR(irq2,isr2);
MotorWheel wheel2(MOTOR2_ENABLE_PIN, MOTOR2_DIRECTION_PIN, MOTOR2_IRQ_PIN, MOTOR2_IRQB_PIN,&irq2);

irqISR(irq3,isr3);
MotorWheel wheel3(MOTOR3_ENABLE_PIN, MOTOR3_DIRECTION_PIN, MOTOR3_IRQ_PIN, MOTOR3_IRQB_PIN,&irq3);

irqISR(irq4,isr4);
MotorWheel wheel4(MOTOR4_ENABLE_PIN, MOTOR4_DIRECTION_PIN, MOTOR4_IRQ_PIN, MOTOR4_IRQB_PIN,&irq4);

Omni4WD Ubbo(&wheel1,&wheel3,&wheel2,&wheel4);  //Reversing back wheels (2 & 3) to get the good config after setting the final good positions of wheels - Not yet identify The reason why

void setup(){
    pinMode(DOCK_RELAY_PIN, OUTPUT);
    pinMode(DOCKED_DIGITAL_PIN, INPUT);
    digitalWrite(DOCKED_DIGITAL_PIN, LOW);

    //Initialize robot PWM
    delay(2000);
    TCCR1B=TCCR1B&0xf8|0x01; // Pin12 &11 PWM 31250Hz
    TCCR2B=TCCR2B&0xf8|0x01; // Pin9,Pin10 PWM 31250Hz
    TCCR3B=TCCR3B&0xf8|0x01; // Pin 5,3, 2 PWM 31250Hz
    TCCR4B=TCCR4B&0xf8|0x01; // Pin8,7,6 PWM 31250Hz

    //Init motors and PID
    Ubbo.PIDEnable(1.0,0.8,0.5,10);
    Ubbo.setAcceleration(fAcceleration);
    Ubbo.setDeceleration(fDeceleration);

    // initialize serials:
    Serial.begin(9600);
    Serial2.begin(9600);
    Serial3.begin(9600);
    dbg_println("Wait for a command:");
    dbg2_println("Ready to Send:");

    ulTimeStart = millis();
    bTimeoutDetected = false;

    ulTimeSensorStart = millis();
    bTimeoutSensorDetected = true;
}

void loop(){
    while(true) {
        if (byCmd != 0) {
            ulTimeStart = millis();
            bTimeoutDetected = false;
            switch (byCmd) {
                case GO_FORWARD: //Go forward
                    if (iMessageSize == 1) {
                        moveRobot(byPosition);
                        //dbg_println("move forward");
                    }
                    else dbg_println("bad \"move robot\" message format");
                    break;

                case GO_BACKWARD: // Go back
                    if (iMessageSize == 1){
                        //Add 127 = angle mapped to 180°
                        moveRobot(byPosition + 127);
                        dbg_println("move Backward");
                    }
                    else dbg_println("bad \"move robot\" message format");
                    break;

                case STOP: //Stop the movement
                    Ubbo.doMovement(Omni4WD::STAT_STOP);
                    //Reset timer
                    ulTimeStart = 0;
                    bTimeoutDetected = true;
                    byPreviousCmd = byCmd;
                    break;

                case TRANSLATE_LEFT: // Translate left
                    Ubbo.doMovement(Omni4WD::STAT_TRANSLATE_LEFT, iSpeedTranslate);
                    byPreviousCmd = byCmd;
                    break;

                case TRANSLATE_RIGHT: // Translate right
                    Ubbo.doMovement(Omni4WD::STAT_TRANSLATE_RIGHT, iSpeedTranslate);
                    byPreviousCmd = byCmd;
                    break;

                case MOVE_TABLET: // Move Tablet Servo
                    if (iMessageSize == 1){
                        moveTablet(byPosition);
                    }
                    else
                    dbg_println("bad \"move tablet\" message format");
                    break;

                default: // Other
                    dbg_println("Unknown command");
                    break;
            }
        }
        else{
            // Timeout management
            if (bTimeoutDetected == false){
                ulTime = millis();
                iTempo = ulTime - ulTimeStart;
                ///Timeout reached
                if (iTempo >= iTempoMax){
                    //dbg_println("End of movement");

                    //Stop the movement
                    Ubbo.doMovement(Omni4WD::STAT_STOP);
                    //Refresh data values
                    byCmd = 0;
                    byPreviousCmd = 0;
                    //Reset timer
                    ulTimeStart = 0;
                    //Set Timeout detection State
                    bTimeoutDetected = true;
                }
            }
            else{
                //Stop the movement
                Ubbo.doMovement(Omni4WD::STAT_STOP);
                //Refresh data values
                byCmd = 0;
                byPreviousCmd = 0;
            }
        }
        break;
    }

    Ubbo.PIDRegulate();

    //Reset value
    byCmd = 0;
    // Data receive State set to false
    bDataReceived = false;
}
