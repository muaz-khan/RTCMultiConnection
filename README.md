## [RTCMultiConnection](http://www.rtcmulticonnection.org/) experimental

It is experimental repo for RTCMultiConnection.js which means that every single update will be pushed to this repo until RTCMultiConnection current version gets stable.

=

## Current Version is [v1.8](http://www.rtcmulticonnection.org/changes-log/#v1.8)

=

## What is RTCMultiConnection?

RTCMultiConnection runs top over RTCPeerConnection API to provide multi-session establishment scenarios. It also provides dozens of unique [WebRTC](https://www.webrtc-experiment.com/) features like hybrid-less mesh networking model, a very reliable presence detection and syncing system; very complex renegotiation scenarios; and much more. It provides everything you've in your mind! Just understand the API and you'll enjoy using it! It is very simple and its syntax is similar like WebSockets JavaScript API and most importantly RTCPeerConnection API.

It is <a href="https://www.webrtc-experiment.com/licence/">MIT Licenced</a>, which means that you can use it in any commercial/non-commercial product.

=

## How to use latest version?

```html
<script src="//www.rtcmulticonnection.org/latest.js"></script>

// or
<script src="//www.webrtc-experiment.com/RTCMultiConnection-v1.8.js"></script>
```

=

## Experimental features in this build?

<ol>
                    <li>
                        <a href="http://www.RTCMultiConnection.org/docs/startRecording/">startRecording</a>/<a href="http://www.RTCMultiConnection.org/docs/stopRecording/">stopRecording</a> updated & fixed.
                        <pre class="sh_javascript">
// record both audio and video
connection.<a href="http://www.RTCMultiConnection.org/docs/streams/">streams</a>['stream-id'].<a href="http://www.RTCMultiConnection.org/docs/startRecording/">startRecording</a>({
    audio: true,
    video: true
});

// stop both audio and video
connection.<a href="http://www.RTCMultiConnection.org/docs/streams/">streams</a>['stream-id'].<a href="http://www.RTCMultiConnection.org/docs/stopRecording/">stopRecording</a>(function (blob) {
    // blob.audio  --- audio blob
    // blob.video  --- video blob
}, {audio:true, video:true} );
</pre>
                    </li>
                
                    <li>
                        "PreRecordedMediaStreamer" is moved to a separate javascript file.
                        <pre class="sh_javascript">
https://www.rtcmulticonnection.org/PreRecordedMediaStreamer.js
</pre>
                    </li>
                    
                    <li>
                        function "<code>stopTracks</code>" updated.
                    </li>
                
                    <li>
                        Fixed <code>connection.streams.stop()</code> via <a href="https://github.com/muaz-khan/WebRTC-Experiment/issues/225#issuecomment-46283072">issue #255</a>.
                    </li>
                
                    <li>
                        Now, you can easily manage external resources/URLs using "<code>connection.resources</code>":
                        <pre class="sh_javascript">
connection.resources = {
    RecordRTC: 'https://www.webrtc-experiment.com/RecordRTC.js',
    PreRecordedMediaStreamer: 'https://www.rtcmulticonnection.org/PreRecordedMediaStreamer.js',
    customGetUserMediaBar: 'https://www.webrtc-experiment.com/navigator.customGetUserMediaBar.js',
    html2canvas: 'https://www.webrtc-experiment.com/screenshot.js',
    hark: 'https://www.rtcmulticonnection.org/hark.js',
    firebase: 'https://www.webrtc-experiment.com/firebase.js',
    firebaseio: 'https://chat.firebaseIO.com/',
    muted: 'https://www.webrtc-experiment.com/images/muted.png'
};
</pre>
                    </li>
                
                    <li>
                        <code>connection.DetectRTC.MediaDevices</code> added:
                        <pre class="sh_javascript">
connection.DetectRTC.MediaDevices.forEach(function(device) {
    // device.deviceId
    // device.kind == 'audioinput' || 'audiooutput' || 'audio'
    
    connection.selectDevices(device.deviceId);
});
</pre>
                    </li>
                
                    <li>
                        Now, <code>hark.js</code> is used instead of <code>SoundMeter.js</code>:
                        <pre class="sh_javascript">
connection.<a href="http://www.RTCMultiConnection.org/docs/onspeaking/">onspeaking</a> = function() {};
connection.<a href="http://www.RTCMultiConnection.org/docs/onsilence/">onsilence</a> = function() {};
</pre>
                    </li>
                
                    <li>
                        <code>captureUserMediaOnDemand</code> added for <code>connection.open</code> method:
                        <pre class="sh_javascript">
// it is "disabled" by default
// captureUserMediaOnDemand means that "getUserMedia" API for initiator will 
// be invoked only when required.
// i.e. when first participant is detected.

// you can enable it by setting it to "true"
connection.open({
    captureUserMediaOnDemand: true
});
</pre>
                    </li>
                
                    <li>
                        <code>connection.DetectRTC.screen.getChromeExtensionStatus</code> added.
                        <pre class="sh_javascript">
var extensionid = 'ajhifddimkapgcifgcodmmfdlknahffk';

connection.DetectRTC.screen.getChromeExtensionStatus(extensionid, function(status) {
    if(status == 'installed-enabled') {
        // chrome extension is installed & enabled.
    }
    
    if(status == 'installed-disabled') {
        // chrome extension is installed but disabled.
    }
    
    if(status == 'not-installed') {
        // chrome extension is not installed
    }
    
    if(status == 'not-chrome') {
        // using non-chrome browser
    }
});
</pre>
                    </li>
                    
                    <li>
                        <code>onMediaCaptured</code> added for <code>connection.open</code> method:
                        <pre class="sh_javascript">
connection.open({
    onMediaCaptured: function() {
        // initiator enable camera/microphone
        // you can share "sessionDescription" with other users
        // and they can quickly join initiator!
    }
});
</pre>
                    </li>
                    
                    <li>
                        <code>openSignalingChannel</code> is moved to "<code>setDefaults</code>" private function.
                    </li>
                
                    <li>
                        <code>connection.preventSSLAutoAllowed</code> added. Now RTCMultiConnection focuses more on end-users privacy! You can ask RTCMultiConnection to "always" display "getUserMedia-permission-bar" even if chrome is running on HTTPs i.e. SSL domain:
                        <pre class="sh_javascript">
// by default "preventSSLAutoAllowed" is true only for "HTTPs" domains
// you can force it for HTTP domains as well by setting this Boolean in your HTML page.
connection.preventSSLAutoAllowed = true;
</pre>
                    </li>
                    
                    <li>
                        <code>onScreenCapturingExtensionAvailable</code>  is fired when RTCMultiConnection detects that chrome extension for screen capturing is installed and available:
                        <pre class="sh_javascript">
connection.onScreenCapturingExtensionAvailable = function() {
    btnInlineInstallButton.disabled = true;
};
</pre>
                    </li>
                    
                    <li>
                        Now, <code>connection.<a href="http://www.RTCMultiConnection.org/docs/join/">join</a></code> method allows you force how to join (i.e. with or without streams etc.):
                        <pre class="sh_javascript">
// it doesn't matter if incoming stream is audio+video
// you can join it with only audio or with only video
// or anonymously i.e. { oneway: true }
var joinWith = {
    audio: true
};

connection.<a href="http://www.RTCMultiConnection.org/docs/join/">join</a>('sessionid', joinWith); // 2nd parameter
</pre>
                    </li>
                    
                    <li>
                        Now, <a href="http://www.RTCMultiConnection.org/docs/onNewSession/">onNewSession</a> is fired once for each room. It will NEVER fire multiple times.
                    </li>
                    
                    <li>
                        <code><a href="https://github.com/muaz-khan/WebRTC-Experiment/tree/master/desktop-sharing">chrome.desktopCapture.chooseDesktopMedia</a></code> is now preferred for screen capturing; and if extension is not installed or disabled, then RTCMultiConnection will auto fallback to <a href="https://www.webrtc-experiment.com/Pluginfree-Screen-Sharing/">command-line flag oriented screen-capturing API</a>; and if both are not available then it will throw a clear "human readable" exception.<br /><br />
                        Chrome extension is available <a href="https://www.webrtc-experiment.com/store/capture-screen/">here</a>.
                    </li>
                    
                    <li>
                        You can use <code>connection.DetectRTC</code> like this:
                        <pre class="sh_javascript">
connection.DetectRTC.load(function() {
    if(connection.DetectRTC.hasMicrophone) { }
    if(connection.DetectRTC.hasWebcam) { }
});

connection.DetectRTC.screen.isChromeExtensionAvailable(function(available) {
    if(available) alert('Chrome screen capturing extension is installed and available.');
}):
</pre>
                    </li>
                    
                    <li>
                        <code>navigator.getUserMedia</code> errors handling in <code>onMediaError</code> event:
                        <pre class="sh_javascript">
connection.onMediaError = function(error) {
    if(error.name == 'PermissionDeniedError') {
        alert(error.message);
    }
};
</pre>
                    </li>
                </ol>

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
