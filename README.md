## [RTCMultiConnection](http://www.rtcmulticonnection.org/) experimental

It is experimental repository for RTCMultiConnection.js which means that every single update will be pushed to this repo until RTCMultiConnection current version gets stable.

=

## Current Version is [v1.9](http://www.rtcmulticonnection.org/changes-log/#v1.9)

## Recent Changes?

<ol>
                    <li>
                        RTCMultiConnection is updated for <code>audio+screen</code> from single getUserMedia request for Firefox Nightly. Below snippet is sharing single video stream containing both audio/video tracks; and target browser is joining with only audio. Screen can be viewed on both chrome and Firefox. If you'll share from chrome, then it will be making multiple getUserMedia requests.
                        <pre class="sh_javascript">
// audio+video+screen will become audio+screen for Firefox
// because Firefox isn't supporting multi-streams feature

// initiator from Firefox
initiator.<a href="http://www.RTCMultiConnection.org/docs/session/"><code>session</code></a> = {
    screen: true,
    audio: true
};

// participant in chrome or Firefox
participant.<a href="http://www.RTCMultiConnection.org/docs/onNewSession/"><code>onNewSession</code></a> = function(session) {
    session.join({ audio: true });
};
</pre>
                    </li>
                    <li>
                        Screen capturing support for Firefox nightly added. You simply need to open "<code>about:config</code>" on Firefox nightly and set "<code>media.getusermedia.screensharing.enabled</code>" to "<code>true</code>".
                        <pre class="sh_javascript">
// same for Firefox
connection.<a href="http://www.RTCMultiConnection.org/docs/session/"><code>session</code></a> = {
    screen: true,
    oneway: true
};
</pre>
                    </li>
                    
                    <li>
                        <code>connection.<a href="http://www.RTCMultiConnection.org/docs/dontCaptureUserMedia/"><code>dontCaptureUserMedia</code></a></code> added:
                        <pre class="sh_javascript">
connection.<a href="http://www.RTCMultiConnection.org/docs/dontCaptureUserMedia/"><code>dontCaptureUserMedia</code></a> = true;
</pre>
                    </li>
                    
                    <li>
                        <code>connection.<a href="http://www.RTCMultiConnection.org/docs/dontAttachStream/"><code>dontAttachStream</code></a></code> updated:
                        <pre class="sh_javascript">
connection.<a href="http://www.RTCMultiConnection.org/docs/dontAttachStream/"><code>dontAttachStream</code></a> = true;
</pre>
                    </li>
                    
                    <li>
                        <code>connection.onstreamid</code> added:
                        <pre class="sh_javascript">
// on getting remote stream's clue
connection.onstreamid = function (e) {
    var mediaElement = document.createElement(e.isAudio ? 'audio' : 'video');
    mediaElement.controls = true;
    mediaElement.poster = connection.resources.muted;
    mediaElement.id = e.streamid;
    connection.body.appendChild(mediaElement);
};

// on getting local or remote media stream
connection.onstream = function (e) {
    if (e.type == 'local') {
        connection.body.appendChild(e.mediaElement);
        return;
    }

    var mediaElement = document.getElementById(e.streamid);
    if (!mediaElement) return;
    mediaElement.src = e.blobURL;
    mediaElement.play();
};

// when remote user closed the stream
connection.onstreamended = function (e) {
    if (e.type == 'local') {
        e.mediaElement.parentNode.removeChild(e.mediaElement);
        return;
    }

    var mediaElement = document.getElementById(e.streamid);
    if (!mediaElement) return;
    mediaElement.parentNode.removeChild(mediaElement);
};
</pre>
                    </li>
                    
                    <li>
                        <code>connection.peers['target-userid'].getStats</code> added.
                        <pre class="sh_javascript">
connection.peers['target-userid'].peer.getStats(function (result) {
    // many useful statistics here
});
</pre>
                    </li>
                    
                    <li>
                        <code>connection.onconnected</code> added.
                        <pre class="sh_javascript">
connection.onconnected = function (event) {
    log('Peer connection has been established between you and', event.userid);
    
    // event.peer.addStream || event.peer.removeStream || event.peer.changeBandwidth
    // event.peer == connection.peers[event.userid]
    
    event.peer.getStats(function (result) {
        // many useful statistics here
    });
};
</pre>
                    </li>
                    
                    <li>
                        <code>connection.onfailed</code> added.
                        <pre class="sh_javascript">
