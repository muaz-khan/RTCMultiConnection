---
api_name: onReConnecting
api_description: Check if peer connection is dropped and if RTCMultiConnection is reconnecting it
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
connection.onReConnecting = function(event) {
    console.info('ReConnecting with', event.userid, '...');
};
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
