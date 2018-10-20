---
api_name: body
api_description: Set container element for audio/video streams; or file progress-bars
---

{% capture html %}

<section>
    <p>Version 3 <b>deprecated</b> "connection.body" and <b>replaced</b> it with "filesContainer" and "videosContainer".</p>
    <pre class="sh_javascript">
&lt;div class="videos-container"&gt;&lt;/div&gt;
&lt;div class="files-container"&gt;&lt;/div&gt;
&lt;script&gt;
    connection.filesContainer = document.querySelector('.videos-container');
    connection.videosContainer = document.querySelector('.files-container');
&lt;/script&gt;
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
