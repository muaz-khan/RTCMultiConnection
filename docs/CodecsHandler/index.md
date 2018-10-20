---
api_name: CodecsHandler
api_description: Allows you manage audio/video codecs e.g. vp8, vp9, h264, opus, isac, G722 etc
---

{% capture html %}

  <section id="disable-video-nack">
    <h2><a href="#disable-video-nack">Disable Video NACK</a></h2>
    <pre style="background:#fff;color:#000"><span style="color:#ff5600">&lt;</span>script src<span style="color:#ff5600">=</span><span style="color:#00a33f">"/dev/CodecsHandler.js"</span><span style="color:#ff5600">></span><span style="color:#ff5600">&lt;</span>/script<span style="color:#ff5600">></span>
<span style="color:#ff5600">&lt;</span>script<span style="color:#ff5600">></span>
<span style="color:#919191">// in your HTML file</span>
<span style="color:#a535ae">connection</span>.<span style="color:#21439c">processSdp</span> <span style="color:#ff5600">=</span> <span style="color:#ff5600">function</span>(sdp) {
    <span style="color:#919191">// Disable NACK to test IDR recovery</span>
    sdp <span style="color:#ff5600">=</span> CodecsHandler.disableNACK(sdp);
    <span style="color:#ff5600">return</span> sdp;
};
<span style="color:#ff5600">&lt;</span>/script<span style="color:#ff5600">></span>
</pre>
  </section>

  <section id="description">
    <h2><a href="#description">Description</a></h2>
    <div class="datagrid">
    <table>
    <thead><tr><th>parameter</th><th>description</th></tr></thead>
    <tbody>
      <tr>
        <td>CodecsHandler.disableNACK</td>
        <td>Disable video NACK</td>
      </tr>
      <tr>
        <td>CodecsHandler.removeVPX</td>
        <td>Remove both vp8 and vp9 codecs</td>
      </tr>
      <tr>
        <td>CodecsHandler.prioritize</td>
        <td>Prioritize any "existing" codec e.g. ask Chrome to use vp8 instead of vp9 etc.</td>
      </tr>
      <tr>
        <td>CodecsHandler.removeNonG722</td>
        <td>Remove all audio codecs except G722</td>
      </tr>
      <tr>
        <td>CodecsHandler.preferVP9</td>
        <td>Ask Chrome to use vp9 all the time</td>
      </tr>
      <tr>
        <td>CodecsHandler.setApplicationSpecificBandwidth</td>
        <td>
            Set "AS=kbps"<br>
            1) first parameter is "sdp" string<br>
            2) second parameter is "bandwidth" object {audio: 50, video: 100}<br>
            3) last parameter is "isScreen" boolean; which forces 300kbps minimum video bitrates
        </td>
      </tr>
      <tr>
        <td>CodecsHandler.setVideoBitrates</td>
        <td>
          1) first parameter is "sdp" string<br>
          2) last parameter is {min: bitrates, max: bitrates}
        </td>
      </tr>
      <tr>
        <td>CodecsHandler.setOpusAttributes</td>
        <td>
          1) first parameter is "sdp" string<br>
          2) last parameter accepts all following:<br><pre style="background:#fff;color:#000">{
    <span style="color:#00a33f">'stereo'</span>: 1,
    <span style="color:#00a33f">'sprop-stereo'</span>: 1,
    <span style="color:#00a33f">'maxaveragebitrate'</span>: connection.bandwidth.audio <span style="color:#ff5600">*</span> 1000 <span style="color:#ff5600">*</span> 8,
    <span style="color:#00a33f">'maxplaybackrate'</span>: connection.bandwidth.audio <span style="color:#ff5600">*</span> 1000 <span style="color:#ff5600">*</span> 8,
    <span style="color:#00a33f">'cbr'</span>: 1,
    <span style="color:#00a33f">'useinbandfec'</span>: 1,
    <span style="color:#00a33f">'usedtx'</span>: 1,
    <span style="color:#00a33f">'maxptime'</span>: 3
}
</pre>
        </td>
      </tr>
    </tbody>
    </table>
    </div>
  </section>

  <section id="prioritize-codecs">
    <h2><a href="#prioritize-codecs">Prioritize Codecs</a></h2>
    <pre style="background:#fff;color:#000"><span style="color:#ff5600">&lt;</span>script src<span style="color:#ff5600">=</span><span style="color:#00a33f">"/dev/CodecsHandler.js"</span><span style="color:#ff5600">></span><span style="color:#ff5600">&lt;</span>/script<span style="color:#ff5600">></span>
<span style="color:#ff5600">&lt;</span>script<span style="color:#ff5600">></span>
<span style="color:#919191">// in your HTML file</span>
<span style="color:#ff5600">if</span>(connection.DetectRTC.browser.<span style="color:#a535ae">name</span> <span style="color:#ff5600">===</span> <span style="color:#00a33f">'Firefox'</span>) {
    connection.getAllParticipants().forEach(<span style="color:#ff5600">function</span>(p) {
        <span style="color:#ff5600">var</span> peer <span style="color:#ff5600">=</span> connection.peers[p].peer;

        CodecsHandler.prioritize(<span style="color:#00a33f">'audio/opus'</span>, peer);
    });
}
<span style="color:#ff5600">&lt;</span>/script<span style="color:#ff5600">></span>
</pre>
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

connection.openOrJoin(<span style="color:#00a33f">'your-room-id'</span>);
<span style="color:#ff5600">&lt;</span>/script<span style="color:#ff5600">></span>

<span style="color:#ff5600">&lt;</span>script src<span style="color:#ff5600">=</span><span style="color:#00a33f">"/dev/CodecsHandler.js"</span><span style="color:#ff5600">></span><span style="color:#ff5600">&lt;</span>/script<span style="color:#ff5600">></span>
<span style="color:#ff5600">&lt;</span>script<span style="color:#ff5600">></span>
<span style="color:#919191">// in your HTML file</span>
<span style="color:#a535ae">connection</span>.<span style="color:#21439c">processSdp</span> <span style="color:#ff5600">=</span> <span style="color:#ff5600">function</span>(sdp) {
    <span style="color:#919191">// Disable NACK to test IDR recovery</span>
    sdp <span style="color:#ff5600">=</span> CodecsHandler.disableNACK(sdp);
    <span style="color:#ff5600">return</span> sdp;
};
<span style="color:#ff5600">&lt;</span>/script<span style="color:#ff5600">></span>
</pre>
  </section>

{% endcapture %}
{% include html_snippet.html html=html %}
