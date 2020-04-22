---
api_name: filesContainer
api_description: Set container element for file progress-bars
---

{% capture html %}

<section>
    <pre class="sh_javascript">
&lt;div class="files-container"&gt;&lt;/div&gt;
&lt;script&gt;
    connection.filesContainer = document.querySelector('.files-container');
&lt;/script&gt;
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
