---
api_name: setCustomSocketHandler
api_description: Set and create your own signaling implementation
---

{% capture html %}

<section>
    <p>This method allows you bypass/skip socket.io and use your own signaling gateway/implementation.</p>
    <p><b>Non socket.io?</b> Please use this build: 
        <a href="https://github.com/muaz-khan/RTCMultiConnection/tree/724ead7cbb589a772b8bb41abd22acff3f700a5d/dist">v3.4.6</a>
    </p>
</section>
<section class="experiment" id="firebase">
    <h2>
        <a href="#firebase">Firebase signaling</a>
    </h2>
    <pre>
// link => /dev/globals.js
// link => /dev/FirebaseConnection.js

var connection = new RTCMultiConnection();

connection.firebase = 'your-firebase-account';

// below line replaces FirebaseConnection
connection.setCustomSocketHandler(FirebaseConnection);
</pre>
</section>
<section class="experiment" id="pubnub">
    <h2>
        <a href="#pubnub">PubNub signaling</a>
    </h2>
    <pre>
// link => /dev/globals.js
// link => /dev/PubNubConnection.js

var connection = new RTCMultiConnection();

// below line replaces PubNubConnection
connection.setCustomSocketHandler(PubNubConnection);
</pre>
</section>
<section class="experiment" id="others">
    <h2>
        <a href="#others">SIP/SignalR/WebSync/XHR signaling</a>
    </h2>
    <pre>
// link => /dev/globals.js
// link => /dev/[Relevant]Connection.js

var connection = new RTCMultiConnection();

// SignalR (requires /dev/SignalRConnection.js)
connection.setCustomSocketHandler(SignalRConnection);

// WebSync (requires /dev/WebSyncConnection.js)
connection.setCustomSocketHandler(WebSyncConnection);

// XHR (requires /dev/XHRConnection.js)
connection.setCustomSocketHandler(XHRConnection);

// Sip (requires /dev/SipConnection.js)
connection.setCustomSocketHandler(SipConnection);
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
