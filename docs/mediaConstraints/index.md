---
api_name: mediaConstraints
api_description: Set getUserMedia parameters e.g. resolutions and framerates
---

{% capture html %}

  <section>
    <p>Choose front or back camera, set resolutions, choose camera/microphone by device-id etc.</p>
  </section>

  <section id="usage">
    <h2><a href="#usage">Usage</a></h2>
    <pre style="background:#fff;color:#000">connection.mediaConstraints <span style="color:#ff5600">=</span> {
    video: <span style="color:#a535ae">true</span>,
    audio: <span style="color:#a535ae">true</span>
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
        <td>audio</td>
        <td>
            it can be a boolean (true|false) or a javascript object<br>
            use this to enable microphone<br>
            set microphone device-id<br>
            set echo-cancellation browser-specific attributes<br>
            etc.
        </td>
      </tr>
      <tr>
        <td>video</td>
        <td>
            it can be a boolean (true|false) or a javascript object<br>
            use this to enable camera<br>
            set camera device-id<br>
            choose front or back camera<br>
            set frame-rates, aspect-ratio<br>
            etc.
        </td>
      </tr>
    </tbody>
    </table>
    </div>
  </section>

  <section id="fackingMode">
    <h2><a href="#fackingMode">Choose front camera on Android</a></h2>
    <pre style="background:#fff;color:#000">connection.mediaConstraints <span style="color:#ff5600">=</span> {
    audio: <span style="color:#a535ae">true</span>,
    video: {
        mandatory: {},
        optional: [{
            facingMode: <span style="color:#00a33f">'user'</span> <span style="color:#919191">// or "application" for back camera</span>
        }]
    }
};

<span style="color:#ff5600">if</span> (DetectRTC.browser.<span style="color:#a535ae">name</span> <span style="color:#ff5600">===</span> <span style="color:#00a33f">'Firefox'</span>) {
    connection.mediaConstraints <span style="color:#ff5600">=</span> {
        audio: <span style="color:#a535ae">true</span>,
        video: {
            facingMode: <span style="color:#00a33f">'user'</span> <span style="color:#919191">// or "application" for back camera</span>
        }
    };
}
</pre>
  </section>

  <section id="frameRate">
    <h2><a href="#frameRate">Set frame-rates</a></h2>
    <pre style="background:#fff;color:#000">connection.mediaConstraints <span style="color:#ff5600">=</span> {
    audio: <span style="color:#a535ae">true</span>,
    video: {
        mandatory: {
            minFrameRate: 15,
            maxFrameRate: 15
        },
        optional: []
    }
};

<span style="color:#ff5600">if</span> (DetectRTC.browser.<span style="color:#a535ae">name</span> <span style="color:#ff5600">===</span> <span style="color:#00a33f">'Firefox'</span>) {
    connection.mediaConstraints <span style="color:#ff5600">=</span> {
        audio: <span style="color:#a535ae">true</span>,
        video: {
            frameRate: {
                min: 15,
                max: 15
            }
        }
    };
}
</pre>
  </section>

  <section id="aspectRatio">
    <h2><a href="#aspectRatio">Set aspect-ratio</a></h2>
    <pre style="background:#fff;color:#000">connection.mediaConstraints <span style="color:#ff5600">=</span> {
    audio: <span style="color:#a535ae">true</span>,
    video: {
        mandatory: {
            minAspectRatio: 1.77
        },
        optional: []
    }
};

<span style="color:#ff5600">if</span> (DetectRTC.browser.<span style="color:#a535ae">name</span> <span style="color:#ff5600">===</span> <span style="color:#00a33f">'Firefox'</span>) {
    connection.mediaConstraints <span style="color:#ff5600">=</span> {
        audio: <span style="color:#a535ae">true</span>,
        video: {
            aspectRatio: 1.77
        }
    };
}
</pre>
  </section>

  <section id="resolutions">
    <h2><a href="#resolutions">Set resolutions</a></h2>
    <pre style="background:#fff;color:#000">connection.mediaConstraints <span style="color:#ff5600">=</span> {
    audio: <span style="color:#a535ae">true</span>,
    video: {
        mandatory: {
            minWidth: 1280,
            maxWidth: 1280,
            minHeight: 720,
            maxHeight: 720
        },
        optional: []
    }
};

<span style="color:#ff5600">if</span> (DetectRTC.browser.<span style="color:#a535ae">name</span> <span style="color:#ff5600">===</span> <span style="color:#00a33f">'Firefox'</span>) {
    connection.mediaConstraints <span style="color:#ff5600">=</span> {
        audio: <span style="color:#a535ae">true</span>,
        video: {
            width: 1280,
            height: 720
        }
    };
}
</pre>
  </section>

  <section id="echo-cancellation">
    <h2><a href="#echo-cancellation">Echo cancellation (browser specific)</a></h2>
    <pre style="background:#fff;color:#000">connection.mediaConstraints <span style="color:#ff5600">=</span> {
    video: <span style="color:#a535ae">true</span>,
    audio: {
        mandatory: {
            echoCancellation: <span style="color:#a535ae">false</span>, <span style="color:#919191">// disabling audio processing</span>
            googAutoGainControl: <span style="color:#a535ae">true</span>,
            googNoiseSuppression: <span style="color:#a535ae">true</span>,
            googHighpassFilter: <span style="color:#a535ae">true</span>,
            googTypingNoiseDetection: <span style="color:#a535ae">true</span>,
            <span style="color:#919191">//googAudioMirroring: true</span>
        },
        optional: []
    }
};

<span style="color:#ff5600">if</span> (DetectRTC.browser.<span style="color:#a535ae">name</span> <span style="color:#ff5600">===</span> <span style="color:#00a33f">'Firefox'</span>) {
    connection.mediaConstraints <span style="color:#ff5600">=</span> {
        audio: <span style="color:#a535ae">true</span>,
        video: <span style="color:#a535ae">true</span>
    };
}
</pre>
  </section>

  <section id="deviceId">
    <h2><a href="#deviceId">Choose secondary camera</a></h2>
    <pre style="background:#fff;color:#000">DetectRTC.<span style="color:#a535ae">load</span>(<span style="color:#ff5600">function</span>() {
    <span style="color:#ff5600">var</span> secondaryCamera <span style="color:#ff5600">=</span> DetectRTC.videoInputDevices[1];
    <span style="color:#ff5600">if</span> (<span style="color:#ff5600">!</span>secondaryCamera) {
        <span style="color:#a535ae">alert</span>(<span style="color:#00a33f">'Please attach another camera device.'</span>);
        <span style="color:#ff5600">return</span>;
    }

    connection.mediaConstraints <span style="color:#ff5600">=</span> {
        audio: <span style="color:#a535ae">true</span>,
        video: {
            mandatory: {},
            optional: [{
                sourceId: secondaryCamera.<span style="color:#a535ae">id</span>
            }]
        }
    };

    <span style="color:#ff5600">if</span> (DetectRTC.browser.<span style="color:#a535ae">name</span> <span style="color:#ff5600">===</span> <span style="color:#00a33f">'Firefox'</span>) {
        connection.mediaConstraints <span style="color:#ff5600">=</span> {
            audio: <span style="color:#a535ae">true</span>,
            video: {
                deviecId: secondaryCamera.<span style="color:#a535ae">id</span>
            }
        };
    }
});
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

connection.mediaConstraints <span style="color:#ff5600">=</span> {
    audio: <span style="color:#a535ae">true</span>,
    video: {
        mandatory: {
            minWidth: 1280,
            maxWidth: 1280,
            minHeight: 720,
            maxHeight: 720,
            minFrameRate: 30,
            minAspectRatio: 1.77
        },
        optional: [{
            facingMode: <span style="color:#00a33f">'user'</span> <span style="color:#919191">// or "application"</span>
        }]
    }
};

<span style="color:#ff5600">if</span> (DetectRTC.browser.<span style="color:#a535ae">name</span> <span style="color:#ff5600">===</span> <span style="color:#00a33f">'Firefox'</span>) {
    connection.mediaConstraints <span style="color:#ff5600">=</span> {
        audio: <span style="color:#a535ae">true</span>,
        video: {
            width: 1280,
            height: 720,
            frameRate: 30,
            aspectRatio: 1.77,
            facingMode: <span style="color:#00a33f">'user'</span> <span style="color:#919191">// or "application"</span>
        }
    };
}

connection.openOrJoin(<span style="color:#00a33f">'your-room-id'</span>);
<span style="color:#ff5600">&lt;</span>/script<span style="color:#ff5600">></span>
</pre>
  </section>

{% endcapture %}
{% include html_snippet.html html=html %}
