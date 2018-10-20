---
api_name: socketOptions
api_description: Socket.io protocol options
css: 
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
connection.socketOptions = {
    'force new connection': true, // For SocketIO version < 1.0
    'forceNew': true, // For SocketIO version >= 1.0
    'transport': 'polling' // fixing transport:unknown issues
};
</pre>
</section>

<section>
    <h2>Otherwise</h2>
    <pre>
connection.socketOptions.resource = 'custom';
connection.socketOptions.transport = 'polling';
connection.socketOptions['try multiple transports'] = false;
connection.socketOptions.secure = true;
connection.socketOptions.port = '9001';
connection.socketOptions['max reconnection attempts'] = 100;
// etc.
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}

