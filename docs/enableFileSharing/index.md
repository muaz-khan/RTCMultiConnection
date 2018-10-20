---
api_name: enableFileSharing
api_description: Use this boolean to enable file sharing
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
&lt;script src="/node_modules/fbr/FileBufferReader.js"&gt;&lt;/script&gt;
&lt;script&gt;
    connection.enableFileSharing = true;
&lt;/script&gt;
</pre>
    <p>Now you can send files using <a href="/docs/send/">send</a> method.</p>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
