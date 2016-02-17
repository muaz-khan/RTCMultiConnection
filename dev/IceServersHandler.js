// IceServersHandler.js

var iceFrame, loadedIceFrame;

function loadIceFrame(callback, skip) {
    if (loadedIceFrame) return;
    if (!skip) return loadIceFrame(callback, true);

    loadedIceFrame = true;

    var iframe = document.createElement('iframe');
    iframe.onload = function() {
        iframe.isLoaded = true;

        listenEventHandler('message', iFrameLoaderCallback);

        function iFrameLoaderCallback(event) {
            if (!event.data || !event.data.iceServers) return;
            callback(event.data.iceServers);
            window.removeEventListener('message', iFrameLoaderCallback);
        }

        iframe.contentWindow.postMessage('get-ice-servers', '*');
    };
    iframe.src = 'https://cdn.webrtc-experiment.com/getIceServers/';
    iframe.style.display = 'none';
    (document.body || document.documentElement).appendChild(iframe);
}

if (typeof window.getExternalIceServers !== 'undefined' && window.getExternalIceServers == true) {
    loadIceFrame(function(externalIceServers) {
        if (!externalIceServers || !externalIceServers.length) return;
        window.RMCExternalIceServers = externalIceServers;

        if (window.iceServersLoadCallback && typeof window.iceServersLoadCallback === 'function') {
            window.iceServersLoadCallback(externalIceServers);
        }
    });
}

var IceServersHandler = (function() {
    function getIceServers(connection) {
        var iceServers = [];

        iceServers.push({
            urls: 'stun:stun.l.google.com:19302'
        }, {
            urls: 'stun:mmt-stun.verkstad.net'
        }, {
            urls: 'stun:stun.anyfirewall.com:3478'
        });

        iceServers.push({
            urls: 'turn:turn.bistri.com:80',
            credential: 'homeo',
            username: 'homeo'
        });

        iceServers.push({
            urls: 'turn:turn.anyfirewall.com:443',
            credential: 'webrtc',
            username: 'webrtc'
        });

        // copyright of mmt-turn.verkstad: Ericsson
        iceServers.push({
            urls: 'turn:mmt-turn.verkstad.net',
            username: 'webrtc',
            credential: 'secret'
        });

        if (window.RMCExternalIceServers) {
            iceServers = window.RMCExternalIceServers.concat(iceServers);
            connection.iceServers = iceServers;
        } else if (typeof window.getExternalIceServers !== 'undefined' && window.getExternalIceServers == true) {
            window.iceServersLoadCallback = function() {
                iceServers = window.RMCExternalIceServers.concat(iceServers);
                connection.iceServers = iceServers;
            };
        }

        return iceServers;
    }

    return {
        getIceServers: getIceServers
    };
})();
