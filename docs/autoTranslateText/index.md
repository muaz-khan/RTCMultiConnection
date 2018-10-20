---
api_name: autoTranslateText
api_description: Convert all incoming chat (text) messages into your preferred language
css: 
---

{% capture html %}

  <section id="set-boolean">
    <h2><a href="#set-boolean">Set boolean</a></h2>
    <pre style="background:#fff;color:#000">connection.<span style="color:#a535ae">language</span> <span style="color:#ff5600">=</span> <span style="color:#00a33f">'ja'</span>; <span style="color:#919191">// choose target language</span>

connection.autoTranslateText <span style="color:#ff5600">=</span> <span style="color:#a535ae">true</span>;

<span style="color:#919191">// you can use "e.data" and "e.original"</span>
<span style="color:#a535ae">connection</span>.<span style="color:#21439c">onmessage</span> <span style="color:#ff5600">=</span> <span style="color:#ff5600">function</span>(e) {
   <span style="color:#919191">// e.data     ---- japanese text</span>
   <span style="color:#919191">// e.original ---- original text</span>
};
</pre>
  </section>

  <section id="description">
    <h2><a href="#description">Description</a></h2>
    <div class="datagrid">
    <table>
    <thead><tr><th>parameter</th><th>description</th></tr></thead>
    <tbody>
      <tr>
        <td>autoTranslateText</td>
        <td>It is a boolean, that can be either "true" or "false"</td>
      </tr>
    </tbody>
    </table>
    </div>
  </section>

  <section id="demo">
    <h2><a href="#demo">Demo</a></h2>
    <pre style="background:#fff;color:#000">&lt;script src=<span style="color:#00a33f">"https://rtcmulticonnection.herokuapp.com/dist/RTCMultiConnection.min.js"</span>>&lt;/script>
&lt;script src=<span style="color:#00a33f">"https://rtcmulticonnection.herokuapp.com/socket.io/socket.io.js"</span>>&lt;/script>

&lt;script>
<span style="color:#ff5600">var</span> connection <span style="color:#ff5600">=</span> <span style="color:#ff5600">new</span> <span style="color:#21439c">RTCMultiConnection</span>();

<span style="color:#919191">// this line is VERY_important</span>
connection.socketURL <span style="color:#ff5600">=</span> <span style="color:#00a33f">'https://rtcmulticonnection.herokuapp.com:443/'</span>;

<span style="color:#919191">// if you want to open data channels</span>
connection.session <span style="color:#ff5600">=</span> {
    data: <span style="color:#a535ae">true</span>
};

connection.openOrJoin(<span style="color:#00a33f">'your-room-id'</span>);

connection.<span style="color:#a535ae">language</span> <span style="color:#ff5600">=</span> <span style="color:#00a33f">'ja'</span>; <span style="color:#919191">// choose a language</span>

connection.autoTranslateText <span style="color:#ff5600">=</span> <span style="color:#a535ae">true</span>;

<span style="color:#919191">// you can use "e.data" and "e.original"</span>
<span style="color:#a535ae">connection</span>.<span style="color:#21439c">onmessage</span> <span style="color:#ff5600">=</span> <span style="color:#ff5600">function</span>(e) {
    <span style="color:#919191">// e.data     ---- japanese text</span>
    <span style="color:#919191">// e.original ---- original text</span>
};
&lt;/script>
</pre>
  </section>

{% endcapture %}
{% include html_snippet.html html=html %}
