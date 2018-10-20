---
title: Write iOS apps using RTCMultiConnection
api_description: This documentation explains how to generate iphone/ipad apps
---

{% capture html %}

  <section>
    <p>RTCMultiConnection v3 supports cordova/ionic/phonegap (webviews).</p>
    <p>For more information: <a href="https://github.com/muaz-khan/RTCMultiConnection/blob/master/docs/ios-android.md" target="_blank">docs/ios-android.md</a></p>
    <p>Want to build Android apps? Check this: <a href="../Write-Android-Apps/">Write Android apps</a></p>
  </section>

  <section id="dev-environment">
    <h2><a href="#dev-environment">Development Environment Prerequisites</a></h2>
    
    <div class="datagrid">
    <table>
    <thead><tr><th>name</th><th>version</th></tr></thead>
    <tbody>
      <tr>
        <td>MacOSX</td>
        <td>10.11 or higher</td>
      </tr>

      <tr>
        <td>xCode</td>
        <td>7.3 or higher</td>
      </tr>

      <tr>
        <td>iOS</td>
        <td>9.2 or higher</td>
      </tr>
    </tbody>
    </table>
    </div>
  </section>

  <section id="verify-prerequisites">
    <h2><a href="#verify-prerequisites">Check if your system is ready</a> (<a href="https://cordova.apache.org/docs/en/latest/guide/cli/" target="_blank" rel="nofollow">see how to install cordova</a>)</h2>
    <pre class="sh_javascript" style="background:#fff;color:#000;padding-left: 20px">cordova requirements
</pre>
    <p style="padding-left: 20px">Above command will/should display a result similar to this:</p>
    <pre class="sh_javascript" style="background:#fff;color:#000;padding-left: 20px">Apple OS X: installed darwin <span style="color:#ff5600">--</span><span style="color:#ff5600">--</span> OSX should be 10.11 or higher
Xcode: installed 7.3         <span style="color:#ff5600">--</span><span style="color:#ff5600">--</span> 7.3 or higher
ios<span style="color:#ff5600">-</span>deploy: installed 1.8.4  <span style="color:#ff5600">--</span><span style="color:#ff5600">--</span> optional
ios<span style="color:#ff5600">-</span>sim: installed 5.0.6     <span style="color:#ff5600">--</span><span style="color:#ff5600">--</span> optional
</pre>

    <p style="padding-left: 20px" class="highlighted">Please make sure to re-install the prerequisites if you get different result.</p>
  </section>

  <section id="create-cordova">
    <h2><a href="#create-cordova">Create Your First Cordova App</a></h2>
<pre class="sh_javascript" style="background:#fff;color:#000;padding-left: 20px">cordova create RTCMultiConnection com.rtcmulticonnection.demo RTCMultiConnection
cd RTCMultiConnection
</pre>

    <p>
      Now you need to change following files:
    </p>

    <div class="datagrid">
    <table>
    <thead><tr><th>name</th><th>path</th><th>description</th><th>demo file</th></tr></thead>
    <tbody>
      <tr>
        <td>index.html</td>
        <td>www/index.html</td>
        <td>iOS app shows this HTML</td>
        <td><a href="http://webrtcweb.com/cordova-apps/video-conferencing/www/index.html" target="_blank">demo file</a></td>
      </tr>

      <tr>
        <td>index.js</td>
        <td>www/js/index.js</td>
        <td>this is the backbone; here you do everything!</td>
        <td><a href="http://webrtcweb.com/cordova-apps/video-conferencing/www/js/index.js" target="_blank">demo file</a></td>
      </tr>

      <tr>
        <td>config.xml</td>
        <td>config.xml</td>
        <td>here you set plugins, platforms, and attributes</td>
        <td><a href="http://webrtcweb.com/cordova-apps/video-conferencing/config.xml" target="_blank">demo file</a></td>
      </tr>
    </tbody>
    </table>
    </div>
  </section>

  <section id="index-html">
    <h2><a href="#index-html">Modify index.html</a></h2>
<pre class="sh_html" style="background:#fff;color:#000;padding-left: 20px">&lt;link type="text/css" href="css/index.css"&gt;
&lt;script src="cordova.js"&gt;&lt;/script&gt;
&lt;script src="js/socket.io.js"&gt;&lt;/script&gt;
&lt;script src="js/RTCMultiConnection.js"&gt;&lt;/script&gt;
&lt;script src="js/index.js"&gt;&lt;/script&gt;
</pre>
  </section>

  <section id="index-js">
    <h2><a href="#index-js">Modify index.js</a></h2>
<pre class="sh_javascript" style="background:#fff;color:#000;padding-left: 20px">var app = {
    initialize: function() {
        app.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', app.onDeviceReady, false);
    },
    onDeviceReady: function() {
        // here goes your real RTCMultiConnection codes
        var connection = new RTCMultiConnection();
        connection.socketURL = 'https://yourWebSite.com:9001/';
        connection.openOrJoin('roomid');
    }
};

app.initialize();
</pre>
  </section>

  <section id="config-xml">
    <h2><a href="#config-xml">Modify config.xml</a></h2>
