// mobileConsole
addEventListener( 'load', e => {
    mobileConsole.init();
} );

// Blue web
let terminal = new BluetoothTerminal();

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



// UI / buttons events
document.querySelector( '#open-room' ).addEventListener( 'click', function() {
    // terminal.connect().then(() => {
    //     console.log( `connected to ${terminal.getDeviceName()}`)
    // });

    connection.open( document.querySelector('#room-id').value, function() {
        showRoomURL(connection.sessionid);


        let socket = connection.getSocket();
        socket.on( 'cmd', data => {
            console.log( data )
            if( data.roomid === roomid ){
                // terminal.send( data.cmd );
            }
        } );
        // setInterval( function(){socket.emit('cmd', {roomid, cmd:'yo'} )},2000);
    });

    disableInputButtons();
});

function disableInputButtons() {
    document.querySelector('#open-room').style.display = "none";
    document.querySelector('#room-id').style.display = "none"
    document.querySelector('#txt-cam').style.display = "block";
}

// ......................................................
// ......................Handling Room-ID................
// ......................................................

function showRoomURL(roomid) {
    let roomHashURL = '#' + roomid;
    let roomQueryStringURL = '?roomid=' + roomid;

    let html = 'Hash URL: ' + 'https://makerschat.herokuapp.com/' + roomHashURL + '</a>';
    html += '<br>';
    html += 'QueryString URL: ' + 'https://makerschat.herokuapp.com/' + roomQueryStringURL + '</a>';

    let roomURLsDiv = document.querySelector('#room-urls');
    roomURLsDiv.innerHTML = html;

    roomURLsDiv.style.display = 'block';
}(function() {
    let params = {},
        r = /([^&=]+)=?([^&]*)/g;

    function d(s) {
        return decodeURIComponent(s.replace(/\+/g, ' '));
    }
    let match,
        search = window.location.search;
    while (match = r.exec(search.substring(1)))
        params[d(match[1])] = d(match[2]);
    window.params = params;
})();

let roomid = '';
if (localStorage.getItem(connection.socketMessageEvent)) {
    roomid = localStorage.getItem(connection.socketMessageEvent);
} else {
    roomid = connection.token();
}
document.querySelector('#room-id').value = roomid;
document.querySelector('#room-id').onkeyup = function() {
    localStorage.setItem(connection.socketMessageEvent, this.value);
};

let hashString = location.hash.replace('#', '');
if (hashString.length && hashString.indexOf('comment-') == 0) {
    hashString = '';
}

// let roomid = params.roomid;
if (!roomid && hashString.length) {
    roomid = hashString;
}

if (roomid && roomid.length) {
    document.querySelector('#room-id').value = roomid;
    localStorage.setItem(connection.socketMessageEvent, roomid);

    // auto-join-room
    (function reCheckRoomPresence() {
        connection.checkPresence(roomid, function(isRoomExists) {
            if (isRoomExists) {
                connection.join(roomid);
                return;
            }

            setTimeout(reCheckRoomPresence, 5000);
        });
    })();

    disableInputButtons();

}
