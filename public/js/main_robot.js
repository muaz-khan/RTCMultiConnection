// Blue web
// Obtain configured Bluetooth Terminal instance
let terminal = new BluetoothTerminal();

// Override `receive` method to log incoming data to the terminal
terminal.receive = function(data) {
    console.log(data, 'in');
};

// Override default log method to output messages to the terminal and console
terminal._log = function(...messages) {
    // We cannot use `super._log()` here
    messages.forEach(message => {
        let p = document.createElement('p')
        p.innerText = message;
        document.body.appendChild(p);
    });
};

// Bind event listeners to the UI elements
let connectButton = document.getElementById('connect');
connectButton.addEventListener('click', function() {
    terminal.connect().then(() => {
        console.log( `connected to ${terminal.getDeviceName()}`)
    });
});

let disconnectButton = document.getElementById('disconnect');
disconnectButton.addEventListener('click', function() {
    terminal.disconnect();
    console.log( 'disconnected' );
});

// Implement own send function to log outcoming data to the terminal
function send(data) {
    terminal.send(data).then(() => console.log(data, 'out')).catch(error => console.log(error));
}
document.querySelectorAll( '.cmd' ).forEach( d => d.addEventListener( 'click', e => {
    console.log( d.dataset.cmd );
    send( d.dataset.cmd );
} ) );

addEventListener('load', e => {
    mobileConsole.init();
    console.log('v0.3');
    console.log('sw.js back');
});


// UI / buttons events
document.getElementById('open-room').onclick = function() {
    disableInputButtons();
    connection.open(document.getElementById('room-id').value, function() {
        showRoomURL(connection.sessionid);
    });
};

function disableInputButtons() {
    document.getElementById('open-room').style.display = "none";
    document.getElementById('room-id').style.display = "none"
    document.getElementById('txt-cam').style.display = "block";
}

// ......................................................
// ..................RTCMultiConnection Code.............
// ......................................................

var connection = new RTCMultiConnection();

// by default, socket.io server is assumed to be deployed on your own URL
connection.socketURL = '/';

connection.socketMessageEvent = 'video-conference-demo';

connection.session = {
    audio: true,
    video: true
};

connection.sdpConstraints.mandatory = {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true
};

connection.videosContainer = document.getElementById('videos-container');
connection.onstream = function(event) {
    var width = parseInt(connection.videosContainer.clientWidth / 2) - 20;
    var mediaElement = getMediaElement(event.mediaElement, {
        title: event.userid,
        buttons: ['full-screen'],
        width: width,
        showOnMouseEnter: false
    });

    connection.videosContainer.appendChild(mediaElement);

    setTimeout(function() {
        mediaElement.media.play();
    }, 5000);

    mediaElement.id = event.streamid;
};

connection.onstreamended = function(event) {
    var mediaElement = document.getElementById(event.streamid);
    if (mediaElement) {
        mediaElement.parentNode.removeChild(mediaElement);
    }
};

// ......................................................
// ......................Handling Room-ID................
// ......................................................

function showRoomURL(roomid) {
    var roomHashURL = '#' + roomid;
    var roomQueryStringURL = '?roomid=' + roomid;

    var html = '<h2>Unique URL to connect to the robot:</h2>';

    html += 'Hash URL: ' + 'https://makerschat.herokuapp.com/' + roomHashURL + '</a>';
    html += '<br>';
    html += 'QueryString URL: ' + 'https://makerschat.herokuapp.com/' + roomQueryStringURL + '</a>';

    var roomURLsDiv = document.getElementById('room-urls');
    roomURLsDiv.innerHTML = html;

    roomURLsDiv.style.display = 'block';
}(function() {
    var params = {},
        r = /([^&=]+)=?([^&]*)/g;

    function d(s) {
        return decodeURIComponent(s.replace(/\+/g, ' '));
    }
    var match,
        search = window.location.search;
    while (match = r.exec(search.substring(1)))
        params[d(match[1])] = d(match[2]);
    window.params = params;
})();

var roomid = '';
if (localStorage.getItem(connection.socketMessageEvent)) {
    roomid = localStorage.getItem(connection.socketMessageEvent);
} else {
    roomid = connection.token();
}
document.getElementById('room-id').value = roomid;
document.getElementById('room-id').onkeyup = function() {
    localStorage.setItem(connection.socketMessageEvent, this.value);
};

var hashString = location.hash.replace('#', '');
if (hashString.length && hashString.indexOf('comment-') == 0) {
    hashString = '';
}

var roomid = params.roomid;
if (!roomid && hashString.length) {
    roomid = hashString;
}

if (roomid && roomid.length) {
    document.getElementById('room-id').value = roomid;
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

// to make it one-to-one
connection.maxParticipantsAllowed = 1;
connection.onRoomFull = function(roomid) {
    connection.closeSocket();
    connection.attachStreams.forEach(function(stream) {
        stream.stop();
    });

    enableInputButtons();

    alert('Room is full.');
};
