---
api_name: chunkSize
api_description: Manage how your files are splitted into chunks
---

{% capture html %}

  <section id="usage">
    <h2><a href="#usage">Usage</a></h2>
    <pre style="background:#fff;color:#000"><span style="color:#919191">// both chrome/firefox now accepts 64 kilo-bits for each data-chunk</span>
connection.chunkSize <span style="color:#ff5600">=</span> 60 <span style="color:#ff5600">*</span> 1000;

<span style="color:#919191">// to make sure it works on all devices</span>
connection.chunkSize <span style="color:#ff5600">=</span> 15 <span style="color:#ff5600">*</span> 1000;
</pre>
  </section>

  <section id="description">
    <h2><a href="#description">Description</a></h2>
    <div class="datagrid">
    <table>
    <tbody>
      <tr>
        <td>Your file will be converted into pieces.</td>
      </tr>
      <tr>
        <td>Pieces will be delivered (shared) in linear order.</td>
      </tr>
      <tr>
        <td>Each piece must be considered as a "data-chunk".</td>
      </tr>
      <tr>
        <td>Both chrome and firefox allows you share 64 kilo-bits of data packets.</td>
      </tr>
      <tr>
        <td>So you can set "chunkSize" to be either 64k or lower. Higher the value faster the streaming will be.</td>
      </tr>
    </tbody>
    </table>
    </div>
  </section>

  <section id="demo">
    <h2><a href="#demo">Demo</a></h2>
    <pre style="background:#fff;color:#000"><span style="color:#ff5600">&lt;</span>script src<span style="color:#ff5600">=</span><span style="color:#00a33f">"https://rtcmulticonnection.herokuapp.com/dist/RTCMultiConnection.min.js"</span><span style="color:#ff5600">></span><span style="color:#ff5600">&lt;</span>/script<span style="color:#ff5600">></span>
<span style="color:#ff5600">&lt;</span>script src<span style="color:#ff5600">=</span><span style="color:#00a33f">"https://rtcmulticonnection.herokuapp.com/socket.io/socket.io.js"</span><span style="color:#ff5600">></span><span style="color:#ff5600">&lt;</span>/script<span style="color:#ff5600">></span>
<span style="color:#ff5600">&lt;</span>script src<span style="color:#ff5600">=</span><span style="color:#00a33f">"https://cdn.webrtc-experiment.com/FileBufferReader.js"</span><span style="color:#ff5600">></span><span style="color:#ff5600">&lt;</span>/script<span style="color:#ff5600">></span>

<span style="color:#ff5600">&lt;</span>script<span style="color:#ff5600">></span>
<span style="color:#ff5600">var</span> connection <span style="color:#ff5600">=</span> <span style="color:#ff5600">new</span> <span style="color:#21439c">RTCMultiConnection</span>();

<span style="color:#919191">// this line is VERY_important</span>
connection.socketURL <span style="color:#ff5600">=</span> <span style="color:#00a33f">'https://rtcmulticonnection.herokuapp.com:443/'</span>;

connection.enableFileSharing <span style="color:#ff5600">=</span> <span style="color:#a535ae">true</span>;
connection.chunkSize <span style="color:#ff5600">=</span> 15 <span style="color:#ff5600">*</span> 1000; <span style="color:#919191">// using 15k</span>

<span style="color:#a535ae">connection</span>.<span style="color:#21439c">onopen</span> <span style="color:#ff5600">=</span> <span style="color:#ff5600">function</span>() {
    <span style="color:#ff5600">if</span> (connection.isInitiator <span style="color:#ff5600">==</span> <span style="color:#a535ae">false</span>) <span style="color:#ff5600">return</span>;

    <span style="color:#ff5600">var</span> selector <span style="color:#ff5600">=</span> <span style="color:#ff5600">new</span> <span style="color:#21439c">FileSelector</span>();
    selector.selectSingleFile(<span style="color:#ff5600">function</span>(file) {
        connection.<span style="color:#a535ae">send</span>(file);
    });
};

<span style="color:#919191">// if you want to open data channels</span>
connection.session <span style="color:#ff5600">=</span> {
    data: <span style="color:#a535ae">true</span>
};

connection.openOrJoin(<span style="color:#00a33f">'your-room-id'</span>);
<span style="color:#ff5600">&lt;</span>/script<span style="color:#ff5600">></span>
</pre>
  </section>

{% endcapture %}
{% include html_snippet.html html=html %}
