---
api_name: checkPresence
api_description: Use this method to check if a room is active and has participants
---

{% capture html %}

  <section id="usage">
    <h2><a href="#usage">Usage</a></h2>
    <pre style="background:#fff;color:#000">connection.checkPresence(<span style="color:#00a33f">'room-id'</span>, <span style="color:#ff5600">function</span>(isRoomExist, roomid, error) {
    <span style="color:#ff5600">if</span> (isRoomExist <span style="color:#ff5600">===</span> <span style="color:#a535ae">true</span>) {
        connection.<span style="color:#a535ae">join</span>(roomid);
    } <span style="color:#ff5600">else</span> {
        connection.<span style="color:#a535ae">open</span>(roomid);
    }
});
</pre>
  </section>

  <section id="looper">
    <h2><a href="#looper">Keep checking for room</a></h2>
    <pre style="background:#fff;color:#000"><span style="color:#919191">// below method "checkRoom" keeps checking for room until joins it</span>
(<span style="color:#ff5600">function</span> <span style="color:#21439c">checkRoom</span>() {
    connection.checkPresence(<span style="color:#00a33f">'your-room-id'</span>, <span style="color:#ff5600">function</span>(isRoomExist, roomid, error) {
        <span style="color:#ff5600">if</span> (isRoomExist <span style="color:#ff5600">===</span> <span style="color:#a535ae">true</span>) {
            connection.<span style="color:#a535ae">join</span>(roomid);
            <span style="color:#ff5600">return</span>;
        }

        <span style="color:#a535ae">setTimeout</span>(checkRoom, 3000); <span style="color:#919191">// recheck after every 3 seconds</span>
    });
})();
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
        <td>API will match this string on socket.io server</td>
      </tr>
      <tr>
        <td>callback</td>
        <td>
            A function gets two parameters:<br>
            1) "isRoomExist" which is a boolean<br>
            2) "roomid" which is a room-id string
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

connection.checkPresence(<span style="color:#00a33f">'room-id'</span>, <span style="color:#ff5600">function</span>(isRoomExist, roomid) {
    <span style="color:#ff5600">if</span> (isRoomExist <span style="color:#ff5600">===</span> <span style="color:#a535ae">true</span>) {
        connection.<span style="color:#a535ae">join</span>(roomid);
    } <span style="color:#ff5600">else</span> {
        connection.<span style="color:#a535ae">open</span>(roomid);
    }
});
<span style="color:#ff5600">&lt;</span>/script<span style="color:#ff5600">></span>
</pre>
  </section>

{% endcapture %}
{% include html_snippet.html html=html %}
