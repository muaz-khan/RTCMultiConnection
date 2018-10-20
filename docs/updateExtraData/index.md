---
api_name: updateExtraData
api_description: This method allows you send your extra-data to nodejs so that it can be shared with all connected users
---

{% capture html %}

  <section>
    <p>Share extra information among all participants using <a href="../extra/">connection.extra</a> object.</p>
    <p>"updateExtraData" allows you update extra information any time, during live session.</p>
    <p><a href="../onExtraDataUpdated/">onExtraDataUpdated</a> is fired for all participants as soon as someone updates extra information.</p>
  </section>

  <section id="usage">
    <h2><a href="#usage">Usage</a></h2>
    <pre style="background:#fff;color:#000">connection.extra.modifiedValue <span style="color:#ff5600">=</span> <span style="color:#00a33f">'new value'</span>;
connection.updateExtraData();

<span style="color:#a535ae">connection</span>.<span style="color:#21439c">onExtraDataUpdated</span> <span style="color:#ff5600">=</span> <span style="color:#ff5600">function</span>(event) {
    <span style="color:#ff5600">var</span> modifiedValue <span style="color:#ff5600">=</span> <span style="color:#a535ae">event</span>.extra.modifiedValue;
    <span style="color:#ff5600">var</span> whoModified <span style="color:#ff5600">=</span> <span style="color:#a535ae">event</span>.userid; <span style="color:#919191">// or event.extra.fullName</span>
};
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

connection.extra <span style="color:#ff5600">=</span> {
    joinedAt: (<span style="color:#ff5600">new</span> <span style="color:#21439c">Date</span>).toISOString()
};

<span style="color:#a535ae">connection</span>.<span style="color:#21439c">onstream</span> <span style="color:#ff5600">=</span> <span style="color:#ff5600">function</span>(event) {
    <span style="color:#a535ae">document</span>.<span style="color:#a535ae">body</span>.<span style="color:#a535ae">appendChild</span>(<span style="color:#a535ae">event</span>.mediaElement);
    <span style="color:#ff5600">if</span> (<span style="color:#a535ae">event</span>.<span style="color:#a535ae">type</span> <span style="color:#ff5600">===</span> <span style="color:#00a33f">'remote'</span>) {
        <span style="color:#ff5600">var</span> heJoinedAt <span style="color:#ff5600">=</span> <span style="color:#ff5600">new</span> <span style="color:#21439c">Date</span>(<span style="color:#a535ae">event</span>.extra.joinedAt).<span style="color:#a535ae">getTime</span>();
        <span style="color:#ff5600">var</span> currentDate <span style="color:#ff5600">=</span> <span style="color:#ff5600">new</span> <span style="color:#21439c">Date</span>().<span style="color:#a535ae">getTime</span>();
        <span style="color:#ff5600">var</span> latency <span style="color:#ff5600">=</span> currentDate <span style="color:#ff5600">-</span> heJoinedAt;
    }
};

<span style="color:#a535ae">btnUpdateExtra</span>.<span style="color:#21439c">onclick</span> <span style="color:#ff5600">=</span> <span style="color:#ff5600">function</span>() {
    connection.extra.modifiedValue <span style="color:#ff5600">=</span> <span style="color:#ff5600">new</span> <span style="color:#21439c">Date</span>(); <span style="color:#919191">// new value</span>
    connection.updateExtraData();
};

<span style="color:#a535ae">connection</span>.<span style="color:#21439c">onExtraDataUpdated</span> <span style="color:#ff5600">=</span> <span style="color:#ff5600">function</span>(event) {
    <span style="color:#ff5600">var</span> modifiedValue <span style="color:#ff5600">=</span> <span style="color:#a535ae">event</span>.extra.modifiedValue;
    <span style="color:#ff5600">var</span> whoModified <span style="color:#ff5600">=</span> <span style="color:#a535ae">event</span>.userid; <span style="color:#919191">// or event.extra.fullName</span>
    <span style="color:#a535ae">alert</span>(whoModified <span style="color:#ff5600">+</span> <span style="color:#00a33f">' modified '</span> <span style="color:#ff5600">+</span> modifiedValue);
};

connection.openOrJoin(<span style="color:#00a33f">'your-room-id'</span>);
<span style="color:#ff5600">&lt;</span>/script<span style="color:#ff5600">></span>
</pre>
  </section>

{% endcapture %}
{% include html_snippet.html html=html %}
