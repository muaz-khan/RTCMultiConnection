
document.querySelector( '#join-room' ).addEventListener( 'click', e => {
    let socket, socketReady = false;

    location = location.origin + '/#' + document.querySelector( '#room-id' ).value;

    let roomid = location.hash.replace('#', '');
    if ( roomid != '' ) {
        console.log( roomid );
        localStorage.setItem( connection.socketMessageEvent, roomid );

        // auto-join-room
        ( function reCheckRoomPresence() {
            connection.checkPresence( roomid, isRoomExists => {
                if ( isRoomExists ) {
                    connection.join( roomid, () => {
                        console.log( 'connection joined' );
                        connection.getSocket( _socket => {
                            socket = _socket;
                            socketReady = true;
                        } );
                    } );
                    toggleButtons();
                    return;
                }

                setTimeout( reCheckRoomPresence, 5000 );
            } );
        } )();
    }

    function toggleButtons() {
        document.querySelector( '#pre-room' ).classList.toggle( 'hidden' );
        document.querySelector( '#in-room' ).classList.toggle( 'hidden' );
    }

    let cmd = '';
    document.querySelectorAll( '.cmd-btn' ).forEach( d => {
        d.addEventListener( 'mousedown', e => {
            cmd = d.dataset.cmd;
            sendCmd();
        } );
        d.addEventListener( 'mouseup', e => {
            cmd = '';
        } );
    } );

    function sendCmd(){
        if( cmd != '' && socketReady ){
            socket.emit( 'cmd', { roomid, cmd } );
            setTimeout( sendCmd, 500 );
        }
    }
} );
