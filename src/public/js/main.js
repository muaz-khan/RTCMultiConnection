let socket, socketReady = false;

document.querySelector( '#join-room' ).addEventListener( 'click', e => {
    location = location.origin + document.querySelector( '#room-id' ).value;

    let roomid = location.hash.replace('#', '');
    if ( roomid != '' ) {
        console.log( roomid );
        localStorage.setItem( connection.socketMessageEvent, roomid );

        // auto-join-room
        ( function reCheckRoomPresence() {
            connection.checkPresence( roomid, isRoomExists => {
                if ( isRoomExists ) {
                    connection.join( roomid );
                    toggleButtons();
                    return;
                }

                setTimeout( reCheckRoomPresence, 5000 );
            } );
        } )();
    }
} );

function toggleButtons() {
    document.querySelector( '#pre-room' ).classList.toggle( 'hidden' );
    document.querySelector( '#in-room' ).classList.toggle( 'hidden' );
}

document.querySelectorAll( '.cmd-btn' ).forEach( d => d.addEventListener( 'click', e => {
    console.log( d.dataset.cmd );
    if( socketReady ) socket.emit( 'cmd', { cmd: d.dataset.cmd } );
} ) );
