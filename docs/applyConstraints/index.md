---
api_name: applyConstraints
api_description: Change camera resolutions and other attributes during live session
css: 
---

{% capture html %}

  <section id="change-camera-resolutions">
    <h2><a href="#change-camera-resolutions">Change camera resolutions</a></h2>
    <pre style="background:#fff;color:#000"><span style="color:#ff5600">var</span> width <span style="color:#ff5600">=</span> 1280;
<span style="color:#ff5600">var</span> height <span style="color:#ff5600">=</span> 720;

<span style="color:#ff5600">var</span> supports <span style="color:#ff5600">=</span> <span style="color:#a535ae">navigator</span>.mediaDevices.getSupportedConstraints();

<span style="color:#ff5600">var</span> constraints <span style="color:#ff5600">=</span> {};
<span style="color:#ff5600">if</span> (supports.<span style="color:#a535ae">width</span> <span style="color:#ff5600">&amp;</span><span style="color:#ff5600">&amp;</span> supports.<span style="color:#a535ae">height</span>) {
    constraints <span style="color:#ff5600">=</span> {
        width: width,
        height: height
    };
}

connection.applyConstraints({
    video: constraints
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
        <td>audio</td>
        <td>{deviceId: ''}</td>
      </tr>
      <tr>
        <td>video</td>
        <td>{width:'', height: '', frameRate: '', etc: ''}</td>
      </tr>
    </tbody>
    </table>
    </div>
  </section>

  <section id="demo">
    <h2><a href="#demo">Demo</a></h2>
    <pre style="background:#fff;color:#000"><span style="color:#ff5600">&lt;</span>script src<span style="color:#ff5600">=</span><span style="color:#00a33f">"https://rtcmulticonnection.herokuapp.com/dist/RTCMultiConnection.min.js"</span><span style="color:#ff5600">></span><span style="color:#ff5600">&lt;</span>/script<span style="color:#ff5600">></span>
<span style="color:#ff5600">&lt;</span>script src<span style="color:#ff5600">=</span><span style="color:#00a33f">"https://rtcmulticonnection.herokuapp.com/socket.io/socket.io.js"</span><span style="color:#ff5600">></span><span style="color:#ff5600">&lt;</span>/script<span style="color:#ff5600">></span>

<span style="color:#ff5600">&lt;</span>hr<span style="color:#ff5600">></span><span style="color:#ff5600">&lt;</span>button id<span style="color:#ff5600">=</span><span style="color:#00a33f">"apply-constraints"</span><span style="color:#ff5600">></span>Apply Constraints<span style="color:#ff5600">&lt;</span>/button<span style="color:#ff5600">></span><span style="color:#ff5600">&lt;</span>hr<span style="color:#ff5600">></span>

<span style="color:#ff5600">&lt;</span>script<span style="color:#ff5600">></span>
<span style="color:#ff5600">var</span> connection <span style="color:#ff5600">=</span> <span style="color:#ff5600">new</span> <span style="color:#21439c">RTCMultiConnection</span>();

<span style="color:#919191">// this line is VERY_important</span>
connection.socketURL <span style="color:#ff5600">=</span> <span style="color:#00a33f">'https://rtcmulticonnection.herokuapp.com:443/'</span>;

<span style="color:#919191">// if you want audio+video conferencing</span>
connection.session <span style="color:#ff5600">=</span> {
    audio: <span style="color:#a535ae">true</span>,
    video: <span style="color:#a535ae">true</span>
};

connection.openOrJoin(<span style="color:#00a33f">'your-room-id'</span>);

<span style="color:#a535ae">document</span>.<span style="color:#a535ae">getElementById</span>(<span style="color:#00a33f">'apply-constraints'</span>).<span style="color:#21439c">onclick</span> <span style="color:#ff5600">=</span> <span style="color:#ff5600">function</span>() {
    this.<span style="color:#a535ae">disabled</span> <span style="color:#ff5600">=</span> <span style="color:#a535ae">true</span>;

    <span style="color:#ff5600">var</span> width <span style="color:#ff5600">=</span> 1280;
    <span style="color:#ff5600">var</span> height <span style="color:#ff5600">=</span> 720;

    <span style="color:#ff5600">var</span> supports <span style="color:#ff5600">=</span> <span style="color:#a535ae">navigator</span>.mediaDevices.getSupportedConstraints();

    <span style="color:#ff5600">var</span> constraints <span style="color:#ff5600">=</span> {};
    <span style="color:#ff5600">if</span> (supports.<span style="color:#a535ae">width</span> <span style="color:#ff5600">&amp;</span><span style="color:#ff5600">&amp;</span> supports.<span style="color:#a535ae">height</span>) {
        constraints <span style="color:#ff5600">=</span> {
            width: width,
            height: height
        };
    }

    connection.applyConstraints({
        video: constraints
    });
};
<span style="color:#ff5600">&lt;</span>/script<span style="color:#ff5600">></span>
</pre>
  </section>


{% endcapture %}
{% include html_snippet.html html=html %}
