---
api_name: onSettingLocalDescription
api_description: This event is fired as soon as "local-description" is created for a peer
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
connection.onSettingLocalDescription = function(event) {
    console.info('Just set local description for remote user', event.userid);
};
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
