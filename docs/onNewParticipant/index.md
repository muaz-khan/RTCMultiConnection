---
api_name: onNewParticipant
api_description: Validate participation requests
---

{% capture html %}

<section>
    <p>This event is fired as soon as someone tries to join you. You can either reject his request or set preferences.</p>
</section>

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

// or do not allow a user twice
var alreadyAllowed = {};
connection.onNewParticipant = function(participantId, userPreferences) {
    if(alreadyAllowed[participantId]) {
        connection.addParticipationRequest(participantId, userPreferences);
        return;
    }

    var message = participantId + ' is trying to join your room. Confirm to accept his request.';
    if( window.confirm(messsage ) ) {
        connection.addParticipationRequest(participantId, userPreferences);
    }
};
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
