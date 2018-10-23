---
title: Getting Started guide for RTCMultiConnection
description: Learn how to use RTCMultiConnection
---

{% capture html %}

  <section>
    <p>It is recommended to <a href="https://www.youtube.com/watch?v=jqtC7mSTCgk" class="highlighted">watch this YouTube video</a> that explains how to test and use <a href="https://rtcmulticonnection.herokuapp.com/demos/">built-in demos</a>.</p>
    <p>Remember: Use <a href="https://github.com/muaz-khan/Chrome-Extensions/tree/master/getUserMedia-on-http">this chrome extension</a> for HTTP-websites. LocalHost is excluded, though.</p>
  </section>

  <section id="simple-video-demo">
    <h2><a href="#simple-video-demo">Simple Video Chat Demo</a></h2>
    <pre style="background:#fff;color:#000">&lt;script src=<span style="color:#00a33f">"https://rtcmulticonnection.herokuapp.com/dist/RTCMultiConnection.min.js"</span>>&lt;/script>
&lt;script src=<span style="color:#00a33f">"https://rtcmulticonnection.herokuapp.com/socket.io/socket.io.js"</span>>&lt;/script>

&lt;script>
<span style="color:#ff5600">var</span> connection <span style="color:#ff5600">=</span> <span style="color:#ff5600">new</span> <span style="color:#21439c">RTCMultiConnection</span>();

<span style="color:#919191">// this line is VERY_important</span>
connection.socketURL <span style="color:#ff5600">=</span> <span style="color:#00a33f">'https://rtcmulticonnection.herokuapp.com:443/'</span>;

<span style="color:#919191">// if you want audio+video conferencing</span>
connection.session <span style="color:#ff5600">=</span> {
    audio: <span style="color:#a535ae">true</span>,
    video: <span style="color:#a535ae">true</span>
};

connection.openOrJoin(<span style="color:#00a33f">'your-room-id'</span>);
&lt;/script>
</pre>
  </section>

  <section id="simple-text-demo">
    <h2><a href="#simple-text-demo">Simple Text Chat Demo</a></h2>
    <pre style="background:#fff;color:#000">&lt;script src=<span style="color:#00a33f">"https://rtcmulticonnection.herokuapp.com/dist/RTCMultiConnection.min.js"</span>>&lt;/script>
&lt;script src=<span style="color:#00a33f">"https://rtcmulticonnection.herokuapp.com/socket.io/socket.io.js"</span>>&lt;/script>

&lt;script>
<span style="color:#ff5600">var</span> connection <span style="color:#ff5600">=</span> <span style="color:#ff5600">new</span> <span style="color:#21439c">RTCMultiConnection</span>();

<span style="color:#919191">// this line is VERY_important</span>
connection.socketURL <span style="color:#ff5600">=</span> <span style="color:#00a33f">'https://rtcmulticonnection.herokuapp.com:443/'</span>;

<span style="color:#919191">// if you want text chat</span>
connection.session <span style="color:#ff5600">=</span> {
    data: <span style="color:#a535ae">true</span>
};

<span style="color:#a535ae">connection</span>.<span style="color:#21439c">onopen</span> <span style="color:#ff5600">=</span> <span style="color:#ff5600">function</span>(event) {
    connection.<span style="color:#a535ae">send</span>(<span style="color:#00a33f">'hello everyone'</span>);
};

<span style="color:#a535ae">connection</span>.<span style="color:#21439c">onmessage</span> <span style="color:#ff5600">=</span> <span style="color:#ff5600">function</span>(event) {
    <span style="color:#a535ae">alert</span>(<span style="color:#a535ae">event</span>.userid <span style="color:#ff5600">+</span> <span style="color:#00a33f">' said: '</span> <span style="color:#ff5600">+</span> <span style="color:#a535ae">event</span>.<span style="color:#a535ae">data</span>);
};

connection.openOrJoin(<span style="color:#00a33f">'your-room-id'</span>);
&lt;/script>
</pre>
  </section>

  <section>For more information: <a href="https://github.com/muaz-khan/RTCMultiConnection/blob/master/docs/getting-started.md">docs/getting-started.md</a></section>

  <section id="video-presentation">
    <h2><a href="#video-presentation">Video presentation</a></h2>
    <div style="text-align: center;">
      <iframe src="https://www.youtube.com/embed/jqtC7mSTCgk?autoplay=0&vq=hd720&hd=1" style="width: 1280px;" height="720" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
    </div>
  </section>

{% endcapture %}
{% include html_snippet.html html=html %}
