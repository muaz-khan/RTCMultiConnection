---
api_name: codecs
api_description: You can manage audio/video codecs e.g. vp8, vp9, h264, opus, isac, G722 etc
---

{% capture html %}

  <section id="usage">
    <h2><a href="#usage">Usage</a></h2>
    <pre style="background:#fff;color:#000">connection.codecs <span style="color:#ff5600">=</span> {
    video: <span style="color:#00a33f">'H264'</span>,
    audio: <span style="color:#00a33f">'G722'</span>
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
        <td>Audio codecs e.g. "opus", "G722", "ISAC" etc.</td>
      </tr>
      <tr>
        <td>video</td>
        <td>Video codecs e.g. "h264", "vp9", "vp8" etc.</td>
      </tr>
    </tbody>
    </table>
    </div>
  </section>

  <section id="use-h264">
    <h2><a href="#use-h264">Wanna use H264 for video?</a></h2>
    <pre style="background:#fff;color:#000">connection.codecs.video <span style="color:#ff5600">=</span> <span style="color:#00a33f">'H264'</span>;
</pre>
  </section>

  <section id="use-VP8">
    <h2><a href="#use-VP8">Wanna use VP8 for video?</a></h2>
    <pre style="background:#fff;color:#000">connection.codecs.video <span style="color:#ff5600">=</span> <span style="color:#00a33f">'VP8'</span>;
</pre>
  </section>

  <section id="use-VP9">
    <h2><a href="#use-VP9">Wanna use VP9 for video?</a></h2>
    <pre style="background:#fff;color:#000">connection.codecs.video <span style="color:#ff5600">=</span> <span style="color:#00a33f">'VP9'</span>;
</pre>
  </section>

  <section id="use-G722">
    <h2><a href="#use-G722">Wanna use G722 for audio?</a></h2>
    <pre style="background:#fff;color:#000">connection.codecs.audio <span style="color:#ff5600">=</span> <span style="color:#00a33f">'G722'</span>;
</pre>
  </section>

  <section id="use-opus">
    <h2><a href="#use-opus">Wanna use opus for audio?</a></h2>
    <pre style="background:#fff;color:#000">connection.codecs.audio <span style="color:#ff5600">=</span> <span style="color:#00a33f">'opus'</span>;
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

connection.codecs <span style="color:#ff5600">=</span> {
    video: <span style="color:#00a33f">'H264'</span>,
    audio: <span style="color:#00a33f">'G722'</span>
};

connection.openOrJoin(<span style="color:#00a33f">'your-room-id'</span>);
<span style="color:#ff5600">&lt;</span>/script<span style="color:#ff5600">></span>
</pre>
  </section>

{% endcapture %}
{% include html_snippet.html html=html %}
