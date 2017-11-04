/*

 This file is licensed under the Creative Commons 4.0 International (CC BY-NC-SA 4.0). https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode
 
 File: PID.h
 Date: 01/04/2015
 Owner: AXYN Robotique
 
 Release note:
 
 - v1.0  20150401 Creation
 
 */

#if defined(ARDUINO) && ARDUINO >= 100
#include "Arduino.h"
#else
#include "wiring.h"
#endif

#include "PID.h"

#include <wiring_private.h>
#include <HardwareSerial.h>

/* Standard Constructor (...)***********************************************
 *    constructor used by most users.  the parameters specified are those for
 * for which we can't set up reliable defaults, so we need to have the user
 * set them.
 ***************************************************************************/
PID::PID(int *Input, int *Output, int *Setpoint, float Kc, float TauI, float TauD)
{

  PID::ConstructorCommon(Input, Output, Setpoint, Kc, TauI, TauD);
  UsingFeedForward = false;
  PID::Reset();


}

/* Overloaded Constructor(...)**********************************************
 *    This one is for more advanced users.  it's essentially the same as the
 * standard constructor, with one addition.  you can link to a Feed Forward bias,
 * which lets you implement... um.. Feed Forward Control.  good stuff.
 ***************************************************************************/
PID::PID(int *Input, int *Output, int *Setpoint, int *FFBias, float Kc, float TauI, float TauD)
{

  PID::ConstructorCommon(Input, Output, Setpoint, Kc, TauI, TauD);
  UsingFeedForward = true;			  //tell the controller that we'll be using an external
  myBias = FFBias;                              //bias, and where to find it
  PID::Reset();

}

/* ConstructorCommon(...)****************************************************
 *    Most of what is done in the two constructors is the same.  that code
 * was put here for ease of maintenance and (minor) reduction of library size
 ****************************************************************************/
void PID::ConstructorCommon(int *Input, int *Output, int *Setpoint, float Kc, float TauI, float TauD)
{
  PID::SetInputLimits(0, 1023);		//default the limits to the 
  PID::SetOutputLimits(0, 255);		//full ranges of the I/O

  tSample = 1000;			//default Controller Sample Time is 1 second

  PID::SetTunings( Kc, TauI, TauD);

  nextCompTime = millis();
  inAuto = false;
  myOutput = Output;
  myInput = Input;
  mySetpoint = Setpoint;

  Err = lastErr = prevErr = 0;
}


/* SetInputLimits(...)*****************************************************
 *	I don't see this function being called all that much (other than from the
 *  constructor.)  it needs to be here so we can tell the controller what it's
 *  input limits are, and in most cases the 0-1023 default should be fine.  if
 *  there's an application where the signal being fed to the controller is
 *  outside that range, well, then this function's here for you.
 **************************************************************************/
void PID::SetInputLimits(int INMin, int INMax)
{
  //after verifying that mins are smaller than maxes, set the values
  if(INMin >= INMax) return;


  inMin = INMin;
  inSpan = INMax - INMin;
}

/* SetOutputLimits(...)****************************************************
 *     This function will be used far more often than SetInputLimits.  while
 *  the input to the controller will generally be in the 0-1023 range (which is
 *  the default already,)  the output will be a little different.  maybe they'll
 *  be doing a time window and will need 0-8000 or something.  or maybe they'll
 *  want to clamp it from 0-125.  who knows.  at any rate, that can all be done
 *  here.
 **************************************************************************/
void PID::SetOutputLimits(int OUTMin, int OUTMax)
{
  //after verifying that mins are smaller than maxes, set the values
  if(OUTMin >= OUTMax) return;

  outMin = OUTMin;
  outSpan = OUTMax - OUTMin;
}

/* SetTunings(...)*************************************************************
 * This function allows the controller's dynamic performance to be adjusted. 
 * it's called automatically from the constructor, but tunings can also
 * be adjusted on the fly during normal operation
 ******************************************************************************/
void PID::SetTunings(float Kc, float TauI, float TauD)
{
  //verify that the tunings make sense
  if (Kc == 0.0 || TauI < 0.0 || TauD < 0.0) return;

  //we're going to do some funky things to the input numbers so all
  //our math works out, but we want to store the numbers intact
  //so we can return them to the user when asked.
  P_Param = Kc;
  I_Param = TauI;
  D_Param = TauD;

  //convert Reset Time into Reset Rate, and compensate for Calculation frequency
  float tSampleInSec = ((float)tSample / 1000.0);
  float tempTauR;
  if (TauI == 0.0)
    tempTauR = 0.0;
  else
    tempTauR = (1.0 / TauI) * tSampleInSec;


  kc = Kc;
  taur = tempTauR;
  taud = TauD / tSampleInSec;

  cof_A = kc * (1 + taur + taud);
  cof_B = kc * (1 + 2 * taud);
  cof_C = kc * taud;
}

