---
api_name: password
api_description: Set password for creating or joining a room
---

{% capture html %}

<section>
    <h2>How to use</h2>
<pre>
connection.password = 'abcdef';

connectin.open('roomid');
connectin.join('roomid');
connectin.openOrJoin('roomid');
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
