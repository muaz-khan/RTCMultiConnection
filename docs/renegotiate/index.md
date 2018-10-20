---
api_name: renegotiate
api_description: Call this method if you added extra streams or removed streams from existing peer connection
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
// for all users
connection.renegotiate();

// for single user
connection.renegotiate('remote-user-id');
</pre>
    <p>Please check <a href="/docs/replaceTrack/">replaceTrack</a> which provides a more reliable implementation.</p>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
