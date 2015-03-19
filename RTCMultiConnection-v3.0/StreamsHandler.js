var StreamsHandler = (function() {
    function setHandlers(stream, syncAction) {
        stream.mute = function(type) {
            if (typeof type == 'undefined' || type == 'audio') {
                stream.getAudioTracks().forEach(function(track) {
                    track.enabled = false;
                });
            }

            if (typeof type == 'undefined' || type == 'video') {
                stream.getVideoTracks().forEach(function(track) {
                    track.enabled = false;
                });
            }

            if (typeof syncAction == 'undefined' || syncAction == true) {
                StreamsHandler.onSyncNeeded(stream.streamid, 'mute', type);
            }
        };

        stream.unmute = function(type) {
            if (typeof type == 'undefined' || type == 'audio') {
                stream.getAudioTracks().forEach(function(track) {
                    track.enabled = true;
                });
            }

            if (typeof type == 'undefined' || type == 'video') {
                stream.getVideoTracks().forEach(function(track) {
                    track.enabled = true;
                });
            }

            if (typeof syncAction == 'undefined' || syncAction == true) {
                StreamsHandler.onSyncNeeded(stream.streamid, 'unmute', type);
            }
        };
    }

    return {
        setHandlers: setHandlers,
        onSyncNeeded: function(streamid, action, type) {}
    };
})();
