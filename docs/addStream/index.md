---
api_name: addStream
api_description: Use this method to add additional streams in a LIVE session
css: 
---

{% capture html %}

  <section id="add-camera-microphone">
    <h2><a href="#add-camera-microphone">Add camera and microphone</a></h2>
    <pre style="background:#fff;color:#000">connection.addStream({
    audio: <span style="color:#a535ae">true</span>,
    video: <span style="color:#a535ae">true</span>,
    oneway: <span style="color:#a535ae">true</span>
});
</pre>
  </section>

  <section id="add-screen">
    <h2><a href="#add-screen">Add screen</a></h2>
    <pre style="background:#fff;color:#000">connection.addStream({
    screen: <span style="color:#a535ae">true</span>,
    oneway: <span style="color:#a535ae">true</span>,
    streamCallback: function(<span style="color:#a535ae">stream</span>) {
      console.log('Screen is successfully captured: ' + <span style="color:#a535ae">stream</span>.getVideoTracks().length);
    }
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
        <td>share microphone</td>
      </tr>
      <tr>
        <td>video</td>
        <td>share camera</td>
      </tr>
      <tr>
        <td>screen</td>
        <td>select and share a screen</td>
      </tr>
      <tr>
        <td>oneway</td>
        <td>only you will share; all others will merely receive it</td>
      </tr>
      <tr>
        <td>streamCallback</td>
        <td>
          this callback is fired if stream is successfully captured.<br>
          use this callback to set <a href="https://www.webrtc-experiment.com/webrtcpedia/#stream-ended-listener">stream-stop-listeners</a> so that you can check if screen sharing is stopped etc.
        </td>
      </tr>
    </tbody>
    </table>
    </div>
  </section>

  <section id="best-practice">
    <h2><a href="#best-practice">Best practice</a></h2>
    <p>Always try to set <a href="../sdpConstraints/">sdpConstraints</a> and <a href="../mediaConstraints/">mediaConstraints</a> before calling "addStream" method:</p>
    <pre style="background:#fff;color:#000">connection.sdpConstraints.mandatory <span style="color:#ff5600">=</span> {
    OfferToReceiveAudio: <span style="color:#a535ae">true</span>,
    OfferToReceiveVideo: <span style="color:#a535ae">true</span>
};

connection.mediaConstraints <span style="color:#ff5600">=</span> {
    video: <span style="color:#a535ae">true</span>,
    audio: <span style="color:#a535ae">true</span>
};

connection.addStream({
    <span style="color:#a535ae">screen</span>: <span style="color:#a535ae">true</span>,
    oneway: <span style="color:#a535ae">true</span>
});
</pre>
  </section>

  <section id="open-datachannel">
    <h2><a href="#open-datachannel">Open data channels</a></h2>
    <p>You can enable text-chat or file-sharing in a LIVE video session:</p>
    <pre style="background:#fff;color:#000">connection.addStream({
    <span style="color:#a535ae">data</span>: <span style="color:#a535ae">true</span>
});
</pre>
  </section>

  <section id="share-with-single-user">
    <h2><a href="#share-with-single-user">Share with single (unique) user</a></h2>
    <p>You can share with only one user rather than sharing with all connected users:</p>
    <pre style="background:#fff;color:#000"><span style="color:#919191">// runtime sharing of screen among two unique users</span>
<span style="color:#919191">// one is you; and other is person whose id is given below</span>
connection.peers[<span style="color:#00a33f">'user-id'</span>].addStream({
    <span style="color:#a535ae">screen</span>: <span style="color:#a535ae">true</span>,
    oneway: <span style="color:#a535ae">true</span>
});
</pre>
  </section>

  <section id="external-stream">
    <h2><a href="#external-stream">Add external stream</a></h2>
    <p>You can capture a stream yourself and share it using "addStream" method:</p>
    <pre style="background:#fff;color:#3b3b3b">navigator.getDisplayMedia({
    video: <span style="color:#a535ae">true</span>
}).<span style="color:#069;font-weight:700">then</span>(externalStream <span style="color:#069;font-weight:700">=</span><span style="color:#069;font-weight:700">></span> {
    connection.addStream(externalStream);
}, <span style="color:#069;font-weight:700">error</span> <span style="color:#069;font-weight:700">=</span><span style="color:#069;font-weight:700">></span> {
    alert(<span style="color:#069;font-weight:700">error</span>);
});
</pre>
  </section>

  <section id="demo">
    <h2><a href="#demo">Demo</a></h2>
    <pre style="background:#fff;color:#000">&lt;script src=<span style="color:#00a33f">"https://rtcmulticonnection.herokuapp.com/dist/RTCMultiConnection.min.js"</span>>&lt;/script>
&lt;script src=<span style="color:#00a33f">"https://rtcmulticonnection.herokuapp.com/socket.io/socket.io.js"</span>>&lt;/script>

&lt;hr>&lt;button id=<span style="color:#00a33f">"share-video"</span>>Share Video&lt;/button>&lt;hr>

&lt;script>
<span style="color:#ff5600">var</span> connection <span style="color:#ff5600">=</span> <span style="color:#ff5600">new</span> <span style="color:#21439c">RTCMultiConnection</span>();

<span style="color:#919191">// this line is VERY_important</span>
connection.socketURL <span style="color:#ff5600">=</span> <span style="color:#00a33f">'https://rtcmulticonnection.herokuapp.com:443/'</span>;

<span style="color:#919191">// if you want audio-only session</span>
connection.session <span style="color:#ff5600">=</span> {
    audio: <span style="color:#a535ae">true</span>
};

connection.mediaConstraints <span style="color:#ff5600">=</span> {
    video: <span style="color:#a535ae">false</span>,
    audio: <span style="color:#a535ae">true</span>
};

connection.sdpConstraints.mandatory <span style="color:#ff5600">=</span> {
    OfferToReceiveAudio: <span style="color:#a535ae">true</span>,
    OfferToReceiveVideo: <span style="color:#a535ae">true</span>
};

connection.openOrJoin(<span style="color:#00a33f">'your-room-id'</span>);

<span style="color:#a535ae">document</span>.<span style="color:#a535ae">getElementById</span>(<span style="color:#00a33f">'share-video'</span>).<span style="color:#21439c">onclick</span> <span style="color:#ff5600">=</span> <span style="color:#ff5600">function</span>() {
    this.<span style="color:#a535ae">disabled</span> <span style="color:#ff5600">=</span> <span style="color:#a535ae">true</span>;
    connection.mediaConstraints.video <span style="color:#ff5600">=</span> <span style="color:#a535ae">true</span>;
    connection.addStream({
        video: <span style="color:#a535ae">true</span>,
        oneway: <span style="color:#a535ae">true</span>
    });
};
&lt;/script>
</pre>
  </section>

{% endcapture %}
{% include html_snippet.html html=html %}
