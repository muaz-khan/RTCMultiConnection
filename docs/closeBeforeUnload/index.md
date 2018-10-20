---
api_name: closeBeforeUnload
api_description: Use this property to disable "onbeforeunload" stuff
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
connection.closeBeforeUnload = false;
</pre>
</section>

<section>
    <h2>Alternative</h2>
    <pre>
// this one is strongly recommended
window.ignoreBeforeUnload = true;

// you can do this as well
connection.onbeforeunload = function() {};
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}

