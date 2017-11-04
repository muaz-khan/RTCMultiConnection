// ......................................................
// ..................RTCMultiConnection Code.............
// ......................................................

const connection = new RTCMultiConnection();

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

connection.videosContainer = document.querySelector( '#videos-container' );
connection.onstream = event => {
    let mediaElement = getMediaElement( event.mediaElement, {
        // title: event.userid,
        // buttons: [ 'full-screen' ],
        buttons: [],
        showOnMouseEnter: false
    } );

    connection.videosContainer.appendChild( mediaElement );

    setTimeout( () => mediaElement.media.play(), 5000 );

    mediaElement.id = event.streamid;

    let videos = connection.videosContainer.querySelectorAll( 'video' );
    videos[ videos.length - 1 ].classList.toggle( 'full', true );
    if( videos.length == 2 ){
        videos[ 0 ].classList.toggle( 'full', false );
        videos[ 0 ].classList.toggle( 'second', true );
    }
};

connection.onstreamended = event => {
    let mediaElement = document.getElementById( event.streamid );
    if( mediaElement ) {
        mediaElement.parentNode.removeChild( mediaElement );
    }
};

// to make it one-to-one
connection.maxParticipantsAllowed = 1;
connection.onRoomFull = function( roomid ) {
    connection.closeSocket();
    connection.attachStreams.forEach(  stream => {
        stream.stop();
    } );

    location = location.origin;
    toggleButtons();

    alert( 'Room is full.' );
};
