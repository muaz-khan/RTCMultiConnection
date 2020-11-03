Live Demo: https://rtcmulticonnection.herokuapp.com/rtc/SSEConnection.html

Server Sent Events (SSE) are used to setup WebRTC peer-to-peer connections.

1. Download above directory
2. Upload to your PHP webserver
3. Give the directory both read-and-write permissions
4. Go to [`dev/SSEConnection.js`](https://github.com/muaz-khan/RTCMultiConnection/blob/master/dev/SSEConnection.js) and replace [`sseDirPath`](https://github.com/muaz-khan/RTCMultiConnection/blob/master/dev/SSEConnection.js#L6) with `sseDirPath='https://php-server.com/SSEConnection/';`
5. Try [`rtc/SSEConnection.html`](https://github.com/muaz-khan/RTCMultiConnection/blob/master/rtc/SSEConnection.html) demo on HTTPs or localhost.

Relevant files:

1. https://github.com/muaz-khan/RTCMultiConnection/blob/master/dev/SSEConnection.js
2. https://github.com/muaz-khan/RTCMultiConnection/blob/master/rtc/SSEConnection.html

PHP Source:

- https://github.com/muaz-khan/RTCMultiConnection/tree/master/rtc/SSEConnection
