## [RTCMultiConnection-v3.0](https://github.com/muaz-khan/RTCMultiConnection/tree/master/RTCMultiConnection-v3.0) (Beta)  [![npm](https://img.shields.io/npm/v/rtcmulticonnection-v3.svg)](https://npmjs.org/package/rtcmulticonnection-v3) [![downloads](https://img.shields.io/npm/dm/rtcmulticonnection-v3.svg)](https://npmjs.org/package/rtcmulticonnection-v3) [![Build Status: Linux](https://travis-ci.org/muaz-khan/RTCMultiConnection.png?branch=master)](https://travis-ci.org/muaz-khan/RTCMultiConnection)

Fetch latest code:

```
npm install rtcmulticonnection-v3
```

To TEST:

```
node server
```

Now open: `https://localhost:9001/`

## Link Single File

```html
<script src="/RTCMultiConnection.js"></script>

<!-- or minified file -->
<script src="/RTCMultiConnection.min.js"></script>
```

If you're sharing files, you also need to link:

```html
<script src="/dev/FileBufferReader.js"></script>
```

You can link multiple files from "dev" directory.

## Set different socket URL

```javascript
connection.socketURL = 'http://yourdomain.com:8080/';

// if your server is already having "message" event
// then you can use something else, unique.
connection.socketMessageEvent = 'unique-message';
```

## Integrate in your own applications?

```javascript
// node.js code
require('./Signaling-Server.js')(httpServerHandlerOrPort);
```

## Migrating from older versions?

Use `streamEvents` instead of `connection.streams`:

```javascript
var stream = connection.streamEvents['streamid'];

# you can even use "getStreamById"
var stream = connection.attachStreams.getStreamById('streamid');

# to get remote stream by id
var allRemoteStreams = connection.getRemoteStreams('remote-user-id');
var stream = allRemoteStreams.getStreamByid('streamid');
```

Wanna check `isScreen` or `isVideo` or `isAudio`?

```javascript
connection.onstream = function(event) {
	if(event.stream.isScreen) {
		// screen stream
	}

	if(event.stream.isVideo) {
		// audio+video or video-only stream
	}

	if(event.stream.isAudio) {
		// audio-only stream
	}
};
```

Wanna mute/unmute?

```javascript
var stream = connection.streamEvents['streamid'].stream;
stream.mute('audio'); // audio or video or both
```

Wanna watch for mute/unmute events?

```javascritp
connection.onstream = function(event) {
	event.stream.addEventListener('mute', function(type) {
		e.session = {
			audio: type == 'audio' || type == null,
			video: type == 'video' || type == null
		};
		connection.onmute(e);
	}, false);

	event.stream.addEventListener('unmute', function(type) {
		e.session = {
			audio: type == 'audio' || type == null,
			video: type == 'video' || type == null
		};
		connection.onunmute(e);
	}, false);
};
```

Wanna detect current browser?

```javascript
if(connection.DetectRTC.browser.isChrome) {
	// it is Chrome
}

// you can even set backward compatibility hack
connection.UA = connection.DetectRTC.browser;
if(connection.UA.isChrome) { }
```

Wanna detect if user is having microphone or webcam?

```javascript
connection.DetectRTC.detectMediaAvailability(function(media){
	if(media.hasWebcam) { }
	if(media.hasMicrophone) { }
	if(media.hasSpeakers) { }
});
```

Wanna detect if user is online or offline?

```javascript
connection.onUserStatusChanged = function(event) {
	alert(event.userid + ' is ' + event.status);
};
```

Wanna watch for each participation request?

```javascript
var alreadyAllowed = {};
connection.onNewParticipant = function(participantId, userPreferences) {
	if(alreadyAllowed[participantId]) {
		connection.addParticipationRequest(participantId, userPreferences);
		return;
	}

	var message = participantId + ' is trying to join your room. Confirm to accept his request.';
	if( window.confirm(messsage ) ) {
		connection.addParticipationRequest(participantId, userPreferences);
	}
};
```

PS. v3.0 documentation is still incomplete. Need to expand this section for more features or backward compatibility hacks.

## Configure v3.0

* [wiki/Configure-v3.0](https://github.com/muaz-khan/RTCMultiConnection/wiki/Configure-v3.0)

## License

[RTCMultiConnection](https://github.com/muaz-khan/RTCMultiConnection) is released under [MIT licence](https://github.com/muaz-khan/RTCMultiConnection/blob/master/LICENSE.md) . Copyright (c) [Muaz Khan](http://www.MuazKhan.com/).