connection.onfailed = function (event) {
    event.peer.renegotiate();
    // or event.peer.redial();
    // event.targetuser.browser == 'firefox' || 'chrome'
};
</pre>
                    </li>
                    
                    <li>
                        <code>connection.<a href="http://www.RTCMultiConnection.org/docs/eject/"><code>eject</code></a></code> is fixed.
                        <pre class="sh_javascript">
connection.<a href="http://www.RTCMultiConnection.org/docs/eject/"><code>eject</code></a>('target-userid');

// check if user is ejected
// clear rooms-list if user is ejected
connection.<a href="http://www.RTCMultiConnection.org/docs/onSessionClosed/"><code>onSessionClosed</code></a> = function (session) {
    if (session.isEjected) {
        warn(session.userid, 'ejected you.');
    } else warn('Session has been closed.', session);

    if (session.isEjected) {
        roomsList.innerHTML = '';
        roomsList.style.display = 'block';
    }
};
</pre>
                    </li>
                    
                    <li>
                        Fixed: <code>remoteEvent.streamid</code> and <code>remoteEvent.isScreen</code>:
                        <pre class="sh_javascript">
connection.<a href="http://www.RTCMultiConnection.org/docs/onstream/"><code>onstream</code></a> = function(event) {
    if(event.isScreen) {
        // it is screen
    }
};
</pre>
                    </li>
                    
                    <li>
                        Screen capturing is improved, and <a href="https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk">single google chrome extension</a> is used to support capturing from all domains!
                    </li>
                    
                    <li>
                        <code>connection.<a href="http://www.RTCMultiConnection.org/docs/processSdp/"><code>processSdp</code></a></code> added.
                        <pre class="sh_javascript">
connection.<a href="http://www.RTCMultiConnection.org/docs/processSdp/"><code>processSdp</code></a> = function(sdp) {
    sdp = remove_vp8_codecs(sdp);
    sdp = prefer_opus (sdp);
    sdp = use_maxaveragebitrate(sdp);
    return sdp;
};
</pre>
                    </li>
                    
                    <li>
                        <code><a href="http://www.RTCMultiConnection.org/docs/session/">connection.session</a>={}</code> fixed. It allows moderator/initiator to become a listener/viewer i.e. it supports many-to-one scenarios:
                        <pre class="sh_javascript">
// for initiator
connection.<a href="http://www.RTCMultiConnection.org/docs/session/"><code>session</code></a> = {};

// for participants
connection.<a href="http://www.RTCMultiConnection.org/docs/onNewSession/"><code>onNewSession</code></a> = function(session) {
    session.<a href="http://www.RTCMultiConnection.org/docs/join/"><code>join</code></a>({
        audio: true,
        video: true
    });
};
</pre>
                    </li>
                    
                    <li>
                        <code><a href="http://www.RTCMultiConnection.org/docs/mediaConstraints/">connection.mediaConstraints</a></code> and <code><a href="http://www.RTCMultiConnection.org/docs/media/">connection.media</a></code> are updated:
                        <pre class="sh_javascript">
connection.<a href="http://www.RTCMultiConnection.org/docs/mediaConstraints/"><code>mediaConstraints</code></a> = {
    mandatory: {
        maxWidth: 1920,
        maxHeight: 1080,
        minAspectRatio: 1.77,

        minFrameRate: 3,
        maxFrameRate: 64
    },
    optional: [
        bandwidth: 256
    ]
};
</pre>
                    </li>
                    
                    <li>
                        <code><a href="http://www.RTCMultiConnection.org/docs/onstream/">connection.onstream</a></code> is updated for <code>event.isScreen</code>:
                        <pre class="sh_javascript">
connection.<code><a href="http://www.RTCMultiConnection.org/docs/onstream/">onstream</a></code> = function (event) {
    if(event.isScreen) {
        // it is screen stream
    }
    
    if(event.isAudio) {
        // it is audio-only stream
    }
    
    if(event.isVideo) {
        // it is audio+video stream
    }
};
</pre>
                    </li>
                    
                    <li>
                        <code><a href="http://www.RTCMultiConnection.org/docs/refresh/">connection.refresh</a></code> is updated and session re-initiation is improved.
                        <pre class="sh_javascript">
// you simply need to invoke "connection.<code><a href="http://www.RTCMultiConnection.org/docs/leave/">leave</a></code>" to 
// leave a session so that you can rejoin same session
connection.<code><a href="http://www.RTCMultiConnection.org/docs/onstatechange/">onstatechange</a></code> = function (state) {
    if(state == 'connected-with-initiator') {
        document.getElementById('leave-session').disabled = false;
    }
};

