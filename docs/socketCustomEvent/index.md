---
api_name: socketCustomEvent
api_description: It is useful for socket.io custom messaging
css: 
---

{% capture html %}

<section>
    <p>This method allows you set custom socket listener before starting or joining a room.</p>
</section>

<section>
    <h2>How to use</h2>
    <pre>
connection.socketCustomEvent = 'abcdef';
connection.openOrJoin('roomid', function() {
    connection.socket.on(connection.socketCustomEvent, function(message) {
        alert(message);
    });

    connection.socket.emit(connection.socketCustomEvent, 'My userid is: ' + connection.userid);
});
</pre>
    <p>Alternative API: <a href="/docs/setCustomSocketEvent/">setCustomSocketEvent</a></p>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}

