---
api_name: socketURL
api_description: This property allows you set socket.io signaling server URL
---

{% capture html %}

  <section id="usage">
    <h2><a href="#usage">Usage</a></h2>
    <pre style="background:#fff;color:#000">connection.socketURL <span style="color:#ff5600">=</span> <span style="color:#00a33f">'https://onlyChangingPort.com:8888/'</span>;
connection.socketURL <span style="color:#ff5600">=</span> <span style="color:#00a33f">'https://separateDomain.com:443/'</span>;
connection.socketURL <span style="color:#ff5600">=</span> <span style="color:#00a33f">'/'</span>; <span style="color:#919191">// same domain</span>

<span style="color:#919191">// or a free signaling server</span>
connection.socketURL <span style="color:#ff5600">=</span> <span style="color:#00a33f">'https://rtcmulticonnection.herokuapp.com:443/'</span>;
</pre>
  </section>

  <section id="description">
    <h2><a href="#description">Description</a></h2>
    <div class="datagrid">
    <table>
    <thead><tr><th>parameter</th><th>description</th></tr></thead>
    <tbody>
      <tr>
        <td>socketURL</td>
        <td>
            it is a string<br>
            it is recommended to set full-URL<br>
            the URL must include port-number as well<br>
            include closing slash "/" as well
            <pre style="background:#fff;color:#000">connection.socketURL <span style="color:#ff5600">=</span> <span style="color:#00a33f">'https://domain.com:port/'</span>;
</pre>
        </td>
      </tr>
    </tbody>
    </table>
    </div>
  </section>

  <section id="remember">
    <h2><a href="#remember">Remember</a></h2>
    <div class="datagrid">
    <table>
    <tbody>
      <tr>
        <td>You can run nodejs on a separate domain or separate port or on a separate server</td>
      </tr>
      <tr>
        <td>You can set socketURL="ip-address" to link nodejs server</td>
      </tr>
      <tr>
        <td>You can run RTCMultiConnection-v3 demos on any webpage; whether it is PHP page, ASP.net page, python or ruby page or whatever framework running top over HTML.</td>
      </tr>
    </tbody>
    </table>
    </div>
  </section>

  <section id="video-presentation">
    <h2><a href="#video-presentation">Video presentation</a></h2>
    <div style="text-align: center;">
      <iframe src="https://www.youtube.com/embed/EtsiYEW_T8Y?autoplay=0&vq=hd720&hd=1" style="width: 1280px;" height="720" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
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

connection.openOrJoin(<span style="color:#00a33f">'your-room-id'</span>);
<span style="color:#ff5600">&lt;</span>/script<span style="color:#ff5600">></span>
</pre>
  </section>

{% endcapture %}
{% include html_snippet.html html=html %}
