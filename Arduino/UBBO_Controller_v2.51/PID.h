/*

 This file is licensed under the Creative Commons 4.0 International (CC BY-NC-SA 4.0). https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode
 
 File: PID.h
 Date: 01/04/2015
 Owner: AXYN Robotique
 
 Release note:
 
 - v1.0  20150401 Creation
 
 */

#ifndef PID_h
#define PID_h

class PID
{


public:

#define AUTO	1
#define MANUAL	0
#define LIBRARY_VERSION	0.6

    //commonly used functions **************************************************************************
    PID(int*, int*, int*,				// * constructor.  links the PID to the Input, Output, and
        float, float, float);			//   Setpoint.  Initial tuning parameters are also set here

    PID(int*, int*, int*,				// * Overloaded Constructor.  if the user wants to implement
        int*, float, float, float);		//   feed-forward

    void SetMode(int Mode);			// * sets PID to either Manual (0) or Auto (non-0)

    void Compute();					// * performs the PID calculation.  it should be
    //   called every time loop() cycles. ON/OFF and
    //   calculation frequency can be set using SetMode
    //   SetSampleTime respectively

    void SetInputLimits(int, int);  //Tells the PID what 0-100% are for the Input

    void SetOutputLimits(int, int); //Tells the PID what 0-100% are for the Output


    //available but not commonly used functions ********************************************************
    void SetTunings(float, float,	// * While most users will set the tunings once in the
                    float);				//   constructor, this function gives the user the option
    //   of changing tunings during runtime for Adaptive control

    void SetSampleTime(int);		// * sets the frequency, in Milliseconds, with which
    //   the PID calculation is performed.  default is 1000

    void Reset();						// * reinitializes controller internals.  automatically
    //   called on a manual to auto transition

    bool JustCalculated();			// * in certain situations, it helps to know when the PID has
    //   computed this bit will be true for one cycle after the
    //   pid calculation has occurred


    //Status functions allow you to query current PID constants ***************************************
    int GetMode();
    int GetINMin();
    int GetINMax();
    int GetOUTMin();
    int GetOUTMax();
    int GetSampleTime();
    float GetP_Param();
    float GetI_Param();
    float GetD_Param();


private:

    void ConstructorCommon(int*, int*, int*,           // * code that is shared by the constructors
                           float, float, float);

    //scaled, tweaked parameters we'll actually be using
    float kc;                    // * (P)roportional Tuning Parameter
    float taur;                  // * (I)ntegral Tuning Parameter
    float taud;                  // * (D)erivative Tuning Parameter

    float cof_A;
    float cof_B;
    float cof_C;

    //nice, pretty parameters we'll give back to the user if they ask what the tunings are
    float P_Param;
    float I_Param;
    float D_Param;


    int *myInput;				// * Pointers to the Input, Output, and Setpoint variables
    int *myOutput;				//   This creates a hard link between the variables and the
    int *mySetpoint;			//   PID, freeing the user from having to constantly tell us
    //   what these values are.  with pointers we'll just know.

    int *myBias;				// * Pointer to the External FeedForward bias, only used
    //   if the advanced constructor is used
    bool UsingFeedForward;		// * internal flag that tells us if we're using FeedForward or not

    unsigned long nextCompTime;    // * Helps us figure out when the PID Calculation needs to
    //   be performed next
    //   to determine when to compute next
    unsigned long tSample;       // * the frequency, in milliseconds, with which we want the
    //   the PID calculation to occur.
    bool inAuto;                  // * Flag letting us know if we are in Automatic or not

    //   the derivative required for the D term
    //float accError;              // * the (I)ntegral term is based on the sum of error over
    //   time.  this variable keeps track of that
    float bias;                  // * the base output from which the PID operates

    int Err;
    int lastErr;
    int prevErr;

    float inMin, inSpan;         // * input and output limits, and spans.  used convert
    float outMin, outSpan;       //   real world numbers into percent span, with which
    //   the PID algorithm is more comfortable.

    bool justCalced;			// * flag gets set for one cycle after the pid calculates
};
#endif


