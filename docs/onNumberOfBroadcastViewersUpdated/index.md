---
api_name: onNumberOfBroadcastViewersUpdated
api_description: Use this method for scalable-broadcast demos
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
connection.onNumberOfBroadcastViewersUpdated = function(event) {
    console.log('Number of broadcast (', event.broadcastId, ') viewers', event.numberOfBroadcastViewers);
};
</pre>
    <p>Please check this demo: <a href="https://rtcmulticonnection.herokuapp.com/demos/Scalable-Broadcast.html">demos/Scalable-Broadcast.html</a></p>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
