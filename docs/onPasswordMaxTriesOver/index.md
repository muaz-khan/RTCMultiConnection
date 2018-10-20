---
api_name: onPasswordMaxTriesOver
api_description: User tried invalid password more than 3 times
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
connection.onPasswordMaxTriesOver = function(remoteUserId) {
    console.warn(remoteUserId, 'is password protected. Your max password tries exceeded the limit.');
};
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}

