---
api_name: chunkInterval
api_description: This property is used only for TextSender.js
---

{% capture html %}

<section>
    <p>This property allows you set time/interval in milliseconds after which each chunk will be transmitted.</p>
    <pre class="sh_javascript">
// for RTP-data channels; chunk-interval is 500
connection.<a href="http://www.RTCMultiConnection.org/docs/chunkInterval/">chunkInterval</a> = 500;

// for SCTP-data channels; chunk-interval is 100
connection.<a href="http://www.RTCMultiConnection.org/docs/chunkSize/">chunkInterval</a> = 100;
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
