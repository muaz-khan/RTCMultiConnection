---
api_name: invokeGetUserMedia
api_description: Make getUserMedia request manually
---

{% capture html %}

<section>
    <h2>How to use</h2>
<pre>
var hints = {
    audio: true,
    video: {
        width: 1920,
        height: 1080,
        frameRate: 30
    }
};
connection.invokeGetUserMedia(hints, function(stream) {
    video.srcObject = stream;
}, connection.session);
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
