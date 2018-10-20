---
api_name: processSdp
api_description: Change SDP before creating any WebRTC connection
---

{% capture html %}

  <section>
    <p>This method can be used to modify SDP yourself!</p>
    <p>You can modify SDP to force h264, vp9 or vp8 codecs.</p>
    <p>You can even modify SDP for application-level bandwidth and many other SDP-attributes.</p>
  </section>

  <section id="usage">
    <h2><a href="#usage">Usage</a></h2>
    <pre style="background:#fff;color:#000"><span style="color:#a535ae">connection</span>.<span style="color:#21439c">processSdp</span> <span style="color:#ff5600">=</span> <span style="color:#ff5600">function</span>(sdp) {
    <span style="color:#919191">// modify SDP here</span>
    sdp <span style="color:#ff5600">=</span> remove_vp8_codecs(sdp);
    sdp <span style="color:#ff5600">=</span> prefer_opus(sdp);
    sdp <span style="color:#ff5600">=</span> use_maxaveragebitrate(sdp);

    <span style="color:#919191">// return the modified SDP</span>
    <span style="color:#ff5600">return</span> sdp;
};
</pre>
  </section>

  <section>
    <h2>Default implementation</h2>
    <pre>
connection.processSdp = function(sdp) {
    if (DetectRTC.browser.name === 'Safari') {
        return sdp;
    }

    if (connection.codecs.video.toUpperCase() === 'VP8') {
        sdp = CodecsHandler.preferCodec(sdp, 'vp8');
    }

    if (connection.codecs.video.toUpperCase() === 'VP9') {
        sdp = CodecsHandler.preferCodec(sdp, 'vp9');
    }

    if (connection.codecs.video.toUpperCase() === 'H264') {
        sdp = CodecsHandler.preferCodec(sdp, 'h264');
    }

    if (connection.codecs.audio === 'G722') {
        sdp = CodecsHandler.removeNonG722(sdp);
    }

    if (DetectRTC.browser.name === 'Firefox') {
        return sdp;
    }

    if (connection.bandwidth.video || connection.bandwidth.screen) {
        sdp = CodecsHandler.setApplicationSpecificBandwidth(sdp, connection.bandwidth, !!connection.session.screen);
    }

    if (connection.bandwidth.video) {
        sdp = CodecsHandler.setVideoBitrates(sdp, {
            min: connection.bandwidth.video * 8 * 1024,
            max: connection.bandwidth.video * 8 * 1024
        });
    }

    if (connection.bandwidth.audio) {
        sdp = CodecsHandler.setOpusAttributes(sdp, {
            maxaveragebitrate: connection.bandwidth.audio * 8 * 1024,
            maxplaybackrate: connection.bandwidth.audio * 8 * 1024,
            stereo: 1,
            maxptime: 3
        });
    }

    return sdp;
};
</pre>
  </section>

  <section id="description">
    <h2><a href="#description">Description</a></h2>
    <div class="datagrid">
    <table>
    <thead><tr><th>parameter</th><th>description</th></tr></thead>
    <tbody>
      <tr>
        <td>sdp</td>
        <td>SDP string is passed as first parameter</td>
      </tr>
    </tbody>
    </table>
    </div>
  </section>

  <section id="isac-audio">
    <h2><a href="#isac-audio">Force ISAC audio; and remove all other codecs</a></h2>
    <pre style="background:#fff;color:#000"><span style="color:#a535ae">connection</span>.<span style="color:#21439c">processSdp</span> <span style="color:#ff5600">=</span> <span style="color:#ff5600">function</span> (sdp) {
    sdp <span style="color:#ff5600">=</span> forceIsac(sdp);
    <span style="color:#ff5600">return</span> sdp;
};

<span style="color:#ff5600">function</span> <span style="color:#21439c">forceIsac</span>(sdp) {
    <span style="color:#919191">// Remove all other codecs (not the video codecs though).</span>
    sdp <span style="color:#ff5600">=</span> sdp.<span style="color:#a535ae">replace</span>(<span style="color:#00a33f">/m=audio (\d+) RTP\/SAVPF.*\r\n/g</span>,
        <span style="color:#00a33f">'m=audio $1 RTP/SAVPF 104\r\n'</span>);
    sdp <span style="color:#ff5600">=</span> sdp.<span style="color:#a535ae">replace</span>(<span style="color:#00a33f">'a=fmtp:111 minptime=10'</span>, <span style="color:#00a33f">'a=fmtp:104 minptime=10'</span>);
    sdp <span style="color:#ff5600">=</span> sdp.<span style="color:#a535ae">replace</span>(<span style="color:#00a33f">/a=rtpmap:(?!104)\d{1,3} (?!VP8|red|ulpfec).*\r\n/g</span>, <span style="color:#00a33f">''</span>);
    <span style="color:#ff5600">return</span> sdp;
}
</pre>
  </section>

  <section id="disable-video-nack">
    <h2><a href="#disable-video-nack">Disable Video NACK</a></h2>
    <pre style="background:#fff;color:#000"><span style="color:#ff5600">&lt;</span>script src<span style="color:#ff5600">=</span><span style="color:#00a33f">"/dev/CodecsHandler.js"</span><span style="color:#ff5600">></span><span style="color:#ff5600">&lt;</span>/script<span style="color:#ff5600">></span>
