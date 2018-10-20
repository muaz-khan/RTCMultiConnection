---
api_name: isOnline
api_description: Check if current user is online or offline
---

{% capture html %}

<section>
    <h2>How to use</h2>
<pre>
alert(connection.isOnline === true);
</pre>
    <p>This property checks your internet connection and changes value accordingly. If you have internet connection then it will be "true". Otherwise "false".</p>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
