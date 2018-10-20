---
api_name: sessionid
api_description: This is room-id. It is a readonly property
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
connection.open('roomid', function(isRoomOpened, roomid, error) {
    if(isRoomOpened === true) {
        alert(connection.sessionid === roomid);
    }
});
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
