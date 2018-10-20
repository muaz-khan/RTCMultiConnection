---
api_name: modifyScreenConstraints
api_description: Validate screen constraints before making a getUserMedia request
---

{% capture html %}

<section>
    <p>Whenever RTCMultiConnection captures a screen, it passes constraints to "modifyScreenConstraints". It helps developer validate constraints before allowing RTCMultiConnection to make getUserMedia request.</p>
</section>

<section>
    <h2>How to use</h2>
    <pre>
connection.modifyScreenConstraints = function(screen_constraints) {
    if(DetectRTC.browser.name === 'Firefox' || DetectRTC.browser.name === 'Edge') {
        screen_constraints = {
            audio: false,
            video: {
                mediaSource: 'window'
            }
        };
    }
    screen_constraints.audio = false; // force to disable any speakers
    return screen_constraints;
};
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