<span style="color:#ff5600">&lt;</span>script<span style="color:#ff5600">></span>
<span style="color:#919191">// in your HTML file</span>
<span style="color:#a535ae">connection</span>.<span style="color:#21439c">processSdp</span> <span style="color:#ff5600">=</span> <span style="color:#ff5600">function</span>(sdp) {
    <span style="color:#919191">// Disable NACK to test IDR recovery</span>
    sdp <span style="color:#ff5600">=</span> CodecsHandler.disableNACK(sdp);
    <span style="color:#ff5600">return</span> sdp;
};
<span style="color:#ff5600">&lt;</span>/script<span style="color:#ff5600">></span>
</pre>
  </section>

  <section id="use-BandwidthHandler">
    <h2><a href="#use-BandwidthHandler">Use BandwidthHandler</a></h2>
    <pre style="background:#fff;color:#000"><span style="color:#ff5600">var</span> BandwidthHandler <span style="color:#ff5600">=</span> connection.BandwidthHandler;
connection.bandwidth <span style="color:#ff5600">=</span> {
    audio: 128,
    video: 256,
    <span style="color:#a535ae">screen</span>: 300
};
<span style="color:#a535ae">connection</span>.<span style="color:#21439c">processSdp</span> <span style="color:#ff5600">=</span> <span style="color:#ff5600">function</span>(sdp) {
    sdp <span style="color:#ff5600">=</span> BandwidthHandler.setApplicationSpecificBandwidth(sdp, connection.bandwidth, <span style="color:#ff5600">!</span><span style="color:#ff5600">!</span>connection.session.<span style="color:#a535ae">screen</span>);
    sdp <span style="color:#ff5600">=</span> BandwidthHandler.setVideoBitrates(sdp, {
        min: connection.bandwidth.video,
        max: connection.bandwidth.video
    });

    sdp <span style="color:#ff5600">=</span> BandwidthHandler.setOpusAttributes(sdp);

    sdp <span style="color:#ff5600">=</span> BandwidthHandler.setOpusAttributes(sdp, {
        <span style="color:#00a33f">'stereo'</span>: 1,
        <span style="color:#919191">//'sprop-stereo': 1,</span>
        <span style="color:#00a33f">'maxaveragebitrate'</span>: connection.bandwidth.audio <span style="color:#ff5600">*</span> 1000 <span style="color:#ff5600">*</span> 8,
        <span style="color:#00a33f">'maxplaybackrate'</span>: connection.bandwidth.audio <span style="color:#ff5600">*</span> 1000 <span style="color:#ff5600">*</span> 8,
        <span style="color:#919191">//'cbr': 1,</span>
        <span style="color:#919191">//'useinbandfec': 1,</span>
        <span style="color:#919191">// 'usedtx': 1,</span>
        <span style="color:#00a33f">'maxptime'</span>: 3
    });

    <span style="color:#ff5600">return</span> sdp;
};
</pre>
  </section>

  <section id="use-SdpSerializer">
    <h2><a href="#use-SdpSerializer">Use SdpSerializer</a></h2>
    <pre style="background:#fff;color:#000"><span style="color:#919191">// https://cdn.webrtc-experiment.com/SdpSerializer.js</span>
