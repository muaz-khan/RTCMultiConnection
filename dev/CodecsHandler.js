// CodecsHandler.js

var CodecsHandler = (function() {
    // "removeVPX" method is taken from github/mozilla/webrtc-landing
    function removeVPX(sdp) {
        if (!sdp || typeof sdp !== 'string') {
            throw 'Invalid arguments.';
        }

        sdp = sdp.replace('a=rtpmap:120 VP8/90000\r\n', '');
        sdp = sdp.replace('a=rtpmap:120 VP9/90000\r\n', '');

        sdp = sdp.replace(/m=video ([0-9]+) RTP\/SAVPF ([0-9 ]*) 120/g, 'm=video $1 RTP\/SAVPF $2');
        sdp = sdp.replace(/m=video ([0-9]+) RTP\/SAVPF 120([0-9 ]*)/g, 'm=video $1 RTP\/SAVPF$2');

        sdp = sdp.replace('a=rtcp-fb:120 nack\r\n', '');
        sdp = sdp.replace('a=rtcp-fb:120 nack pli\r\n', '');
        sdp = sdp.replace('a=rtcp-fb:120 ccm fir\r\n', '');

        return sdp;
    }

    function disableNACK(sdp) {
        if (!sdp || typeof sdp !== 'string') {
            throw 'Invalid arguments.';
        }

        sdp = sdp.replace('a=rtcp-fb:126 nack\r\n', '');
        sdp = sdp.replace('a=rtcp-fb:126 nack pli\r\n', 'a=rtcp-fb:126 pli\r\n');
        sdp = sdp.replace('a=rtcp-fb:97 nack\r\n', '');
        sdp = sdp.replace('a=rtcp-fb:97 nack pli\r\n', 'a=rtcp-fb:97 pli\r\n');

        return sdp;
    }

    function prioritize(codecMimeType, peer) {
        if (!peer || !peer.getSenders || !peer.getSenders().length) {
            return;
        }

        if (!codecMimeType || typeof codecMimeType !== 'string') {
            throw 'Invalid arguments.';
        }

        peer.getSenders().forEach(function(sender) {
            var params = sender.getParameters();
            for (var i = 0; i < params.codecs.length; i++) {
                if (params.codecs[i].mimeType == codecMimeType) {
                    params.codecs.unshift(params.codecs.splice(i, 1));
                    break;
                }
            }
            sender.setParameters(params);
        });
    }

    return {
        removeVPX: removeVPX,
        disableNACK: disableNACK,
        prioritize: prioritize
    };
})();
