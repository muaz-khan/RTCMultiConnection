---
api_name: sdpConstraints
api_description: You can force constraints that should be used each time when createOffer/createAnswer API are invoked
---

{% capture html %}

  <section id="usage">
    <h2><a href="#usage">Usage</a></h2>
    <pre style="background:#fff;color:#000">connection.sdpConstraints <span style="color:#ff5600">=</span> {
    mandatory: {
        OfferToReceiveAudio: <span style="color:#a535ae">true</span>,
        OfferToReceiveVideo: <span style="color:#a535ae">true</span>,
        VoiceActivityDetection: <span style="color:#a535ae">false</span>,
        IceRestart: <span style="color:#a535ae">false</span>
    },
    optional: []
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
        <td>mandatory</td>
        <td>
            ask browser to apply these conditions; otherwise fail<br>
            "OfferToReceiveAudio" ask browser to receive audio from remote peers<br>
            "OfferToReceiveVideo" ask browser to receive video from remote peers
        </td>
      </tr>
      <tr>
        <td>optional</td>
        <td>
            optional conditions; ask browser to choose this option if available, otherwise fallback<br>
            browser will not fail if condition doesn't applies
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

connection.sdpConstraints <span style="color:#ff5600">=</span> {
    mandatory: {
        OfferToReceiveAudio: <span style="color:#a535ae">true</span>,
        OfferToReceiveVideo: <span style="color:#a535ae">true</span>
    },
    optional: []
};

connection.openOrJoin(<span style="color:#00a33f">'your-room-id'</span>);
<span style="color:#ff5600">&lt;</span>/script<span style="color:#ff5600">></span>
</pre>
  </section>

{% endcapture %}
{% include html_snippet.html html=html %}
