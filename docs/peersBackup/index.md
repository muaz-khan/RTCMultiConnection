---
api_name: peersBackup
api_description: This object keeps backup of extra-data information
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
connection.onleave = function(event) {
    var extra = connection.peersBackup[event.userid];
    alert(extra.fullName + ' left the room.');
};
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
