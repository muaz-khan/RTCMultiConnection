// common.js is useless for you!

(function () {
    if(!document.getElementById('send-message')) return;
    var parentNode = document.getElementById('send-message').parentNode;
    parentNode.innerHTML = '';

    var disqus_shortname;

    if(document.domain == 'www.rtcmulticonnection.org') {
        disqus_shortname = 'rtcmulticonnection';
    }

	if(document.domain == 'rtcmulticonnection.herokuapp.com') {
        disqus_shortname = 'rtcmulticonnection-v3';
    }

    if(document.domain == 'www.webrtc-experiment.com') {
        disqus_shortname = 'webrtcexperiment';
    }

    if(document.domain == 'recordrtc.org') {
        disqus_shortname = 'recordrtc';
    }

    if(document.domain == 'webrtcweb.com') {
        disqus_shortname = 'webrtcweb';
    }

    if(disqus_shortname) {
        var div = document.createElement('div');
        div.id = 'disqus_thread';
        parentNode.appendChild(div);

        var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
        dsq.src = 'https://' + disqus_shortname + '.disqus.com/embed.js';
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
    }
})();
