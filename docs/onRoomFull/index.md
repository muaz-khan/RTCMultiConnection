---
api_name: onRoomFull
api_description: This event is fired if room's max participation limit is exceeded
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
connection.onRoomFull = function(roomid) {
    console.warn(roomid, 'is full.');
};
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
