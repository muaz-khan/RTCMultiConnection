---
api_name: resetScreen
api_description: Always call this method before invoking getUserMedia for screen capturing
---

{% capture html %}

<section>
    <h2>How to use</h2>
<pre>
connection.resetScreen();
connection.addStream({
    screen: true,
    oneway: true
});
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
