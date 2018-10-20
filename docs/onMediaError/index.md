---
api_name: onMediaError
api_description: This event is fired if getUserMedia request is failed
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
connection.onMediaError = function (error) {
    // error.name == 'PermissionDeniedError' etc.
    // error.message
    // error.constraintName
    // error.session --- original session that is used to capture media
}
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
