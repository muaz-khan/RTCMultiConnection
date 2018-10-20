---
api_name: rtcpMuxPolicy
api_description: This property accepts only two values: require or negotiate
css: 
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
connection.rtcpMuxPolicy = 'require';
connection.rtcpMuxPolicy = 'negotiate';
connection.rtcpMuxPolicy = null;
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}

