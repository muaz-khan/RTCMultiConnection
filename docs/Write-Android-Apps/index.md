---
title: Write Android apps using RTCMultiConnection
api_description: This documentation explains how to generate android APK files
---

{% capture html %}

  <section>
    <p>RTCMultiConnection v3 supports cordova/ionic/phonegap (webviews).</p>
    <p>For more information: <a href="https://github.com/muaz-khan/RTCMultiConnection/blob/master/docs/ios-android.md" target="_blank">docs/ios-android.md</a></p>
    <p>Want to build iOS apps? Check this: <a href="../Write-iOS-Apps/">Write iOS apps</a></p>
  </section>

  <section id="dev-environment">
    <h2><a href="#dev-environment">Development Environment Prerequisites</a></h2>
    
    <div class="datagrid">
    <table>
    <thead><tr><th>name</th><th>link</th></tr></thead>
    <tbody>
      <tr>
        <td>Oracle Java Development Kit (JDK)</td>
        <td><a href="http://www.oracle.com/technetwork/java/javase/downloads/" target="_blank">http://www.oracle.com/technetwork/java/javase/downloads/</a></td>
      </tr>

      <tr>
        <td>Apache Ant</td>
        <td><a href="http://www.apache.org/dist/ant/binaries/" target="_blank">http://www.apache.org/dist/ant/binaries/</a></td>
      </tr>

      <tr>
        <td>Android SDK</td>
        <td><a href="http://developer.android.com/sdk/index.html" target="_blank">http://developer.android.com/sdk/index.html</a></td>
      </tr>
    </tbody>
    </table>
    </div>

    <p style="padding-left: 20px">For a clear (comprehensive) guide, please check: <a href="https://cordova.apache.org/docs/en/latest/guide/platforms/android/#installing-the-requirements" target="_blank">appache: installing-the-requirements</a></p>
  </section>

  <section id="verify-prerequisites">
    <h2><a href="#verify-prerequisites">Check if your system is ready</a></h2>
    <pre style="background:#fff;color:#000;padding-left: 20px">cordova requirements
</pre>
    <p style="padding-left: 20px">Above command will/should display a result similar to this:</p>
    <pre style="background:#fff;color:#000; padding-left: 20px;">Java JDK: installed
Android SDK: installed
Android target: installed android<span style="color:#ff5600">-</span>23,Google Inc.:Google APIs:23
Gradle: installed <span style="color:#ff5600">--</span><span style="color:#ff5600">--</span><span style="color:#ff5600">--</span><span style="color:#ff5600">--</span><span style="color:#ff5600">--</span><span style="color:#ff5600">--</span><span style="color:#ff5600">--</span><span style="color:#ff5600">--</span><span style="color:#ff5600">-</span> this one seems redundant
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
        <td>Android app shows this HTML</td>
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

      <tr>
        <td>AndroidManifest.xml</td>
        <td>platforms/android/AndroidManifest.xml</td>
        <td>your android APK requires this file</td>
        <td><a href="http://webrtcweb.com/cordova-apps/video-conferencing/platforms/android/AndroidManifest.xml" target="_blank">demo file</a></td>
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
    
    &lt;allow-navigation href="*" /&gt;
    &lt;allow-intent href="*" /&gt;
    &lt;access origin="*" /&gt;

    &lt;platform name="android"&gt;
        &lt;preference name="Orientation" value="default" /&gt;
        &lt;preference name="KeepRunning" value="true" /&gt;
        &lt;preference name="AndroidLaunchMode" value="singleTop" /&gt;
    &lt;/platform&gt;
    
    &lt;preference name="xwalkVersion" value="23+" /&gt;
    &lt;preference name="xwalkCommandLine" value="--disable-pull-to-refresh-effect" /&gt;
    &lt;preference name="xwalkMode" value="embedded" /&gt;
    &lt;preference name="xwalkMultipleApk" value="true" /&gt;

    &lt;plugin name="cordova-plugin-whitelist" spec="latest" /&gt;
    &lt;plugin name="cordova-plugin-device" spec="latest" /&gt;
    &lt;plugin name="cordova-plugin-crosswalk-webview" spec="latest" /&gt;
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

  <section id="AndroidManifest-xml">
    <h2><a href="#AndroidManifest-xml">Modify AndroidManifest.xml</a></h2>
<pre class="sh_html" style="background:#fff;color:#000;padding-left: 20px">&lt;?xml version='1.0' encoding='utf-8'?&gt;
&lt;manifest android:versionName="1.0.0" package="com.rtcmulticonnection.demo"&gt;
    &lt;uses-sdk android:minSdkVersion="16" android:targetSdkVersion="25" /&gt;
    &lt;uses-permission android:name="android.permission.CAMERA" /&gt;
    &lt;uses-permission android:name="android.permission.MICROPHONE" /&gt;
    &lt;uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" /&gt;
    &lt;uses-permission android:name="android.permission.RECORD_AUDIO" /&gt;
    &lt;uses-permission android:name="android.permission.WAKE_LOCK" /&gt;
    &lt;uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" /&gt;
    &lt;uses-permission android:name="android.permission.ACCESS_WIFI_STATE" /&gt;
&lt;/manifest&gt;
</pre>
  </section>

  <section id="android-platform">
    <h2><a href="#android-platform">Add Android platform</a></h2>
<pre class="sh_javascript" style="background:#fff;color:#000;padding-left: 20px">cordova platform add android
</pre>
  </section>

  <section id="build-android">
    <h2><a href="#build-android">Build Android</a></h2>
<pre class="sh_javascript" style="background:#fff;color:#000;padding-left: 20px">cordova build android
</pre>
    <p style="padding-left: 20px">You can find the generated APK here:</p>
    <pre class="sh_javascript" style="background:#fff;color:#000;padding-left: 20px">project<span style="color:#ff5600">-</span>directory/platforms/android/build/outputs/apk/android<span style="color:#ff5600">-</span>armv7<span style="color:#ff5600">-</span>debug.apk
</pre>
  </section>

{% endcapture %}
{% include html_snippet.html html=html %}
