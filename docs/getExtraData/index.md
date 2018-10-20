---
api_name: getExtraData
api_description: Get extra data information for a specific user
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
var extra = connection.getExtraData('remote-userid');
alert(extra.fullName);
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}

