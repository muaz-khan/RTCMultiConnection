---
api_name: candidates
api_description: Manage STUN, TURN and host ip-addresses usage
---

{% capture html %}

  <section id="usage">
    <h2><a href="#usage">Usage</a></h2>
    <pre style="background:#fff;color:#000">connection.candidates <span style="color:#ff5600">=</span> {
    turn: <span style="color:#a535ae">true</span>,
    stun: <span style="color:#a535ae">true</span>,
    host: <span style="color:#a535ae">false</span>
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
        <td>turn</td>
        <td>Enable or disable "relay" ip-addresses</td>
      </tr>
      <tr>
        <td>stun</td>
        <td>Enable or disable (peer) "reflexive" ip-addresses</td>
      </tr>
      <tr>
        <td>host</td>
        <td>Enable or disable local ip-addresses</td>
      </tr>
    </tbody>
    </table>
    </div>
  </section>

  <section id="demo">
    <h2><a href="#demo">Demo</a></h2>
    <pre style="background:#fff;color:#000"><span style="color:#ff5600">&lt;</span>script src<span style="color:#ff5600">=</span><span style="color:#00a33f">"https://rtcmulticonnection.herokuapp.com/dist/RTCMultiConnection.min.js"</span><span style="color:#ff5600">></span><span style="color:#ff5600">&lt;</span>/script<span style="color:#ff5600">></span>
<span style="color:#ff5600">&lt;</span>script src<span style="color:#ff5600">=</span><span style="color:#00a33f">"https://rtcmulticonnection.herokuapp.com/socket.io/socket.io.js"</span><span style="color:#ff5600">></span><span style="color:#ff5600">&lt;</span>/script<span style="color:#ff5600">></span>

<span style="color:#ff5600">&lt;</span>script<span style="color:#ff5600">></span>
<span style="color:#ff5600">var</span> connection <span style="color:#ff5600">=</span> <span style="color:#ff5600">new</span> <span style="color:#21439c">RTCMultiConnection</span>();

<span style="color:#919191">// this line is VERY_important</span>
connection.socketURL <span style="color:#ff5600">=</span> <span style="color:#00a33f">'https://rtcmulticonnection.herokuapp.com:443/'</span>;

<span style="color:#919191">// if you want audio+video conferencing</span>
connection.session <span style="color:#ff5600">=</span> {
    audio: <span style="color:#a535ae">true</span>,
    video: <span style="color:#a535ae">true</span>
};

<span style="color:#919191">// enable only relay ip-addresses</span>
connection.candidates <span style="color:#ff5600">=</span> {
    turn: <span style="color:#a535ae">true</span>,
    stun: <span style="color:#a535ae">false</span>,
    host: <span style="color:#a535ae">false</span>
};

connection.openOrJoin(<span style="color:#00a33f">'your-room-id'</span>);
<span style="color:#ff5600">&lt;</span>/script<span style="color:#ff5600">></span>
</pre>
  </section>

{% endcapture %}
{% include html_snippet.html html=html %}