<span style="color:#a535ae">connection</span>.<span style="color:#21439c">processSdp</span> <span style="color:#ff5600">=</span> <span style="color:#ff5600">function</span> (sdp) {
    <span style="color:#ff5600">var</span> serializer <span style="color:#ff5600">=</span> <span style="color:#ff5600">new</span> <span style="color:#21439c">SdpSerializer</span>(sdp);
    
    <span style="color:#919191">// remove entire audio m-line</span>
    serializer.audio.<span style="color:#a535ae">remove</span>();

    <span style="color:#919191">// change order of a payload type in video m-line</span>
    serializer.video.payload(117).order(0);

    <span style="color:#919191">// inject new-line after a specific payload type; under video m-line</span>
    serializer.video.payload(117).newLine(<span style="color:#00a33f">'a=ptime:10'</span>);

    <span style="color:#919191">// remove a specific payload type; under video m-line</span>
    serializer.video.payload(100).<span style="color:#a535ae">remove</span>();

    <span style="color:#919191">// want to add/replace a crypto line?</span>
    serializer.video.<span style="color:#a535ae">crypto</span>().newLine(<span style="color:#00a33f">'a=crypto:0 AES_CM_128_HMAC_SHA1_80 inline:AAAAAAAAAAAAAAAAAAAAAAAAA'</span>);

    <span style="color:#919191">// want to remove a crypto line?</span>
    serializer.video.<span style="color:#a535ae">crypto</span>(80).<span style="color:#a535ae">remove</span>();

    <span style="color:#919191">// want to set direction?</span>
    serializer.video.direction.set(<span style="color:#00a33f">'sendonly'</span>);

    <span style="color:#919191">// want to get direction?</span>
    serializer.video.direction.get();

    <span style="color:#919191">// want to remove entire audio or video track?</span>
    <span style="color:#919191">// usually, in video m-line:</span>
    <span style="color:#919191">// 0-track is always "video" stream</span>
    <span style="color:#919191">// 1-track will be screen sharing stream (if attached)</span>
    serializer.video.track(0).<span style="color:#a535ae">remove</span>()

    <span style="color:#919191">// get serialized sdp</span>
    sdp <span style="color:#ff5600">=</span> serializer.deserialize();
    
    <span style="color:#ff5600">return</span> sdp;
};
</pre>
  </section>

  <section id="demo">
    <h2><a href="#demo">Demo</a></h2>
    <pre style="background:#fff;color:#000"><span style="color:#ff5600">&lt;</span>script src<span style="color:#ff5600">=</span><span style="color:#00a33f">"https://rtcmulticonnection.herokuapp.com/dist/RTCMultiConnection.min.js"</span><span style="color:#ff5600">></span><span style="color:#ff5600">&lt;</span>/script<span style="color:#ff5600">></span>
<span style="color:#ff5600">&lt;</span>script src<span style="color:#ff5600">=</span><span style="color:#00a33f">"https://rtcmulticonnection.herokuapp.com/socket.io/socket.io.js"</span><span style="color:#ff5600">></span><span style="color:#ff5600">&lt;</span>/script<span style="color:#ff5600">></span>

<span style="color:#ff5600">&lt;</span>script<span style="color:#ff5600">></span>
<span style="color:#ff5600">var</span> connection <span style="color:#ff5600">=</span> <span style="color:#ff5600">new</span> <span style="color:#21439c">RTCMultiConnection</span>();

<span style="color:#919191">// this line is VERY_important</span>
connection.socketURL <span style="color:#ff5600">=</span> <span style="color:#00a33f">'https://rtcmulticonnection.herokuapp.com:443/'</span>;

<span style="color:#919191">// if you want audio+video conferencing</span>
connection.session <span style="color:#ff5600">=</span> {
    audio: <span style="color:#a535ae">true</span>,
    video: <span style="color:#a535ae">true</span>
};

<span style="color:#ff5600">var</span> BandwidthHandler <span style="color:#ff5600">=</span> connection.BandwidthHandler;
connection.bandwidth <span style="color:#ff5600">=</span> {
    audio: 128,
    video: 256,
    <span style="color:#a535ae">screen</span>: 300
};
<span style="color:#a535ae">connection</span>.<span style="color:#21439c">processSdp</span> <span style="color:#ff5600">=</span> <span style="color:#ff5600">function</span>(sdp) {
    sdp <span style="color:#ff5600">=</span> BandwidthHandler.setApplicationSpecificBandwidth(sdp, connection.bandwidth, <span style="color:#ff5600">!</span><span style="color:#ff5600">!</span>connection.session.<span style="color:#a535ae">screen</span>);
    sdp <span style="color:#ff5600">=</span> BandwidthHandler.setVideoBitrates(sdp, {
        min: connection.bandwidth.video,
        max: connection.bandwidth.video
    });

    sdp <span style="color:#ff5600">=</span> BandwidthHandler.setOpusAttributes(sdp);

    sdp <span style="color:#ff5600">=</span> BandwidthHandler.setOpusAttributes(sdp, {
        <span style="color:#00a33f">'stereo'</span>: 1,
        <span style="color:#919191">//'sprop-stereo': 1,</span>
        <span style="color:#00a33f">'maxaveragebitrate'</span>: connection.bandwidth.audio <span style="color:#ff5600">*</span> 1000 <span style="color:#ff5600">*</span> 8,
        <span style="color:#00a33f">'maxplaybackrate'</span>: connection.bandwidth.audio <span style="color:#ff5600">*</span> 1000 <span style="color:#ff5600">*</span> 8,
        <span style="color:#919191">//'cbr': 1,</span>
        <span style="color:#919191">//'useinbandfec': 1,</span>
        <span style="color:#919191">// 'usedtx': 1,</span>
        <span style="color:#00a33f">'maxptime'</span>: 3
    });

    <span style="color:#ff5600">return</span> sdp;
};

connection.openOrJoin(<span style="color:#00a33f">'your-room-id'</span>);
<span style="color:#ff5600">&lt;</span>/script<span style="color:#ff5600">></span>
</pre>
  </section>

{% endcapture %}
{% include html_snippet.html html=html %}
