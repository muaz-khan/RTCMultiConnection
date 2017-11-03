// ......................................................
// ..................RTCMultiConnection Code.............
// ......................................................

const connection = new RTCMultiConnection();

( function setupRTCConnection(){
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

    connection.videosContainer = document.querySelector('#videos-container');
    connection.onstream = function( event ) {
        socket = connection.getSocket();
        socketReady = true;

        let width = parseInt( connection.videosContainer.clientWidth / 4 ) - 20;
        let mediaElement = getMediaElement( event.mediaElement, {
            // title: event.userid,
            // buttons: [ 'full-screen' ],
            // width: width,
            showOnMouseEnter: false
        } );

        connection.videosContainer.appendChild( mediaElement );

        setTimeout( () => mediaElement.media.play(), 5000 );

        mediaElement.id = event.streamid;
    };

    connection.onstreamended = function( event ) {
        let mediaElement = document.getElementById( event.streamid );
        if (mediaElement) {
            mediaElement.parentNode.removeChild( mediaElement );
        }
    };

    // to make it one-to-one
    connection.maxParticipantsAllowed = 1;
    connection.onRoomFull = function( roomid ) {
        connection.closeSocket();
        connection.attachStreams.forEach( function( stream ) {
            stream.stop();
        } );

        location = location.origin;
        toggleButtons();

        alert( 'Room is full.' );
    };
} )();
