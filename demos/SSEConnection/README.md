* https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/SSEConnection

Server Sent Events (SSE) are used to setup WebRTC peer-to-peer connections.

1. Download above directory
2. Upload to your PHP webserver
3. Give the directory both read-and-write permissions
4. Go to `dev/SSEConnection.js` and replace `sseDirPath` with `sseDirPath='https://php-server.com/SSEConnection/';`
5. Try `demos/SSEConnection.html` demo on HTTPs or localhost.
