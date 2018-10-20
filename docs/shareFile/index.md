---
api_name: shareFile
api_description: Share files with single or multiple users
css: 
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
// share with all users
connection.shareFile(file);

// share with specific user only
connection.shareFile(file, 'remote-user-id');
</pre>
    <p>If you send file using <a href="/docs/send/">send</a> method, it will invoke "shareFile" internally. So both are same in functionality.</p>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}

