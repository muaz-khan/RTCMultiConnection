---
api_name: attachStreams
api_description: This array allows you either manage all your local streams; or attach external (your-own-captured) media streams
css: 
---

{% capture html %}

  <section id="stop-local-streams">
    <h2><a href="#stop-local-streams">Stop all local streams</a></h2>
    <pre style="background:#fff;color:#000">connection.attachStreams.forEach(<span style="color:#ff5600">function</span>(localStream) {
    localStream.<span style="color:#a535ae">stop</span>();
});
</pre>
  </section>

  <section id="attach-external-streams">
    <h2><a href="#attach-external-streams">Attach external streams</a></h2>
    <pre style="background:#fff;color:#000">connection.attachStreams <span style="color:#ff5600">=</span> [yourExternalStream];

<span style="color:#919191">// or</span>
connection.attachStreams.<span style="color:#a535ae">push</span>(yourExternalStream);
</pre>
  </section>

  <section id="description">
    <h2><a href="#description">Description</a></h2>
    <div class="datagrid">
    <table>
    <thead><tr><th>parameter</th><th>description</th></tr></thead>
    <tbody>
      <tr>
        <td>attachStreams</td>
        <td>It is a JavaScript array</td>
      </tr>
      <tr>
        <td>MediaStream</td>
        <td>webkitMediaStream or native "MediaStream" object</td>
      </tr>
    </tbody>
    </table>
    </div>
  </section>

  <section id="add-external-streams">
    <h2><a href="#add-external-streams">Add external stream in a LIVE session</a></h2>
    <pre style="background:#fff;color:#000">connection.dontCaptureUserMedia <span style="color:#ff5600">=</span> <span style="color:#a535ae">true</span>;
connection.attachStreams <span style="color:#ff5600">=</span> [yourExternalStream];
connection.addStream({
    audio: <span style="color:#a535ae">true</span>,
    video: <span style="color:#a535ae">true</span>,
    oneway: <span style="color:#a535ae">true</span>
});
</pre>
  </section>

  <section id="demo">
    <h2><a href="#demo">Demo</a></h2>
    <pre style="background:#fff;color:#000">&lt;script src=<span style="color:#00a33f">"https://rtcmulticonnection.herokuapp.com/dist/RTCMultiConnection.min.js"</span>>&lt;/script>
&lt;script src=<span style="color:#00a33f">"https://rtcmulticonnection.herokuapp.com/socket.io/socket.io.js"</span>>&lt;/script>

&lt;script>
<span style="color:#ff5600">var</span> connection <span style="color:#ff5600">=</span> <span style="color:#ff5600">new</span> <span style="color:#21439c">RTCMultiConnection</span>();

<span style="color:#919191">// this line is VERY_important</span>
connection.socketURL <span style="color:#ff5600">=</span> <span style="color:#00a33f">'https://rtcmulticonnection.herokuapp.com:443/'</span>;

<span style="color:#919191">// if you want audio+video conferencing</span>
connection.session <span style="color:#ff5600">=</span> {
    audio: <span style="color:#a535ae">true</span>,
    video: <span style="color:#a535ae">true</span>
};

connection.dontCaptureUserMedia <span style="color:#ff5600">=</span> <span style="color:#a535ae">true</span>;
<span style="color:#a535ae">navigator</span>.webkitGetUserMedia({
    video: <span style="color:#a535ae">true</span>,
    audio: <span style="color:#a535ae">true</span>
}, <span style="color:#ff5600">function</span>(yourExternalStream) {
    connection.attachStreams <span style="color:#ff5600">=</span> [yourExternalStream];
    connection.openOrJoin(<span style="color:#00a33f">'your-room-id'</span>);
}, <span style="color:#ff5600">function</span>(error) {});
&lt;/script>
</pre>
  </section>

{% endcapture %}
{% include html_snippet.html html=html %}
