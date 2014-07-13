## [RTCMultiConnection](http://www.rtcmulticonnection.org/) experimental

It is experimental repo for RTCMultiConnection.js which means that every single update will be pushed to this repo until RTCMultiConnection current version gets stable.

=

## Current Version is [v1.8](http://www.rtcmulticonnection.org/changes-log/#v1.8)

## Recent Changes?

`connection.getExternalIceServers` boolean added. Now, by default, RTCMultiConnection gets TURN/STUN servers from xirsys however you can disable this feature using same boolean object.

```javascript
connection.getExternalIceServers = false; // disable
```

`connection.mediaConstraints` and `connection.media` updated. Now it works same like getUserMedia API.

```javascript
connection.mediaConstraints = {
    mandatory: {
        maxWidth: 1280,
        maxHeight: 720,
        minAspectRatio: 1.77
    },
    optional: []
};
```

`connection.media.min` and `connection.media.max` sets min/max width/heigth in the `connection.mediaConstraints.mandatory` object:

```javascript
connection.min(1280, 720);
connection.min(1920, 1080);

// it is actually similar like this;
connection.mediaConstraints = {
    mandatory: {
        maxWidth: 1280,
        maxHeight: 720,
        maxWidth: 1920,
        maxHeight: 1080
    },
    optional: []
};
```

You can use SD video like this:

```javascript
connection.mediaConstraints = {
    mandatory: {},
    optional: []
};
```

----

`connection.onstream` is updated for `event.isScreen` boolean.

```javascript
connection.onstream = function(event) {
    // to check screen stream
    if(event.isScreen) { }
    
    // to check audio-only stream
    if(event.isAudio) { }
    
    // to check audio+video stream
    if(event.isVideo) { }
};
```

Many things updated:

1. `connection.refresh` is updated. Now, session-reinitiation works as expected. You simply need to call `connection.leave` to leave a session and rejoin same session or join any other.
2. `connection.iceProtocols = { tcp: true, udp: true}` added.
3. STUN/TURN servers updated.
4. `connection.preventSSLAutoAllowed` is disabled by default.

A screen capturing extension has been deployed on Google App Store:

* https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk

Previously this extension was useful only with https://www.webrtc-experiment.com/.

But, from today v1.8 updates, RTCMultiConnection can use same extension within any webpage!

It means that you can simply ask your users to install above extension and you can use screen capturing feature in your personal pages.

