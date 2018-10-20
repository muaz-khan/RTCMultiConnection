---
title: RTCMultiConnection Session Initiator
description: If you create an RTCMultiConnection room
---

{% capture html %}

<section>
    <p><a href="/docs/isInitiator/">isInitiator</a> allows you check if current person is room moderator.</p>
</section>

<section>
    <h2>How to use</h2>
    <pre>
connection.open('roomid', function(isRoomOpened, roomid, error) {
    if(isRoomOpened === true) {
        alert(connection.isInitiator === true);
    }
});
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
