---
api_name: setUserPreferences
api_description: Set userPreferences for RTCPeerConnection.js
---

{% capture html %}

<section>
    <p>This code is used internally. However it can help advance users to manage RTCPeerConnection execution.</p>
</section>

<section>
    <h2>How to use</h2>
    <pre>
connection.setUserPreferences({
    extra: connection.extra,
    localPeerSdpConstraints: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
    },
    remotePeerSdpConstraints: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
    },
    isOneWay: false,
    isDataOnly: false,
    dontGetRemoteStream: false,
    dontAttachLocalStream: false,
    connectionDescription: {
        remoteUserId: connection.userid,
        message: {
            newParticipationRequest: true,
            isOneWay: false,
            isDataOnly: false,
            localPeerSdpConstraints: {
                OfferToReceiveAudio: true,
                OfferToReceiveVideo: true
            },
            remotePeerSdpConstraints: {
                OfferToReceiveAudio: true,
                OfferToReceiveVideo: true
            }
        },
        sender: connection.userid
    },
    successCallback: function() {
        //
    }
});
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}