document.getElementById('leave-session').onclick = function() {
    connection.<code><a href="http://www.RTCMultiConnection.org/docs/leave/">leave</a></code>();
};
</pre>
                    </li>
                    
                    <li>
                        <code>connection.iceProtocols</code> added.
                        <pre class="sh_javascript">
connection.iceProtocols = {
    tcp: true, // prefer using TCP-candidates
    udp: true  // prefer using UDP-candidates
};
</pre>
                    </li>
                    
                    <li>
                        Use custom chrome extension for screen capturing:
                        <pre class="sh_javascript">
connection.<code><a href="http://www.rtcmulticonnection.org/docs/DetectRTC/">DetectRTC</a></code>.screen.<code><a href="http://www.rtcmulticonnection.org/docs/DetectRTC/#DetectRTC.screen">extensionid</a></code> = 'your-app-store-extensionid';
</pre>
                    </li>
                    
                    <li>
                        STUN/TURN servers are updated; as well as ICE-servers from XirSys are used:
                        <pre class="sh_javascript">
// to disable XirSys ICE-Servers
connection.getExternalIceServers = false;
</pre>
                    </li>
                    
                    <li>
                        <code>connection.preventSSLAutoAllowed</code> is disabled.
                        <pre class="sh_javascript">
// to enable it
connection.preventSSLAutoAllowed = true;
</pre>
                    </li>
                </ol>


=

## Issues?

<ol>
    <li>
        Audio/Video recording must support single-file for Firefox.
    </li>
    
    <li>
        Need to use maxaveragebitrate for audio bandwidth.
    </li>
    
    <li>
        <p>
            "groupId" returned by MediaDeviceInfo object refers to single device with multiple tracks.
        </p>
        
        <p>
            Need to provide API like this:
        </p>
        
        <pre>
connection.DetectRTC.MediaDevices.forEach(function (device) {
    //---device.audioinput(headset's microphone)
    //-------- device.audioinput.deviceid

    //--- device.audiooutput (headset's speakers);
    //--------device.audioinput.audiooutput

    //---device.videoinput(webcam)
    //--------device.videoinput.audiooutput
});

// there is no "videoutput" in the spec.
// it means that we can't detect which monitor is used for video output.
</pre>
    </li>
    
    <li>
        "<code>removeStream</code>" shim needed for Firefox.
    </li>
    
    <li>
        "<code>stream.onended</code>" should be thoroughly tested for Firefox. <a href="http://www.rtcmulticonnection.org/docs/onstreamended/">onstreamended</a> event must be fired once.
    </li>
    
    <li>
        if("<code>connection.trickleIce==false</code>") then renegotiation fails.
    </li>
    
    <li>
        "<code>&lt;input type=file multiparts&gt;</code>": RTCMultiConnection fails to send multiple files, simultaneously.
    </li>
    
    <li>
        "<code>DetectRTC</code>" fails to detect microphone or camera presence, in case if there are more than one devices attached to the system. "<code>navigator.getMediaDevices</code>" fails to list those rejected/denied/not-available devices.
    </li>
    
    <li>
        "<code>navigator.getMediaDevices</code>" works with only audio devices (on canary). Though, it seems chromium issue.
    </li>
    
    <li>
        "<code>connection.autoRedialOnFailure</code>" still fails with renegotiation scenarios because when renegotiating media, connection state always changes to "disconnected" then it follows connection steps from beginning i.e. `disconnected > new > checking > connected > completed` . Read more <a href="http://muaz-khan.blogspot.com/2014/05/webrtc-tips-tricks.html">here</a>.
    </li>
    
    <li>
        <p>
            (wontfix) Renegotiation scenarios that fails:
        </p>
        <ol>
            <li>if chrome starts video-only session and firefox joins with only audio</li>
            <li>if chrome starts with audio-only session and firefox joins with only video</li>
            <li>if chrome starts only audio and firefox joins with audio+video</li>
        </ol>
    </li>
    
    <li>
        getMediaDevices is going to be renamed enumerateDevices which will cause more shims. <a href="https://code.google.com/p/chromium/issues/detail?id=388648">chromium#388648</a>
    </li>
    
    <li>
        Use "googIPv6" when canary is fixed to add both UDP and TCP ipv6 addresses.
    </li>
</ol>

=

## What is RTCMultiConnection?

RTCMultiConnection is a <a href="https://www.webrtc-experiment.com/">WebRTC</a> JavaScript wrapper library runs top over RTCPeerConnection API to provide multi-session establishment scenarios. It also provides dozens of features as hybrid-less mesh networking model, a reliable presence detection and syncing system; complex renegotiation scenarios; and much more. It provides everything you've in your mind! Just understand the API and you'll enjoy using it! It is simple and its syntax is similar as WebSockets JavaScript API and RTCPeerConnection API.

