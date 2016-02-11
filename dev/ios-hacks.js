// ios-hacks.js

document.addEventListener('deviceready', function() {
    if (typeof cordova === 'undefined' || typeof cordova.plugins === 'undefined' || typeof cordova.plugins.iosrtc === 'undefined') return;
    if (!window.device || window.device.platform !== 'iOS') return;

    var iosrtc = cordova.plugins.iosrtc;
    RTCPeerConnection = iosrtc.RTCPeerConnection;
    RTCSessionDescription = iosrtc.RTCSessionDescription;
    RTCIceCandidate = iosrtc.RTCIceCandidate;
    MediaStream = iosrtc.MediaStream;
    MediaStreamTrack = iosrtc.MediaStreamTrack;

    iosrtc.debug.enable('iosrtc*');
    iosrtc.registerGlobals();
}, false);
