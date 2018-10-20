---
title: socket.on(get-public-rooms) | RTCMultiConnection
description: This event allows you get list of all public rooms
css: 
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
connection.publicRoomIdentifier = 'unique-id-for-your-page'; // required
connection.socket.emit('get-public-rooms', connection.publicRoomIdentifier, function(listOfRooms) {
    listOfRooms.forEach(function(room) {
        console.log(roomid);
    });
});
</pre>
    <p>Here is a demo that is using "<b>get-public-rooms</b>": <a href="https://rtcmulticonnection.herokuapp.com/demos/dashboard.html">demos/dashboard.html</a></p>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
