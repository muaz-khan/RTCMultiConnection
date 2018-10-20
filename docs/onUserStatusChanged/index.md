---
api_name: onUserStatusChanged
api_description: Use this event to get users online/offline statuses
---

{% capture html %}

<section>
    <p>This event allows you detect who gone offline; or who just joined the room. i.e. online/offline statuses from all those users who joined you; or users who was/were/are connected with you.</p>
</section>

<section>
    <h2>How to use</h2>
    <pre>
connection.onUserStatusChanged = function(event) {
    var isOnline = event.status === 'online';
    var isOffline = event.status === 'offline';

    var targetUserId = event.userid;
    var targetUserExtraInfo = event.extra; // extra.fullName/etc
};
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
