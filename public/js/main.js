let socket;

// UI / buttons events
document.getElementById('join-room').onclick = function() {
    disableInputButtons();
    connection.join(document.getElementById('room-id').value);
    socket = connection.getSocket();
};

function disableInputButtons() {
    document.getElementById('join-room').style.display = "none"
    document.getElementById('room-id').disabled = true;
    document.getElementById('txt-cam').style.display = "block";
    document.getElementById('div-buttons-robot').style.display = "block";
}

function enableInputButtons() {
    document.getElementById('join-room').disabled = false;
    document.getElementById('room-id').disabled = false;
}

document.getElementById('avant').onclick = function() {
    MoveRobotUp();
};

document.getElementById('arriere').onclick = function() {
    MoveRobotDown();
};

document.getElementById('gauche').onclick = function() {
    MoveRobotLeft();
};

document.getElementById('droite').onclick = function() {
    MoveRobotRight();
};

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case "ArrowUp":
            MoveRobotUp();
            break;
        case "ArrowDown":
            MoveRobotDown();
            break;
        case "ArrowLeft":
            MoveRobotLeft();
            break;
        case "ArrowRight":
            MoveRobotRight();
            break;
        default:
    }
});

// FONCTIONS TO MOVE ROBOT

function MoveRobotUp() {
    console.log("En AVANT !!!");
    socket.emit('cmd', {cmd:'u'});
}

function MoveRobotDown() {
    console.log("En ARRIERE !!!");
    socket.emit('cmd', {cmd:'d'});
}

function MoveRobotLeft() {
    console.log("GAUCHE TOUTE !!!");
    socket.emit('cmd', {cmd:'l'});
}

function MoveRobotRight() {
    console.log("DROITE TOUTE !!!");
    socket.emit('cmd', {cmd:'r'});
}

// ......................................................
// ..................RTCMultiConnection Code.............
// ......................................................

var connection = new RTCMultiConnection();

// by default, socket.io server is assumed to be deployed on your own URL
connection.socketURL = '/';

// comment-out below line if you do not have your own socket.io server
// connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';

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
    var width = parseInt(connection.videosContainer.clientWidth / 4) - 20;
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
