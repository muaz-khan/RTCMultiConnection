---
api_name: beforeAddingStream
api_description: You can skip any stream or allow RTCMultiConnection to share a stream with remote users
---

{% capture html %}

  <section>
    <p><code>nativePeer.addStream</code> method will be called only if "beforeAddingStream" permits it.</p>
  </section>

  <section id="usage">
    <h2><a href="#usage">Usage</a></h2>
    <pre style="background:#fff;color:#000"><span style="color:#a535ae">connection</span>.<span style="color:#21439c">beforeAddingStream</span> <span style="color:#ff5600">=</span> <span style="color:#ff5600">function</span>(stream, peer) {
    <span style="color:#ff5600">if</span>(stream.<span style="color:#a535ae">id</span> <span style="color:#ff5600">==</span> <span style="color:#00a33f">'any-streamid'</span>) <span style="color:#ff5600">return</span>; <span style="color:#919191">// skip</span>
    <span style="color:#ff5600">if</span>(stream.isScreen) <span style="color:#ff5600">return</span>; <span style="color:#919191">// skip</span>
    <span style="color:#ff5600">if</span>(stream.inactive) <span style="color:#ff5600">return</span>; <span style="color:#919191">// skip</span>

    <span style="color:#919191">// var remoteUserId = peer.userid;</span>
    <span style="color:#919191">// var remoteUserExtra = connection.peers[remoteUserId].extra;</span>

    <span style="color:#ff5600">return</span> stream; <span style="color:#919191">// otherwise allow RTCMultiConnection to share this stream with remote users</span>
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
        <td>stream</td>
        <td>MediaStream object</td>
      </tr>
      <tr>
        <td>peer</td>
        <td>remoteUserId = peer.userid<br>remoteUserExtra = peer.extra</td>
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

<span style="color:#a535ae">connection</span>.<span style="color:#21439c">beforeAddingStream</span> <span style="color:#ff5600">=</span> <span style="color:#ff5600">function</span>(stream, peer) {
    <span style="color:#ff5600">if</span>(peer.userid <span style="color:#ff5600">===</span> <span style="color:#00a33f">'xyz'</span>) {
       <span style="color:#919191">// do not share any stream with user "XYZ"</span>
       <span style="color:#ff5600">return</span>;
    }

    <span style="color:#ff5600">return</span> stream;
};

connection.openOrJoin(<span style="color:#00a33f">'your-room-id'</span>);
<span style="color:#ff5600">&lt;</span>/script<span style="color:#ff5600">></span>
</pre>
  </section>

{% endcapture %}
{% include html_snippet.html html=html %}
