---
api_name: onUserIdAlreadyTaken
api_description: Userid must be unique
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
connection.onUserIdAlreadyTaken = function(useridAlreadyTaken, yourNewUserId) {
    console.warn('Userid already taken.', useridAlreadyTaken, 'Your new userid:', yourNewUserId);
    connection.userid = connection.token();
    connection.join(connection.sessionid);
};
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
