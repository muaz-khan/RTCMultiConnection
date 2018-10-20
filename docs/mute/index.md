---
api_name: mute
api_description: Mute i.e. disable audio, video or screen track
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>var localStream = connection.attachStreams[0];
localStream.mute('both');

// or
var firstRemoteStream = connection.streamEvents.selectFirst({ remote: true }).stream;
firstRemoteStream.mute();

// or
var streamByUserId = connection.streamEvents.selectFirst({ userid: 'remote-userid' }).stream;
streamByUserId.mute();
</pre>

    <p>You can pass "audio", "video" or "both" on "stream.mute" method.</p>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
