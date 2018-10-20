---
api_name: onPeerStateChanged
api_description: Check if ice-connection statuses for all connected users
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
connection.onPeerStateChanged = function(state) {
    if (state.iceConnectionState.search(/closed|failed/gi) !== -1) {
        console.error('Peer connection is closed between you & ', state.userid, state.extra, 'state:', state.iceConnectionState);
    }
};
</pre>
    <p>Here is a demo that is using this API: <a href="https://rtcmulticonnection.herokuapp.com/demos/getStats.html">demos/getStats.html</a></p>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
