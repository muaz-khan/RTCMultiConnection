---
api_name: setCustomSocketEvent
api_description: It is useful for socket.io custom messaging
css: 
---

{% capture html %}

<section>
    <p>This method allows you set custom socket listeners anytime, during a live session.</p>
</section>

<section>
    <h2>How to use</h2>
    <pre>
connection.setCustomSocketEvent('abcdef');
connection.socket.on('abcdef', function(message) {
    alert(message);
});

connection.socket.emit('abcdef', 'My userid is: ' + connection.userid);
</pre>
    <p>Alternative API: <a href="/docs/socketCustomEvent/">socketCustomEvent</a></p>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}

