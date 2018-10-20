---
api_name: onEntireSessionClosed
api_description: This event is fired if room-owner closed entire session
css: 
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
connection.onEntireSessionClosed = function(event) {
    console.info('Entire session is closed: ', event.sessionid, event.extra);
};
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}

