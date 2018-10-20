---
api_name: userid
api_description: Each and every user must have a unique userid
---

{% capture html %}

  <section id="usage">
    <h2><a href="#usage">Usage</a></h2>
    <pre style="background:#fff;color:#000">
connection.userid <span style="color:#ff5600">=</span> <span style="color:#00a33f">'unique-userid'</span>;
connection.<span style="color:#a535ae">open</span> (<span style="color:#00a33f">'room-id'</span>);
</pre>
  </section>

{% endcapture %}
{% include html_snippet.html html=html %}
