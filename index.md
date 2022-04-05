---
title: RTCMultiConnection.js
description: WebRTC JavaScript library for peer-to-peer applications (screen sharing, audio/video conferencing, file sharing, media streaming etc.)
---

{% capture html %}

  <section style="text-align: center;">
    <p>Newbie? Please check built-in demos: <a href="https://muazkhan.com:9001/demos/">List Of All Demos</a></p>
    <input type="search" id="txt-search" placeholder="Search API">
    <small id="results" style="margin-left: 11px;font-size: 15px;">Results: 0</small>
  </section>

  <section id="a">
    <h2><a href="#a">a</a></h2>
    <ul>
      <li>
        <a href="/docs/addStream/">addStream</a>
      </li>
      <li>
        <a href="/docs/attachStreams/">attachStreams</a>
      </li>
      <li>
        <a href="/docs/applyConstraints/">applyConstraints</a>
      </li>
      <li>
        <a href="/docs/autoCloseEntireSession/">autoCloseEntireSession</a>
      </li>
      <li>
        <a href="/docs/autoTranslateText/">autoTranslateText</a>
      </li>
      <li>
        <a href="/docs/autoSaveToDisk/">autoSaveToDisk</a>
      </li>
      <li>
        <a href="/docs/acceptParticipationRequest/">acceptParticipationRequest</a>
      </li>
      <li>
        <a href="/docs/autoCreateMediaElement/">autoCreateMediaElement</a>
      </li>
    </ul>

    <del>acceptModerationControl, addNewBroadcaster</del>
  </section>

  <section id="b">
    <h2><a href="#b">b</a></h2>
    <ul>
      <li>
        <a href="/docs/bandwidth/">bandwidth</a>
      </li>
      <li>
        <a href="/docs/beforeAddingStream/">beforeAddingStream</a>
      </li>
      <li>
        <a href="/docs/beforeRemovingStream/">beforeRemovingStream</a>
      </li>
      <li>
        <a href="/docs/BandwidthHandler/">BandwidthHandler</a>
      </li>
    </ul>

    <del>broadcasters, becomePublicModerator</del>
  </section>

  <section id="c">
    <h2><a href="#c">c</a></h2>
    <ul>
      <li>
        <a href="/docs/channel/">channel</a>
      </li>
      <li>
        <a href="/docs/checkPresence/">checkPresence</a>
      </li>
      <li>
        <a href="/docs/closeSocket/">closeSocket</a>
      </li>
      <li>
        <a href="/docs/close/">close</a>
      </li>
      <li>
        <a href="/docs/connectSocket/">connectSocket</a>
      </li>
      <li>
        <a href="/docs/candidates/">candidates</a>
      </li>
      <li>
        <a href="/docs/captureUserMedia/">captureUserMedia</a>
      </li>
      <li>
        <a href="/docs/changeUserId/">changeUserId</a>
      </li>
      <li>
        <a href="/docs/checkIfChromeExtensionAvailable/">checkIfChromeExtensionAvailable</a>
      </li>
      <li>
        <a href="/docs/chunkSize/">chunkSize</a>
      </li>
      <li>
        <a href="/docs/closeBeforeUnload/">closeBeforeUnload</a>
      </li>
      <li>
        <a href="/docs/connect/">connect</a>
      </li>
      <li>
        <a href="/docs/constructor/">constructor</a>
      </li>
      <li>
        <a href="/docs/connectWithAllParticipants/">connectWithAllParticipants</a>
      </li>
      <li>
        <a href="/docs/codecs/">codecs</a>
      </li>
      <li>
        <a href="/docs/CodecsHandler/">CodecsHandler</a>
      </li>
    </ul>

    <del>closeEntireSession</del>
  </section>

  <section id="d">
    <h2><a href="#d">d</a></h2>
    <ul>
      <li>
        <a href="/docs/disconnectWith/">disconnectWith</a>
      </li>
      <li>
        <a href="/docs/disconnectWith/">disconnect</a>
      </li>
      <li>
        <a href="/docs/deletePeer/">deletePeer</a>
      </li>
      <li>
        <a href="/docs/direction/">direction</a>
      </li>
      <li>
        <a href="/docs/dontAttachStream/">dontAttachStream</a>
      </li>
      <li>
        <a href="/docs/dontCaptureUserMedia/">dontCaptureUserMedia</a>
      </li>
      <li>
        <a href="/docs/dontGetRemoteStream/">dontGetRemoteStream</a>
      </li>
      <li>
        <a href="/docs/DetectRTC/">DetectRTC</a>
      </li>
    </ul>
    <del>dontMakeMeModerator</del>
  </section>

  <section id="e">
    <h2><a href="#e">e</a></h2>
    <ul>
      <li>
        <a href="/docs/enableLogs/">enableLogs</a>
      </li>
      <li>
        <a href="/docs/extra/">extra</a>
      </li>
      <li>
        <a href="/docs/enableFileSharing/">enableFileSharing</a>
      </li>
      <li>
        <a href="/docs/enableScalableBroadcast/">enableScalableBroadcast</a>
      </li>
    </ul>
  </section>

  <section id="f">
    <h2><a href="#f">f</a></h2>
    <ul>
      <li>
        <a href="/docs/filesContainer/">filesContainer</a>
      </li>
    </ul>
  </section>

  <section id="g">
    <h2><a href="#g">g</a></h2>
    <ul>
      <li>
        <a href="/docs/getAllParticipants/">getAllParticipants</a>
      </li>
      <li>
        <a href="/docs/getChromeExtensionStatus/">getChromeExtensionStatus</a>
      </li>
      <li>
        <a href="/docs/getExtraData/">getExtraData</a>
      </li>
      <li>
        <a href="/docs/getNumberOfBroadcastViewers/">getNumberOfBroadcastViewers</a>
      </li>
      <li>
        <a href="/docs/getRemoteStreams/">getRemoteStreams</a>
      </li>
      <li>
        <a href="/docs/getScreenConstraints/">getScreenConstraints</a>
      </li>
      <li>
        <a href="/docs/getSocket/">getSocket</a>
      </li>
      <li>
        <a href="/docs/captureUserMedia/">getUserMedia</a>
      </li>
      <li>
        <a href="/docs/getUserMediaHandler/">getUserMediaHandler</a>
      </li>
      <li>
        <a href="/docs/googKey/">googKey</a>
      </li>
      <li>
        <a href="/docs/get-public-rooms/">get-public-rooms</a>
      </li>
    </ul>
    <del>getPublicModerators</del>
  </section>

  <section id="i">
    <h2><a href="#i">i</a></h2>
    <ul>
      <li>
        <a href="/docs/iceServers/">iceServers</a>
      </li>
      <li>
        <a href="/docs/iceProtocols/">iceProtocols</a>
      </li>
      <li>
        <a href="/docs/iceTransportPolicy/">iceTransportPolicy</a>
      </li>
      <li>
        <a href="/docs/invokeGetUserMedia/">invokeGetUserMedia</a>
      </li>
      <li>
        <a href="/docs/invokeSelectFileDialog/">invokeSelectFileDialog</a>
      </li>
      <li>
        <a href="/docs/isInitiator/">isInitiator</a>
      </li>
      <li>
        <a href="/docs/isOnline/">isOnline</a>
      </li>
      <li>
        <a href="/docs/isLowBandwidth/">isLowBandwidth</a>
      </li>
    </ul>
    <del>isPluginRTC</del>
  </section>

  <section id="j">
    <h2><a href="#j">j</a></h2>
    <ul>
      <li>
        <a href="/docs/join/">join</a>
      </li>
    </ul>
  </section>

  <section id="l">
    <h2><a href="#l">l</a></h2>
    <ul>
      <li>
        <a href="/docs/leave/">leave</a>
      </li>
      <li>
        <a href="/docs/language/">language</a>
      </li>
    </ul>
  </section>

  <section id="m">
    <h2><a href="#m">m</a></h2>
    <ul>
      <li>
        <a href="/docs/mediaConstraints/">mediaConstraints</a>
      </li>
      <li>
        <a href="/docs/maxParticipantsAllowed/">maxParticipantsAllowed</a>
      </li>
      <li>
        <a href="/docs/maxRelayLimitPerUser/">maxRelayLimitPerUser</a>
      </li>
      <li>
        <a href="/docs/modifyScreenConstraints/">modifyScreenConstraints</a>
      </li>
      <li>
        <a href="/docs/multiPeersHandler/">multiPeersHandler</a>
      </li>
      <li>
        <a href="/docs/mute/">mute</a>
      </li>
    </ul>
  </section>

  <section id="o">
    <h2><a href="#o">o</a></h2>
    <ul>
      <li>
        <a href="/docs/open/">open</a>
      </li>
      <li>
        <a href="/docs/openOrJoin/">openOrJoin</a>
      </li>
      <li>
        <a href="/docs/onbeforeunload/">onbeforeunload</a>
      </li>
      <li>
        <a href="/docs/onstream/">onstream</a>
      </li>
      <li>
        <a href="/docs/onstreamended/">onstreamended</a>
      </li>
      <li>
        <a href="/docs/onopen/">onopen</a>
      </li>
      <li>
        <a href="/docs/onmessage/">onmessage</a>
      </li>
      <li>
        <a href="/docs/onclose/">onclose</a>
      </li>
      <li>
        <a href="/docs/onerror/">onerror</a>
      </li>
      <li>
        <a href="/docs/onleave/">onleave</a>
      </li>
      <li>
        <a href="/docs/onmute/">onmute</a>
      </li>
      <li>
        <a href="/docs/onunmute/">onunmute</a>
      </li>
      <li>
        <a href="/docs/optionalArgument/">optionalArgument</a>
      </li>
      <li>
        <a href="/docs/onExtraDataUpdated/">onExtraDataUpdated</a>
      </li>
      <li>
        <a href="/docs/onFileStart/">onFileStart</a>
      </li>
      <li>
        <a href="/docs/onFileProgress/">onFileProgress</a>
      </li>
      <li>
        <a href="/docs/onFileEnd/">onFileEnd</a>
      </li>
      <li>
        <a href="/docs/onInvalidPassword/">onInvalidPassword</a>
      </li>
      <li>
        <a href="/docs/onJoinWithPassword/">onJoinWithPassword</a>
      </li>
      <li>
        <a href="/docs/onMediaError/">onMediaError</a>
      </li>
      <li>
        <a href="/docs/onNewParticipant/">onNewParticipant</a>
      </li>
      <li>
        <a href="/docs/onNumberOfBroadcastViewersUpdated/">onNumberOfBroadcastViewersUpdated</a>
      </li>
      <li>
        <a href="/docs/onPasswordMaxTriesOver/">onPasswordMaxTriesOver</a>
      </li>
      <li>
        <a href="/docs/onPeerStateChanged/">onPeerStateChanged</a>
      </li>
      <li>
        <a href="/docs/onUserStatusChanged/">onUserStatusChanged</a>
      </li>
      <li>
        <a href="/docs/onReConnecting/">onReConnecting</a>
      </li>
      <li>
        <a href="/docs/onRoomFull/">onRoomFull</a>
      </li>
      <li>
        <a href="/docs/onSettingLocalDescription/">onSettingLocalDescription</a>
      </li>
      <li>
        <a href="/docs/onUserIdAlreadyTaken/">onUserIdAlreadyTaken</a>
      </li>
      <li>
        <a href="/docs/onEntireSessionClosed/">onEntireSessionClosed</a>
      </li>
      <li>
        <a href="/docs/onReadyForOffer/">onReadyForOffer</a>
      </li>
    </ul>

    <del>onSessionClosed, onstatechange, onstats, onShiftedModerationControl</del>
  </section>

  <section id="p">
    <h2><a href="#p">p</a></h2>
    <ul>
      <li>
        <a href="/docs/peers/">peers</a>
      </li>
      <li>
        <a href="/docs/processSdp/">processSdp</a>
      </li>
      <li>
        <a href="/docs/peersBackup/">peersBackup</a>
      </li>
      <li>
        <a href="/docs/publicRoomIdentifier/">publicRoomIdentifier</a>
      </li>
      <li>
        <a href="/docs/password/">password</a>
      </li>
    </ul>
  </section>

  <section id="r">
    <h2><a href="#r">r</a></h2>
    <ul>
      <li>
        <a href="/docs/rejoin/">rejoin</a>
      </li>
      <li>
        <a href="/docs/removeStream/">removeStream</a>
      </li>
      <li>
        <a href="/docs/renegotiate/">renegotiate</a>
      </li>
      <li>
        <a href="/docs/replaceTrack/">replaceTrack</a>
      </li>
      <li>
        <a href="/docs/resetTrack/">resetTrack</a>
      </li>
      <li>
        <a href="/docs/rtcpMuxPolicy/">rtcpMuxPolicy</a>
      </li>
      <li>
        <a href="/docs/resetScreen/">resetScreen</a>
      </li>
    </ul>

    <del>removeFromBroadcastersList</del>
  </section>

  <section id="s">
    <h2><a href="#s">s</a></h2>
    <ul>
      <li>
        <a href="/docs/socketURL/">socketURL</a>
      </li>
      <li>
        <a href="/docs/session/">session</a>
      </li>
      <li>
        <a href="/docs/send/">send</a>
      </li>
      <li>
        <a href="/docs/shareFile/">shareFile</a>
      </li>
      <li>
        <a href="/docs/streamEvents/">streamEvents</a>
      </li>
      <li>
        <a href="/docs/setCustomSocketEvent/">setCustomSocketEvent</a>
      </li>
      <li>
        <a href="/docs/setCustomSocketHandler/">setCustomSocketHandler</a>
      </li>
      <li>
        <a href="/docs/socketCustomEvent/">socketCustomEvent</a>
      </li>
      <li>
        <a href="/docs/socketMessageEvent/">socketMessageEvent</a>
      </li>
      <li>
        <a href="/docs/streams/">streams</a>
      </li>
      <li>
        <a href="/docs/sdpConstraints/">sdpConstraints</a>
      </li>
      <li>
        <a href="/docs/sessionid/">sessionid</a>
      </li>
      <li>
        <a href="/docs/socketOptions/">socketOptions</a>
      </li>
      <li>
        <a href="/docs/setStreamEndHandler/">setStreamEndHandler</a>
      </li>
      <li>
        <a href="/docs/setUserPreferences/">setUserPreferences</a>
      </li>
      <li>
        <a href="/docs/StreamsHandler/">StreamsHandler</a>
      </li>
      <li>
        <a href="/docs/socket/">socket</a>
      </li>
    </ul>

    <del>shiftModerationControl</del>
  </section>

  <section id="t">
    <h2><a href="#t">t</a></h2>
    <ul>
      <li>
        <a href="/docs/trickleIce/">trickleIce</a>
      </li>
      <li>
        <a href="/docs/token/">token</a>
      </li>
      <li>
        <a href="/docs/Translator/">Translator</a>
      </li>
    </ul>
  </section>

  <section id="u">
    <h2><a href="#u">u</a></h2>
    <ul>
      <li>
        <a href="/docs/userid/">userid</a>
      </li>
      <li>
        <a href="/docs/updateExtraData/">updateExtraData</a>
      </li>
      <li>
        <a href="/docs/unmute/">unmute</a>
      </li>
    </ul>
  </section>

  <section id="v">
    <h2><a href="#v">v</a></h2>
    <ul>
      <li>
        <a href="/docs/version/">version</a>
      </li>
      <li>
        <a href="/docs/videosContainer/">videosContainer</a>
      </li>
    </ul>
  </section>

  <section id="extras">
    <h2><a href="#extras">extras</a></h2>
    <ul style="margin: 20px 0;">
      <li>
        <a href="/docs/Write-Android-Apps/">Write Android apps</a>
      </li>
      <li>
        <a href="/docs/Write-iOS-Apps/">Write iOS apps</a>
      </li>
      <li>
        <a href="https://github.com/muaz-khan/cordova-mobile-apps">Cordova Apps (open-sourced)</a>
      </li>
    </ul>
  </section>

  <section id="contribute">
    <h2><a href="#contribute">contribute</a></h2>
    <p style="margin:0;padding:0;margin: 20px 10px;">
      Do you want to contribute fixing (updating) these documentations? <a href="https://github.com/muaz-khan/RTCMultiConnection/tree/gh-pages" class="highlighted">RTCMultiConnection/gh-pages</a>
    </p>
  </section>

  <footer>
    <small id="send-message"></small>
  </footer>

   <script>
      window.onkeyup = function(e) {
        var keyCode = e.which || e.keyCode || 0;
        if(keyCode == 70) {
          document.getElementById('txt-search').focus();
        }
      };

      function searchAPI(text) {
        if(!text) text = '';
        text = text.toString().toLowerCase().trim();

        var found = 0;
        var foundParent = {};
        document.querySelectorAll('a').forEach(function(link) {
          if(!link.parentNode.parentNode.parentNode) return;
          if(link.parentNode.parentNode.parentNode.nodeName.toLowerCase() !== 'section') return;

          var html = link.innerHTML.toString().toLowerCase();
          if(!text || !text.length || html.indexOf(text) == -1) {
            link.className = '';

            if(text && text.length && html.indexOf(text) == -1 && !foundParent[link.parentNode.parentNode.parentNode.id]) {
              link.parentNode.parentNode.parentNode.style.display = 'none';
            }
            else {
              link.parentNode.parentNode.parentNode.style.display = 'block';
            }
            
            return;
          }
          foundParent[link.parentNode.parentNode.parentNode.id] = true;
          link.parentNode.parentNode.parentNode.style.display = 'block';

          link.className = 'highlighted bg-yellow';
          found++;
        });

        results.innerHTML = 'Results: ' + found;
      }

      var results = document.getElementById('results');
      document.getElementById('txt-search').onkeyup = function() {
        searchAPI(this.value);
      };
  </script>

{% endcapture %}
{% include html_snippet.html html=html %}
