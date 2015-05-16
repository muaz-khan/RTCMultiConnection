## [RTCMultiConnection-v3.0](https://github.com/muaz-khan/RTCMultiConnection/tree/master/RTCMultiConnection-v3.0) (Beta)  [![npm](https://img.shields.io/npm/v/rtcmulticonnection-v3.svg)](https://npmjs.org/package/rtcmulticonnection-v3) [![downloads](https://img.shields.io/npm/dm/rtcmulticonnection-v3.svg)](https://npmjs.org/package/rtcmulticonnection-v3) [![Build Status: Linux](https://travis-ci.org/muaz-khan/RTCMultiConnection.png?branch=master)](https://travis-ci.org/muaz-khan/RTCMultiConnection)

Fetch latest code:

```
npm install rtcmulticonnection-v3
```

To TEST:

```
node Signaling-Server
```

Now open: `https://localhost:9001/`

## Link Single File

```html
<script src="/Single-File/RTCMultiConnection.js"></script>

<!-- or minified file -->
<script src="/Single-File/RTCMultiConnection.min.js"></script>
```

If you're sharing files, you also need to link:

```html
<script src="/FileBufferReader.js"></script>
```

## Set different socket URL

```javascript
connection.socketURL = 'http://yourdomain.com:8080/';
```

## Configure v3.0

* [wiki/Configure-v3.0](https://github.com/muaz-khan/RTCMultiConnection/wiki/Configure-v3.0)

## License

[RTCMultiConnection](https://github.com/muaz-khan/RTCMultiConnection) is released under [MIT licence](https://github.com/muaz-khan/RTCMultiConnection/blob/master/LICENSE.md) . Copyright (c) [Muaz Khan](http://www.MuazKhan.com/).
