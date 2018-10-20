---
api_name: onmessage
api_description: Use this event to receive chat messages, or any kind of non-File data
---

{% capture html %}

  <section id="usage">
    <h2><a href="#usage">Usage</a></h2>
    <pre style="background:#fff;color:#000"><span style="color:#a535ae">connection</span>.<span style="color:#21439c">onmessage</span> <span style="color:#ff5600">=</span> <span style="color:#ff5600">function</span>(event) {
    <span style="color:#ff5600">var</span> sender <span style="color:#ff5600">=</span> <span style="color:#a535ae">event</span>.userid;
    <span style="color:#ff5600">var</span> senderFullName <span style="color:#ff5600">=</span> <span style="color:#a535ae">event</span>.extra.fullName;

    <span style="color:#ff5600">var</span> div <span style="color:#ff5600">=</span> <span style="color:#a535ae">document</span>.<span style="color:#a535ae">createElement</span>(<span style="color:#00a33f">'div'</span>);
    div.innerHTML <span style="color:#ff5600">=</span> <span style="color:#a535ae">event</span>.<span style="color:#a535ae">data</span>;
    <span style="color:#a535ae">document</span>.<span style="color:#a535ae">body</span>.<span style="color:#a535ae">insertBefore</span>(div, <span style="color:#a535ae">document</span>.<span style="color:#a535ae">body</span>.<span style="color:#a535ae">firstChild</span>);
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
        <td>data</td>
        <td>
            text chat message or any kind of javascript data except "Blob" and "File"
            <pre style="background:#fff;color:#000"><span style="color:#a535ae">connection</span>.<span style="color:#21439c">onmessage</span> <span style="color:#ff5600">=</span> <span style="color:#ff5600">function</span>(event) {
    <span style="color:#ff5600">var</span> chatMesssge <span style="color:#ff5600">=</span> <span style="color:#a535ae">event</span>.<span style="color:#a535ae">data</span>;
};
</pre>
        </td>
      </tr>

      <tr>
        <td>userid</td>
        <td>
            the person who sent chat message
            <pre style="background:#fff;color:#000"><span style="color:#a535ae">connection</span>.<span style="color:#21439c">onmessage</span> <span style="color:#ff5600">=</span> <span style="color:#ff5600">function</span>(event) {
    <span style="color:#ff5600">var</span> sender <span style="color:#ff5600">=</span> <span style="color:#a535ae">event</span>.userid;
};
</pre>
        </td>
      </tr>

      <tr>
        <td>extra</td>
        <td>
            extra information along with chat message
            <pre style="background:#fff;color:#000"><span style="color:#a535ae">connection</span>.<span style="color:#21439c">onmessage</span> <span style="color:#ff5600">=</span> <span style="color:#ff5600">function</span>(event) {
    <span style="color:#ff5600">var</span> senderFullName <span style="color:#ff5600">=</span> <span style="color:#a535ae">event</span>.extra.fullName;
    <span style="color:#ff5600">var</span> senderEmail <span style="color:#ff5600">=</span> <span style="color:#a535ae">event</span>.extra.email;
    <span style="color:#ff5600">var</span> senderPhoto <span style="color:#ff5600">=</span> <span style="color:#a535ae">event</span>.extra.photo;
    <span style="color:#ff5600">var</span> sentAt <span style="color:#ff5600">=</span> <span style="color:#a535ae">event</span>.extra.sentAt; <span style="color:#919191">// date-time in ISO format</span>
};
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
<span style="color:#ff5600">&lt;</span>/script<span style="color:#ff5600">></span>
</pre>
  </section>

{% endcapture %}
{% include html_snippet.html html=html %}
