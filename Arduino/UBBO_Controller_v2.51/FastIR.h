///////////////////////////////////////////////////////
// FastIR by jérôme Depys
// v.1.0
///////////////////////////////////////////////////////

#ifndef FastIR_h
#define FastIR_h

#include <stdint.h>

#ifndef FASTIR_BIT_DURATION
#define FASTIR_BIT_DURATION 500 // microseconds
#endif

#ifndef FASTIR_DATA_TYPE
#define FASTIR_DATA_TYPE uint8_t // data size
#endif

#ifndef FASTIR_MAX_CODE
#define FASTIR_MAX_CODE 2 // max number of code to scan
#endif

#ifndef FASTIR_MAX_RECEIVER
#define FASTIR_MAX_RECEIVER 3 //
#endif

/////////////
///
/// Sender
///
/////////////
class FastIRSender{
  public:
    static void sendValue(int pin, FASTIR_DATA_TYPE value, int halfPeriodeUs = 13);
  private:
    static void sendSpace(int pin);
    static unsigned long sendMark(int pin, int halfPeriodeUs);
};


/////////////
///
/// Receiver
///
/////////////
class FastIRReceiver{
  public:
    int pin; // IR Receiver pin
    FastIRReceiver();
    void manage(); // called by interruption at good rate after start()
    volatile unsigned long signalAtMillis[FASTIR_MAX_CODE];
    volatile unsigned long lastSignalAt;
    
    static FASTIR_DATA_TYPE codeList[FASTIR_MAX_CODE];
    static FastIRReceiver *receiverList[FASTIR_MAX_RECEIVER];
    
    static void start(); // start timer interruption
    static void stop(); // stop timer interruption
    static void showFrequency(); // debug to check frequency
    static unsigned long tickCmpt; //
  private:
    FASTIR_DATA_TYPE curCode;
    unsigned long lastTime;
    bool lastState;
};

#endif
