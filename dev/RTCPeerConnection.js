// RTCPeerConnection.js

var defaults = {};

function setSdpConstraints(config) {
    var sdpConstraints;

    var sdpConstraints_mandatory = {
        OfferToReceiveAudio: !!config.OfferToReceiveAudio,
        OfferToReceiveVideo: !!config.OfferToReceiveVideo
    };

    sdpConstraints = {
        mandatory: sdpConstraints_mandatory,
        optional: [{
            VoiceActivityDetection: false
        }]
    };

    if (!!navigator.mozGetUserMedia && firefoxVersion > 34) {
        sdpConstraints = {
            OfferToReceiveAudio: !!config.OfferToReceiveAudio,
            OfferToReceiveVideo: !!config.OfferToReceiveVideo
        };
    }

    return sdpConstraints;
}

var RTCPeerConnection;
if (typeof mozRTCPeerConnection !== 'undefined') {
    RTCPeerConnection = mozRTCPeerConnection;
} else if (typeof webkitRTCPeerConnection !== 'undefined') {
    RTCPeerConnection = webkitRTCPeerConnection;
} else if (typeof window.RTCPeerConnection !== 'undefined') {
    RTCPeerConnection = window.RTCPeerConnection;
} else {
    console.error('WebRTC 1.0 (RTCPeerConnection) API are NOT available in this browser.');
    RTCPeerConnection = window.RTCSessionDescription = window.RTCIceCandidate = function() {};
}

var RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
var RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate;
var MediaStreamTrack = window.MediaStreamTrack;

var Plugin = {};

function onPluginRTCInitialized(pluginRTCObject) {
    Plugin = pluginRTCObject;
    MediaStreamTrack = Plugin.MediaStreamTrack;
    RTCPeerConnection = Plugin.RTCPeerConnection;
    RTCIceCandidate = Plugin.RTCIceCandidate;
    RTCSessionDescription = Plugin.RTCSessionDescription;
}
if (typeof PluginRTC !== 'undefined') onPluginRTCInitialized(PluginRTC);

var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
var isIE = !!document.documentMode;
var isPluginRTC = isSafari || isIE;

