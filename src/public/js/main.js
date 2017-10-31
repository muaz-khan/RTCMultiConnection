let socket, socketReady = false;
console.log( location )
// UI / buttons events
document.getElementById('join-room').onclick = function() {
    location = location.origin + document.getElementById('room-id').value;

    // ......................................................
    // ......................Handling Room-ID................
    // ......................................................

    var roomid = '';

    var hashString = location.hash.replace('#', '');
    if (hashString.length && hashString.indexOf('comment-') == 0) {
        hashString = '';
    }

    if (!roomid && hashString.length) {
        roomid = hashString;
    }

    if (roomid && roomid.length) {
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
};

function disableInputButtons() {
    document.getElementById('room-id').style.display = "none";
    document.getElementById('join-room').style.display = "none";
    document.getElementById('txt-cam').style.display = "block";
    document.getElementById('div-buttons-robot').style.display = "block";
}

function enableInputButtons() {
    document.getElementById('room-id').style.display = "auto";
    document.getElementById('join-room').style.display = "auto";
    document.getElementById('txt-cam').style.display = "none";
    document.getElementById('div-buttons-robot').style.display = "none";
}

document.querySelectorAll( '.cmd-btn' ).forEach( d => d.addEventListener( 'click', e => {
    console.log( d.dataset.cmd );
    if(socketReady) socket.emit('cmd', { cmd: d.dataset.cmd } );
} ) );


// ......................................................
// ..................RTCMultiConnection Code.............
// ......................................................

var connection = new RTCMultiConnection();

(function setupRTCConnection(){
    // by default, socket.io server is assumed to be deployed on your own URL
    // connection.socketURL = '/';

    // connection.socketMessageEvent = 'video-conference-demo';

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
        socket = connection.getSocket();
        socketReady = true;

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

    // to make it one-to-one
    connection.maxParticipantsAllowed = 1;
    connection.onRoomFull = function(roomid) {
        connection.closeSocket();
        connection.attachStreams.forEach(function(stream) {
            stream.stop();
        });

        location = location.origin;
        enableInputButtons();

        alert('Room is full.');
    };
})();
