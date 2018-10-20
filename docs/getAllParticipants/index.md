---
api_name: getAllParticipants
api_description: Get list of all connected users
---

{% capture html %}

  <section id="usage">
    <h2><a href="#usage">Usage</a></h2>
    <pre style="background:#fff;color:#000">connection.getAllParticipants().forEach(<span style="color:#ff5600">function</span>(participantId) {
    <span style="color:#ff5600">var</span> user <span style="color:#ff5600">=</span> connection.peers[participantId];
    <span style="color:#ff5600">var</span> hisFullName <span style="color:#ff5600">=</span> user.extra.fullName;
    <span style="color:#ff5600">var</span> hisUID <span style="color:#ff5600">=</span> user.userid;
    <span style="color:#ff5600">var</span> hisNativePeer <span style="color:#ff5600">=</span> user.peer;
    <span style="color:#ff5600">var</span> hisIncomingStreams <span style="color:#ff5600">=</span> user.peer.getRemoteStreams();
    <span style="color:#ff5600">var</span> hisDataChannels <span style="color:#ff5600">=</span> user.channels;
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
        <td>getAllParticipants</td>
        <td>
            this method returns array (list) of user-ids (users that are connected with you)
            <pre style="background:#fff;color:#000"><span style="color:#ff5600">var</span> numberOfUsers <span style="color:#ff5600">=</span> connection.getAllParticipants().<span style="color:#a535ae">length</span>;

<span style="color:#ff5600">var</span> arrayOfUserIds <span style="color:#ff5600">=</span> connection.getAllParticipants();
<span style="color:#919191">// you will get something like this</span>
arrayOfUserIds <span style="color:#ff5600">===</span> [<span style="color:#00a33f">'first'</span>, <span style="color:#00a33f">'second'</span>, <span style="color:#00a33f">'third'</span>, <span style="color:#00a33f">'fourth'</span>, <span style="color:#00a33f">'so-on'</span>];
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

<span style="color:#a535ae">btnGetUserInfo</span>.<span style="color:#21439c">onclick</span> <span style="color:#ff5600">=</span> <span style="color:#ff5600">function</span>() {
    connection.getAllParticipants().forEach(<span style="color:#ff5600">function</span>(participantId) {
        <span style="color:#ff5600">var</span> user <span style="color:#ff5600">=</span> connection.peers[participantId];
        <span style="color:#ff5600">var</span> hisUID <span style="color:#ff5600">=</span> user.userid;
        <span style="color:#a535ae">alert</span>(hisUID <span style="color:#ff5600">+</span> <span style="color:#00a33f">' connected with you.'</span>);
    });

    <span style="color:#ff5600">var</span> numberOfUsers <span style="color:#ff5600">=</span> connection.getAllParticipants().<span style="color:#a535ae">length</span>;
    <span style="color:#a535ae">alert</span>(numberOfUsers <span style="color:#ff5600">+</span> <span style="color:#00a33f">' users connected with you.'</span>);
};

connection.openOrJoin(<span style="color:#00a33f">'your-room-id'</span>);
<span style="color:#ff5600">&lt;</span>/script<span style="color:#ff5600">></span>
</pre>
  </section>

{% endcapture %}
{% include html_snippet.html html=html %}
