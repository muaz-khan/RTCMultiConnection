---
api_name: onbeforeunload
api_description: Use this event to handle before-unload
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
connection.onbeforeunload = function() {
    connection.peers.getAllParticipants().forEach(function(participant) {
        mPeer.onNegotiationNeeded({
            userLeft: true
        }, participant);

        if (connection.peers[participant] && connection.peers[participant].peer) {
            connection.peers[participant].peer.close();
        }

        delete connection.peers[participant];
    });

    connection.attachStreams.forEach(function(stream) {
        stream.stop();
    });

    connection.closeSocket();
    connection.isInitiator = false;
};
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}

