---
api_name: onspeaking
api_description: This event is fired if a user keeps speaking
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
connection.onspeaking = function (e) {
    // e.streamid, e.userid, e.stream, etc.
    // e.extra.fullName
    e.mediaElement.style.border = '1px solid red';
};
</pre>
    <p>Please check other event as well: <a href="/docs/onsilence/">onsilence</a></p>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
