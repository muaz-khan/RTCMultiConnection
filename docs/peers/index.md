---
api_name: peers
api_description: This object stores list of all connected peer connections
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
var peerContainer = connection.peers['remote-user-id'];
if(peerContainer) {
    var native = peerContainer.peer;
    native.getSenders();
    native.getReceivers();
    native.getLocalStreams();
    native.addTrack(track, stream);
    // etc
}
</pre>
    <p>This object provides huge number of nested API. Need to update this documentation for all possible usages.</p>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
