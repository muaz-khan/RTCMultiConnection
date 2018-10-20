---
api_name: becomePublicModerator
api_description: This method is deprecated since RTCMultiConnection version 3.4.7
css: 
---

{% capture html %}

<section>
    <p>This method was used in RTCMultiConnection v3.4.6 and earlier versions.</p>
    <p>v3.4.7 <b>removed</b> it and <b>replaced</b> it with this:</p>
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
