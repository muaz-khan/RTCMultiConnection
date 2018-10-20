---
title: RTCMultiConnection Session Participant
description: If you join an RTCMultiConnection room
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
connection.join('roomid', function(isRoomJoined, roomid, error) {
    if(isRoomJoined === true) {
        alert(connection.isInitiator === false);
    }
});
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
