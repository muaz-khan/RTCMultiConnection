---
api_name: getSocket
api_description: Get socket.io object
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
var socket = connection.getSocket();
</pre>
    <p>It is similar to <a href="/docs/socket/">socket</a> object howevere "getSocket" makes sure to connect socket if not currently connected.</p>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
