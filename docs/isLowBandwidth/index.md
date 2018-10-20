---
api_name: isLowBandwidth
api_description: Check if current user has low bandwidth
---

{% capture html %}

<section>
    <h2>How to use</h2>
<pre>
alert('is current user has low bandwidth? ' + connection.isLowBandwidth === true);
</pre>
    <p>This property checks your internet connection is 2G or available bandwidth is too low.</p>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
