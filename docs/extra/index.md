---
api_name: extra
api_description: Share extra information with all connected users
---

{% capture html %}

  <section>
    <p>
      "event.extra" is accessible from all events e.g. 
      <a href="/docs/onopen/">onopen</a>
      <a href="/docs/onmessage/">onmessage</a>
      <a href="/docs/onstream/">onstream</a>
      <a href="/docs/onExtraDataUpdated/">onExtraDataUpdated</a>
      etc.
    </p>
  </section>

  <section id="usage">
    <h2><a href="#usage">Usage</a></h2>
    <pre style="background:#fff;color:#000">connection.extra <span style="color:#ff5600">=</span> {
    fullName: <span style="color:#00a33f">'Your full name'</span>,
    email: <span style="color:#00a33f">'Your email'</span>,
    photo: <span style="color:#00a33f">'http://site.com/profile.png'</span>
};

connection.openOrJoin(<span style="color:#00a33f">'the-room-id'</span>);
</pre>
  </section>

  <section id="description">
    <h2><a href="#description">Description</a></h2>
    <div class="datagrid">
    <table>
    <thead><tr><th>parameter</th><th>description</th></tr></thead>
    <tbody>
      <tr>
        <td>extra</td>
        <td>
            it is a javascript object which accepts any kind of value<br>
            it can be a string<br>
            it can be a number<br>
            it can be a boolean<br>
            it can be a javascript object<br>
            etc.
            <pre style="background:#fff;color:#000">connection.extra <span style="color:#ff5600">=</span> {
    username: <span style="color:#00a33f">'muazkh'</span>,
    fullname: <span style="color:#00a33f">'Muaz Khan'</span>,
    email: <span style="color:#00a33f">'muazkh@gmail.com'</span>,
    <span style="color:#ff5600">boolean</span>: <span style="color:#a535ae">true</span>,
    integer: 123,
    objects: {},
    whatever: <span style="color:#00a33f">'whatever'</span>
};
</pre>
        </td>
      </tr>
    </tbody>
    </table>
    </div>
  </section>

  <section id="video-presentation">
    <h2><a href="#video-presentation">Video presentation</a></h2>
    <div style="text-align: center;">
      <iframe src="https://www.youtube.com/embed/r4eA7TX4ZEk?autoplay=0&vq=hd720&hd=1" style="width: 1280px;" height="720" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
    </div>
  </section>

  <section id="updateExtraData">
    <h2><a href="#updateExtraData">Update extra data</a></h2>
    <pre style="background:#fff;color:#000">connection.extra.modifiedValue <span style="color:#ff5600">=</span> <span style="color:#00a33f">'new value'</span>;
connection.updateExtraData();

<span style="color:#a535ae">connection</span>.<span style="color:#21439c">onExtraDataUpdated</span> <span style="color:#ff5600">=</span> <span style="color:#ff5600">function</span>(event) {
    <span style="color:#ff5600">var</span> modifiedValue <span style="color:#ff5600">=</span> <span style="color:#a535ae">event</span>.extra.modifiedValue;
    <span style="color:#ff5600">var</span> whoModified <span style="color:#ff5600">=</span> <span style="color:#a535ae">event</span>.userid; <span style="color:#919191">// or event.extra.fullName</span>
};
</pre>
      <p>Please check this for more information: <a href="/docs/updateExtraData/">updateExtraData</a></p>
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

connection.openOrJoin(<span style="color:#00a33f">'your-room-id'</span>);
<span style="color:#ff5600">&lt;</span>/script<span style="color:#ff5600">></span>
</pre>
  </section>

{% endcapture %}
{% include html_snippet.html html=html %}
