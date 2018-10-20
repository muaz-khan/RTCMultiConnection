---
api_name: direction
api_description: Set stream direct i.e. how stream should flow
---

{% capture html %}

<section id="usage">
    <h2><a href="#usage">How to use</a></h2>
    <pre>
connection.direction = 'one-way';
connection.direction = 'one-to-one';
connection.direction = 'one-to-many';
connection.direction = 'many-to-many';
</pre>
</section>

<section id="alternatives">
    <h2><a href="#alternatives">Alternatives</a></h2>
    <pre>
connection.session.oneway = true;    // one-way
connection.session.broadcast = true; // one-to-many
</pre>
    <p>Remove above two booleans (from <a href="/docs/session/">session</a> object) to make it "many-to-many" and use <a href="/docs/maxParticipantsAllowed/">maxParticipantsAllowed</a> to force one-to-one.</p>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
