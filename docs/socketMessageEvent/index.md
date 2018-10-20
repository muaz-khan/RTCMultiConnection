---
api_name: socketMessageEvent
api_description: Make your room more protected and secure using this property
css: 
---

{% capture html %}

<section>
    <p>Use a random and unique value for each room.</p>
</section>

<section>
    <h2>How to use</h2>
    <pre>
var roomid = 'unique-roomid';
connection.socketMessageEvent = roomid;
connectino.openOrJoin(roomid);
</pre>
    <p>Remember, this property is optional. Default value for this property is always "RTCMultiConnection-Message". You can find default value in the "config.json" file.</p>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}

