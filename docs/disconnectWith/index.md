---
api_name: disconnectWith
api_description: Close peer connection with a specific user
---

{% capture html %}

<section>
    <p>This method allows you leave any single user.</p>
    <p>This method accepts "remote-user-id" as the only argument:</p>
    <pre>
connection.disconnectWith( 'remote-userid' );

// or
// to leave entire room
connection.getAllParticipants().forEach(function(participantId) {
    connection.disconnectWith( participantId );
});
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
