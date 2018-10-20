---
api_name: iceTransportPolicy
api_description: Set ice-transport-policy
---

{% capture html %}

<section>
    <h2>How to use</h2>
<pre>
// to get only TURN candidate pairs
connection.iceTransportPolicy = 'relay';

// to get both STUN and TURN candidate pairs
connection.iceTransportPolicy = 'all';
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
