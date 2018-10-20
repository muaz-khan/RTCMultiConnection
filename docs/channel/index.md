---
api_name: channel
api_description: Default sessionid i.e. default room-id
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
connection.channel = 'default-room-id';
connection.openOrJoin();
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
