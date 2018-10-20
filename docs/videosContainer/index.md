---
api_name: videosContainer
api_description: Set container element for audio/video elements
---

{% capture html %}

<section>
    <pre class="sh_javascript">
&lt;div class="videos-container"&gt;&lt;/div&gt;
&lt;script&gt;
    connection.videosContainer = document.querySelector('.videos-container');
&lt;/script&gt;
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
