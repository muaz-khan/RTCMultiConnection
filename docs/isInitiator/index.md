---
api_name: isInitiator
api_description: Check if current user is room moderator
---

{% capture html %}

  <section>
    <p>Readonly boolean that can be used to detect the room initiator/owner/moderator.</p>
  </section>

  <section id="usage">
    <h2><a href="#usage">Usage</a></h2>
    <pre style="background:#fff;color:#000"><span style="color:#a535ae">connection</span>.<span style="color:#21439c">onstream</span> <span style="color:#ff5600">=</span> <span style="color:#ff5600">function</span>(event) {
    <span style="color:#ff5600">var</span> isInitiator <span style="color:#ff5600">=</span> connection.isInitiator;

    <span style="color:#ff5600">if</span> (isInitiator <span style="color:#ff5600">===</span> <span style="color:#a535ae">true</span> <span style="color:#ff5600">&amp;</span><span style="color:#ff5600">&amp;</span> <span style="color:#a535ae">event</span>.<span style="color:#a535ae">type</span> <span style="color:#ff5600">===</span> <span style="color:#00a33f">'local'</span>) {
        <span style="color:#919191">// initiator's own stream</span>
    }

    <span style="color:#ff5600">if</span> (isInitiator <span style="color:#ff5600">===</span> <span style="color:#a535ae">true</span> <span style="color:#ff5600">&amp;</span><span style="color:#ff5600">&amp;</span> <span style="color:#a535ae">event</span>.<span style="color:#a535ae">type</span> <span style="color:#ff5600">===</span> <span style="color:#00a33f">'remote'</span>) {
        <span style="color:#919191">// initiator recieved stream from someone else</span>
    }
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
        <td>isInitiator</td>
        <td>
            it is a readonly boolean
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

<span style="color:#a535ae">connection</span>.<span style="color:#21439c">onstream</span> <span style="color:#ff5600">=</span> <span style="color:#ff5600">function</span>(event) {
    <span style="color:#ff5600">var</span> isInitiator <span style="color:#ff5600">=</span> connection.isInitiator;

    <span style="color:#ff5600">if</span> (isInitiator <span style="color:#ff5600">===</span> <span style="color:#a535ae">true</span> <span style="color:#ff5600">&amp;</span><span style="color:#ff5600">&amp;</span> <span style="color:#a535ae">event</span>.<span style="color:#a535ae">type</span> <span style="color:#ff5600">===</span> <span style="color:#00a33f">'local'</span>) {
        <span style="color:#919191">// initiator's own stream</span>
        <span style="color:#a535ae">alert</span>(<span style="color:#00a33f">'you are initiator'</span>);
    }

    <span style="color:#ff5600">if</span> (isInitiator <span style="color:#ff5600">===</span> <span style="color:#a535ae">true</span> <span style="color:#ff5600">&amp;</span><span style="color:#ff5600">&amp;</span> <span style="color:#a535ae">event</span>.<span style="color:#a535ae">type</span> <span style="color:#ff5600">===</span> <span style="color:#00a33f">'remote'</span>) {
        <span style="color:#919191">// initiator recieved stream from someone else</span>
        <span style="color:#a535ae">alert</span>(<span style="color:#00a33f">'dear initiator, you just receive a remote stream'</span>);
    }

    <span style="color:#a535ae">document</span>.<span style="color:#a535ae">body</span>.<span style="color:#a535ae">appendChild</span>(<span style="color:#a535ae">event</span>.mediaElement);
};

connection.openOrJoin(<span style="color:#00a33f">'your-room-id'</span>);
<span style="color:#ff5600">&lt;</span>/script<span style="color:#ff5600">></span>
</pre>
  </section>

{% endcapture %}
{% include html_snippet.html html=html %}
