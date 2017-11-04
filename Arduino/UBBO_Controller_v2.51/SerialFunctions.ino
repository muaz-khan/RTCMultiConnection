/////////////
// Serial Functions
///////////

/*
  SerialEvent occurs whenever a new data comes in the
 hardware serial RX.  This routine is run between each
 time loop() runs, so using delay inside loop can delay
 response.  Multiple bytes of data may be available.
 */
void serialEvent()
{
    HardwareSerial &mySerial = Serial;
    byte byData = 0;
    byte byDataSize = 0;
    bool bDataRemaining = true;
    bool bStatus = true;


    //Init global variables
    initSerialVars();


    //Get Commande and var ize
    if (mySerial.available())
    {
        byCmd = (byte)mySerial.read();            //Read the command
        if (bStatus = waitForIncomingData(mySerial))
        {
            byDataSize = (byte)mySerial.read();       //Read the embedded data size
            if(byDataSize >= MAX_VAR) byDataSize = MAX_VAR - 1;
            
            if (byDataSize > 0)
            {
                bStatus = waitForIncomingData(mySerial);
            }
            else bDataRemaining = false;
        }

        if (bStatus)
        {
            //Get var
            while (mySerial.available() && (bDataRemaining == true) )
            {
                byData = (byte)mySerial.read();           //Read the data
                byMessage[iMessageSize] = byData;
                iMessageSize++;

                if (iMessageSize == byDataSize)
                    bDataRemaining = false;
            }
            if ((bDataRemaining == false) && bStatus)
            {

                dbg_print("Full message: ");
                dbg_print("<0x");
                dbg_print_hex(byCmd);
                dbg_print(">");
                dbg_print("<0x");
                dbg_print_hex(byDataSize);
                dbg_print(">");

                for (int i=0;i<iMessageSize;i++)
                {
                    dbg_print("<0x");
                    dbg_print_hex(byMessage[i]);
                    dbg_print(">");
                }
                dbg_println(".");
                bDataRemaining = true;

                if (!bCheckForEndOfFrame(mySerial))
                {
                    //Init global variables
                    initSerialVars();
                    dbg_println("Bad EOF!");
                }
                else
                {
                    //Split Data to get the info
                    if (bParseData())
                    {
                        // Data Received State to true
                        bDataReceived = true;
                    }
                }
            }
        }
        else
        {
            //Init global variables
            initSerialVars();
            dbg_println("Message incomplete. Cleared! Not executed!");
        }
        // clear the Incoming Data
        //while (mySerial.available()) mySerial.read();
        //mySerial.flush();
    }
}

void serialEvent2()
{

    HardwareSerial &mySerial = Serial2;

    byte byData = 0;
    byte byDataSize = 0;
    boolean bDataRemaining = true;
    boolean bStatus = true;

    //Init global variables
    initSerialVars();

    //Get Commande and var ize
    if (mySerial.available())
    {
        byCmd = (byte)mySerial.read();            //Read the command
        if (bStatus = waitForIncomingData(mySerial))
        {
            byDataSize = (byte)mySerial.read();       //Read the embedded data size
            if(byDataSize >= MAX_VAR) byDataSize = MAX_VAR - 1;
            if (byDataSize > 0)
            {
                bStatus = waitForIncomingData(mySerial);
            }
            else bDataRemaining = false;
        }

        if (bStatus)
        {

          
            //Get var
            while (mySerial.available() && (bDataRemaining == true))
            {
                byData = (byte)mySerial.read();//Read the data
                byMessage[iMessageSize] = byData;
                iMessageSize++;
                if (iMessageSize == byDataSize)
                    bDataRemaining = false;
            }
            if ((bDataRemaining == false) && bStatus)
            {

                dbg_print("message: ");
                dbg_print("<0x");
                dbg_print_hex(byCmd);
                dbg_print(">");
                dbg_print("<0x");
                dbg_print_hex(byDataSize);
                dbg_print(">");

                for (int i = 0; i < iMessageSize; i++)
                {
                    dbg_print("<0x");
                    dbg_print_hex(byMessage[i]);
                    dbg_print(">");
                }
                dbg_println(".");

                bDataRemaining = true;
                if (!bCheckForEndOfFrame(mySerial))
                {
                    //Init global variables
                    initSerialVars();
                    dbg_println("Bad EOF!");
                }
                else
                {
                    //Split Data to get the info
                    if (bParseData())
                    {
                        // Data Received State to true
                        bDataReceived = true;
                    }
                }
            }
            
        }
        else
        {
            dbg_println("Message incomplete. Cleared! Not executed!");
            dbg_print("message: ");
            dbg_print("<0x");
            dbg_print_hex(byCmd);
            dbg_print(">");
            dbg_print("<0x");
            dbg_print_hex(byDataSize);
            dbg_print(">");

            for (int i=0;i<iMessageSize;i++)
            {
                dbg_print("<0x");
                dbg_print_hex(byMessage[i]);
                dbg_print(">");
            }
            dbg_println(".");
            //Init global variables
            initSerialVars();
        }

        // clear the Incoming Data
        //while (mySerial.available()) mySerial.read();
        //mySerial.flush();
    }


    
}


