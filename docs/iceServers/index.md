---
api_name: iceServers
api_description: Set your own STUN and TURN servers
---

{% capture html %}

  <section>
    <p>Use this javascript array to set your own STUN+TURN servers.</p>
    <p>See <a href="https://www.webrtc-experiment.com/docs/TURN-server-installation-guide.html">how to install your own TURN server</a>.</p>
  </section>

  <section id="usage">
    <h2><a href="#usage">Usage</a></h2>
    <pre style="background:#fff;color:#000"><span style="color:#919191">// first step, ignore default STUN+TURN servers</span>
connection.iceServers <span style="color:#ff5600">=</span> [];

<span style="color:#919191">// second step, set STUN url</span>
connection.iceServers.<span style="color:#a535ae">push</span>({
    urls: <span style="color:#00a33f">'stun:yourSTUN.com:port'</span>
});

<span style="color:#919191">// last step, set TURN url (recommended)</span>
connection.iceServers.<span style="color:#a535ae">push</span>({
    urls: <span style="color:#00a33f">'turn:yourTURN.com:port'</span>,
    credential: <span style="color:#00a33f">'password'</span>,
    username: <span style="color:#00a33f">'username'</span>
});
</pre>
  </section>

  <section id="description">
    <h2><a href="#description">Description</a></h2>
    <div class="datagrid">
    <table>
    <thead><tr><th>parameter</th><th>description</th></tr></thead>
    <tbody>
      <tr>
        <td>javascript array</td>
        <td>
          1) "urls" set the URL for STUN or TURN server<br>
          2) "credential" set TURN password<br>
          3) "username" set TURN user-name
        </td>
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

<span style="color:#919191">// first step, ignore default STUN+TURN servers</span>
connection.iceServers <span style="color:#ff5600">=</span> [];

<span style="color:#919191">// second step, set STUN url</span>
connection.iceServers.<span style="color:#a535ae">push</span>({
    urls: <span style="color:#00a33f">'stun:yourSTUN.com:port'</span>
});

<span style="color:#919191">// last step, set TURN url (recommended)</span>
connection.iceServers.<span style="color:#a535ae">push</span>({
    urls: <span style="color:#00a33f">'turn:yourTURN.com:port'</span>,
    credential: <span style="color:#00a33f">'password'</span>,
    username: <span style="color:#00a33f">'username'</span>
});

connection.openOrJoin(<span style="color:#00a33f">'your-room-id'</span>);
<span style="color:#ff5600">&lt;</span>/script<span style="color:#ff5600">></span>
</pre>
  </section>

{% endcapture %}
{% include html_snippet.html html=html %}
