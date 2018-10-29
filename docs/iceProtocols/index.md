---
api_name: iceProtocols
api_description: Set ICE protocols i.e. UDP or TCP
---

{% capture html %}

  <section id="usage">
    <h2><a href="#usage">Usage</a></h2>
    <pre>
connection.iceProtocols = {
    udp: true,
    tcp: true
};
</pre>
  </section>

{% endcapture %}
{% include html_snippet.html html=html %}