boolean bParseData()
{
    int iBlockVarSize = 2;
    int iDataIndex = 0;
    int iVarIndex = 0;

    byPosition = byMessage[0];

    if (iMessageSize >1)
    {
        for (iVarIndex = 0; iVarIndex < (int)(iMessageSize/2); iVarIndex++)
        {
            byVarType[iVarIndex] = byMessage[iDataIndex+1];
            byVarValue[iVarIndex] = byMessage[iDataIndex+2];
            dbg_print("byVarType[");
            dbg_print(iVarIndex);
            dbg_print("]=");
            dbg_println(byVarType[iVarIndex]);
            dbg_print("byVarValue[");
            dbg_print(iVarIndex);
            dbg_print("]=");
            dbg_println(byVarValue[iVarIndex]);
            iDataIndex+=2;
        }
    }
    iNbVar = iVarIndex;


    // Problem with message size
    if ((iMessageSize >=2) && (iDataIndex != (iMessageSize-1)))
        return false;

    return true;
}

boolean waitForIncomingData(HardwareSerial &hCom)
{

    int iLoop = 0;
    boolean bTimeoutNotReached = 1;

    while (!hCom.available())
    {
        Ubbo.delayMS(5);   //wait for new data
        iLoop++;
        if (iLoop >=100)
        {
            bTimeoutNotReached = 0;
            dbg_println("data not received after 500ms. Flush..");
            break;
        }
    }

    return bTimeoutNotReached;
}


boolean bCheckForEndOfFrame(HardwareSerial &hCom)
{
    boolean bStatus = false;

    if (waitForIncomingData(hCom))
    {
        int byEndofFrame1 = (byte)hCom.read();       //Read the embedded data size
        //dbg_print("byEndofFrame1:");
        //dbg_println(byEndofFrame1);
        if ((byEndofFrame1 == END_OF_FRAME_1) && (waitForIncomingData(hCom)))
        {
            int byEndofFrame2 = (byte)hCom.read();       //Read the embedded data size
            //dbg_print("byEndofFrame2:");
            //dbg_println(byEndofFrame2);
            if ((byEndofFrame2 == END_OF_FRAME_2) && (waitForIncomingData(hCom)))
            {
                int byEndofFrame3 = (byte)hCom.read();       //Read the embedded data size
                //dbg_print("byEndofFrame3:");
                //dbg_println(byEndofFrame3);
                if (byEndofFrame3 == END_OF_FRAME_3)
                {
                    bStatus = true;
                    //dbg_println("good End of Frame 3 ");
                }
                else
                {
                    dbg_print("byEndofFrame: <0x");
                    dbg_print_hex(byEndofFrame1);
                    dbg_print("><0x");
                    dbg_print_hex(byEndofFrame2);
                    dbg_print("><0x");
                    dbg_print_hex(byEndofFrame3);
                    dbg_println(">");
                }
            }
            else
            {
                dbg_print("byEndofFrame: <0x");
                dbg_print_hex(byEndofFrame1);
                dbg_print("><0x");
                dbg_print_hex(byEndofFrame2);
                dbg_println(">");
            }
        }
        else
        {
            dbg_print("byEndofFrame: <0x");
            dbg_print_hex(byEndofFrame1);
            dbg_println(">");
        }
    }
    return bStatus;
}


void initSerialVars()
{
    iNbVar= 0;

    iMessageSize = 0;
    byCmd = 0;
    for (int i=0; i < MAX_VAR; i++)
    {
        byMessage[i] = '\0';
        byVarType[i] = '\0';
        byVarValue[i] = '\0';
    }
}



void printHex8(HardwareSerial &hCom, uint8_t iData) // prints 8-bit data in hex with leading zeroes
{
    if (iData<0x10)
      hCom.print(0,HEX);
    hCom.print(iData,HEX); 
}
