---
api_name: invokeSelectFileDialog
api_description: Select and get single file
---

{% capture html %}

<section>
    <h2>How to use</h2>
<pre>
connection.invokeSelectFileDialog(function(file) {
    connection.send(file);
});
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
