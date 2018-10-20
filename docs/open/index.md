---
api_name: open
api_description: Use this methodto create rooms
---

{% capture html %}

  <section id="usage">
    <h2><a href="#usage">Usage</a></h2>
    <pre style="background:#fff;color:#000">connection.open(<span style="color:#00a33f">'room-id'</span>);

// this one is recommended
connection.open(<span style="color:#00a33f">'room-id'</span>, function(isRoomOpened, roomid, error) {
    if(error) {
        alert(error);
    }

    if(isRoomOpened === true) {
        alert('<span style="color:#00a33f">Successfully created the room.</span>');
    }
});
</pre>
  </section>

  <section id="best-practice">
    <h2><a href="#best-practice">Best practice</a></h2>
    <pre style="background:#fff;color:#000">connection.checkPresence(<span style="color:#00a33f">'room-id'</span>, <span style="color:#ff5600">function</span>(isRoomExist, roomid) {
    <span style="color:#ff5600">if</span> (isRoomExist <span style="color:#ff5600">===</span> <span style="color:#a535ae">true</span>) {
        connection.<span style="color:#a535ae">join</span>(roomid);
    } <span style="color:#ff5600">else</span> {
        connection.<span style="color:#a535ae">open</span>(roomid);
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
        <td>roomid</td>
        <td>it is a string</td>
      </tr>
      <tr>
        <td>callback</td>
        <td>
            it is an optional function callback
            <pre style="background:#fff;color:#000">connection.<span style="color:#a535ae">open</span>(<span style="color:#00a33f">'room-id'</span>, <span style="color:#ff5600">function</span>() {
    <span style="color:#919191">// open callback</span>
});
</pre>
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

<span style="color:#a535ae">btnJoinRoom</span>.<span style="color:#21439c">onclick</span> <span style="color:#ff5600">=</span> <span style="color:#ff5600">function</span>() {
    connection.<span style="color:#a535ae">join</span>(<span style="color:#00a33f">'room-id'</span>, function(isRoomJoined, roomid, error) {
        if(error) {
            alert(error);
        }

        if(isRoomJoined === true) {
            alert(<span style="color:#00a33f">'Successfully joined the room.'</span>);
        }
    });
};

<span style="color:#a535ae">btnOpenRoom</span>.<span style="color:#21439c">onclick</span> <span style="color:#ff5600">=</span> <span style="color:#ff5600">function</span>() {
    connection.<span style="color:#a535ae">open</span>(<span style="color:#00a33f">'room-id'</span>, function(isRoomOpened, roomid, error) {
        if(error) {
            alert(error);
        }

        if(isRoomOpened === true) {
            alert('<span style="color:#00a33f">Successfully created the room.</span>');
        }
    });
};
<span style="color:#ff5600">&lt;</span>/script<span style="color:#ff5600">></span>
</pre>
  </section>

{% endcapture %}
{% include html_snippet.html html=html %}
