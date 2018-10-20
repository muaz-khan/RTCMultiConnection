---
api_name: unmute
api_description: UnMute i.e. enable audio, video or screen track
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>var localStream = connection.attachStreams[0];
localStream.unmute('both');

// or
var firstRemoteStream = connection.streamEvents.selectFirst({ remote: true }).stream;
firstRemoteStream.unmute();

// or
var streamByUserId = connection.streamEvents.selectFirst({ userid: 'remote-userid' }).stream;
streamByUserId.unmute();
</pre>

    <p>You can pass "audio", "video" or "both" on "stream.unmute" method.</p>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