In simple words, "RTCMultiConnection can use single chrome extension for all domains!". [Quick Simple Demo](https://5ae4c146d4d329adbe1de2aee5b4473a60e72d7d.googledrive.com/host/0B6GWd_dUUTT8cGw2bmpOaHMzbFU/)

----

`connection.processSdp` added. Now you can process SDP for stereo audio or opus/vp8 parameters or [application-level bandwidth management](http://stackoverflow.com/questions/16712224/how-to-control-bandwidth-in-webrtc-video-call/16868123#16868123). 

```javascript
connection.processSdp = function(sdp) {
    // process sdp here; e.g.
    // sdp = changeOpusParameters(sdp);
    
    // you must return "sdp" back.
    return sdp;
};
```

This feature gives you full control over SDP-modification. You can even use something like [SdpSerializer](https://github.com/muaz-khan/SdpSerializer) to modify the SDP.

Note: This function will be called by RTCMultiConnection code. It accepts single string-argument where SDP is passed. There is no clue of the type of sdp, though. You MUST return "sdp" back using "return" statement.

`connection.join('sessionid')` fixed. Now, `onNewSession` will NEVER be fired if you're calling "join" method whilst passing "string" as session-id.

```javascript
connection.onNewSession = function(session) {
    // this code isn't called
    // because "join" method is called with string-argument
    // you should use "connect" method if you want "onNewSession" to be fired.
    session.join();
};

connection.join('session-id');
```

(to fix canary ipv6 candidates issues): disabled "googIPv6", "googDscp" and "googImprovedWifiBwe"

=

## Issues?

<ol>
    <li>
        connection.playRoleOfInitiator must have extra-data as well.
    </li>
    
    <li>
        Audio/Video recording must support single-file for Firefox.
    </li>
    
    <li>
        Need to use maxaveragebitrate for audio bandwidth.
    </li>
    
    <li>
        Provide options to use local chrome extension for screen capturing.
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
        <p>
            Dirty workaround for "<code>ice-connection-state==disconnected</code>"
        </p>
        <p>
            Fix "<code>disconnected</code>" which happens often. Need to use WebRTC data channels for dirty workaround whenever possible; currently we're relying on signaling medium.
        </p>
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
        "<code>connection.onSessionClosed</code>" isn't fired. This should be fired if initiator closes the entire session.
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
<script src="//www.rtcmulticonnection.org/latest.js"></script>

// or
<script src="//www.webrtc-experiment.com/RTCMultiConnection-v1.8.js"></script>
```

=

## Experimental features in this build?

<ol>
                    <li>
                        (to fix canary ipv6 candidates issues): disabled "googIPv6", "googDscp" and "googImprovedWifiBwe"
                    </li>
                    
                    <li>
                        "<code>connection.leaveOnPageUnload</code>" added.
                        <pre class="sh_javascript">
// if you want to prevent default behaviour
connection.leaveOnPageUnload = false;

// display a notification box
window.addEventListener('beforeunload', function () {
    return 'Are you want to leave?';
}, false);

// leave here
window.addEventListener('unload', function () {
    connection.leave();
}, false);
</pre>
                    </li>
                    
                    <li>
                        <pre class="sh_javascript">
-. renegotiation scenarios that fails:
-. 1) if chrome starts video-only session and firefox joins with only audio
-. 2) if chrome starts with audio-only session and firefox joins with only video
-. 3) if chrome starts only audio and firefox joins with audio+video
-. renegotiation scenarios that works:
-. 1) if chrome starts audio+video and firefox joins with only audio or audio+video
-. 2) if both browsers has similar streams
</pre>
                    </li>
                    
                    <li>
                        "<code>connection.onstatechange</code>" added:
                        <pre class="sh_javascript">
connection.onstatechange = function (state, reason) {
    // fetching-usermedia
    // usermedia-fetched

    // detecting-room-presence
    // room-not-available
    // room-available

    // connecting-with-initiator
    // connected-with-initiator

    // failed---has reason

    // request-accepted
    // request-rejected

    if(state == 'room-not-available') {
        // room no longer exist
    }
};
</pre>
                        Remember, older "<code><a href="http://www.rtcmulticonnection.org/docs/onstats/">onstats</a></code>" has been removed in v1.8.
                    </li>
                    
                    <li>
                        Now if you'll invoke "<code>connection.sharePartOfScreen(...)</code>" and a new user will join you; existing part of screen will be auto shared with him.<br /><br />
                        It means that "<code>sharePartOfScreen</code>" will work with all new/old users.
                    </li>
                    
                    <li>
                        "<code>connection.donotJoin</code>" added:
                        <pre class="sh_javascript">
connection.onstatechange = function (state) {
    if(state == 'room-not-available') {
        connection.donotJoin(connection.sessionid);
    }
};
</pre>
                    </li>
                    
                    <li>
                        You can set <code>connection.DetectRTC.screen.extensionid="your-chrome-extensionid"</code> to make sure inline (newly) installed chrome extension is quickly used for screen capturing instead of prompting user to reload page once to use it.<br /><br />
                        It means that install the chrome extension and RTCMultiConnection will auto use it. Don't ask your users to reload the page:
                        <pre class="sh_javascript">
connection.DetectRTC.screen.extensionid = 'ajhifddimkapgcifgcodmmfdlknahffk';
</pre>
                    </li>
                    
                    <li>
                        Fixed: If Chrome starts video-only session; and Firefox joins with only audio. Then both fails to connect; though sendrecv/recvonly/sendonly everything is correctly implemented.
                    </li>
                    
                    <li>
                        Fixed: "the videos are not square and they look grainy not has sharp as before". Now video is captured & streamed with better quality.
                    </li>
                    
                    <li>
                        "<code>connection.DetectRTC.hasSpeakers</code>" added.
                    </li>
                    
                    <li>
                        "<code>connection.resumePartOfScreenSharing()</code>" added.
                    </li>
                    
                    <li>
                        "<code>event.blobURL</code>" in the <code><a href="http://www.rtcmulticonnection.org/docs/onstream/">onstream</a></code> event is fixed for Firefox.
                        <pre class="sh_javascript">
connection.onstream = function(e) {
    // e.blobURL -- now it is always blob:URI
};
</pre>
                    </li>
                    
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
