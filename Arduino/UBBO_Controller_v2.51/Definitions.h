// For tablet serial prot
const char STX = '<';
const char ETX = '>';

//Speed / accel parameters
const int iSpeed = 400; // Initially 300
const int iSpeedTranslate = 300; // Initially 300
const int iSpeedTurn = 200; //
const int iSpeedMediumTurn = 300; //
const float fAcceleration = 1.0f; // can be 0 to disable
const float fDeceleration = 1.0f; // can be 0 to disable

int int_deceleration_time = 300; //initially 300



//Motor power pins
const int MOTOR1_ENABLE_PIN = 2;
const int MOTOR1_DIRECTION_PIN = 3;

const int MOTOR2_ENABLE_PIN=5;
const int MOTOR2_DIRECTION_PIN=6;

const int MOTOR3_ENABLE_PIN =8;
const int MOTOR3_DIRECTION_PIN =9;

const int MOTOR4_ENABLE_PIN = 11;
const int MOTOR4_DIRECTION_PIN = 12;

//Motors sensors
const int MOTOR1_IRQ_PIN = 18;
const int MOTOR1_IRQB_PIN = 31;

const int MOTOR2_IRQ_PIN = 19;
const int MOTOR2_IRQB_PIN = 32;

const int MOTOR3_IRQ_PIN = 20;
const int MOTOR3_IRQB_PIN = 33;

const int MOTOR4_IRQ_PIN = 21;
const int MOTOR4_IRQB_PIN = 34;

// dock station
const int DOCKED_DIGITAL_PIN = 40;
const int DOCK_RELAY_PIN = 39;  // pin  (can be 0 to disable)
const float DOCK_THRESHOLD_DISCHARGE = 5.0f;  // cut relay when discharge detected
const unsigned long DOCK_RELAY_INTERVAL = 5 * 60 * 1000UL; // check for charger power off every X ms
const unsigned long DOCK_RELAY_DURATION = 5 * 1000UL; // switch relay during X ms
const unsigned long DOCK_SCAN_TO = 30000; // scan timeout
const unsigned long DOCK_TRANSLATE_TO = 10000; // translate timeout
const unsigned long DOCK_TRANSLATE_SCAN_TO = 20000; // scan + translate timeout (bounce case)
const unsigned long DOCK_MOVE_TO = 60000; // run timeout

// auto dock station
boolean AUTO_DOCK_STATION = true; // do automatic "return to base" when bat level lower than AUTO_DOCK_MIN_VOLTAGE
const int AUTO_DOCK_MIN_VOLTAGE = 700; // min bat voltage
const unsigned long AUTO_DOCK_IDLE_TIME = 5 * 60 * 1000UL; // idle time before returning to home base

//Battery info
const int BATTERY_VOLTAGE_PIN = A0;
const int BATTERY_VOLTAGE_ALARM = 600;
float fBatteryVoltage = 0.0f;

// Proximity sensors
boolean bProximityDetection=true;
// analog / digital
const boolean FRONT_PROX_SENSOR_IS_ANALOG = false;
const boolean LEFT_PROX_SENSOR_IS_ANALOG = false;
const boolean BACK_PROX_SENSOR_IS_ANALOG = true;
const boolean RIGHT_PROX_SENSOR_IS_ANALOG = false;
// for analog, set distance
const int FRONT_PROX_SENSOR_ANALOG_DISTANCE = 30;
const int LEFT_PROX_SENSOR_ANALOG_DISTANCE = 30;
const int BACK_PROX_SENSOR_ANALOG_DISTANCE = 30;
const int RIGHT_PROX_SENSOR_ANALOG_DISTANCE = 27;
//pin
const int FRONT_PROX_SENSOR_PIN = A6;
const int LEFT_PROX_SENSOR_PIN = A7;
const int BACK_PROX_SENSOR_PIN = A8;
const int RIGHT_PROX_SENSOR_PIN = A9;
// cache value
boolean FRONT_PROX_SENSOR_VALUE = true;
boolean LEFT_PROX_SENSOR_VALUE = true;
boolean BACK_PROX_SENSOR_VALUE = true;
boolean RIGHT_PROX_SENSOR_VALUE = true;
//id
const int FRONT_PROX_SENSOR_ID = 0;
const int RIGHT_PROX_SENSOR_ID = 1;
const int BACK_PROX_SENSOR_ID = 2;
const int LEFT_PROX_SENSOR_ID = 3;

//InfraRed receivers
//pins
const int IR_LEFT_PIN = 28;
const int IR_CENTER_PIN = 29;
const int IR_RIGHT_PIN = 30;
// emitter code
const int IR_CODE_LEFT = 0xB3A3;
const int IR_CODE_RIGHT = 0xB4A4;
//id receivers
const int IR_RC_CENTER_ID = 0;
const int IR_RC_LEFT_ID = 1;
const int IR_RC_RIGHT_ID = 2;
//id transmitter
const int IR_TR_CENTER_ID = 0;
const int IR_TR_LEFT_ID = 1;
const int IR_TR_RIGHT_ID = 2;
//consts
const int IR_NUM_RECEIVERS = 3;
const int IR_NUM_TRANSMITTERS = 3;
const int IR_NUM_DETECTION = 2*IR_NUM_TRANSMITTERS;
const int IR_TIMER_DETECTION = 250;
const int IR_DELAY_LAST_SEEN = 1000; //Ms
//Command Values
const int GO_FORWARD = 0x01;
const int GO_BACKWARD = 0x02;
const int STOP = 0x03;
const int GO_BACK_DOCKSTATION = 0x4;
const int TRANSLATE_LEFT = 0x08;
const int TRANSLATE_RIGHT = 0x09;
const int MOVE_TABLET = 0x10;
const int HEART_BEAT = 0x11;
const int TURN_LEFT = 0x30;
const int TURN_RIGHT = 0x31;

// Status returned to tablet
const int SENSOR_STATUS = 0x20;
const int VERSION_STATUS = 0x21;
const int BATTERY_STATUS = 0x22;

//Nb max of variable in the message
const int MAX_VAR= 10;


const byte END_OF_FRAME_1 = 0x7F;
const byte END_OF_FRAME_2 = 0x00;
const byte END_OF_FRAME_3 = 0x7F;


#ifdef DEBUG
#define dbg_print(x)    Serial.print (x)
#define dbg_print_hex(x)    Serial.print (x,HEX)
#define dbg_println(x)  Serial.println (x)
#define dbg_println_hex(x,y)  Serial.println (x,HEX)
#define dbg2_print(x)    Serial2.print (x)
#define dbg2_println(x)  Serial2.println (x)
#define dbg_line() Serial.print("line : ");Serial.print(__LINE__)
#define dbg_lineln() Serial.print("line : ");Serial.println(__LINE__)
#else
#define dbg_print(x)
#define dbg_print_hex(x)
#define dbg_println(x)
#define dbg_println_hex(x)
#define dbg2_print(x)
#define dbg2_println(x)
#define dbg_line()
#define dbg_lineln()
#endif
