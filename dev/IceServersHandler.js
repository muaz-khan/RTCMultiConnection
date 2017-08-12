// IceServersHandler.js

var IceServersHandler = (function() {
    function getIceServers(connection) {
        // resiprocate: 3344+4433
        var iceServers = [{
                'urls': [
                    'turn:webrtcweb.com:7788', // coTURN 7788+8877
                    'turn:webrtcweb.com:4455' // restund 4455+5544
                ],
                'username': 'muazkh',
                'credential': 'muazkh'
            },
            {
                'urls': [
                    'stun:stun.l.google.com:19302'
                ]
            }
        ];

        if (DetectRTC.browser.name === 'Firefox' && DetectRTC.browser.version >= 54) {
            iceServers[0].urls = [iceServers[0].urls[0]];
        }

        return iceServers;
    }

    return {
        getIceServers: getIceServers
    };
})();
