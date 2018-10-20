---
api_name: autoCreateMediaElement
api_description: Disable default mediaElement
---

{% capture html %}

<section>
    <h2>How to use</h2>
<pre>
connection.autoCreateMediaElement = false;
connection.onstream = function(event) {
    alert(typeof event.mediaElement === 'undefined');

    var video = document.createElement('video');
    video.srcObject = event.stream;
    connection.videosContainer.appendChild(video);
};
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
