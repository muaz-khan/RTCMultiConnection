---
api_name: dontAttachStream
api_description: Capture your local camera but do not share with anybody else
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
connection.dontAttachStream = true;
</pre>
    <p><a href="/docs/dontCaptureUserMedia">dontCaptureUserMedia</a> is an alternative.</p>
    <p>The only difference between the two is that "dontCaptureUserMedia" doesn't tries to capture your camera. It simply ignores making any request to the camera.</p>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
