---
api_name: closeSocket
api_description: Disconnect socket.io and close all peers
---

{% capture html %}

  <section id="usage">
    <h2><a href="#usage">Usage</a></h2>
    <pre style="background:#fff;color:#000">connection.closeSocket();
</pre>
  </section>

  <section id="best-practice">
    <h2><a href="#best-practice">Best practice</a></h2>
    <pre style="background:#fff;color:#000"><span style="color:#a535ae">btnLeave</span>.<span style="color:#21439c">onclick</span> <span style="color:#ff5600">=</span> <span style="color:#ff5600">function</span>() {
    <span style="color:#919191">// disconnect with all users</span>
    connection.getAllParticipants().forEach(<span style="color:#ff5600">function</span>(pid) {
        connection.disconnectWith(pid);
    });

    <span style="color:#919191">// stop all local cameras</span>
    connection.attachStreams.forEach(<span style="color:#ff5600">function</span>(localStream) {
        localStream.<span style="color:#a535ae">stop</span>();
    });

    <span style="color:#919191">// close socket.io connection</span>
    connection.closeSocket();
};
</pre>
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

<span style="color:#a535ae">btnLeave</span>.<span style="color:#21439c">onclick</span> <span style="color:#ff5600">=</span> <span style="color:#ff5600">function</span>() {
    <span style="color:#919191">// disconnect with all users</span>
    connection.getAllParticipants().forEach(<span style="color:#ff5600">function</span>(pid) {
        connection.disconnectWith(pid);
    });

    <span style="color:#919191">// stop all local cameras</span>
    connection.attachStreams.forEach(<span style="color:#ff5600">function</span>(localStream) {
        localStream.<span style="color:#a535ae">stop</span>();
    });

    <span style="color:#919191">// close socket.io connection</span>
    connection.closeSocket();
};

connection.openOrJoin(<span style="color:#00a33f">'your-room-id'</span>);
<span style="color:#ff5600">&lt;</span>/script<span style="color:#ff5600">></span>
</pre>
  </section>

{% endcapture %}
{% include html_snippet.html html=html %}
