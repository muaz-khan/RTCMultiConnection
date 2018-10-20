---
api_name: captureUserMedia
api_description: Manually capture camera, microphone or screen
---

{% capture html %}

  <section id="capture-camera-microphone">
    <h2><a href="#capture-camera-microphone">Capture camera and microphone</a></h2>
    <pre style="background:#fff;color:#000"><span style="color:#ff5600">var</span> cameraOptions <span style="color:#ff5600">=</span> {
    audio: <span style="color:#a535ae">true</span>,
    video: <span style="color:#a535ae">true</span>
};

connection.captureUserMedia(<span style="color:#ff5600">function</span>(camera) {
    <span style="color:#ff5600">var</span> video <span style="color:#ff5600">=</span> <span style="color:#a535ae">document</span>.<span style="color:#a535ae">createElement</span>(<span style="color:#00a33f">'video'</span>);
    video.<span style="color:#a535ae">src</span> <span style="color:#ff5600">=</span> URL.createObjectURL(camera);
    video.muted <span style="color:#ff5600">=</span> ture;

    <span style="color:#ff5600">var</span> streamEvent <span style="color:#ff5600">=</span> {
        type: <span style="color:#00a33f">'local'</span>,
        stream: camera,
        streamid: camera.<span style="color:#a535ae">id</span>,
        mediaElement: video
    };
    connection.onstream(streamEvent);
}, cameraOptions);
</pre>
  </section>

  <section id="description">
    <h2><a href="#description">Description</a></h2>
    <div class="datagrid">
    <table>
    <thead><tr><th>parameter</th><th>description</th></tr></thead>
    <tbody>
      <tr>
        <td>callback</td>
        <td>MediaStream is returned via callback function</td>
      </tr>
      <tr>
        <td>media-constraints</td>
        <td>Camera or screen options, same constraints as getUserMedia API</td>
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

connection.connectSocket(<span style="color:#ff5600">function</span>() {
    <span style="color:#a535ae">alert</span>(<span style="color:#00a33f">'Successfully connected to socket.io server.'</span>);

    connection.socket.emit(<span style="color:#00a33f">'howdy'</span>, <span style="color:#00a33f">'hello'</span>);
});

<span style="color:#ff5600">var</span> cameraOptions <span style="color:#ff5600">=</span> {
    audio: <span style="color:#a535ae">true</span>,
    video: <span style="color:#a535ae">true</span>
};

connection.captureUserMedia(<span style="color:#ff5600">function</span>(camera) {
    <span style="color:#ff5600">var</span> video <span style="color:#ff5600">=</span> <span style="color:#a535ae">document</span>.<span style="color:#a535ae">createElement</span>(<span style="color:#00a33f">'video'</span>);
    video.<span style="color:#a535ae">src</span> <span style="color:#ff5600">=</span> URL.createObjectURL(camera);
    video.muted <span style="color:#ff5600">=</span> ture;

    <span style="color:#ff5600">var</span> streamEvent <span style="color:#ff5600">=</span> {
        type: <span style="color:#00a33f">'local'</span>,
        stream: camera,
        streamid: camera.<span style="color:#a535ae">id</span>,
        mediaElement: video
    };
    connection.onstream(streamEvent);

    <span style="color:#919191">// ask RTCMultiConnection to</span>
    <span style="color:#919191">// DO NOT capture any camera</span>
    <span style="color:#919191">// because we already have one</span>
    connection.dontCaptureUserMedia <span style="color:#ff5600">=</span> <span style="color:#a535ae">true</span>;

    <span style="color:#919191">// now open or join a room</span>
    connection.openOrJoin(<span style="color:#00a33f">'your-room-id'</span>);
}, cameraOptions);
<span style="color:#ff5600">&lt;</span>/script<span style="color:#ff5600">></span>
</pre>
  </section>

{% endcapture %}
{% include html_snippet.html html=html %}
