---
api_name: onunmute
api_description: This event is fired if any of the stream is un-muted/re-enabled
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
// if local or remote stream is muted
connection.onunmute = function(e) {
   e.mediaElement.removeAttribute('poster');
   e.mediaElement.srcObject = e.stream;
};
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