/* Reset()*********************************************************************
 *	does all the things that need to happen to ensure a bumpless transfer
 *  from manual to automatic mode.  this shouldn't have to be called from the
 *  outside. In practice though, it is sometimes helpful to start from scratch,
 *  so it was made publicly available
 ******************************************************************************/
void PID::Reset()
{

  if(UsingFeedForward)
    bias = (*myBias - outMin) / outSpan;
  else
    bias = (*myOutput - outMin) / outSpan;

}

/* SetMode(...)****************************************************************
 * Allows the controller Mode to be set to manual (0) or Automatic (non-zero)
 * when the transition from manual to auto occurs, the controller is
 * automatically initialized
 ******************************************************************************/
void PID::SetMode(int Mode)
{
  if (Mode!=0 && !inAuto)
  {	//we were in manual, and we just got set to auto.
    //reset the controller internals
    PID::Reset();
  }
  inAuto = (Mode!=0);
}

/* SetSampleTime(...)*******************************************************
 * sets the frequency, in Milliseconds, with which the PID calculation is performed	
 ******************************************************************************/
void PID::SetSampleTime(int NewSampleTime)
{
  if (NewSampleTime > 0)
  {
    //convert the time-based tunings to reflect this change
    taur *= ((float)NewSampleTime)/((float) tSample);
    taud *= ((float)NewSampleTime)/((float) tSample);
    tSample = (unsigned long)NewSampleTime;

    cof_A = kc * (1 + taur + taud);
    cof_B = kc * (1 + 2 * taud);
    cof_C = kc * taud;
  }
}

/* Compute() **********************************************************************
 *     This, as they say, is where the magic happens.  this function should be called
 *   every time "void loop()" executes.  the function will decide for itself whether a new
 *   pid Output needs to be computed
 *
 *  Some notes for people familiar with the nuts and bolts of PID control:
 *  - I used the Ideal form of the PID equation.  mainly because I like IMC
 *    tunings.  lock in the I and D, and then just vary P to get more 
 *    aggressive or conservative
 *
 *  - While this controller presented to the outside world as being a Reset Time
 *    controller, when the user enters their tunings the I term is converted to
 *    Reset Rate.  I did this merely to avoid the div0 error when the user wants
 *    to turn Integral action off.
 *    
 *  - Derivative on Measurement is being used instead of Derivative on Error.  The
 *    performance is identical, with one notable exception.  DonE causes a kick in
 *    the controller output whenever there's a setpoint change. DonM does not.
 *
 *  If none of the above made sense to you, and you would like it to, go to:
 *  http://www.controlguru.com .  Dr. Cooper was my controls professor, and is
 *  gifted at concisely and clearly explaining PID control
 *********************************************************************************/
void PID::Compute()
{
  justCalced=false;
  if (!inAuto) return; //if we're in manual just leave;

  unsigned long now = millis();

  //millis() wraps around to 0 at some point.  depending on the version of the 
  //Arduino Program you are using, it could be in 9 hours or 50 days.
  //this is not currently addressed by this algorithm.


  //...Perform PID Computations if it's time...
  if (now>=nextCompTime)
  {

    Err = *mySetpoint - *myInput;
    
    //if we're using an external bias (i.e. the user used the 
    //overloaded constructor,) then pull that in now
    if(UsingFeedForward)
    {
      bias = *myBias - outMin;
    }


    // perform the PID calculation.  
    //float output = bias + kc * ((Err - lastErr)+ (taur * Err) + (taud * (Err - 2*lastErr + prevErr)));
    noInterrupts();
    int output = bias + (cof_A * Err - cof_B * lastErr + cof_C * prevErr);
    interrupts();

    //make sure the computed output is within output constraints
    if (output < -outSpan) output = -outSpan;
    else if (output > outSpan) output = outSpan;


    prevErr = lastErr;
    lastErr = Err;


    //scale the output from percent span back out to a real world number
    *myOutput = output;

    nextCompTime += tSample;				// determine the next time the computation
    if(nextCompTime < now) nextCompTime = now + tSample;	// should be performed	

    justCalced=true;  //set the flag that will tell the outside world that the output was just computed

  }


}


/*****************************************************************************
 * STATUS SECTION
 * These functions allow the outside world to query the status of the PID
 *****************************************************************************/

bool PID::JustCalculated()
{
  return justCalced;
}
int PID::GetMode()
{
  if(inAuto)return 1;
  else return 0;
}

int PID::GetINMin()
{
  return inMin;
}
int PID::GetINMax()
{
  return inMin + inSpan;
}
int PID::GetOUTMin()
{
  return outMin;
}
int PID::GetOUTMax()
{
  return outMin+outSpan;
}
int PID::GetSampleTime()
{
  return tSample;
}
float PID::GetP_Param()
{
  return P_Param;
}
float PID::GetI_Param()
{
  return I_Param;
}

float PID::GetD_Param()
{
  return D_Param;
}


