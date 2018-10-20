---
api_name: onmute
api_description: This event is fired if any of the stream is muted/disabled
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
// if local or remote stream is muted
connection.onmute = function(e) {
   e.mediaElement.srcObject = null;
   e.mediaElement.setAttribute('poster', 'photo.jpg');
};
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
