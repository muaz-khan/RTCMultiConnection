---
api_name: send
api_description: Send text messages using WebRTC data channels
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
connection.send('text-message');

// objects
connection.send({
    a: true,
    b: 1,
    c: 'string',
    e: {
        hello: 'hmm'
    }
});

// file
connection.send(file || blob);
</pre>
    <p>You can receive messages using <a href="/docs/onmessage/">onmessage</a> event.</p>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
