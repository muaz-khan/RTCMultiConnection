---
api_name: onJoinWithPassword
api_description: Room is password protected. So please join with a password
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
connection.onJoinWithPassword = function(remoteUserId) {
    console.warn(remoteUserId, 'is password protected. Please join with password.');
};
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}

