#include "FastIR.h"
#include "Arduino.h"

/////////////
///
/// Sender
///
/////////////
unsigned long FastIRSender::sendMark(int pin, int halfPeriodeUs){
  long int nb;
  unsigned long  tm = micros();
  for(nb = 0; tm > micros() - FASTIR_BIT_DURATION; nb++){
    digitalWrite(pin, HIGH);
    delayMicroseconds(halfPeriodeUs - 6);
    digitalWrite(pin, LOW);
    delayMicroseconds(halfPeriodeUs - 7);
  }
  return nb;
}
void FastIRSender::sendSpace(int pin){
  delayMicroseconds(FASTIR_BIT_DURATION);
}
void FastIRSender::sendValue(int pin, FASTIR_DATA_TYPE value, int halfPeriodeUs){
  for(int i = sizeof(FASTIR_DATA_TYPE) * 8 - 1; i >= 0; i--){
    if((value >> i) & 1){
      sendMark(pin, halfPeriodeUs);
    }else{
      sendSpace(pin);
    }
  }  
}


/////////////
///
/// Receiver
///
/////////////
unsigned long FastIRReceiver::tickCmpt = 0;
FastIRReceiver *FastIRReceiver::receiverList[FASTIR_MAX_RECEIVER] = {NULL};
FASTIR_DATA_TYPE FastIRReceiver::codeList[FASTIR_MAX_CODE];

// member
FastIRReceiver::FastIRReceiver(){
   lastSignalAt = 0;
   for(int i=0; i<FASTIR_MAX_CODE; i++)signalAtMillis[i] = 0;
}
void FastIRReceiver::showFrequency(){
  while(true){
    Serial.println(tickCmpt);
    tickCmpt = 0;
    delay(1000);
  }
}
void FastIRReceiver::manage(){ // read IR level
  boolean v = !digitalRead(pin);
  boolean newBit = false;
  unsigned long tm = micros();
  if(lastState != v){ // change bit state, so it is a new bit
    lastState = v;
    lastTime = tm;
    newBit = true;
  }else if(lastTime < tm - FASTIR_BIT_DURATION){ // time out, add bit
    newBit = true;
    lastTime = tm;
  }
  if(newBit){
    curCode = curCode << 1; // left bit shift
    curCode += v;
    for(int i=0; i<FASTIR_MAX_CODE; i++){
      if(curCode == codeList[i]){
        signalAtMillis[i] = lastSignalAt = millis();
      }
    }
  }
}

// static
#if defined(__AVR_ATmega328P__) // uno

  void FastIRReceiver::stop(){
    TCCR1A = 0;
    TCCR1B = 0;
  }
  void FastIRReceiver::start(){ // set frequency > to FASTIR_BIT_DURATION frequency
    noInterrupts();           // disable all interrupts
    TCCR1A = 0;
    TCCR1B = 0;
    TCNT1  = 0;
    OCR1A = 30;            // compare match register 16MHz/64/5000Hz = 50
    TCCR1B |= (1 << WGM12);   // CTC mode
    TCCR1B |= (3 << CS10);    // prescaler 1=>1 2=>8 3=>64 4=>256 5=>1024
    TIMSK1 |= (1 << OCIE1A);  // enable timer compare interrupt
    interrupts();             // enable all interrupts
  }
  
  ISR(TIMER1_COMPA_vect){
    FastIRReceiver::tickCmpt++; // used to check counter
    for(int i=0; i<FASTIR_MAX_RECEIVER; i++){
      if(FastIRReceiver::receiverList[i])
        FastIRReceiver::receiverList[i]->manage();
    }
  }
  
#elif defined(__AVR_ATmega2560__)

  void FastIRReceiver::stop(){
    TCCR5A = 0;
    TCCR5B = 0;
  }
  void FastIRReceiver::start(){ // set frequency > to FASTIR_BIT_DURATION frequency
    noInterrupts();           // disable all interrupts
    TCCR5A = 0;
    TCCR5B = 0;
    TCNT5  = 0;
    OCR5A = 400;            // compare match register 16MHz/8/5000Hz = 400
    TCCR5B |= (1 << WGM52);   // CTC mode
    TCCR5B |= (2 << CS50);    // prescaler 1=>1 2=>8 3=>64 4=>256 5=>1024
    TIMSK5 |= (1 << OCIE5A);  // enable timer compare interrupt
    interrupts();             // enable all interrupts
  }
  
  ISR(TIMER5_COMPA_vect){
    FastIRReceiver::tickCmpt++; // used to check counter
    for(int i=0; i<FASTIR_MAX_RECEIVER; i++){
      if(FastIRReceiver::receiverList[i])
        FastIRReceiver::receiverList[i]->manage();
    }
  }
  
#endif

