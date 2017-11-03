// mobileConsole
// addEventListener( 'load', e => {
//     mobileConsole.init();
// } );

// Blue web
let terminal, hasBT = false;
if( navigator.bluetooth ) {
    hasBT = true;
    terminal = new BluetoothTerminal();

    terminal.receive = data => {
        console.log( data, 'in' );
    };

    terminal._log = ( ...messages ) => {
        messages.forEach( message => {
            let p = document.createElement( 'p' );
            p.innerText = message;
            document.body.appendChild(p);
        } );
    };
}

// UI / buttons events
document.querySelector( '#open-room' ).addEventListener( 'click', () => {
    let roomid = document.querySelector( '#room-id' ).value;

    localStorage.setItem( connection.socketMessageEvent, roomid );

    if( hasBT ){
        terminal.connect().then(() => {
            console.log( `connected to ${ terminal.getDeviceName() }`)
        } );
    }

    connection.open( roomid, () => {
        document.querySelector( '#pre-room' ).classList.toggle( 'hidden' );
        document.querySelector( '#in-room' ).classList.toggle( 'hidden' );
        console.log( `Join bot here: https://makerschat.herokuapp.com/#${ connection.sessionid }` );

        connection.getSocket( socket => {
            socket.on( 'cmd', data => {
                console.log( data );
                if( data.roomid === roomid ){
                    if( hasBT ) terminal.send( data.cmd );
                }
            } );
        } );
    } );
} );
