---
api_name: StreamsHandler
api_description: Get access to StreamsHandler.js
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
// first parameter is your MediaStream object
// second parameter is: should I sync mute/unmute/stop action across all users
// third parameter is your "connection" object
connection.StreamsHandler.setHandlers(screenStream, true, connection);
</pre>
</section>

<section>
    <p>This object helps you force syncing of screen-stop action across all connected users.</p>
    <p>RTCMultiConnection, by default, always forces sync-action. i.e. it tells all connected users that your stream is muted or unmute or stopped.</p>
</section>

<section>
    <h2>Internal code (you can always override):</h2>
    <pre>
connection.StreamsHandler.onSyncNeeded = function(streamid, action, type) {
    connection.peers.getAllParticipants().forEach(function(participant) {
        mPeer.onNegotiationNeeded({
            streamid: streamid,
            action: action,
            streamSyncNeeded: true,
            type: type || 'both'
        }, participant);
    });
};
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}

