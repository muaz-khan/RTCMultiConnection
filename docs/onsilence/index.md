---
api_name: onsilence
api_description: This event is fired if a user stops speaking
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
connection.onsilence = function (e) {
    // e.streamid, e.userid, e.stream, etc.
    // e.extra.fullName
    e.mediaElement.style.border = '';
};
</pre>
    <p>Please check other event as well: <a href="/docs/onspeaking/">onspeaking</a></p>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
