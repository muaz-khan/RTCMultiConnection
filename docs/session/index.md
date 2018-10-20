---
api_name: session
api_description: Set video directions and media types
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
connection.session = {
    audio: true, // mic
    video: true, // camera
    data: true,  // webrtc data channels
    screen: false,
    oneway: false,
    broadcast: false
};
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