function PeerInitiator(config) {
    var connection = config.rtcMultiConnection;

    this.extra = config.remoteSdp ? config.remoteSdp.extra : connection.extra;
    this.remoteUserId = config.remoteUserId;
    this.streams = [];
    this.channels = [];
    this.connectionDescription = config.connectionDescription;

    var that = this;

    if (config.remoteSdp) {
        this.connectionDescription = config.remoteSdp.connectionDescription;
    }

    var allRemoteStreams = {};

    if (Object.observe) {
        var that = this;
        Object.observe(this.channels, function(changes) {
            changes.forEach(function(change) {
                if (change.type === 'add') {
                    change.object[change.name].addEventListener('close', function() {
                        delete that.channels[that.channels.indexOf(change.object[change.name])];
                        that.channels = removeNullEntries(that.channels);
                    }, false);
                }
                if (change.type === 'remove' || change.type === 'delete') {
                    if (that.channels.indexOf(change.object[change.name]) !== -1) {
                        delete that.channels.indexOf(change.object[change.name]);
                    }
                }

                that.channels = removeNullEntries(that.channels);
            });
        });
    }

    defaults.sdpConstraints = setSdpConstraints({
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
    });

    var peer;

    var renegotiatingPeer = !!config.renegotiatingPeer;
    if (config.remoteSdp) {
        renegotiatingPeer = !!config.remoteSdp.renegotiatingPeer;
    }

    var localStreams = [];
    config.localStreams.forEach(function(stream) {
        if (!!stream) localStreams.push(stream);
    });

    if (!renegotiatingPeer) {
        peer = new RTCPeerConnection(navigator.onLine ? {
            iceServers: config.iceServers,
            iceTransports: 'all'
        } : null, config.optionalArgument);
    } else {
        peer = config.peerRef;

        peer.getLocalStreams().forEach(function(stream) {
            localStreams.forEach(function(localStream, index) {
                if (stream == localStream) {
                    delete localStreams[index];
                }
            });

            config.removeStreams.forEach(function(streamToRemove, index) {
                if (stream === streamToRemove) {
                    stream = config.beforeRemovingStream(stream);
                    if (stream && !!peer.removeStream) {
                        peer.removeStream(stream);
                    }

                    localStreams.forEach(function(localStream, index) {
                        if (streamToRemove == localStream) {
                            delete localStreams[index];
                        }
                    });
                }
            });
        });
    }

    if (connection.DetectRTC.browser.name === 'Firefox') {
        peer.removeStream = function(stream) {
            stream.mute();
            connection.StreamsHandler.onSyncNeeded(stream.streamid, 'stream-removed');
        };
    }

    peer.onicecandidate = function(event) {
        if (!event.candidate) return;
        config.onLocalCandidate({
            candidate: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid,
            sdpMLineIndex: event.candidate.sdpMLineIndex
        });
    };

    var isFirefoxOffered = !isFirefox;
    if (config.remoteSdp && config.remoteSdp.remotePeerSdpConstraints && config.remoteSdp.remotePeerSdpConstraints.isFirefoxOffered) {
        isFirefoxOffered = true;
    }

    localStreams.forEach(function(localStream) {
        if (config.remoteSdp && config.remoteSdp.remotePeerSdpConstraints && config.remoteSdp.remotePeerSdpConstraints.dontGetRemoteStream) {
            return;
        }

        if (config.dontAttachLocalStream) {
            return;
        }

        localStream = config.beforeAddingStream(localStream);
        if (localStream) {
            peer.addStream(localStream);
        }
    });

    peer.oniceconnectionstatechange = peer.onsignalingstatechange = function() {
        var extra = that.extra;
        if (connection.peers[that.remoteUserId]) {
            extra = connection.peers[that.remoteUserId].extra || extra;
        }

        if (!peer) {
            that.removeAllRemoteStreams();
            return;
        }

        if (peer.iceConnectionState.search(/closed|failed/gi) !== -1) {
            if (peer.firedOnce) return;
            peer.firedOnce = true;

            that.removeAllRemoteStreams();
            if (that.connectionDescription && connection.userid == that.connectionDescription.sender && !!connection.autoReDialOnFailure) {
                if (connection.isInitiator) return;
                setTimeout(function() {
                    connection.rejoin(that.connectionDescription);
                    if (peer) {
                        peer.firedOnce = false;
                    }
                }, 5000);
            }
        }

        config.onPeerStateChanged({
            iceConnectionState: peer.iceConnectionState,
            iceGatheringState: peer.iceGatheringState,
            signalingState: peer.signalingState,
            extra: extra,
            userid: that.remoteUserId
        });
    };

    var sdpConstraints = {
        OfferToReceiveAudio: !!localStreams.length,
        OfferToReceiveVideo: !!localStreams.length
    };

    if (config.localPeerSdpConstraints) sdpConstraints = config.localPeerSdpConstraints;

    defaults.sdpConstraints = setSdpConstraints(sdpConstraints);

    peer.onaddstream = function(event) {
        var streamsToShare = {};
        if (config.remoteSdp && config.remoteSdp.streamsToShare) {
            streamsToShare = config.remoteSdp.streamsToShare;
        } else if (config.streamsToShare) {
            streamsToShare = config.streamsToShare;
        }

        var streamToShare = streamsToShare[event.stream.id];
        if (streamToShare) {
            event.stream.isAudio = streamToShare.isAudio;
            event.stream.isVideo = streamToShare.isVideo;
            event.stream.isScreen = streamToShare.isScreen;
        }

        event.stream.streamid = event.stream.id;
        if (!event.stream.stop) {
            event.stream.stop = function() {
                fireEvent(event.stream, 'ended', event);
            };
        }
        allRemoteStreams[event.stream.id] = event.stream;
        config.onRemoteStream(event.stream);
    };

    peer.onremovestream = function(event) {
        event.stream.streamid = event.stream.id;

        if (allRemoteStreams[event.stream.id]) {
            delete allRemoteStreams[event.stream.id];
        }

        config.onRemoteStreamRemoved(event.stream);
    };

    this.addRemoteCandidate = function(remoteCandidate) {
        peer.addIceCandidate(new RTCIceCandidate(remoteCandidate));
    };

    this.addRemoteSdp = function(remoteSdp) {
        peer.setRemoteDescription(new RTCSessionDescription(remoteSdp), function() {}, function(error) {
            if (!!connection.enableLogs) {
                console.error(JSON.stringify(error, null, '\t'));
            }

            if (!!connection.autoReDialOnFailure) {
                setTimeout(function() {
                    connection.rejoin(that.connectionDescription);
                }, 2000);
            }
        });
    };

    var isOfferer = true;

    if (config.remoteSdp) {
        isOfferer = false;
    }

    if (config.enableDataChannels === true) {
        createDataChannel();
    }

    if (config.remoteSdp) {
        if (config.remoteSdp.remotePeerSdpConstraints) {
            sdpConstraints = config.remoteSdp.remotePeerSdpConstraints;
        }
        defaults.sdpConstraints = setSdpConstraints(sdpConstraints);
        this.addRemoteSdp(config.remoteSdp);
    }

    function createDataChannel() {
        if (!isOfferer) {
            peer.ondatachannel = function(event) {
                var channel = event.channel;
                setChannelEvents(channel);
            };
            return;
        }

        var channel = peer.createDataChannel('RTCDataChannel', {});
        setChannelEvents(channel);
    }

    function setChannelEvents(channel) {
        // force ArrayBuffer in Firefox; which uses "Blob" by default.
        channel.binaryType = 'arraybuffer';

        channel.onmessage = function(event) {
            config.onDataChannelMessage(event.data);
        };

        channel.onopen = function() {
            config.onDataChannelOpened(channel);
        };

        channel.onerror = function(error) {
            config.onDataChannelError(error);
        };

        channel.onclose = function(event) {
            config.onDataChannelClosed(event);
        };

        channel.internalSend = channel.send;
        channel.send = function(data) {
            if (channel.readyState !== 'open') {
                return;
            }

            channel.internalSend(data);
        };

        peer.channel = channel;
    }

    if (config.session.audio == 'two-way' || config.session.video == 'two-way' || config.session.screen == 'two-way') {
        defaults.sdpConstraints = setSdpConstraints({
            OfferToReceiveAudio: config.session.audio == 'two-way' || (config.remoteSdp && config.remoteSdp.remotePeerSdpConstraints && config.remoteSdp.remotePeerSdpConstraints.OfferToReceiveAudio),
            OfferToReceiveVideo: config.session.video == 'two-way' || config.session.screen == 'two-way' || (config.remoteSdp && config.remoteSdp.remotePeerSdpConstraints && config.remoteSdp.remotePeerSdpConstraints.OfferToReceiveAudio)
        });
    }

    var streamsToShare = {};
    peer.getLocalStreams().forEach(function(stream) {
        streamsToShare[stream.streamid] = {
            isAudio: !!stream.isAudio,
            isVideo: !!stream.isVideo,
            isScreen: !!stream.isScreen
        };
    });

    peer[isOfferer ? 'createOffer' : 'createAnswer'](function(localSdp) {
        localSdp.sdp = config.processSdp(localSdp.sdp);
        peer.setLocalDescription(localSdp);
        config.onLocalSdp({
            type: localSdp.type,
            sdp: localSdp.sdp,
            remotePeerSdpConstraints: config.remotePeerSdpConstraints || false,
            renegotiatingPeer: !!config.renegotiatingPeer || false,
            connectionDescription: that.connectionDescription,
            dontGetRemoteStream: !!config.dontGetRemoteStream,
            extra: connection ? connection.extra : {},
            streamsToShare: streamsToShare,
            isFirefoxOffered: isFirefox
        });
    }, function(error) {
        if (!!connection.enableLogs) {
            console.error('sdp-error', error);
        }

        if (!connection.autoReDialOnFailure || !connection.isInitiator || !isFirefox || !isFirefoxOffered) return;

        setTimeout(function() {
            connection.rejoin(that.connectionDescription);
        }, 5000);
    }, defaults.sdpConstraints);

    peer.nativeClose = peer.close;
    peer.close = function() {
        if (!peer) {
            that.removeAllRemoteStreams();
            return;
        }

        connection.multiPeersHandler.onNegotiationNeeded({
            userLeft: true,
            autoCloseEntireSession: !!connection.autoCloseEntireSession
        }, that.remoteUserId);

        try {
            if (peer.iceConnectionState.search(/closed|failed/gi) === -1) {
                peer.getRemoteStreams().forEach(function(stream) {
                    stream.stop();
                });
            }
            peer.nativeClose();
        } catch (e) {}

        peer = null;
    };

    this.removeAllRemoteStreams = function() {
        for (var id in allRemoteStreams) {
            config.onRemoteStreamRemoved(allRemoteStreams[id]);
        }
        allRemoteStreams = {};

        that.streams.forEach(function(stream) {
            stream.stop();
        });
        that.streams = [];
    }

    this.peer = peer;
}
