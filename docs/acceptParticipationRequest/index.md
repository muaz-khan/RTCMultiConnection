---
api_name: acceptParticipationRequest
api_description: Validate person who is joining your room
css: 
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
connection.onNewParticipant = function(participantId, userPreferences) {
    // if OfferToReceiveAudio/OfferToReceiveVideo should be enabled for specific users
    userPreferences.localPeerSdpConstraints.OfferToReceiveAudio = true;
    userPreferences.localPeerSdpConstraints.OfferToReceiveVideo = true;

    userPreferences.dontAttachStream = false; // according to situation
    userPreferences.dontGetRemoteStream = false;  // according to situation

    // below line must be included. Above all lines are optional.
    // if below line is NOT included; "join-request" will be considered rejected.
    connection.acceptParticipationRequest(participantId, userPreferences);
};
</pre>
    <p>Please check this API as well: <a href="/docs/onNewParticipant/">onNewParticipant</a></p>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}

