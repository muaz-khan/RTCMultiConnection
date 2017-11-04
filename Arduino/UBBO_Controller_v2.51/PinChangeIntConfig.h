
// This file is used to separate the changes you make to personalize the 
// Pin Change Interrupt library from any future changes to the library itself.
// Ideally it would reside in the folder of the current sketch, but I have not 
// figured out how such a file can be included from a library.
// Nothing is required to be defined within this file since default values are
// defined in the primary PinChangeInt.h file.

// Uncomment the line below to limit the handler to servicing a single interrupt per invocation.
//#define	DISABLE_PCINT_MULTI_SERVICE

// Define the value MAX_PIN_CHANGE_PINS to limit the number of pins that may be 
// used for pin change interrupts. This value determines the number of pin change 
// interrupts supported for all ports.
//#define	MAX_PIN_CHANGE_PINS 2

// declare ports without pin change interrupts used
//#define	NO_PORTB_PINCHANGES
//#define	NO_PORTC_PINCHANGES
//#define	NO_PORTD_PINCHANGES
