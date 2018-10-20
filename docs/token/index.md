---
api_name: token
api_description: This method generates a random string id
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
var userid = connection.token();
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
