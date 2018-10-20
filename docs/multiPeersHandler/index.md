---
api_name: multiPeersHandler
api_description: Get access to MultiPeersHandler.js
---

{% capture html %}

<section>
    <p>This object gives you full access to <a href="https://github.com/muaz-khan/RTCMultiConnection/blob/master/dev/MultiPeersHandler.js">dev/MultiPeersHandler.js</a></p>
</section>

<section>
    <h2>How to use</h2>
    <pre>
var internalHandler = connection.multiPeersHandler;
internalHandler.createNewPeer('remote-userid', userPreferences);

// you can find all the APIs in the dev/MultiPeersHandler.js
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
