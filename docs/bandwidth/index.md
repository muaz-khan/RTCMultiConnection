---
api_name: bandwidth
api_description: Set audio/video bitrates and framerates
css: 
---

{% capture html %}

  <section id="set-object">
    <h2><a href="#set-object">Set object</a></h2>
    <pre style="background:#fff;color:#000">connection.bandwidth <span style="color:#ff5600">=</span> {
    audio: 50,  <span style="color:#919191">// 50 kbps</span>
    video: 256, <span style="color:#919191">// 256 kbps</span>
    <span style="color:#a535ae">screen</span>: 300 <span style="color:#919191">// 300 kbps</span>
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
        <td>audio</td>
        <td>audio bitrates. Minimum 6 kbps and maximum 510 kbps</td>
      </tr>
      <tr>
        <td>video</td>
        <td>video framerates. Minimum 100 kbps; maximum 2000 kbps</td>
      </tr>
      <tr>
        <td>screen</td>
        <td>screen framerates. Minimum 300 kbps; maximum 4000 kbps</td>
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

connection.bandwidth <span style="color:#ff5600">=</span> {
    audio: 50,  <span style="color:#919191">// 50 kbps</span>
    video: 256 <span style="color:#919191">// 256 kbps</span>
};

connection.openOrJoin(<span style="color:#00a33f">'your-room-id'</span>);
<span style="color:#ff5600">&lt;</span>/script<span style="color:#ff5600">></span>
</pre>
  </section>

{% endcapture %}
{% include html_snippet.html html=html %}
