---
title: FAQ | RTCMultiConnection
description: Frequently asked questions about RTCMultiConnection
css: 
---

{% capture html %}
  <section>
    <p>Having bugs/issues reports? <a href="https://github.com/muaz-khan/RTCMultiConnection/issues">discuss here</a></p>
  </section>

  <section id="mit">
    <h2><a href="#mit">MIT Licensed</a></h2>
    <p>RTCMultiConnection is using <a href="https://en.wikipedia.org/wiki/MIT_License">MIT</a> license, which means that:</p>
    <div class="datagrid">
    <table>
    <tbody>
      <tr><td>it is <a href="https://github.com/muaz-khan/RTCMultiConnection">open-sourced</a></td></tr>
      <tr><td>it is free, 100% free</td></tr>
      <tr><td>it has a small community as well</td></tr>
    </tbody>
    </table>
    </div>
  </section>

  <section id="Browsers-OS">
    <h2><a href="#Browsers-OS">Browsers + Operating Systems</a></h2>
    <div class="datagrid">
    <table>
    <thead><tr><th>Browser</th><th>Operating Sytem</th><th>Description</th></tr></thead>
    <tbody>
      <tr>
        <td>Google Chrome</td>
        <td>Mac, Linux/Ubuntu, Windows, Android</td>
        <td>
            Fully Supported<br>
            Android is fully-supported as well
        </td>
      </tr>

      <tr>
        <td>Firefox</td>
        <td>Mac, Linux/Ubuntu, Windows, Android</td>
        <td>
            Fully Supported<br>
            Screen-capturing on Android is NOT supported yet.
        </td>
      </tr>

      <tr>
        <td>Safari</td>
        <td>Mac, iOS (iphone+ipad)</td>
        <td>
            Fully Supported except screen capturing<br>
            Requires version 11 or higher
        </td>
      </tr>

      <tr>
        <td>Edge</td>
        <td>Windows 10</td>
        <td>
            Fully Supported
        </td>
      </tr>

      <tr>
        <td>Opera</td>
        <td>Mac, Linux/Ubuntu, Windows, Android</td>
        <td>
            Fully Supported except screen-capturing
        </td>
      </tr>

      <tr>
        <td>Cordova</td>
        <td>iOS + Android (<a href="https://github.com/muaz-khan/cordova-mobile-apps">native apps</a>)</td>
        <td>
            Fully Supported except screen-capturing<br>
            Supports: iPhone+iPad+Android tablets
        </td>
      </tr>
    </tbody>
    </table>
    </div>
  </section>

  <section id="php">
    <h2><a href="#php">PHP</a></h2>
    <p>You can use server sent events (SSE) based open-sourced demo: <a href="https://rtcmulticonnection.herokuapp.com/demos/SSEConnection.html">Live Demo</a> or <a href="https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/SSEConnection">Source</a></p>
  </section>

  <section id="aspnet">
    <h2><a href="#aspnet">ASP.NET</a></h2>
    <p>
        You can use <a href="https://github.com/muaz-khan/XHR-Signaling">xhr signaling</a>, <a href="https://github.com/muaz-khan/WebRTC-Experiment/blob/master/Signaling.md#how-to-use-websync-for-signaling">websync signaling</a> or <a href="https://github.com/muaz-khan/WebRTC-Experiment/blob/master/Signaling.md#how-to-use-signalr-for-signaling">signal-r signaling</a>.
    </p>

    <p>
        Check a tutorial: <a href="https://muaz-khan.blogspot.com/2014/10/webrtc-for-aspnet-developers.html">WebRTC for ASP.NET developers</a>
    </p>
  </section>

  <section id="more-info">
    <h2><a href="#more-info">More information</a></h2>
    <p>
        Are you a newbie (beginner)? Check this tutorial: <a href="https://www.webrtc-experiment.com/docs/WebRTC-Signaling-Concepts.html">WebRTC Signaling Concepts</a>
    </p>
  </section>

{% endcapture %}
{% include html_snippet.html html=html %}
