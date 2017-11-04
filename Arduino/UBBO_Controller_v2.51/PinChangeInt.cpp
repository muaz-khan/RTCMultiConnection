/*
	PinChangeInt.cpp
 */

#include "PinChangeInt.h"


PCintPort::PCintPin PCintPort::PCintPin::pinDataAlloc[MAX_PIN_CHANGE_PINS];


PCintPort PCintPort::pcIntPorts[] = {
        PCintPort(0,PCMSK0),
        PCintPort(1,PCMSK1),
        PCintPort(2,PCMSK2)
};

void PCintPort::addPin(uint8_t mode,uint8_t mask,PCIntvoidFuncPtr userFunc)
{
    //int i = 0;
    PCintPin* p = PCintPin::pinDataAlloc;
    do {
        if (!p->PCintMode) { // found an available pin data structure
            // now find the next slot to put it in
            PCintPin** t = &pcIntPins[0];
            do {
                if (!*t) {	// we have a slot
                    // fill in the data
                    p->PCintMode = mode;
                    *t = p;
                    p->PCintFunc = userFunc;
                    // set the mask
                    pcmask |= p->PCIntMask = mask;
                    // enable the interrupt
                    PCICR |= PCICRbit;

#ifdef	DEBUG
                    Serial.print("BitMask = ");
            Serial.print(mask, BIN);
            Serial.print("; ");
            Serial.print("slot = ");
            Serial.println((int)(t - &pcIntPins[0]), DEC);
#endif

                    return;
                }
            }
            while (int(++t) < int(&pcIntPins[8]));
        }
    }
    while (int(++p) < int(&PCintPin::pinDataAlloc[MAX_PIN_CHANGE_PINS]));
}

void PCintPort::delPin(uint8_t mask)
{
    PCintPin** t = pcIntPins;
    while (*t) {
        PCintPin& p = **t;
        if (p.PCIntMask == mask) {	// found the target
            uint8_t oldSREG = SREG;
            cli();
            // disable the mask.
            pcmask &= ~mask;
            // if that's the last one, disable the interrupt.
            if (pcmask == 0) {
                PCICR &= ~(PCICRbit);
            }
            p.PCIntMask = 0;
            p.PCintMode = 0;
            p.PCintFunc = NULL;
            do { // shuffle down as we pass through the list, filling the hole
                *t = t[1];
            }
            while (*t);
            SREG = oldSREG;
            return;
        }
        t++;
    }
}

/*
 * attach an interrupt to a specific pin using pin change interrupts.
 */
void PCintPort::attachInterrupt(uint8_t pin, PCIntvoidFuncPtr userFunc, int mode)
{
    uint8_t portNum = digitalPinToPort(pin);
#if defined(__AVR_ATmega1280__) || defined(__AVR_ATmega2560__)
    if (((portNum != 2) && (portNum != 11))
    || (userFunc == NULL)
    ) {

#ifdef	DEBUG
    Serial.println("NOT_A_PORT det");
#endif

    return;
  }
  // map pin to PCIR register
  uint8_t portIndex = (portNum == 2)?(0):(2);
#else
    if ((portNum == NOT_A_PORT) || (userFunc == NULL)) {
        return;
    }
    // map pin to PCIR register
    uint8_t portIndex = portNum - 2;
#endif

#ifdef	DEBUG
    Serial.print("portNum = ");
  Serial.print(portNum, DEC);
  Serial.print("; ");
#endif

    PCintPort &port = PCintPort::pcIntPorts[portIndex];
    port.addPin(mode,digitalPinToBitMask(pin),userFunc);
}

void PCintPort::detachInterrupt(uint8_t pin)
{
    uint8_t portNum = digitalPinToPort(pin);
#if defined(__AVR_ATmega1280__) || defined(__AVR_ATmega2560__)
    if ((portNum != 2) && (portNum != 11)) {
    //Serial.println("NOT_A_PORT det");
    return;
  }
  uint8_t portIndex = (portNum == 2)?(0):(2);
  PCintPort& port = PCintPort::pcIntPorts[portIndex];

#else
    if (portNum == NOT_A_PORT) {
        //Serial.println("NOT_A_PORT det");
        return;
    }
    PCintPort& port = PCintPort::pcIntPorts[portNum - 2];
#endif

    port.delPin(digitalPinToBitMask(pin));
}

// common code for isr handler. "port" is the PCINT number.
// there isn't really a good way to back-map ports and masks to pins.
void PCintPort::PCint() {
#ifndef DISABLE_PCINT_MULTI_SERVICE
    uint8_t pcifr;
    do {
#endif
        uint8_t curr = portInputReg;
        uint8_t mask = curr ^ PCintLast;
        // get the pin states for the indicated port.
        // mask is pins that have changed. screen out non pcint pins.
        if ((mask &= pcmask) == 0) {
            return;
        }
        PCintLast = curr;
        PCintPin** t = pcIntPins;
        while (*t) {
            PCintPin& p = **t;
            if (p.PCIntMask & mask) { // a changed bit
                // Trigger interrupt if mode is CHANGE, or if mode is RISING and
                // the bit is currently high, or if mode is FALLING and bit is low.
                if (p.PCintMode == CHANGE
                    || ((p.PCintMode == FALLING) && !(curr & p.PCIntMask))
                    || ((p.PCintMode == RISING) && (curr & p.PCIntMask))
                        ) {
                    p.PCintFunc();
                }
            }
            t++;
        }
#ifndef DISABLE_PCINT_MULTI_SERVICE
        pcifr = PCIFR & PCICRbit;
        PCIFR = pcifr;	// clear the interrupt if we will process is (no effect if bit is zero)
    }
    while(pcifr);
#endif
}

#ifndef NO_PORTB_PINCHANGES
ISR(PCINT0_vect) {
        PCintPort::pcIntPorts[0].PCint();
}
#endif

#ifndef NO_PORTC_PINCHANGES
ISR(PCINT1_vect) {
        PCintPort::pcIntPorts[1].PCint();
}
#endif

#ifndef NO_PORTD_PINCHANGES
ISR(PCINT2_vect) {
        PCintPort::pcIntPorts[2].PCint();
}
#endif


