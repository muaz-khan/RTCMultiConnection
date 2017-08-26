// IceServersHandler.js

var IceServersHandler = (function() {
    function getIceServers(connection) {
        // resiprocate: 3344+4433
        var iceServers = [{
                'urls': [
                    'turn:webrtcweb.com:7788', // coTURN 7788+8877
                    'turn:webrtcweb.com:4455', // restund udp
                    'turn:webrtcweb.com:5544' // restund tcp
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

        return iceServers;
    }

    return {
        getIceServers: getIceServers
    };
})();
