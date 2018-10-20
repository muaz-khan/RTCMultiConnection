---
api_name: onopen
api_description: WebRTC SCTP data channel's open event
---

{% capture html %}

  <section>
    <p>This event is fired as soon as WebRTC data channel opens.</p>
  </section>

  <section id="usage">
    <h2><a href="#usage">Usage</a></h2>
    <pre style="background:#fff;color:#000"><span style="color:#a535ae">connection</span>.<span style="color:#21439c">onopen</span> <span style="color:#ff5600">=</span> <span style="color:#ff5600">function</span>(event) {
    <span style="color:#ff5600">var</span> remoteUserId <span style="color:#ff5600">=</span> <span style="color:#a535ae">event</span>.userid;
    <span style="color:#ff5600">var</span> remoteUserFullName <span style="color:#ff5600">=</span> <span style="color:#a535ae">event</span>.extra.fullName;

    <span style="color:#a535ae">alert</span>(<span style="color:#00a33f">'data connection opened with '</span> <span style="color:#ff5600">+</span> remoteUserFullName);
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
        <td>userid</td>
        <td>
            data connection opened with this user-id
            <pre style="background:#fff;color:#000"><span style="color:#a535ae">connection</span>.<span style="color:#21439c">onopen</span> <span style="color:#ff5600">=</span> <span style="color:#ff5600">function</span>(event) {
    <span style="color:#ff5600">var</span> remoteUserId <span style="color:#ff5600">=</span> <span style="color:#a535ae">event</span>.userid;
};
</pre>
        </td>
      </tr>

      <tr>
        <td>extra</td>
        <td>
            extra information
            <pre style="background:#fff;color:#000"><span style="color:#a535ae">connection</span>.<span style="color:#21439c">onopen</span> <span style="color:#ff5600">=</span> <span style="color:#ff5600">function</span>(event) {
    <span style="color:#ff5600">var</span> remoteUserFullName <span style="color:#ff5600">=</span> <span style="color:#a535ae">event</span>.extra.fullName;
};
</pre>
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

<span style="color:#919191">// if you want text chat</span>
connection.session <span style="color:#ff5600">=</span> {
    data: <span style="color:#a535ae">true</span>
};

<span style="color:#a535ae">connection</span>.<span style="color:#21439c">onopen</span> <span style="color:#ff5600">=</span> <span style="color:#ff5600">function</span>(event) {
    connection.<span style="color:#a535ae">send</span>(<span style="color:#00a33f">'hello everyone'</span>);
};

<span style="color:#a535ae">connection</span>.<span style="color:#21439c">onmessage</span> <span style="color:#ff5600">=</span> <span style="color:#ff5600">function</span>(event) {
    <span style="color:#a535ae">alert</span>(<span style="color:#a535ae">event</span>.userid <span style="color:#ff5600">+</span> <span style="color:#00a33f">' said: '</span> <span style="color:#ff5600">+</span> <span style="color:#a535ae">event</span>.<span style="color:#a535ae">data</span>);
};

connection.openOrJoin(<span style="color:#00a33f">'your-room-id'</span>);
<span style="color:#ff5600">&lt;</span>/script<span style="color:#ff5600">></span>
</pre>
  </section>

{% endcapture %}
{% include html_snippet.html html=html %}
