---
api_name: dontCaptureUserMedia
api_description: Do not make any request to getUserMedia
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
connection.dontCaptureUserMedia = true;
</pre>
    <p><a href="/docs/dontAttachStream">dontAttachStream</a> is an alternative.</p>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