It is <a href="https://www.webrtc-experiment.com/licence/">MIT Licenced</a>, which means that you can use it in any commercial/non-commercial product, free of cost.

=

## Want to try latest stable version?

```html
// recommended link (you can even use version numbers)
// e.g. cdn.webrtc-experiment.com/RTCMultiConnection-v1.9.js
<script src="//cdn.webrtc-experiment.com/RTCMultiConnection.js"></script>

// or
<script src="//www.rtcmulticonnection.org/latest.js"></script>

// or
<script src="//www.webrtc-experiment.com/RTCMultiConnection-v1.9.js"></script>
```

=

## RTCMultiConnection older changes log

<table style="font-size:18px; font-weight:bold; margin:0; padding:0; margin-left:auto; margin-right:auto; text-align:center;">
    <thead>
        <th>RTCMultiConnection Version</th>
        <th>Changes Logs</th>
    </thead>
    <tbody>
        <tr>
            <td>
                <a href="https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/Library/RTCMultiConnection-v1.9.js">RTCMultiConnection-v1.9.js</a>
            </td>
            
            <td>
                <a href="http://www.rtcmulticonnection.org/changes-log/#v1.9">Changes Log</a>
            </td>
        </tr>
        
        <tr>
            <td>
                <a href="https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/Library/RTCMultiConnection-v1.8.js">RTCMultiConnection-v1.8.js</a>
            </td>
            
            <td>
                <a href="http://www.rtcmulticonnection.org/changes-log/#v1.8">Changes Log</a>
            </td>
        </tr>
        
        <tr>
            <td>
                <a href="https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/Library/RTCMultiConnection-v1.7.js">RTCMultiConnection-v1.7.js</a>
            </td>
            
            <td>
                <a href="http://www.rtcmulticonnection.org/changes-log/#v1.7">Changes Log</a>
            </td>
        </tr>
        
        <tr>
            <td>
                <a href="https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/Library/RTCMultiConnection-v1.6.js">RTCMultiConnection-v1.6.js</a>
            </td>
            
            <td>
                <a href="http://www.rtcmulticonnection.org/changes-log/#v1.6">Changes Log</a>
            </td>
        </tr>
        
        <tr>
            <td>
                <a href="https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/Library/RTCMultiConnection-v1.5.js">RTCMultiConnection-v1.5.js</a>
            </td>
            
            <td>
                <a href="http://www.rtcmulticonnection.org/changes-log/#v1.5">Changes Log</a>
            </td>
        </tr>
        
        <tr>
            <td>
                <a href="https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/Library/RTCMultiConnection-v1.4.js">RTCMultiConnection-v1.4.js</a>
            </td>
            
            <td>
                <a href="http://www.rtcmulticonnection.org/changes-log/#v1.4">Changes Log</a>
            </td>
        </tr>
        
        <tr>
            <td>
                <a href="https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/Library/RTCMultiConnection-v1.3.js">RTCMultiConnection-v1.3.js</a>
            </td>
            
            <td>
                <a href="http://www.rtcmulticonnection.org/changes-log/#v1.3">Changes Log</a>
            </td>
        </tr>
        
        <tr>
            <td>
                <a href="https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/Library/RTCMultiConnection-v1.2.js">RTCMultiConnection-v1.2.js</a>
            </td>
            
            <td>
                <a href="http://www.rtcmulticonnection.org/changes-log/#v1.2">Changes Log</a>
            </td>
        </tr>
        
        <tr>
            <td>
                <a href="https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/Library/RTCMultiConnection-v1.1.js">RTCMultiConnection-v1.1.js</a>
            </td>
            
            <td>
                <a href="http://www.rtcmulticonnection.org/changes-log/#v1.1">Changes Log</a>
            </td>
        </tr>
        
        <tr>
            <td>
                <a href="https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/Library/RTCMultiConnection-v1.0.js">RTCMultiConnection-v1.0.js</a>
            </td>
            
            <td>
                <a href="http://www.rtcmulticonnection.org/changes-log/#v1.0">Changes Log</a>
            </td>
        </tr>
    </tbody>
</table>

=

## Demos using [RTCMultiConnection](http://www.RTCMultiConnection.org/)

