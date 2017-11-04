/*
	PinChangeInt.h
*/


#ifndef PinChangeInt_h
#define	PinChangeInt_h

#if defined(ARDUINO) && ARDUINO >= 100
#include "Arduino.h"
#else
#include "WProgram.h"
#endif

#include "PinChangeIntConfig.h"
#ifndef Pins_Arduino_h
#include "pins_arduino.h"
#endif
// This library was inspired by and derived from "johnboiles" (it seems) Main.PCInt Arduino Playground example
// see: http://www.arduino.cc/playground/Main/PcInt


// Interrupt management for PCI
/*
 * an extension to the interrupt support for arduino.
 * add pin change interrupts to the external interrupts, giving a way
 * for users to have interrupts drive off of any pin.
 * Refer to avr-gcc header files, arduino source and atmega datasheet.
 */

/*
 * Theory: all IO pins on AtmegaX(168/328/1280/2560) are covered by Pin Change Interrupts.
 * The PCINT corresponding to the pin must be enabled and masked, and
 * an ISR routine provided.  Since PCINTs are per port, not per pin, the ISR
 * must use some logic to actually implement a per-pin interrupt service.
 */

/* Pin to interrupt map ON ATmega168/328:
 * D0-D7 = PCINT 16-23 = PCIR2 = PD = PCIE2 = pcmsk2
 * D8-D13 = PCINT 0-5 = PCIR0 = PB = PCIE0 = pcmsk0
 * A0-A5 (D14-D19) = PCINT 8-13 = PCIR1 = PC = PCIE1 = pcmsk1
 */


/* Pin to interrupt map ON ATmega1280/2560:
 * D50-D53 = PCINT 3-0 = PCIR0 = PB = PCIE0 = pcmsk0
 * D10-D13 = PCINT 4-7 = PCIR0 = PB = PCIE0 = pcmsk0
 * A8-A15 (D62-D69) = PCINT 16-23 = PCIR2 = Pk = PCIE2 = pcmsk2
 
  * *******D0 = PCINT 8 = PCIR1 = PE = PCIE1 = pcmsk1**********
 * *******D14-D15 = PCINT 10-9 = PJ = PCIE1 = pcmsk1*********
 ********NOTE:PCINT 8-15 does NOT available in this library******
 */


/*
	Please make any configuration changes in the accompanying PinChangeIntConfig.h file.
	This will help avoid having to reset your config in the event of changes to the 
	library code (just don't replace that file when you update).

*/


#ifndef MAX_PIN_CHANGE_PINS
#define	MAX_PIN_CHANGE_PINS 8
#endif

// You can reduce the memory footprint of this handler by declaring that there will be no pin change interrupts
// on any of the three ports.
// define NO_PORTB_PINCHANGES to indicate that port b will not be used for pin change interrupts
// define NO_PORTC_PINCHANGES to indicate that port c will not be used for pin change interrupts
// define NO_PORTD_PINCHANGES to indicate that port d will not be used for pin change interrupts
// If only a single port remains, the handler will be declared inline reducing the size and latency 
// of the handler.

// if their is only one PCInt vector in use the code can be inlined
// reducing latecncy and code size
#define	INLINE_PCINT
#if ((defined(NO_PORTB_PINCHANGES) && defined(NO_PORTC_PINCHANGES)) || \
	(defined(NO_PORTC_PINCHANGES) && defined(NO_PORTD_PINCHANGES)) || \
	(defined(NO_PORTD_PINCHANGES) && defined(NO_PORTB_PINCHANGES)))
#undef INLINE_PCINT
#define	INLINE_PCINT inline
#endif

// Provide drop in compatibility with johnboiles PCInt project at
// http://www.arduino.cc/playground/Main/PcInt
#define	PCdetachInterrupt(pin)	PCintPort::detachInterrupt(pin)
#define	PCattachInterrupt(pin,userFunc,mode) PCintPort::attachInterrupt(pin, userFunc,mode)



typedef void (*PCIntvoidFuncPtr)(void);

class PCintPort {
	PCintPort(int index,volatile uint8_t& maskReg) :
#if defined(__AVR_ATmega1280__) || defined(__AVR_ATmega2560__)
	portInputReg(*portInputRegister((index == 0)?(2):(index + 9))),

#else
			portInputReg(*portInputRegister(index + 2)),
#endif

			pcmask(maskReg),
			PCICRbit(1 << index),
			PCintLast(0)	{
		for (int i = 0; i < 9; i++) {
			pcIntPins[i] = NULL;
		}
	}
public:
	static		void attachInterrupt(uint8_t pin, PCIntvoidFuncPtr userFunc, int mode);
	static		void detachInterrupt(uint8_t pin);
	INLINE_PCINT void PCint();
	static		PCintPort	pcIntPorts[];

protected:
	class PCintPin {
	public:
		PCintPin() :
				PCintFunc((PCIntvoidFuncPtr)NULL),
				PCintMode(0) {}
		PCIntvoidFuncPtr PCintFunc;
		uint8_t 	PCintMode;
		uint8_t		PCIntMask;
		static PCintPin	pinDataAlloc[MAX_PIN_CHANGE_PINS];
	};
	void		addPin(uint8_t mode,uint8_t mask,PCIntvoidFuncPtr userFunc);
	void		delPin(uint8_t mask);
	volatile	uint8_t&		portInputReg;
	volatile	uint8_t&		pcmask;
	const		uint8_t			PCICRbit;
	uint8_t			PCintLast;
	PCintPin*	pcIntPins[9];	// extra entry is a barrier
};
#endif
