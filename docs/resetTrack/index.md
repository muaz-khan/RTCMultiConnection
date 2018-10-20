---
api_name: resetTrack
api_description: Use this method after using replaceTrack
css: 
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
// show original tracks for all users
connection.resetTrack();

// show original tracks for single user
connection.resetTrack('remote-userid-id');

// force to reset only video tracks
connection.resetTrack(null, true);
</pre>
    <p>There is a relevant API: <a href="/docs/replaceTrack/">replaceTrack</a></p>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}