| Experiment Name        | Demo           | Source Code |
| ------------- |-------------|-------------|
| **All-in-One test** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/demos/all-in-one.html) |
| **Renegotiation & Mute/UnMute/Stop** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/Renegotiation.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/demos/Renegotiation.html) |
| **Multi-streams attachment** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/multi-streams-attachment.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/demos/multi-streams-attachment.html) |
| **Admin/Guest audio/video calling** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/admin-guest.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/demos/admin-guest.html) |
| **Session-Reinitiation** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/session-reinitiation.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/demos/session-reinitiation.html) |
| **Audio/Video Recording** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/RecordRTC-and-RTCMultiConnection.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/demos/RecordRTC-and-RTCMultiConnection.html) |
| **Mute/UnMute** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/mute-unmute.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/demos/mute-unmute.html) |
| **Password Protected Rooms** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/password-protect-rooms.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/demos/password-protect-rooms.html) |
| **WebRTC remote media stream forwarding** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/remote-stream-forwarding.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/demos/remote-stream-forwarding.html) |
| **Video Conferencing** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/videoconferencing.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/demos/videoconferencing.html) |
| **Multi-Session Establishment** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/multi-session-establishment.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/demos/multi-session-establishment.html) |
| **RTCMultiConnection-v1.3 testing demo** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/RTCMultiConnection-v1.3-demo.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/demos/RTCMultiConnection-v1.3-demo.html) |
| **Video Broadcasting** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/video-broadcasting.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/demos/video-broadcasting.html) |
| **File Sharing + Text Chat** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/group-file-sharing-plus-text-chat.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/demos/group-file-sharing-plus-text-chat.html) |
| **Audio Conferencing** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/audioconferencing.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/demos/audioconferencing.html) |
| **Join with/without camera** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/join-with-or-without-camera.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/demos/join-with-or-without-camera.html) |
| **Screen Sharing** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/screen-sharing.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/demos/screen-sharing.html) |
| **One-to-One file sharing** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/one-to-one-filesharing.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/demos/one-to-one-filesharing.html) |
| **Manual session establishment + extra data transmission + video conferencing** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/manual-session-establishment-plus-extra-data-transmission-plus-videoconferencing.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/demos/manual-session-establishment-plus-extra-data-transmission-plus-videoconferencing.html) |
| **Customizing Bandwidth** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/bandwidth.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/demos/bandwidth.html) |
| **Users ejection and presence detection** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/users-ejection.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/demos/users-ejection.html) |
| **RTCMultiConnection-v1.3 and socket.io** | ---- | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/demos/RTCMultiConnection-v1.3-and-socket.io.html) |
| **Multi-Broadcasters and Many Viewers** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/Multi-Broadcasters-and-Many-Viewers.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/demos/Multi-Broadcasters-and-Many-Viewers.html) |
| **Stream Mp3 Live** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/stream-mp3-live.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/demos/stream-mp3-live.html) |

=

<table style="font-size:18px; font-weight:bold; margin:0; padding:0; margin-left:auto; margin-right:auto; text-align:center;">
    <tr>
        <td>
            <a href="https://www.webrtc-experiment.com/RTCMultiConnection/" target="_blank">
                <img src="http://www.rtcmulticonnection.org/img/demo.png" style="display:block; width:99px; height99px;" alt="Demos">
                Demos
            </a>
        </td>
        
        <td>
            <a href="http://www.rtcmulticonnection.org/docs/getting-started/" target="_blank">
                <img src="http://www.rtcmulticonnection.org/img/getting-started.png" style="display:block; width:99px; height99px;" alt="Getting-Started">
                Getting Started
            </a>
        </td>
        
        <td>
            <a href="http://www.rtcmulticonnection.org/docs/" target="_blank">
                <img src="http://www.rtcmulticonnection.org/img/documentation.png" style="display:block; width:99px; height99px;" alt="Documentation">
                Documentation
            </a>
        </td>
        
        <td>
            <a href="http://www.rtcmulticonnection.org/changes-log/" target="_blank">
                <img src="http://www.rtcmulticonnection.org/img/whats-new.png" style="display:block; width:99px; height99px;" alt="Changes Log">
                Changes Log
            </a>
        </td>
        
        <td>
            <a href="http://www.rtcmulticonnection.org/FAQ/" target="_blank">
                <img src="http://www.rtcmulticonnection.org/img/FAQ.png" style="display:block; width:99px; height99px;" alt="FAQ">
                FAQ
            </a>
        </td>
    </tr>
</table>

=

# Muaz Khan

1. Personal Webpage — http://www.muazkhan.com
2. Email — muazkh@gmail.com
3. Twitter — https://twitter.com/muazkh and https://twitter.com/WebRTCWeb

=

# License

[RTCMultiConnection](http://www.rtcmulticonnection.org/) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
