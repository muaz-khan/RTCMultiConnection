---
api_name: replaceTrack
api_description: Change between camera and screen or two cameras seamlessly across all users
css: 
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
var screenTrack = screenStream.getVideoTracks()[0];

// replace across all users
connection.replaceTrack(screenTrack);

// replace for a specific user only
connection.replaceTrack(screenTrack, 'specific-user-id');
</pre>
    <p>This method is strongly recommended over <a href="/docs/renegotiate/">renegotiate</a>.</p>
    <p>There is a relevant API: <a href="/docs/resetTrack/">resetTrack</a> which resets back to original track.</p>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}

