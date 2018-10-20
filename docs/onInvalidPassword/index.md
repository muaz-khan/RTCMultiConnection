---
api_name: onInvalidPassword
api_description: Password entered by current user is invalid
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
connection.onInvalidPassword = function(remoteUserId, oldPassword) {
    console.warn(remoteUserId, 'is password protected. Please join with valid password. Your old password', oldPassword, 'is wrong.');
};
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}

