---
api_name: beforeRemovingStream
api_description: Check if RTCMultiConnection is removing a stream during peer connection
---

{% capture html %}

  <section id="usage">
    <h2><a href="#usage">Usage</a></h2>
    <pre>
connection.beforeRemovingStream = function(stream) {
  // stream.id, stream.getTracks()
  return stream;
};
</pre>
  </section>

{% endcapture %}
{% include html_snippet.html html=html %}
