---
api_name: removeStream
api_description: Remote a media-stream from all connected users
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
// remove all screen streams.
// you can use "remove all video streams" by passing "video"
// or "remove all audio streams" by passing "audio"
connection.<a href="http://www.RTCMultiConnection.org/docs/removeStream/"><code>removeStream</code></a>('screen');

// remove-all but multiple streams
// i.e. remove all audio and video streams
// or remove all audio and screen streams
connection.<a href="http://www.RTCMultiConnection.org/docs/removeStream/"><code>removeStream</code></a>({
    screen: true,
    audio: true
});

// remove a media-stream by id
connection.removeStream('stream-id');


</pre>
    <p>Todo: Need to update this documentation for all possible usages.</p>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
