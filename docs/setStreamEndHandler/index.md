---
api_name: setStreamEndHandler
api_description: This method fires callback as soon as any of the stream track is ended/stopped
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
connection.setStreamEndHandler(screenStream, null, function() {
    alert('Screen stream is stopped. It is automatically removed from all connected users side.')
});
</pre>
</section>

<section>
    <h2>Alternative</h2>
    <pre>
addStreamStopListener(screenStream, function() {
    alert('screen sharing is ended.');

    // remove from RTCPeerConnectino objects
    // and renegotiate
    // or resetTrack
});

function addStreamStopListener(stream, callback) {
    var streamEndedEvent = 'ended';
    if ('oninactive' in stream) {
        streamEndedEvent = 'inactive';
    }
    stream.addEventListener(streamEndedEvent, function() {
        callback();
        callback = function() {};
    }, false);
    stream.getAudioTracks().forEach(function(track) {
        track.addEventListener(streamEndedEvent, function() {
            callback();
            callback = function() {};
        }, false);
    });
    stream.getVideoTracks().forEach(function(track) {
        track.addEventListener(streamEndedEvent, function() {
            callback();
            callback = function() {};
        }, false);
    });
}
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}