<pre class="sh_html" style="background:#fff;color:#000;padding-left: 20px">&lt;?xml version='1.0' encoding='utf-8'?&gt;
&lt;widget id="com.rtcmulticonnection.demo" version="1.0.0" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/ns/1.0"&gt;
    &lt;name&gt;RTCMultiConnection&lt;/name&gt;
    &lt;icon src="www/img/icon.png" /&gt;
    &lt;content src="index.html" /&gt;
    &lt;platform name="ios"&gt;
        &lt;preference name="Orientation" value="all" /&gt;
        &lt;hook src="hooks/iosrtc-swift-support.js" type="after_platform_add" /&gt;
        &lt;config-file parent="CFBundleURLTypes" target="*-Info.plist"&gt;
            &lt;array&gt;
                &lt;key&gt;NSAppTransportSecurity&lt;/key&gt;
                &lt;dict&gt;
                    &lt;key&gt;NSAllowsArbitraryLoads&lt;/key&gt;
                    &lt;true /&gt;
                &lt;/dict&gt;
            &lt;/array&gt;
        &lt;/config-file&gt;
    &lt;/platform&gt;
    &lt;plugin name="cordova-plugin-whitelist" spec="latest" /&gt;
    &lt;plugin name="cordova-plugin-iosrtc" spec="latest" /&gt;
    &lt;plugin name="cordova-plugin-device" spec="latest" /&gt;
&lt;/widget&gt;
</pre>

      <p style="padding-left: 20px">Please modify following XML attributes:</p>

    <div class="datagrid">
    <table>
    <thead><tr><th>description</th><th>example code</th></tr></thead>
    <tbody>
      <tr>
        <td>"id" attribute: It should be something like this:</td>
        <td>
          <pre class="sh_javascript" style="background:#fff;color:#000;">&lt;widget id=<span style="color:#00a33f">"com.yourdomain"</span>
</pre>
        </td>
      </tr>

      <tr>
        <td>"name" attribute: Name should NOT have spaces or special characters. Consider it as a "username":</td>
        <td>
          <pre class="sh_javascript" style="background:#fff;color:#000;">&lt;<span style="color:#ff5600">name</span>yourAppName&lt;/<span style="color:#ff5600">name</span>
</pre>
        </td>
      </tr>

      <tr>
        <td colspan="2">
          "icon" attribute: You can replace "icon.png" file with your own app-icon.
        </td>
      </tr>
    </tbody>
    </table>
    </div>
  </section>

  <section id="iosrtc-swift-supportjs">
    <h2><a href="#iosrtc-swift-supportjs">Download "iosrtc-swift-support.js" in the "hooks" directory</a></h2>
<pre class="sh_javascript" style="background:#fff;color:#000;padding-left: 20px">mkdir hooks
cd hooks
# wget http://webrtcweb.com/cordova-apps/video-conferencing/hooks/iosrtc-swift-support.js
wget https://raw.githubusercontent.com/eface2face/cordova-plugin-iosrtc/master/extra/hooks/iosrtc-swift-support.js

[sudo] chmod +x iosrtc-swift-support.js
</pre>
  </section>

  <section id="ios-platform">
    <h2><a href="#ios-platform">Add iOS platform</a></h2>
<pre class="sh_javascript" style="background:#fff;color:#000;padding-left: 20px">cordova platform add ios
</pre>
  </section>

  <section id="xcodeproj">
    <h2><a href="#xcodeproj">Open "xcodeproj" using xCode</a></h2>
<pre class="sh_javascript" style="background:#fff;color:#000;padding-left: 20px">platforms/ios/ProjectName.xcodeproj
</pre>
    <p>
      You need to validate your iOS profile/email.
    </p>
  </section>

  <section id="info-plist">
    <h2><a href="#info-plist">Add Two New Entires in the "Info.plist"</a></h2>

    <p>
      Using xCode, goto "info.plist" section and you MUST add following two entries:
    </p>
    <div class="datagrid">
    <table>
    <tbody>
      <tr>
        <td>Add "Privacy - Microphone" entry</td>
      </tr>

      <tr>
        <td>Add "Privacy - Camera" entry</td>
      </tr>
    </tbody>
    </table>
    </div>
  </section>

  <section id="build-ios">
    <h2><a href="#build-ios">Build iOS</a></h2>
<pre class="sh_javascript" style="background:#fff;color:#000;padding-left: 20px">cordova build ios
</pre>
    <p>
      Now click "Run" button on xCode to compile the iOS app and install on your real iPhone/iPad device. Please do NOT use emulators.
    </p>
  </section>

  <section id="test-using-real-iphone">
    <h2><a href="#test-using-real-iphone">Test on a Real iPhone device</a></h2>
    <p style="padding-left: 20px">(Use USB cable) Plugin your iPhone (6p or 7) device to your MacBook</p>
    <p style="padding-left: 20px">Open XCode and click "Generic iOS Device" from the tool-bar</p>
    <p style="padding-left: 20px">Select your real iPhone device</p>
    <p style="padding-left: 20px">Click "Run" button from the same tool-bar</p>
    <p style="padding-left: 20px" class="highlighted">
      It will generate iOS app, automatically install it on your real iPhone device and automatically open it as well. 
    </p>
  </section>

{% endcapture %}
{% include html_snippet.html html=html %}
