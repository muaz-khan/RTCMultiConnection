---
api_name: onReadyForOffer
api_description: Check if new participant enable camera/mic and trying to join your room
---

{% capture html %}

<section>
    <p>This event is fired as soon as callee says "I am ready for offer. I enabled camera. Please create offer and share with me".</p>
</section>

<section>
    <h2>How to use</h2>
    <pre>
connection.onReadyForOffer = function(remoteUserId, userPreferences) {
    // if OfferToReceiveAudio/OfferToReceiveVideo should be enabled for specific users
    userPreferences.localPeerSdpConstraints.OfferToReceiveAudio = true;
    userPreferences.localPeerSdpConstraints.OfferToReceiveVideo = true;

    userPreferences.dontAttachStream = false; // according to situation
    userPreferences.dontGetRemoteStream = false;  // according to situation

    // below line must be included. Above all lines are optional.
    connection.multiPeersHandler.createNewPeer(remoteUserId, userPreferences);
};
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}

