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

{% endcapture %}
{% include html_snippet.html html=html %}

