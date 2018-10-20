---
api_name: getNumberOfBroadcastViewers
api_description: Use this method for scalable-broadcast demos
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
connection.getNumberOfBroadcastViewers('scalable-broadcast-id', function(numberOfBroadcastViewers) {
    //
});
</pre>
    <p>Please check this demo: <a href="https://rtcmulticonnection.herokuapp.com/demos/Scalable-Broadcast.html">demos/Scalable-Broadcast.html</a></p>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
