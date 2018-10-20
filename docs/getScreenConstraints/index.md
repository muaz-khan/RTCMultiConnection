---
api_name: getScreenConstraints
api_description: Get screen-capturing constraints
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
connection.getScreenConstraints(function(error, screen_constraints) {
    if (error) {
        return alert(error);
    }

    if(screen_constraints.canRequestAudioTrack) {
        // you can capture speakers
        // getUserMedia({audio:screen_constraints})
    }

    navigator.mediaDevices.getUserMedia({
        video: screen_constraints
    }).then(function(stream) {
        var video = document.querySelector('video');
        video.src = URL.createObjectURL(stream);
        video.play();
    }).catch(function(error) {
        alert(JSON.stringify(error, null, '\t'));
    });
});
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
