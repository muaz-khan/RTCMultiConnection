---
api_name: onstreamended
api_description: Use this event to remove inactive (stopped) videos
---

{% capture html %}

  <section id="usage">
    <h2><a href="#usage">Usage</a></h2>
    <pre style="background:#fff;color:#000"><span style="color:#a535ae">connection</span>.<span style="color:#21439c">onstreamended</span> <span style="color:#ff5600">=</span> <span style="color:#ff5600">function</span>(event) {
    <span style="color:#ff5600">var</span> video <span style="color:#ff5600">=</span> <span style="color:#a535ae">document</span>.<span style="color:#a535ae">getElementById</span>(<span style="color:#a535ae">event</span>.streamid);
    <span style="color:#ff5600">if</span> (video <span style="color:#ff5600">&amp;</span><span style="color:#ff5600">&amp;</span> video.<span style="color:#a535ae">parentNode</span>) {
        video.<span style="color:#a535ae">parentNode</span>.<span style="color:#a535ae">removeChild</span>(video);
    }
};
</pre>

        <p>
            Please check <a href="../onstream/">onstream</a> for event description.
        </p>
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
    <span style="color:#ff5600">var</span> video <span style="color:#ff5600">=</span> <span style="color:#a535ae">event</span>.mediaElement;
    video.<span style="color:#a535ae">id</span> <span style="color:#ff5600">=</span> <span style="color:#a535ae">event</span>.streamid;
    <span style="color:#a535ae">document</span>.<span style="color:#a535ae">body</span>.<span style="color:#a535ae">insertBefore</span>(video, <span style="color:#a535ae">document</span>.<span style="color:#a535ae">body</span>.<span style="color:#a535ae">firstChild</span>);
};

<span style="color:#a535ae">connection</span>.<span style="color:#21439c">onstreamended</span> <span style="color:#ff5600">=</span> <span style="color:#ff5600">function</span>(event) {
    <span style="color:#ff5600">var</span> video <span style="color:#ff5600">=</span> <span style="color:#a535ae">document</span>.<span style="color:#a535ae">getElementById</span>(<span style="color:#a535ae">event</span>.streamid);
    <span style="color:#ff5600">if</span> (video <span style="color:#ff5600">&amp;</span><span style="color:#ff5600">&amp;</span> video.<span style="color:#a535ae">parentNode</span>) {
        video.<span style="color:#a535ae">parentNode</span>.<span style="color:#a535ae">removeChild</span>(video);
    }
};

connection.openOrJoin(<span style="color:#00a33f">'your-room-id'</span>);
<span style="color:#ff5600">&lt;</span>/script<span style="color:#ff5600">></span>
</pre>
  </section>

{% endcapture %}
{% include html_snippet.html html=html %}
