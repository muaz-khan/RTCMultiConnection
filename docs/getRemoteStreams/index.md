---
api_name: getRemoteStreams
api_description: Get all remote streams from single user or from all users
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
// single remote user
var singleUserStreams = connection.getRemoteStreams('remote-user-id');

// all remote users
var allUserStreams = connection.getRemoteStreams();
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
