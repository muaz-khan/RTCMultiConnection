/*
   This file is licensed under the Creative Commons 4.0 International (CC BY-NC-SA 4.0). https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode

   File: UBBO_Controller
   Version: 1.1
   Date: 12/04/2016
   Owner: AXYN Robotique

   Release note:

   - V1.0 - 01/03/2016 FAX: First delivery
   - V1.1 - 29/01/2015 FAX: Board is now a Atmega 328 Arduino Pro + Parse serial data received

   I/O Use
   -------

   Pin 0: RX from Arduino
   Pin 12: PWM for tablet servc

   Info:
   ----
   Choose on Arduino IDE:
   Card Type: Arduino Mini w/ ATmega328
   Compiler: AVR ISPMkII


   /////////////////////////
   Arduino Servo controller
   ////////////////////////
   Pin 12: Servomotor for Tablet

 */

#include <math.h>
#include <Servo.h>

#define DEBUG

#ifdef DEBUG
    #define dbg_print(x) Serial.print(x)
    #define dbg_print_hex(x) Serial.print(x,HEX)
    #define dbg_println(x) Serial.println(x)
    #define dbg_println_hex(x) Serial.println(x,HEX)
#else
    #define dbg_print(x)
    #define dbg_print_hex(x)
    #define dbg_println(x)
    #define dbg_println_hex(x)
#endif

const char STX = '<';
const char ETX = '>';

// Tablet data
Servo oTabletServo;
const int iTabletServoPin = 12;
int iTabletPos = 30;
int iCmd = 0;
boolean bDataReceived = false;

void setup(){
    oTabletServo.attach(iTabletServoPin); // attaches the servo on pin 9 to the servo object

    // initialize serial:
    Serial.begin( 9600 );

    Serial.print( "STX: " );
    Serial.println( STX );
    Serial.print( "ETX: " );
    Serial.println( ETX );

    dbg_println( "Wait for a command:" );

    //Set Servo at init position
    oTabletServo.write( iTabletPos );
}

void loop(){
    if (bDataReceived == true){
        dbg_println("move tablet");
        bDataReceived = false;
        moveTablet(iCmd);
    }
    delay(100);
}

void  moveTablet(int iReqPos){
    int iPos;

    //Get actual position
    int iTabletPos = oTabletServo.read();
    iReqPos = constrain( iReqPos, 0, 60 );
    if (iTabletPos != iReqPos){
        dbg_print("Move tablet from ");
        dbg_print(iTabletPos);
        dbg_print(" to ");
        dbg_println(iReqPos);

        if (iReqPos > iTabletPos){
            for(iPos = iTabletPos; iPos <= iReqPos; iPos += 1){ // goes from actual position to Required position by +1 step
                oTabletServo.write(iPos); // tell servo to go to position in variable 'iPos'
                delay(50);
            }
        }
        else{
            for(iPos = iTabletPos; iPos >= iReqPos; iPos -= 1) // goes from actual position to Required position by +1 step
            {
                oTabletServo.write(iPos); // tell servo to go to position in variable 'pos'
                delay(50);
            }
        }
    }
    else{
        if (iTabletPos == iReqPos) dbg_println("Tablet already in position");
        else dbg_println("Bad value. Must be >=0 & <=180");
    }
}

void serialEvent(){
    byte byVal;

    // Read serial input:
    if (Serial.available() > 0){
        float fVal = 0;
        byte byVal = (byte)Serial.read();

        if (byVal == STX){

            dbg_print("STX detected.");
            while (Serial.available() > 0){
                // convert the incoming byte to a char
                // and add it to the string:
                byVal = (byte)Serial.read();
                dbg_print("byVal:");
                dbg_println(byVal);

                if (byVal != ETX){
                    //iCmd = byVal;
                    //To limit down the rotation slide from 0 to 50 (like exponential movement)
                    fVal = (byVal/180.0);
                    iCmd = (int)((pow(fVal,1.5))*180);
                }
                else{
                    dbg_print("ETX detected.");

                    // Wait until ETX and the end of the slide movement
                    if (Serial.available() == 0)
                    {
                        bDataReceived = true;
                        break;
                    }
                }
            }
            if ((byVal != ETX) && (byVal != STX)){
                bDataReceived = true;
                dbg_print("ETX not detected but value is there.");
            }
        }
        if (bDataReceived){
            //Get Command and var ize
            dbg_print("Data Received:");
            dbg_println(iCmd);
        }
    }
}
