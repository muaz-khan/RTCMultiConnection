---
api_name: dontGetRemoteStream
api_description: Ignore all remote streams
---

{% capture html %}

<section>
    <p>By default, it is false. Which means that RTCMultiConnection will always get remote streams.</p>
</section>

<section>
    <h2>How to use</h2>
    <pre>
connection.dontGetRemoteStream = true;
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
