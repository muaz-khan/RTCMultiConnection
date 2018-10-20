---
api_name: optionalArgument
api_description: Set RTCPeerConnection optional argument
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
connection.optionalArgument = {
    optional: [{
        DtlsSrtpKeyAgreement: true
    }, {
        googImprovedWifiBwe: true
    }, {
        googScreencastMinBitrate: 300
    }, {
        googIPv6: true
    }, {
        googDscp: true
    }, {
        googCpuUnderuseThreshold: 55
    }, {
        googCpuOveruseThreshold: 85
    }, {
        googSuspendBelowMinBitrate: true
    }, {
        googCpuOveruseDetection: true
    }],
    mandatory: {}
};
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
