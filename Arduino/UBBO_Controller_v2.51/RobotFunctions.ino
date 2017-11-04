void moveRobot( int iReqValue ){
    //    Forward   | 90
    //   |
    //   180 - - + - - 0
    //   |
    //   Backward   | 270

    boolean bMove = false;
    // map value received from 0->127 to 0->180.
    int iAngle = map(iReqValue,0,255,0,360);

    //Turn Right
    if (((iAngle >= 0) && (iAngle < 23)) && (( byCmd != byPreviousCmd) || !((iPreviousAngle >= 0) && (iPreviousAngle < 23)))){
        Ubbo.doMovement(Omni4WD::STAT_TURN_RIGHT, iSpeedTurn);
        bMove = true;
    }
    //Turn up right
    else if (((iAngle >= 23) && (iAngle < 68)) && (( byCmd != byPreviousCmd) || !((iPreviousAngle >= 23) && (iPreviousAngle < 68)))){
        Ubbo.doMovement(Omni4WD::STAT_TURN_UPRIGHT, iSpeedMediumTurn);
        bMove = true;
    }
    //Go Forward
    else if (((iAngle >= 68) && (iAngle < 113)) && (( byCmd != byPreviousCmd) || !((iPreviousAngle >= 68) && (iPreviousAngle < 113)))){
        Ubbo.doMovement(Omni4WD::STAT_MOVE_FORWARD, iSpeed);
        bMove = true;
    }
    else if (((iAngle >= 113) && (iAngle <=158)) && (( byCmd != byPreviousCmd) || !((iPreviousAngle >= 113) && (iPreviousAngle <= 158)))){
        Ubbo.doMovement(Omni4WD::STAT_TURN_UPLEFT, iSpeedMediumTurn);
        bMove = true;
    }
    else if (((iAngle > 158) && (iAngle <=203)) && (( byCmd != byPreviousCmd) || !((iPreviousAngle > 158) && (iPreviousAngle <= 203)))){
        Ubbo.doMovement(Omni4WD::STAT_TURN_LEFT, iSpeedTurn);
        bMove = true;
    }
    else if (((iAngle >= 203) && (iAngle < 248)) && (( byCmd != byPreviousCmd) || !((iPreviousAngle >= 203) && (iPreviousAngle < 248)))){
        Ubbo.doMovement(Omni4WD::STAT_TURN_DOWNLEFT, iSpeedMediumTurn);
        bMove = true;
    }
    else if (((iAngle >= 248) && (iAngle < 293)) && (( byCmd != byPreviousCmd) || !((iPreviousAngle >= 248) && (iPreviousAngle < 293)))){
        Ubbo.doMovement(Omni4WD::STAT_MOVE_BACKWARD, iSpeed);
        bMove = true;
    }
    else if (((iAngle >= 293) && (iAngle <=338)) && (( byCmd != byPreviousCmd) || !((iPreviousAngle >= 293) && (iPreviousAngle <= 338)))){
        Ubbo.doMovement(Omni4WD::STAT_TURN_DOWNRIGHT, iSpeedMediumTurn);
        bMove = true;
    }
    else if (((iAngle > 338) && (iAngle <=360)) && (( byCmd != byPreviousCmd) || !((iPreviousAngle > 338) && (iPreviousAngle < 360)))){
        Ubbo.doMovement(Omni4WD::STAT_TURN_RIGHT, iSpeedTurn);
        bMove = true;
    }

    if (bMove){
        //update Previous values
        iPreviousAngle = iAngle;
        byPreviousCmd = byCmd;
    }
}

void  moveTablet(int iReqValue){
    int iPos;
    byte iReqPos;

    // map value received from 0->127 to 0->180.
    iReqPos = map( iReqValue,0,127,0,180 );
    Serial3.write(STX);
    Serial3.write(iReqPos);
    Serial3.write(ETX);
}
