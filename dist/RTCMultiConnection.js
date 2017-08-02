'use strict';

// Last time updated: 2017-08-02 5:29:59 AM UTC

// _________________________
// RTCMultiConnection v3.4.4

// Open-Sourced: https://github.com/muaz-khan/RTCMultiConnection

// --------------------------------------------------
// Muaz Khan     - www.MuazKhan.com
// MIT License   - www.WebRTC-Experiment.com/licence
// --------------------------------------------------

window.RTCMultiConnection = function(roomid, forceOptions) {

    function SocketConnection(connection, connectCallback) {
        var parameters = '';

        parameters += '?userid=' + connection.userid;
        parameters += '&sessionid=' + connection.sessionid;
        parameters += '&msgEvent=' + connection.socketMessageEvent;
        parameters += '&socketCustomEvent=' + connection.socketCustomEvent;
        parameters += '&autoCloseEntireSession=' + !!connection.autoCloseEntireSession;

        parameters += '&maxParticipantsAllowed=' + connection.maxParticipantsAllowed;

        if (connection.enableScalableBroadcast) {
            parameters += '&enableScalableBroadcast=true';
            parameters += '&maxRelayLimitPerUser=' + (connection.maxRelayLimitPerUser || 2);
        }

        if (connection.socketCustomParameters) {
            parameters += connection.socketCustomParameters;
        }

        try {
            io.sockets = {};
        } catch (e) {};

        if (!connection.socketURL) {
            connection.socketURL = '/';
        }

        if (connection.socketURL.substr(connection.socketURL.length - 1, 1) != '/') {
            // connection.socketURL = 'https://domain.com:9001/';
            throw '"socketURL" MUST end with a slash.';
        }

        if (connection.enableLogs) {
            if (connection.socketURL == '/') {
                console.info('socket.io is connected at: ', location.origin + '/');
            } else {
                console.info('socket.io is connected at: ', connection.socketURL);
            }
        }

        try {
            connection.socket = io(connection.socketURL + parameters);
        } catch (e) {
            connection.socket = io.connect(connection.socketURL + parameters, connection.socketOptions);
        }

        // detect signaling medium
        connection.socket.isIO = true;

        var mPeer = connection.multiPeersHandler;

        connection.socket.on('extra-data-updated', function(remoteUserId, extra) {
            if (!connection.peers[remoteUserId]) return;
            connection.peers[remoteUserId].extra = extra;

            connection.onExtraDataUpdated({
                userid: remoteUserId,
                extra: extra
            });

            if (!connection.peersBackup[remoteUserId]) {
                connection.peersBackup[remoteUserId] = {
                    userid: remoteUserId,
                    extra: {}
                };
            }

            connection.peersBackup[remoteUserId].extra = extra;
        });

        connection.socket.on(connection.socketMessageEvent, function(message) {
            if (message.remoteUserId != connection.userid) return;

            if (connection.peers[message.sender] && connection.peers[message.sender].extra != message.message.extra) {
                connection.peers[message.sender].extra = message.extra;
                connection.onExtraDataUpdated({
                    userid: message.sender,
                    extra: message.extra
                });
            }

            if (message.message.streamSyncNeeded && connection.peers[message.sender]) {
                var stream = connection.streamEvents[message.message.streamid];
                if (!stream || !stream.stream) {
                    return;
                }

                var action = message.message.action;

                if (action === 'ended' || action === 'inactive' || action === 'stream-removed') {
                    if (connection.peersBackup[stream.userid]) {
                        stream.extra = connection.peersBackup[stream.userid].extra;
                    }
                    connection.onstreamended(stream);
                    return;
                }

                var type = message.message.type != 'both' ? message.message.type : null;

                if (typeof stream.stream[action] == 'function') {
                    stream.stream[action](type);
                }
                return;
            }

            if (message.message === 'connectWithAllParticipants') {
                if (connection.broadcasters.indexOf(message.sender) === -1) {
                    connection.broadcasters.push(message.sender);
                }

                mPeer.onNegotiationNeeded({
                    allParticipants: connection.getAllParticipants(message.sender)
                }, message.sender);
                return;
            }

            if (message.message === 'removeFromBroadcastersList') {
                if (connection.broadcasters.indexOf(message.sender) !== -1) {
                    delete connection.broadcasters[connection.broadcasters.indexOf(message.sender)];
                    connection.broadcasters = removeNullEntries(connection.broadcasters);
                }
                return;
            }

            if (message.message === 'dropPeerConnection') {
                connection.deletePeer(message.sender);
                return;
            }

            if (message.message.allParticipants) {
                if (message.message.allParticipants.indexOf(message.sender) === -1) {
                    message.message.allParticipants.push(message.sender);
                }

                message.message.allParticipants.forEach(function(participant) {
                    mPeer[!connection.peers[participant] ? 'createNewPeer' : 'renegotiatePeer'](participant, {
                        localPeerSdpConstraints: {
                            OfferToReceiveAudio: connection.sdpConstraints.mandatory.OfferToReceiveAudio,
                            OfferToReceiveVideo: connection.sdpConstraints.mandatory.OfferToReceiveVideo
                        },
                        remotePeerSdpConstraints: {
                            OfferToReceiveAudio: connection.session.oneway ? !!connection.session.audio : connection.sdpConstraints.mandatory.OfferToReceiveAudio,
                            OfferToReceiveVideo: connection.session.oneway ? !!connection.session.video || !!connection.session.screen : connection.sdpConstraints.mandatory.OfferToReceiveVideo
                        },
                        isOneWay: !!connection.session.oneway || connection.direction === 'one-way',
                        isDataOnly: isData(connection.session)
                    });
                });
                return;
            }

            if (message.message.newParticipant) {
                if (message.message.newParticipant == connection.userid) return;
                if (!!connection.peers[message.message.newParticipant]) return;

                mPeer.createNewPeer(message.message.newParticipant, message.message.userPreferences || {
                    localPeerSdpConstraints: {
                        OfferToReceiveAudio: connection.sdpConstraints.mandatory.OfferToReceiveAudio,
                        OfferToReceiveVideo: connection.sdpConstraints.mandatory.OfferToReceiveVideo
                    },
                    remotePeerSdpConstraints: {
                        OfferToReceiveAudio: connection.session.oneway ? !!connection.session.audio : connection.sdpConstraints.mandatory.OfferToReceiveAudio,
                        OfferToReceiveVideo: connection.session.oneway ? !!connection.session.video || !!connection.session.screen : connection.sdpConstraints.mandatory.OfferToReceiveVideo
                    },
                    isOneWay: !!connection.session.oneway || connection.direction === 'one-way',
                    isDataOnly: isData(connection.session)
                });
                return;
            }

            if (message.message.readyForOffer || message.message.addMeAsBroadcaster) {
                connection.addNewBroadcaster(message.sender);
            }

            if (message.message.newParticipationRequest && message.sender !== connection.userid) {
                if (connection.peers[message.sender]) {
                    connection.deletePeer(message.sender);
                }

                var userPreferences = {
                    extra: message.extra || {},
                    localPeerSdpConstraints: message.message.remotePeerSdpConstraints || {
                        OfferToReceiveAudio: connection.sdpConstraints.mandatory.OfferToReceiveAudio,
                        OfferToReceiveVideo: connection.sdpConstraints.mandatory.OfferToReceiveVideo
                    },
                    remotePeerSdpConstraints: message.message.localPeerSdpConstraints || {
                        OfferToReceiveAudio: connection.session.oneway ? !!connection.session.audio : connection.sdpConstraints.mandatory.OfferToReceiveAudio,
                        OfferToReceiveVideo: connection.session.oneway ? !!connection.session.video || !!connection.session.screen : connection.sdpConstraints.mandatory.OfferToReceiveVideo
                    },
                    isOneWay: typeof message.message.isOneWay !== 'undefined' ? message.message.isOneWay : !!connection.session.oneway || connection.direction === 'one-way',
                    isDataOnly: typeof message.message.isDataOnly !== 'undefined' ? message.message.isDataOnly : isData(connection.session),
                    dontGetRemoteStream: typeof message.message.isOneWay !== 'undefined' ? message.message.isOneWay : !!connection.session.oneway || connection.direction === 'one-way',
                    dontAttachLocalStream: !!message.message.dontGetRemoteStream,
                    connectionDescription: message,
                    successCallback: function() {
                        // if its oneway----- todo: THIS SEEMS NOT IMPORTANT.
                        if (typeof message.message.isOneWay !== 'undefined' ? message.message.isOneWay : !!connection.session.oneway || connection.direction === 'one-way') {
                            connection.addNewBroadcaster(message.sender, userPreferences);
                        }

                        if (!!connection.session.oneway || connection.direction === 'one-way' || isData(connection.session)) {
                            connection.addNewBroadcaster(message.sender, userPreferences);
                        }
                    }
                };

                connection.onNewParticipant(message.sender, userPreferences);
                return;
            }

            if (message.message.shiftedModerationControl) {
                connection.onShiftedModerationControl(message.sender, message.message.broadcasters);
                return;
            }

            if (message.message.changedUUID) {
                if (connection.peers[message.message.oldUUID]) {
                    connection.peers[message.message.newUUID] = connection.peers[message.message.oldUUID];
                    delete connection.peers[message.message.oldUUID];
                }
            }

            if (message.message.userLeft) {
                mPeer.onUserLeft(message.sender);

                if (!!message.message.autoCloseEntireSession) {
                    connection.leave();
                }

                return;
            }

            mPeer.addNegotiatedMessage(message.message, message.sender);
        });

        connection.socket.on('user-left', function(userid) {
            onUserLeft(userid);

            connection.onUserStatusChanged({
                userid: userid,
                status: 'offline',
                extra: connection.peers[userid] ? connection.peers[userid].extra || {} : {}
            });

            var eventObject = {
                userid: userid,
                extra: {}
            };

            if (connection.peersBackup[eventObject.userid]) {
                eventObject.extra = connection.peersBackup[eventObject.userid].extra;
            }

            connection.onleave(eventObject);
        });

        var alreadyConnected = false;

        connection.socket.resetProps = function() {
            alreadyConnected = false;
        };

        connection.socket.on('connect', function() {
            if (alreadyConnected) {
                return;
            }
            alreadyConnected = true;

            if (connection.enableLogs) {
                console.info('socket.io connection is opened.');
            }

            setTimeout(function() {
                connection.socket.emit('extra-data-updated', connection.extra);

                if (connectCallback) {
                    connectCallback(connection.socket);
                }
            }, 1000);
        });

        connection.socket.on('disconnect', function() {
            if (connection.enableLogs) {
                console.warn('socket.io connection is closed');
            }
        });

        connection.socket.on('join-with-password', function(remoteUserId) {
            connection.onJoinWithPassword(remoteUserId);
        });

        connection.socket.on('invalid-password', function(remoteUserId, oldPassword) {
            connection.onInvalidPassword(remoteUserId, oldPassword);
        });

        connection.socket.on('password-max-tries-over', function(remoteUserId) {
            connection.onPasswordMaxTriesOver(remoteUserId);
        });

        connection.socket.on('user-disconnected', function(remoteUserId) {
            if (remoteUserId === connection.userid) {
                return;
            }

            connection.onUserStatusChanged({
                userid: remoteUserId,
                status: 'offline',
                extra: connection.peers[remoteUserId] ? connection.peers[remoteUserId].extra || {} : {}
            });

            connection.deletePeer(remoteUserId);
        });

        connection.socket.on('user-connected', function(userid) {
            if (userid === connection.userid) {
                return;
            }

            connection.onUserStatusChanged({
                userid: userid,
                status: 'online',
                extra: connection.peers[userid] ? connection.peers[userid].extra || {} : {}
            });
        });

        connection.socket.on('closed-entire-session', function(sessionid, extra) {
            connection.leave();
            connection.onEntireSessionClosed({
                sessionid: sessionid,
                userid: sessionid,
                extra: extra
            });
        });

        connection.socket.on('userid-already-taken', function(useridAlreadyTaken, yourNewUserId) {
            connection.isInitiator = false;
            connection.userid = yourNewUserId;

            connection.onUserIdAlreadyTaken(useridAlreadyTaken, yourNewUserId);
        })

        connection.socket.on('logs', function(log) {
            if (!connection.enableLogs) return;
            console.debug('server-logs', log);
        });

        connection.socket.on('number-of-broadcast-viewers-updated', function(data) {
            connection.onNumberOfBroadcastViewersUpdated(data);
        });

        connection.socket.on('room-full', function(roomid) {
            connection.onRoomFull(roomid);
        });

        connection.socket.on('become-next-modrator', function(sessionid) {
            if (sessionid != connection.sessionid) return;
            setTimeout(function() {
                connection.open(sessionid);
                connection.socket.emit('shift-moderator-control-on-disconnect');
            }, 1000);
        });
    }

    function MultiPeers(connection) {
        var self = this;

        var skipPeers = ['getAllParticipants', 'getLength', 'selectFirst', 'streams', 'send', 'forEach'];
        connection.peersBackup = {};
        connection.peers = {
            getLength: function() {
                var numberOfPeers = 0;
                for (var peer in this) {
                    if (skipPeers.indexOf(peer) == -1) {
                        numberOfPeers++;
                    }
                }
                return numberOfPeers;
            },
            selectFirst: function() {
                var firstPeer;
                for (var peer in this) {
                    if (skipPeers.indexOf(peer) == -1) {
                        firstPeer = this[peer];
                    }
                }
                return firstPeer;
            },
            getAllParticipants: function(sender) {
                var allPeers = [];
                for (var peer in this) {
                    if (skipPeers.indexOf(peer) == -1 && peer != sender) {
                        allPeers.push(peer);
                    }
                }
                return allPeers;
            },
            forEach: function(callbcak) {
                this.getAllParticipants().forEach(function(participant) {
                    callbcak(connection.peers[participant]);
                });
            },
            send: function(data, remoteUserId) {
                var that = this;

                if (!isNull(data.size) && !isNull(data.type)) {
                    self.shareFile(data, remoteUserId);
                    return;
                }

                if (data.type !== 'text' && !(data instanceof ArrayBuffer) && !(data instanceof DataView)) {
                    TextSender.send({
                        text: data,
                        channel: this,
                        connection: connection,
                        remoteUserId: remoteUserId
                    });
                    return;
                }

                if (data.type === 'text') {
                    data = JSON.stringify(data);
                }

                if (remoteUserId) {
                    var remoteUser = connection.peers[remoteUserId];
                    if (remoteUser) {
                        if (!remoteUser.channels.length) {
                            connection.peers[remoteUserId].createDataChannel();
                            connection.renegotiate(remoteUserId);
                            setTimeout(function() {
                                that.send(data, remoteUserId);
                            }, 3000);
                            return;
                        }

                        remoteUser.channels.forEach(function(channel) {
                            channel.send(data);
                        });
                        return;
                    }
                }

                this.getAllParticipants().forEach(function(participant) {
                    if (!that[participant].channels.length) {
                        connection.peers[participant].createDataChannel();
                        connection.renegotiate(participant);
                        setTimeout(function() {
                            that[participant].channels.forEach(function(channel) {
                                channel.send(data);
                            });
                        }, 3000);
                        return;
                    }

                    that[participant].channels.forEach(function(channel) {
                        channel.send(data);
                    });
                });
            }
        };

        this.uuid = connection.userid;

        this.getLocalConfig = function(remoteSdp, remoteUserId, userPreferences) {
            if (!userPreferences) {
                userPreferences = {};
            }

            return {
                streamsToShare: userPreferences.streamsToShare || {},
                rtcMultiConnection: connection,
                connectionDescription: userPreferences.connectionDescription,
                userid: remoteUserId,
                localPeerSdpConstraints: userPreferences.localPeerSdpConstraints,
                remotePeerSdpConstraints: userPreferences.remotePeerSdpConstraints,
                dontGetRemoteStream: !!userPreferences.dontGetRemoteStream,
                dontAttachLocalStream: !!userPreferences.dontAttachLocalStream,
                renegotiatingPeer: !!userPreferences.renegotiatingPeer,
                peerRef: userPreferences.peerRef,
                channels: userPreferences.channels || [],
                onLocalSdp: function(localSdp) {
                    self.onNegotiationNeeded(localSdp, remoteUserId);
                },
                onLocalCandidate: function(localCandidate) {
                    localCandidate = OnIceCandidateHandler.processCandidates(connection, localCandidate)
                    if (localCandidate) {
                        self.onNegotiationNeeded(localCandidate, remoteUserId);
                    }
                },
                remoteSdp: remoteSdp,
                onDataChannelMessage: function(message) {
                    if (!connection.fbr && connection.enableFileSharing) initFileBufferReader();

                    if (typeof message == 'string' || !connection.enableFileSharing) {
                        self.onDataChannelMessage(message, remoteUserId);
                        return;
                    }

                    var that = this;

                    if (message instanceof ArrayBuffer || message instanceof DataView) {
                        connection.fbr.convertToObject(message, function(object) {
                            that.onDataChannelMessage(object);
                        });
                        return;
                    }

                    if (message.readyForNextChunk) {
                        connection.fbr.getNextChunk(message, function(nextChunk, isLastChunk) {
                            connection.peers[remoteUserId].channels.forEach(function(channel) {
                                channel.send(nextChunk);
                            });
                        }, remoteUserId);
                        return;
                    }

                    if (message.chunkMissing) {
                        connection.fbr.chunkMissing(message);
                        return;
                    }

                    connection.fbr.addChunk(message, function(promptNextChunk) {
                        connection.peers[remoteUserId].peer.channel.send(promptNextChunk);
                    });
                },
                onDataChannelError: function(error) {
                    self.onDataChannelError(error, remoteUserId);
                },
                onDataChannelOpened: function(channel) {
                    self.onDataChannelOpened(channel, remoteUserId);
                },
                onDataChannelClosed: function(event) {
                    self.onDataChannelClosed(event, remoteUserId);
                },
                onRemoteStream: function(stream) {
                    if (connection.peers[remoteUserId]) {
                        connection.peers[remoteUserId].streams.push(stream);
                    }

                    self.onGettingRemoteMedia(stream, remoteUserId);
                },
                onRemoteStreamRemoved: function(stream) {
                    self.onRemovingRemoteMedia(stream, remoteUserId);
                },
                onPeerStateChanged: function(states) {
                    self.onPeerStateChanged(states);

                    if (states.iceConnectionState === 'new') {
                        self.onNegotiationStarted(remoteUserId, states);
                    }

                    if (states.iceConnectionState === 'connected') {
                        self.onNegotiationCompleted(remoteUserId, states);
                    }

                    if (states.iceConnectionState.search(/closed|failed/gi) !== -1) {
                        self.onUserLeft(remoteUserId);
                        self.disconnectWith(remoteUserId);
                    }
                }
            };
        };

        this.createNewPeer = function(remoteUserId, userPreferences) {
            if (connection.maxParticipantsAllowed <= connection.getAllParticipants().length) {
                return;
            }

            userPreferences = userPreferences || {};

            if (connection.isInitiator && !!connection.session.audio && connection.session.audio === 'two-way' && !userPreferences.streamsToShare) {
                userPreferences.isOneWay = false;
                userPreferences.isDataOnly = false;
                userPreferences.session = connection.session;
            }

            if (!userPreferences.isOneWay && !userPreferences.isDataOnly) {
                userPreferences.isOneWay = true;
                this.onNegotiationNeeded({
                    enableMedia: true,
                    userPreferences: userPreferences
                }, remoteUserId);
                return;
            }

            userPreferences = connection.setUserPreferences(userPreferences, remoteUserId);
            var localConfig = this.getLocalConfig(null, remoteUserId, userPreferences);
            connection.peers[remoteUserId] = new PeerInitiator(localConfig);
        };

        this.createAnsweringPeer = function(remoteSdp, remoteUserId, userPreferences) {
            userPreferences = connection.setUserPreferences(userPreferences || {}, remoteUserId);

            var localConfig = this.getLocalConfig(remoteSdp, remoteUserId, userPreferences);
            connection.peers[remoteUserId] = new PeerInitiator(localConfig);
        };

        this.renegotiatePeer = function(remoteUserId, userPreferences, remoteSdp) {
            if (!connection.peers[remoteUserId]) {
                if (connection.enableLogs) {
                    console.error('This peer (' + remoteUserId + ') does not exist. Renegotiation skipped.');
                }
                return;
            }

            if (!userPreferences) {
                userPreferences = {};
            }

            userPreferences.renegotiatingPeer = true;
            userPreferences.peerRef = connection.peers[remoteUserId].peer;
            userPreferences.channels = connection.peers[remoteUserId].channels;

            var localConfig = this.getLocalConfig(remoteSdp, remoteUserId, userPreferences);

            connection.peers[remoteUserId] = new PeerInitiator(localConfig);
        };

        this.replaceTrack = function(track, remoteUserId, isVideoTrack) {
            if (!connection.peers[remoteUserId]) {
                throw 'This peer (' + remoteUserId + ') does not exist.';
            }

            var peer = connection.peers[remoteUserId].peer;

            if (!!peer.getSenders && typeof peer.getSenders === 'function' && peer.getSenders().length) {
                peer.getSenders().forEach(function(rtpSender) {
                    if (isVideoTrack && rtpSender.track instanceof VideoStreamTrack) {
                        connection.peers[remoteUserId].peer.lastVideoTrack = rtpSender.track;
                        rtpSender.replaceTrack(track);
                    }

                    if (!isVideoTrack && rtpSender.track instanceof AudioStreamTrack) {
                        connection.peers[remoteUserId].peer.lastAudioTrack = rtpSender.track;
                        rtpSender.replaceTrack(track);
                    }
                });
                return;
            }

            console.warn('RTPSender.replaceTrack is NOT supported.');
            this.renegotiatePeer(remoteUserId);
        };

        this.onNegotiationNeeded = function(message, remoteUserId) {};
        this.addNegotiatedMessage = function(message, remoteUserId) {
            if (message.type && message.sdp) {
                if (message.type == 'answer') {
                    if (connection.peers[remoteUserId]) {
                        connection.peers[remoteUserId].addRemoteSdp(message);
                    }
                }

                if (message.type == 'offer') {
                    if (message.renegotiatingPeer) {
                        this.renegotiatePeer(remoteUserId, null, message);
                    } else {
                        this.createAnsweringPeer(message, remoteUserId);
                    }
                }

                if (connection.enableLogs) {
                    console.log('Remote peer\'s sdp:', message.sdp);
                }
                return;
            }

            if (message.candidate) {
                if (connection.peers[remoteUserId]) {
                    connection.peers[remoteUserId].addRemoteCandidate(message);
                }

                if (connection.enableLogs) {
                    console.log('Remote peer\'s candidate pairs:', message.candidate);
                }
                return;
            }

            if (message.enableMedia) {
                connection.session = message.userPreferences.session || connection.session;

                if (connection.session.oneway && connection.attachStreams.length) {
                    connection.attachStreams = [];
                }

                if (message.userPreferences.isDataOnly && connection.attachStreams.length) {
                    connection.attachStreams.length = [];
                }

                var streamsToShare = {};
                connection.attachStreams.forEach(function(stream) {
                    streamsToShare[stream.streamid] = {
                        isAudio: !!stream.isAudio,
                        isVideo: !!stream.isVideo,
                        isScreen: !!stream.isScreen
                    };
                });
                message.userPreferences.streamsToShare = streamsToShare;

                self.onNegotiationNeeded({
                    readyForOffer: true,
                    userPreferences: message.userPreferences
                }, remoteUserId);
            }

            if (message.readyForOffer) {
                connection.onReadyForOffer(remoteUserId, message.userPreferences);
            }

            function cb(stream) {
                gumCallback(stream, message, remoteUserId);
            }
        };

        function gumCallback(stream, message, remoteUserId) {
            var streamsToShare = {};
            connection.attachStreams.forEach(function(stream) {
                streamsToShare[stream.streamid] = {
                    isAudio: !!stream.isAudio,
                    isVideo: !!stream.isVideo,
                    isScreen: !!stream.isScreen
                };
            });
            message.userPreferences.streamsToShare = streamsToShare;

            self.onNegotiationNeeded({
                readyForOffer: true,
                userPreferences: message.userPreferences
            }, remoteUserId);
        }

        this.connectNewParticipantWithAllBroadcasters = function(newParticipantId, userPreferences, broadcastersList) {
            if (connection.socket.isIO) {
                return;
            }

            broadcastersList = (broadcastersList || '').split('|-,-|');

            if (!broadcastersList.length) {
                return;
            }

            var firstBroadcaster;

            var remainingBroadcasters = [];
            broadcastersList.forEach(function(list) {
                list = (list || '').replace(/ /g, '');
                if (list.length) {
                    if (!firstBroadcaster) {
                        firstBroadcaster = list;
                    } else {
                        remainingBroadcasters.push(list);
                    }
                }
            });

            if (!firstBroadcaster) {
                return;
            }

            self.onNegotiationNeeded({
                newParticipant: newParticipantId,
                userPreferences: userPreferences || false
            }, firstBroadcaster);

            if (!remainingBroadcasters.length) {
                return;
            }

            setTimeout(function() {
                self.connectNewParticipantWithAllBroadcasters(newParticipantId, userPreferences, remainingBroadcasters.join('|-,-|'));
            }, 3 * 1000);
        };

        this.onGettingRemoteMedia = function(stream, remoteUserId) {};
        this.onRemovingRemoteMedia = function(stream, remoteUserId) {};
        this.onGettingLocalMedia = function(localStream) {};
        this.onLocalMediaError = function(error, constraints) {
            connection.onMediaError(error, constraints);
        };

        function initFileBufferReader() {
            connection.fbr = new FileBufferReader();
            connection.fbr.onProgress = function(chunk) {
                connection.onFileProgress(chunk);
            };
            connection.fbr.onBegin = function(file) {
                connection.onFileStart(file);
            };
            connection.fbr.onEnd = function(file) {
                connection.onFileEnd(file);
            };
        }

        this.shareFile = function(file, remoteUserId) {
            if (!connection.enableFileSharing) {
                throw '"connection.enableFileSharing" is false.';
            }

            initFileBufferReader();

            connection.fbr.readAsArrayBuffer(file, function(uuid) {
                var arrayOfUsers = connection.getAllParticipants();

                if (remoteUserId) {
                    arrayOfUsers = [remoteUserId];
                }

                arrayOfUsers.forEach(function(participant) {
                    connection.fbr.getNextChunk(uuid, function(nextChunk) {
                        connection.peers[participant].channels.forEach(function(channel) {
                            channel.send(nextChunk);
                        });
                    }, participant);
                });
            }, {
                userid: connection.userid,
                // extra: connection.extra,
                chunkSize: isFirefox ? 15 * 1000 : connection.chunkSize || 0
            });
        };

        if (typeof 'TextReceiver' !== 'undefined') {
            var textReceiver = new TextReceiver(connection);
        }

        this.onDataChannelMessage = function(message, remoteUserId) {
            textReceiver.receive(JSON.parse(message), remoteUserId, connection.peers[remoteUserId] ? connection.peers[remoteUserId].extra : {});
        };

        this.onDataChannelClosed = function(event, remoteUserId) {
            event.userid = remoteUserId;
            event.extra = connection.peers[remoteUserId] ? connection.peers[remoteUserId].extra : {};
            connection.onclose(event);
        };

        this.onDataChannelError = function(error, remoteUserId) {
            error.userid = remoteUserId;
            event.extra = connection.peers[remoteUserId] ? connection.peers[remoteUserId].extra : {};
            connection.onerror(error);
        };

        this.onDataChannelOpened = function(channel, remoteUserId) {
            // keep last channel only; we are not expecting parallel/channels channels
            if (connection.peers[remoteUserId].channels.length) {
                connection.peers[remoteUserId].channels = [channel];
                return;
            }

            connection.peers[remoteUserId].channels.push(channel);
            connection.onopen({
                userid: remoteUserId,
                extra: connection.peers[remoteUserId] ? connection.peers[remoteUserId].extra : {},
                channel: channel
            });
        };

        this.onPeerStateChanged = function(state) {
            connection.onPeerStateChanged(state);
        };

        this.onNegotiationStarted = function(remoteUserId, states) {};
        this.onNegotiationCompleted = function(remoteUserId, states) {};

        this.getRemoteStreams = function(remoteUserId) {
            remoteUserId = remoteUserId || connection.peers.getAllParticipants()[0];
            return connection.peers[remoteUserId] ? connection.peers[remoteUserId].streams : [];
        };
    }

    (function(f) {
        if (typeof exports === "object" && typeof module !== "undefined") {
            module.exports = f()
        } else if (typeof define === "function" && define.amd) {
            define([], f)
        } else {
            var g;
            if (typeof window !== "undefined") {
                g = window
            } else if (typeof global !== "undefined") {
                g = global
            } else if (typeof self !== "undefined") {
                g = self
            } else {
                g = this
            }
            g.adapter = f()
        }
    })(function() {
        var define, module, exports;
        return (function e(t, n, r) {
            function s(o, u) {
                if (!n[o]) {
                    if (!t[o]) {
                        var a = typeof require == "function" && require;
                        if (!u && a) return a(o, !0);
                        if (i) return i(o, !0);
                        var f = new Error("Cannot find module '" + o + "'");
                        throw f.code = "MODULE_NOT_FOUND", f
                    }
                    var l = n[o] = {
                        exports: {}
                    };
                    t[o][0].call(l.exports, function(e) {
                        var n = t[o][1][e];
                        return s(n ? n : e)
                    }, l, l.exports, e, t, n, r)
                }
                return n[o].exports
            }
            var i = typeof require == "function" && require;
            for (var o = 0; o < r.length; o++) s(r[o]);
            return s
        })({
            1: [function(require, module, exports) {
                /* eslint-env node */
                'use strict';

                // SDP helpers.
                var SDPUtils = {};

                // Generate an alphanumeric identifier for cname or mids.
                // TODO: use UUIDs instead? https://gist.github.com/jed/982883
                SDPUtils.generateIdentifier = function() {
                    return Math.random().toString(36).substr(2, 10);
                };

                // The RTCP CNAME used by all peerconnections from the same JS.
                SDPUtils.localCName = SDPUtils.generateIdentifier();

                // Splits SDP into lines, dealing with both CRLF and LF.
                SDPUtils.splitLines = function(blob) {
                    return blob.trim().split('\n').map(function(line) {
                        return line.trim();
                    });
                };
                // Splits SDP into sessionpart and mediasections. Ensures CRLF.
                SDPUtils.splitSections = function(blob) {
                    var parts = blob.split('\nm=');
                    return parts.map(function(part, index) {
                        return (index > 0 ? 'm=' + part : part).trim() + '\r\n';
                    });
                };

                // Returns lines that start with a certain prefix.
                SDPUtils.matchPrefix = function(blob, prefix) {
                    return SDPUtils.splitLines(blob).filter(function(line) {
                        return line.indexOf(prefix) === 0;
                    });
                };

                // Parses an ICE candidate line. Sample input:
                // candidate:702786350 2 udp 41819902 8.8.8.8 60769 typ relay raddr 8.8.8.8
                // rport 55996"
                SDPUtils.parseCandidate = function(line) {
                    var parts;
                    // Parse both variants.
                    if (line.indexOf('a=candidate:') === 0) {
                        parts = line.substring(12).split(' ');
                    } else {
                        parts = line.substring(10).split(' ');
                    }

                    var candidate = {
                        foundation: parts[0],
                        component: parseInt(parts[1], 10),
                        protocol: parts[2].toLowerCase(),
                        priority: parseInt(parts[3], 10),
                        ip: parts[4],
                        port: parseInt(parts[5], 10),
                        // skip parts[6] == 'typ'
                        type: parts[7]
                    };

                    for (var i = 8; i < parts.length; i += 2) {
                        switch (parts[i]) {
                            case 'raddr':
                                candidate.relatedAddress = parts[i + 1];
                                break;
                            case 'rport':
                                candidate.relatedPort = parseInt(parts[i + 1], 10);
                                break;
                            case 'tcptype':
                                candidate.tcpType = parts[i + 1];
                                break;
                            default: // extension handling, in particular ufrag
                                candidate[parts[i]] = parts[i + 1];
                                break;
                        }
                    }
                    return candidate;
                };

                // Translates a candidate object into SDP candidate attribute.
                SDPUtils.writeCandidate = function(candidate) {
                    var sdp = [];
                    sdp.push(candidate.foundation);
                    sdp.push(candidate.component);
                    sdp.push(candidate.protocol.toUpperCase());
                    sdp.push(candidate.priority);
                    sdp.push(candidate.ip);
                    sdp.push(candidate.port);

                    var type = candidate.type;
                    sdp.push('typ');
                    sdp.push(type);
                    if (type !== 'host' && candidate.relatedAddress &&
                        candidate.relatedPort) {
                        sdp.push('raddr');
                        sdp.push(candidate.relatedAddress); // was: relAddr
                        sdp.push('rport');
                        sdp.push(candidate.relatedPort); // was: relPort
                    }
                    if (candidate.tcpType && candidate.protocol.toLowerCase() === 'tcp') {
                        sdp.push('tcptype');
                        sdp.push(candidate.tcpType);
                    }
                    if (candidate.ufrag) {
                        sdp.push('ufrag');
                        sdp.push(candidate.ufrag);
                    }
                    return 'candidate:' + sdp.join(' ');
                };

                // Parses an ice-options line, returns an array of option tags.
                // a=ice-options:foo bar
                SDPUtils.parseIceOptions = function(line) {
                    return line.substr(14).split(' ');
                }

                // Parses an rtpmap line, returns RTCRtpCoddecParameters. Sample input:
                // a=rtpmap:111 opus/48000/2
                SDPUtils.parseRtpMap = function(line) {
                    var parts = line.substr(9).split(' ');
                    var parsed = {
                        payloadType: parseInt(parts.shift(), 10) // was: id
                    };

                    parts = parts[0].split('/');

                    parsed.name = parts[0];
                    parsed.clockRate = parseInt(parts[1], 10); // was: clockrate
                    // was: channels
                    parsed.numChannels = parts.length === 3 ? parseInt(parts[2], 10) : 1;
                    return parsed;
                };

                // Generate an a=rtpmap line from RTCRtpCodecCapability or
                // RTCRtpCodecParameters.
                SDPUtils.writeRtpMap = function(codec) {
                    var pt = codec.payloadType;
                    if (codec.preferredPayloadType !== undefined) {
                        pt = codec.preferredPayloadType;
                    }
                    return 'a=rtpmap:' + pt + ' ' + codec.name + '/' + codec.clockRate +
                        (codec.numChannels !== 1 ? '/' + codec.numChannels : '') + '\r\n';
                };

                // Parses an a=extmap line (headerextension from RFC 5285). Sample input:
                // a=extmap:2 urn:ietf:params:rtp-hdrext:toffset
                // a=extmap:2/sendonly urn:ietf:params:rtp-hdrext:toffset
                SDPUtils.parseExtmap = function(line) {
                    var parts = line.substr(9).split(' ');
                    return {
                        id: parseInt(parts[0], 10),
                        direction: parts[0].indexOf('/') > 0 ? parts[0].split('/')[1] : 'sendrecv',
                        uri: parts[1]
                    };
                };

                // Generates a=extmap line from RTCRtpHeaderExtensionParameters or
                // RTCRtpHeaderExtension.
                SDPUtils.writeExtmap = function(headerExtension) {
                    return 'a=extmap:' + (headerExtension.id || headerExtension.preferredId) +
                        (headerExtension.direction && headerExtension.direction !== 'sendrecv' ?
                            '/' + headerExtension.direction :
                            '') +
                        ' ' + headerExtension.uri + '\r\n';
                };

                // Parses an ftmp line, returns dictionary. Sample input:
                // a=fmtp:96 vbr=on;cng=on
                // Also deals with vbr=on; cng=on
                SDPUtils.parseFmtp = function(line) {
                    var parsed = {};
                    var kv;
                    var parts = line.substr(line.indexOf(' ') + 1).split(';');
                    for (var j = 0; j < parts.length; j++) {
                        kv = parts[j].trim().split('=');
                        parsed[kv[0].trim()] = kv[1];
                    }
                    return parsed;
                };

                // Generates an a=ftmp line from RTCRtpCodecCapability or RTCRtpCodecParameters.
                SDPUtils.writeFmtp = function(codec) {
                    var line = '';
                    var pt = codec.payloadType;
                    if (codec.preferredPayloadType !== undefined) {
                        pt = codec.preferredPayloadType;
                    }
                    if (codec.parameters && Object.keys(codec.parameters).length) {
                        var params = [];
                        Object.keys(codec.parameters).forEach(function(param) {
                            params.push(param + '=' + codec.parameters[param]);
                        });
                        line += 'a=fmtp:' + pt + ' ' + params.join(';') + '\r\n';
                    }
                    return line;
                };

                // Parses an rtcp-fb line, returns RTCPRtcpFeedback object. Sample input:
                // a=rtcp-fb:98 nack rpsi
                SDPUtils.parseRtcpFb = function(line) {
                    var parts = line.substr(line.indexOf(' ') + 1).split(' ');
                    return {
                        type: parts.shift(),
                        parameter: parts.join(' ')
                    };
                };
                // Generate a=rtcp-fb lines from RTCRtpCodecCapability or RTCRtpCodecParameters.
                SDPUtils.writeRtcpFb = function(codec) {
                    var lines = '';
                    var pt = codec.payloadType;
                    if (codec.preferredPayloadType !== undefined) {
                        pt = codec.preferredPayloadType;
                    }
                    if (codec.rtcpFeedback && codec.rtcpFeedback.length) {
                        // FIXME: special handling for trr-int?
                        codec.rtcpFeedback.forEach(function(fb) {
                            lines += 'a=rtcp-fb:' + pt + ' ' + fb.type +
                                (fb.parameter && fb.parameter.length ? ' ' + fb.parameter : '') +
                                '\r\n';
                        });
                    }
                    return lines;
                };

                // Parses an RFC 5576 ssrc media attribute. Sample input:
                // a=ssrc:3735928559 cname:something
                SDPUtils.parseSsrcMedia = function(line) {
                    var sp = line.indexOf(' ');
                    var parts = {
                        ssrc: parseInt(line.substr(7, sp - 7), 10)
                    };
                    var colon = line.indexOf(':', sp);
                    if (colon > -1) {
                        parts.attribute = line.substr(sp + 1, colon - sp - 1);
                        parts.value = line.substr(colon + 1);
                    } else {
                        parts.attribute = line.substr(sp + 1);
                    }
                    return parts;
                };

                // Extracts the MID (RFC 5888) from a media section.
                // returns the MID or undefined if no mid line was found.
                SDPUtils.getMid = function(mediaSection) {
                    var mid = SDPUtils.matchPrefix(mediaSection, 'a=mid:')[0];
                    if (mid) {
                        return mid.substr(6);
                    }
                }

                SDPUtils.parseFingerprint = function(line) {
                    var parts = line.substr(14).split(' ');
                    return {
                        algorithm: parts[0].toLowerCase(), // algorithm is case-sensitive in Edge.
                        value: parts[1]
                    };
                };

                // Extracts DTLS parameters from SDP media section or sessionpart.
                // FIXME: for consistency with other functions this should only
                //   get the fingerprint line as input. See also getIceParameters.
                SDPUtils.getDtlsParameters = function(mediaSection, sessionpart) {
                    var lines = SDPUtils.matchPrefix(mediaSection + sessionpart,
                        'a=fingerprint:');
                    // Note: a=setup line is ignored since we use the 'auto' role.
                    // Note2: 'algorithm' is not case sensitive except in Edge.
                    return {
                        role: 'auto',
                        fingerprints: lines.map(SDPUtils.parseFingerprint)
                    };
                };

                // Serializes DTLS parameters to SDP.
                SDPUtils.writeDtlsParameters = function(params, setupType) {
                    var sdp = 'a=setup:' + setupType + '\r\n';
                    params.fingerprints.forEach(function(fp) {
                        sdp += 'a=fingerprint:' + fp.algorithm + ' ' + fp.value + '\r\n';
                    });
                    return sdp;
                };
                // Parses ICE information from SDP media section or sessionpart.
                // FIXME: for consistency with other functions this should only
                //   get the ice-ufrag and ice-pwd lines as input.
                SDPUtils.getIceParameters = function(mediaSection, sessionpart) {
                    var lines = SDPUtils.splitLines(mediaSection);
                    // Search in session part, too.
                    lines = lines.concat(SDPUtils.splitLines(sessionpart));
                    var iceParameters = {
                        usernameFragment: lines.filter(function(line) {
                            return line.indexOf('a=ice-ufrag:') === 0;
                        })[0].substr(12),
                        password: lines.filter(function(line) {
                            return line.indexOf('a=ice-pwd:') === 0;
                        })[0].substr(10)
                    };
                    return iceParameters;
                };

                // Serializes ICE parameters to SDP.
                SDPUtils.writeIceParameters = function(params) {
                    return 'a=ice-ufrag:' + params.usernameFragment + '\r\n' +
                        'a=ice-pwd:' + params.password + '\r\n';
                };

                // Parses the SDP media section and returns RTCRtpParameters.
                SDPUtils.parseRtpParameters = function(mediaSection) {
                    var description = {
                        codecs: [],
                        headerExtensions: [],
                        fecMechanisms: [],
                        rtcp: []
                    };
                    var lines = SDPUtils.splitLines(mediaSection);
                    var mline = lines[0].split(' ');
                    for (var i = 3; i < mline.length; i++) { // find all codecs from mline[3..]
                        var pt = mline[i];
                        var rtpmapline = SDPUtils.matchPrefix(
                            mediaSection, 'a=rtpmap:' + pt + ' ')[0];
                        if (rtpmapline) {
                            var codec = SDPUtils.parseRtpMap(rtpmapline);
                            var fmtps = SDPUtils.matchPrefix(
                                mediaSection, 'a=fmtp:' + pt + ' ');
                            // Only the first a=fmtp:<pt> is considered.
                            codec.parameters = fmtps.length ? SDPUtils.parseFmtp(fmtps[0]) : {};
                            codec.rtcpFeedback = SDPUtils.matchPrefix(
                                    mediaSection, 'a=rtcp-fb:' + pt + ' ')
                                .map(SDPUtils.parseRtcpFb);
                            description.codecs.push(codec);
                            // parse FEC mechanisms from rtpmap lines.
                            switch (codec.name.toUpperCase()) {
                                case 'RED':
                                case 'ULPFEC':
                                    description.fecMechanisms.push(codec.name.toUpperCase());
                                    break;
                                default: // only RED and ULPFEC are recognized as FEC mechanisms.
                                    break;
                            }
                        }
                    }
                    SDPUtils.matchPrefix(mediaSection, 'a=extmap:').forEach(function(line) {
                        description.headerExtensions.push(SDPUtils.parseExtmap(line));
                    });
                    // FIXME: parse rtcp.
                    return description;
                };

                // Generates parts of the SDP media section describing the capabilities /
                // parameters.
                SDPUtils.writeRtpDescription = function(kind, caps) {
                    var sdp = '';

                    // Build the mline.
                    sdp += 'm=' + kind + ' ';
                    sdp += caps.codecs.length > 0 ? '9' : '0'; // reject if no codecs.
                    sdp += ' UDP/TLS/RTP/SAVPF ';
                    sdp += caps.codecs.map(function(codec) {
                        if (codec.preferredPayloadType !== undefined) {
                            return codec.preferredPayloadType;
                        }
                        return codec.payloadType;
                    }).join(' ') + '\r\n';

                    sdp += 'c=IN IP4 0.0.0.0\r\n';
                    sdp += 'a=rtcp:9 IN IP4 0.0.0.0\r\n';

                    // Add a=rtpmap lines for each codec. Also fmtp and rtcp-fb.
                    caps.codecs.forEach(function(codec) {
                        sdp += SDPUtils.writeRtpMap(codec);
                        sdp += SDPUtils.writeFmtp(codec);
                        sdp += SDPUtils.writeRtcpFb(codec);
                    });
                    var maxptime = 0;
                    caps.codecs.forEach(function(codec) {
                        if (codec.maxptime > maxptime) {
                            maxptime = codec.maxptime;
                        }
                    });
                    if (maxptime > 0) {
                        sdp += 'a=maxptime:' + maxptime + '\r\n';
                    }
                    sdp += 'a=rtcp-mux\r\n';

                    caps.headerExtensions.forEach(function(extension) {
                        sdp += SDPUtils.writeExtmap(extension);
                    });
                    // FIXME: write fecMechanisms.
                    return sdp;
                };

                // Parses the SDP media section and returns an array of
                // RTCRtpEncodingParameters.
                SDPUtils.parseRtpEncodingParameters = function(mediaSection) {
                    var encodingParameters = [];
                    var description = SDPUtils.parseRtpParameters(mediaSection);
                    var hasRed = description.fecMechanisms.indexOf('RED') !== -1;
                    var hasUlpfec = description.fecMechanisms.indexOf('ULPFEC') !== -1;

                    // filter a=ssrc:... cname:, ignore PlanB-msid
                    var ssrcs = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
                        .map(function(line) {
                            return SDPUtils.parseSsrcMedia(line);
                        })
                        .filter(function(parts) {
                            return parts.attribute === 'cname';
                        });
                    var primarySsrc = ssrcs.length > 0 && ssrcs[0].ssrc;
                    var secondarySsrc;

                    var flows = SDPUtils.matchPrefix(mediaSection, 'a=ssrc-group:FID')
                        .map(function(line) {
                            var parts = line.split(' ');
                            parts.shift();
                            return parts.map(function(part) {
                                return parseInt(part, 10);
                            });
                        });
                    if (flows.length > 0 && flows[0].length > 1 && flows[0][0] === primarySsrc) {
                        secondarySsrc = flows[0][1];
                    }

                    description.codecs.forEach(function(codec) {
                        if (codec.name.toUpperCase() === 'RTX' && codec.parameters.apt) {
                            var encParam = {
                                ssrc: primarySsrc,
                                codecPayloadType: parseInt(codec.parameters.apt, 10),
                                rtx: {
                                    ssrc: secondarySsrc
                                }
                            };
                            encodingParameters.push(encParam);
                            if (hasRed) {
                                encParam = JSON.parse(JSON.stringify(encParam));
                                encParam.fec = {
                                    ssrc: secondarySsrc,
                                    mechanism: hasUlpfec ? 'red+ulpfec' : 'red'
                                };
                                encodingParameters.push(encParam);
                            }
                        }
                    });
                    if (encodingParameters.length === 0 && primarySsrc) {
                        encodingParameters.push({
                            ssrc: primarySsrc
                        });
                    }

                    // we support both b=AS and b=TIAS but interpret AS as TIAS.
                    var bandwidth = SDPUtils.matchPrefix(mediaSection, 'b=');
                    if (bandwidth.length) {
                        if (bandwidth[0].indexOf('b=TIAS:') === 0) {
                            bandwidth = parseInt(bandwidth[0].substr(7), 10);
                        } else if (bandwidth[0].indexOf('b=AS:') === 0) {
                            // use formula from JSEP to convert b=AS to TIAS value.
                            bandwidth = parseInt(bandwidth[0].substr(5), 10) * 1000 * 0.95 -
                                (50 * 40 * 8);
                        } else {
                            bandwidth = undefined;
                        }
                        encodingParameters.forEach(function(params) {
                            params.maxBitrate = bandwidth;
                        });
                    }
                    return encodingParameters;
                };

                // parses http://draft.ortc.org/#rtcrtcpparameters*
                SDPUtils.parseRtcpParameters = function(mediaSection) {
                    var rtcpParameters = {};

                    var cname;
                    // Gets the first SSRC. Note that with RTX there might be multiple
                    // SSRCs.
                    var remoteSsrc = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
                        .map(function(line) {
                            return SDPUtils.parseSsrcMedia(line);
                        })
                        .filter(function(obj) {
                            return obj.attribute === 'cname';
                        })[0];
                    if (remoteSsrc) {
                        rtcpParameters.cname = remoteSsrc.value;
                        rtcpParameters.ssrc = remoteSsrc.ssrc;
                    }

                    // Edge uses the compound attribute instead of reducedSize
                    // compound is !reducedSize
                    var rsize = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-rsize');
                    rtcpParameters.reducedSize = rsize.length > 0;
                    rtcpParameters.compound = rsize.length === 0;

                    // parses the rtcp-mux attrіbute.
                    // Note that Edge does not support unmuxed RTCP.
                    var mux = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-mux');
                    rtcpParameters.mux = mux.length > 0;

                    return rtcpParameters;
                };

                // parses either a=msid: or a=ssrc:... msid lines and returns
                // the id of the MediaStream and MediaStreamTrack.
                SDPUtils.parseMsid = function(mediaSection) {
                    var parts;
                    var spec = SDPUtils.matchPrefix(mediaSection, 'a=msid:');
                    if (spec.length === 1) {
                        parts = spec[0].substr(7).split(' ');
                        return {
                            stream: parts[0],
                            track: parts[1]
                        };
                    }
                    var planB = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
                        .map(function(line) {
                            return SDPUtils.parseSsrcMedia(line);
                        })
                        .filter(function(parts) {
                            return parts.attribute === 'msid';
                        });
                    if (planB.length > 0) {
                        parts = planB[0].value.split(' ');
                        return {
                            stream: parts[0],
                            track: parts[1]
                        };
                    }
                };

                // Generate a session ID for SDP.
                // https://tools.ietf.org/html/draft-ietf-rtcweb-jsep-20#section-5.2.1
                // recommends using a cryptographically random +ve 64-bit value
                // but right now this should be acceptable and within the right range
                SDPUtils.generateSessionId = function() {
                    return Math.random().toString().substr(2, 21);
                };

                // Write boilder plate for start of SDP
                // sessId argument is optional - if not supplied it will
                // be generated randomly
                // sessVersion is optional and defaults to 2
                SDPUtils.writeSessionBoilerplate = function(sessId, sessVer) {
                    var sessionId;
                    var version = sessVer !== undefined ? sessVer : 2;
                    if (sessId) {
                        sessionId = sessId;
                    } else {
                        sessionId = SDPUtils.generateSessionId();
                    }
                    // FIXME: sess-id should be an NTP timestamp.
                    return 'v=0\r\n' +
                        'o=thisisadapterortc ' + sessionId + ' ' + version + ' IN IP4 127.0.0.1\r\n' +
                        's=-\r\n' +
                        't=0 0\r\n';
                };

                SDPUtils.writeMediaSection = function(transceiver, caps, type, stream) {
                    var sdp = SDPUtils.writeRtpDescription(transceiver.kind, caps);

                    // Map ICE parameters (ufrag, pwd) to SDP.
                    sdp += SDPUtils.writeIceParameters(
                        transceiver.iceGatherer.getLocalParameters());

                    // Map DTLS parameters to SDP.
                    sdp += SDPUtils.writeDtlsParameters(
                        transceiver.dtlsTransport.getLocalParameters(),
                        type === 'offer' ? 'actpass' : 'active');

                    sdp += 'a=mid:' + transceiver.mid + '\r\n';

                    if (transceiver.direction) {
                        sdp += 'a=' + transceiver.direction + '\r\n';
                    } else if (transceiver.rtpSender && transceiver.rtpReceiver) {
                        sdp += 'a=sendrecv\r\n';
                    } else if (transceiver.rtpSender) {
                        sdp += 'a=sendonly\r\n';
                    } else if (transceiver.rtpReceiver) {
                        sdp += 'a=recvonly\r\n';
                    } else {
                        sdp += 'a=inactive\r\n';
                    }

                    if (transceiver.rtpSender) {
                        // spec.
                        var msid = 'msid:' + stream.id + ' ' +
                            transceiver.rtpSender.track.id + '\r\n';
                        sdp += 'a=' + msid;

                        // for Chrome.
                        sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
                            ' ' + msid;
                        if (transceiver.sendEncodingParameters[0].rtx) {
                            sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc +
                                ' ' + msid;
                            sdp += 'a=ssrc-group:FID ' +
                                transceiver.sendEncodingParameters[0].ssrc + ' ' +
                                transceiver.sendEncodingParameters[0].rtx.ssrc +
                                '\r\n';
                        }
                    }
                    // FIXME: this should be written by writeRtpDescription.
                    sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
                        ' cname:' + SDPUtils.localCName + '\r\n';
                    if (transceiver.rtpSender && transceiver.sendEncodingParameters[0].rtx) {
                        sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc +
                            ' cname:' + SDPUtils.localCName + '\r\n';
                    }
                    return sdp;
                };

                // Gets the direction from the mediaSection or the sessionpart.
                SDPUtils.getDirection = function(mediaSection, sessionpart) {
                    // Look for sendrecv, sendonly, recvonly, inactive, default to sendrecv.
                    var lines = SDPUtils.splitLines(mediaSection);
                    for (var i = 0; i < lines.length; i++) {
                        switch (lines[i]) {
                            case 'a=sendrecv':
                            case 'a=sendonly':
                            case 'a=recvonly':
                            case 'a=inactive':
                                return lines[i].substr(2);
                            default:
                                // FIXME: What should happen here?
                        }
                    }
                    if (sessionpart) {
                        return SDPUtils.getDirection(sessionpart);
                    }
                    return 'sendrecv';
                };

                SDPUtils.getKind = function(mediaSection) {
                    var lines = SDPUtils.splitLines(mediaSection);
                    var mline = lines[0].split(' ');
                    return mline[0].substr(2);
                };

                SDPUtils.isRejected = function(mediaSection) {
                    return mediaSection.split(' ', 2)[1] === '0';
                };

                // Expose public methods.
                module.exports = SDPUtils;

            }, {}],
            2: [function(require, module, exports) {
                (function(global) {
                    /*
                     *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
                     *
                     *  Use of this source code is governed by a BSD-style license
                     *  that can be found in the LICENSE file in the root of the source
                     *  tree.
                     */
                    /* eslint-env node */

                    'use strict';

                    var adapterFactory = require('./adapter_factory.js');
                    module.exports = adapterFactory({
                        window: global.window
                    });

                }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
            }, {
                "./adapter_factory.js": 3
            }],
            3: [function(require, module, exports) {
                /*
                 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
                 *
                 *  Use of this source code is governed by a BSD-style license
                 *  that can be found in the LICENSE file in the root of the source
                 *  tree.
                 */
                /* eslint-env node */

                'use strict';

                // Shimming starts here.
                module.exports = function(dependencies, opts) {
                    var window = dependencies && dependencies.window;

                    var options = {
                        shimChrome: true,
                        shimFirefox: true,
                        shimEdge: true,
                        shimSafari: true,
                    };

                    for (var key in opts) {
                        if (hasOwnProperty.call(opts, key)) {
                            options[key] = opts[key];
                        }
                    }

                    // Utils.
                    var utils = require('./utils');
                    var logging = utils.log;
                    var browserDetails = utils.detectBrowser(window);

                    // Export to the adapter global object visible in the browser.
                    var adapter = {
                        browserDetails: browserDetails,
                        extractVersion: utils.extractVersion,
                        disableLog: utils.disableLog,
                        disableWarnings: utils.disableWarnings
                    };

                    // Uncomment the line below if you want logging to occur, including logging
                    // for the switch statement below. Can also be turned on in the browser via
                    // adapter.disableLog(false), but then logging from the switch statement below
                    // will not appear.
                    // require('./utils').disableLog(false);

                    // Browser shims.
                    var chromeShim = require('./chrome/chrome_shim') || null;
                    var edgeShim = require('./edge/edge_shim') || null;
                    var firefoxShim = require('./firefox/firefox_shim') || null;
                    var safariShim = require('./safari/safari_shim') || null;

                    // Shim browser if found.
                    switch (browserDetails.browser) {
                        case 'chrome':
                            if (!chromeShim || !chromeShim.shimPeerConnection ||
                                !options.shimChrome) {
                                logging('Chrome shim is not included in this adapter release.');
                                return adapter;
                            }
                            logging('adapter.js shimming chrome.');
                            // Export to the adapter global object visible in the browser.
                            adapter.browserShim = chromeShim;

                            chromeShim.shimGetUserMedia(window);
                            chromeShim.shimMediaStream(window);
                            utils.shimCreateObjectURL(window);
                            chromeShim.shimSourceObject(window);
                            chromeShim.shimPeerConnection(window);
                            chromeShim.shimOnTrack(window);
                            chromeShim.shimAddTrackRemoveTrack(window);
                            chromeShim.shimGetSendersWithDtmf(window);
                            break;
                        case 'firefox':
                            if (!firefoxShim || !firefoxShim.shimPeerConnection ||
                                !options.shimFirefox) {
                                logging('Firefox shim is not included in this adapter release.');
                                return adapter;
                            }
                            logging('adapter.js shimming firefox.');
                            // Export to the adapter global object visible in the browser.
                            adapter.browserShim = firefoxShim;

                            firefoxShim.shimGetUserMedia(window);
                            utils.shimCreateObjectURL(window);
                            firefoxShim.shimSourceObject(window);
                            firefoxShim.shimPeerConnection(window);
                            firefoxShim.shimOnTrack(window);
                            break;
                        case 'edge':
                            if (!edgeShim || !edgeShim.shimPeerConnection || !options.shimEdge) {
                                logging('MS edge shim is not included in this adapter release.');
                                return adapter;
                            }
                            logging('adapter.js shimming edge.');
                            // Export to the adapter global object visible in the browser.
                            adapter.browserShim = edgeShim;

                            edgeShim.shimGetUserMedia(window);
                            utils.shimCreateObjectURL(window);
                            edgeShim.shimPeerConnection(window);
                            edgeShim.shimReplaceTrack(window);
                            break;
                        case 'safari':
                            if (!safariShim || !options.shimSafari) {
                                logging('Safari shim is not included in this adapter release.');
                                return adapter;
                            }
                            logging('adapter.js shimming safari.');
                            // Export to the adapter global object visible in the browser.
                            adapter.browserShim = safariShim;
                            // shim window.URL.createObjectURL Safari (technical preview)
                            utils.shimCreateObjectURL(window);
                            safariShim.shimRTCIceServerUrls(window);
                            safariShim.shimCallbacksAPI(window);
                            safariShim.shimLocalStreamsAPI(window);
                            safariShim.shimRemoteStreamsAPI(window);
                            safariShim.shimGetUserMedia(window);
                            break;
                        default:
                            logging('Unsupported browser!');
                            break;
                    }

                    return adapter;
                };

            }, {
                "./chrome/chrome_shim": 4,
                "./edge/edge_shim": 6,
                "./firefox/firefox_shim": 9,
                "./safari/safari_shim": 11,
                "./utils": 12
            }],
            4: [function(require, module, exports) {

                /*
                 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
                 *
                 *  Use of this source code is governed by a BSD-style license
                 *  that can be found in the LICENSE file in the root of the source
                 *  tree.
                 */
                /* eslint-env node */
                'use strict';
                var utils = require('../utils.js');
                var logging = utils.log;

                var chromeShim = {
                    shimMediaStream: function(window) {
                        window.MediaStream = window.MediaStream || window.webkitMediaStream;
                    },

                    shimOnTrack: function(window) {
                        if (typeof window === 'object' && window.RTCPeerConnection && !('ontrack' in
                                window.RTCPeerConnection.prototype)) {
                            Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
                                get: function() {
                                    return this._ontrack;
                                },
                                set: function(f) {
                                    if (this._ontrack) {
                                        this.removeEventListener('track', this._ontrack);
                                    }
                                    this.addEventListener('track', this._ontrack = f);
                                }
                            });
                            var origSetRemoteDescription =
                                window.RTCPeerConnection.prototype.setRemoteDescription;
                            window.RTCPeerConnection.prototype.setRemoteDescription = function() {
                                var pc = this;
                                if (!pc._ontrackpoly) {
                                    pc._ontrackpoly = function(e) {
                                        // onaddstream does not fire when a track is added to an existing
                                        // stream. But stream.onaddtrack is implemented so we use that.
                                        e.stream.addEventListener('addtrack', function(te) {
                                            var receiver;
                                            if (window.RTCPeerConnection.prototype.getReceivers) {
                                                receiver = pc.getReceivers().find(function(r) {
                                                    return r.track.id === te.track.id;
                                                });
                                            } else {
                                                receiver = {
                                                    track: te.track
                                                };
                                            }

                                            var event = new Event('track');
                                            event.track = te.track;
                                            event.receiver = receiver;
                                            event.streams = [e.stream];
                                            pc.dispatchEvent(event);
                                        });
                                        e.stream.getTracks().forEach(function(track) {
                                            var receiver;
                                            if (window.RTCPeerConnection.prototype.getReceivers) {
                                                receiver = pc.getReceivers().find(function(r) {
                                                    return r.track.id === track.id;
                                                });
                                            } else {
                                                receiver = {
                                                    track: track
                                                };
                                            }
                                            var event = new Event('track');
                                            event.track = track;
                                            event.receiver = receiver;
                                            event.streams = [e.stream];
                                            pc.dispatchEvent(event);
                                        });
                                    };
                                    pc.addEventListener('addstream', pc._ontrackpoly);
                                }
                                return origSetRemoteDescription.apply(pc, arguments);
                            };
                        }
                    },

                    shimGetSendersWithDtmf: function(window) {
                        // Overrides addTrack/removeTrack, depends on shimAddTrackRemoveTrack.
                        if (typeof window === 'object' && window.RTCPeerConnection &&
                            !('getSenders' in window.RTCPeerConnection.prototype) &&
                            'createDTMFSender' in window.RTCPeerConnection.prototype) {
                            var shimSenderWithDtmf = function(pc, track) {
                                return {
                                    track: track,
                                    get dtmf() {
                                        if (this._dtmf === undefined) {
                                            if (track.kind === 'audio') {
                                                this._dtmf = pc.createDTMFSender(track);
                                            } else {
                                                this._dtmf = null;
                                            }
                                        }
                                        return this._dtmf;
                                    },
                                    _pc: pc
                                };
                            };

                            // augment addTrack when getSenders is not available.
                            if (!window.RTCPeerConnection.prototype.getSenders) {
                                window.RTCPeerConnection.prototype.getSenders = function() {
                                    this._senders = this._senders || [];
                                    return this._senders.slice(); // return a copy of the internal state.
                                };
                                var origAddTrack = window.RTCPeerConnection.prototype.addTrack;
                                window.RTCPeerConnection.prototype.addTrack = function(track, stream) {
                                    var pc = this;
                                    var sender = origAddTrack.apply(pc, arguments);
                                    if (!sender) {
                                        sender = shimSenderWithDtmf(pc, track);
                                        pc._senders.push(sender);
                                    }
                                    return sender;
                                };

                                var origRemoveTrack = window.RTCPeerConnection.prototype.removeTrack;
                                window.RTCPeerConnection.prototype.removeTrack = function(sender) {
                                    var pc = this;
                                    origRemoveTrack.apply(pc, arguments);
                                    var idx = pc._senders.indexOf(sender);
                                    if (idx !== -1) {
                                        pc._senders.splice(idx, 1);
                                    }
                                };
                            }
                            var origAddStream = window.RTCPeerConnection.prototype.addStream;
                            window.RTCPeerConnection.prototype.addStream = function(stream) {
                                var pc = this;
                                pc._senders = pc._senders || [];
                                origAddStream.apply(pc, [stream]);
                                stream.getTracks().forEach(function(track) {
                                    pc._senders.push(shimSenderWithDtmf(pc, track));
                                });
                            };

                            var origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
                            window.RTCPeerConnection.prototype.removeStream = function(stream) {
                                var pc = this;
                                pc._senders = pc._senders || [];
                                origRemoveStream.apply(pc, [(pc._streams[stream.id] || stream)]);

                                stream.getTracks().forEach(function(track) {
                                    var sender = pc._senders.find(function(s) {
                                        return s.track === track;
                                    });
                                    if (sender) {
                                        pc._senders.splice(pc._senders.indexOf(sender), 1); // remove sender
                                    }
                                });
                            };
                        } else if (typeof window === 'object' && window.RTCPeerConnection &&
                            'getSenders' in window.RTCPeerConnection.prototype &&
                            'createDTMFSender' in window.RTCPeerConnection.prototype &&
                            window.RTCRtpSender &&
                            !('dtmf' in window.RTCRtpSender.prototype)) {
                            var origGetSenders = window.RTCPeerConnection.prototype.getSenders;
                            window.RTCPeerConnection.prototype.getSenders = function() {
                                var pc = this;
                                var senders = origGetSenders.apply(pc, []);
                                senders.forEach(function(sender) {
                                    sender._pc = pc;
                                });
                                return senders;
                            };

                            Object.defineProperty(window.RTCRtpSender.prototype, 'dtmf', {
                                get: function() {
                                    if (this._dtmf === undefined) {
                                        if (this.track.kind === 'audio') {
                                            this._dtmf = this._pc.createDTMFSender(this.track);
                                        } else {
                                            this._dtmf = null;
                                        }
                                    }
                                    return this._dtmf;
                                }
                            });
                        }
                    },

                    shimSourceObject: function(window) {
                        var URL = window && window.URL;

                        if (typeof window === 'object') {
                            if (window.HTMLMediaElement &&
                                !('srcObject' in window.HTMLMediaElement.prototype)) {
                                // Shim the srcObject property, once, when HTMLMediaElement is found.
                                Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
                                    get: function() {
                                        return this._srcObject;
                                    },
                                    set: function(stream) {
                                        var self = this;
                                        // Use _srcObject as a private property for this shim
                                        this._srcObject = stream;
                                        if (this.src) {
                                            URL.revokeObjectURL(this.src);
                                        }

                                        if (!stream) {
                                            this.src = '';
                                            return undefined;
                                        }
                                        this.src = URL.createObjectURL(stream);
                                        // We need to recreate the blob url when a track is added or
                                        // removed. Doing it manually since we want to avoid a recursion.
                                        stream.addEventListener('addtrack', function() {
                                            if (self.src) {
                                                URL.revokeObjectURL(self.src);
                                            }
                                            self.src = URL.createObjectURL(stream);
                                        });
                                        stream.addEventListener('removetrack', function() {
                                            if (self.src) {
                                                URL.revokeObjectURL(self.src);
                                            }
                                            self.src = URL.createObjectURL(stream);
                                        });
                                    }
                                });
                            }
                        }
                    },

                    shimAddTrackRemoveTrack: function(window) {
                        // shim addTrack and removeTrack.
                        if (window.RTCPeerConnection.prototype.addTrack) {
                            return;
                        }

                        // also shim pc.getLocalStreams when addTrack is shimmed
                        // to return the original streams.
                        var origGetLocalStreams = window.RTCPeerConnection.prototype
                            .getLocalStreams;
                        window.RTCPeerConnection.prototype.getLocalStreams = function() {
                            var self = this;
                            var nativeStreams = origGetLocalStreams.apply(this);
                            self._reverseStreams = self._reverseStreams || {};
                            return nativeStreams.map(function(stream) {
                                return self._reverseStreams[stream.id];
                            });
                        };

                        var origAddStream = window.RTCPeerConnection.prototype.addStream;
                        window.RTCPeerConnection.prototype.addStream = function(stream) {
                            var pc = this;
                            pc._streams = pc._streams || {};
                            pc._reverseStreams = pc._reverseStreams || {};

                            stream.getTracks().forEach(function(track) {
                                var alreadyExists = pc.getSenders().find(function(s) {
                                    return s.track === track;
                                });
                                if (alreadyExists) {
                                    throw new DOMException('Track already exists.',
                                        'InvalidAccessError');
                                }
                            });
                            // Add identity mapping for consistency with addTrack.
                            // Unless this is being used with a stream from addTrack.
                            if (!pc._reverseStreams[stream.id]) {
                                var newStream = new window.MediaStream(stream.getTracks());
                                pc._streams[stream.id] = newStream;
                                pc._reverseStreams[newStream.id] = stream;
                                stream = newStream;
                            }
                            origAddStream.apply(pc, [stream]);
                        };

                        var origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
                        window.RTCPeerConnection.prototype.removeStream = function(stream) {
                            var pc = this;
                            pc._streams = pc._streams || {};
                            pc._reverseStreams = pc._reverseStreams || {};

                            origRemoveStream.apply(pc, [(pc._streams[stream.id] || stream)]);
                            delete pc._reverseStreams[(pc._streams[stream.id] ?
                                pc._streams[stream.id].id : stream.id)];
                            delete pc._streams[stream.id];
                        };

                        window.RTCPeerConnection.prototype.addTrack = function(track, stream) {
                            var pc = this;
                            if (pc.signalingState === 'closed') {
                                throw new DOMException(
                                    'The RTCPeerConnection\'s signalingState is \'closed\'.',
                                    'InvalidStateError');
                            }
                            var streams = [].slice.call(arguments, 1);
                            if (streams.length !== 1 ||
                                !streams[0].getTracks().find(function(t) {
                                    return t === track;
                                })) {
                                // this is not fully correct but all we can manage without
                                // [[associated MediaStreams]] internal slot.
                                throw new DOMException(
                                    'The adapter.js addTrack polyfill only supports a single ' +
                                    ' stream which is associated with the specified track.',
                                    'NotSupportedError');
                            }

                            var alreadyExists = pc.getSenders().find(function(s) {
                                return s.track === track;
                            });
                            if (alreadyExists) {
                                throw new DOMException('Track already exists.',
                                    'InvalidAccessError');
                            }

                            pc._streams = pc._streams || {};
                            pc._reverseStreams = pc._reverseStreams || {};
                            var oldStream = pc._streams[stream.id];
                            if (oldStream) {
                                // this is using odd Chrome behaviour, use with caution:
                                // https://bugs.chromium.org/p/webrtc/issues/detail?id=7815
                                // Note: we rely on the high-level addTrack/dtmf shim to
                                // create the sender with a dtmf sender.
                                oldStream.addTrack(track);
                                pc.dispatchEvent(new Event('negotiationneeded'));
                            } else {
                                var newStream = new window.MediaStream([track]);
                                pc._streams[stream.id] = newStream;
                                pc._reverseStreams[newStream.id] = stream;
                                pc.addStream(newStream);
                            }
                            return pc.getSenders().find(function(s) {
                                return s.track === track;
                            });
                        };

                        window.RTCPeerConnection.prototype.removeTrack = function(sender) {
                            var pc = this;
                            if (pc.signalingState === 'closed') {
                                throw new DOMException(
                                    'The RTCPeerConnection\'s signalingState is \'closed\'.',
                                    'InvalidStateError');
                            }
                            // We can not yet check for sender instanceof RTCRtpSender
                            // since we shim RTPSender. So we check if sender._pc is set.
                            if (!sender._pc) {
                                throw new DOMException('Argument 1 of RTCPeerConnection.removeTrack ' +
                                    'does not implement interface RTCRtpSender.', 'TypeError');
                            }
                            var isLocal = sender._pc === pc;
                            if (!isLocal) {
                                throw new DOMException('Sender was not created by this connection.',
                                    'InvalidAccessError');
                            }

                            // Search for the native stream the senders track belongs to.
                            pc._streams = pc._streams || {};
                            var stream;
                            Object.keys(pc._streams).forEach(function(streamid) {
                                var hasTrack = pc._streams[streamid].getTracks().find(function(track) {
                                    return sender.track === track;
                                });
                                if (hasTrack) {
                                    stream = pc._streams[streamid];
                                }
                            });

                            if (stream) {
                                if (stream.getTracks().length === 1) {
                                    // if this is the last track of the stream, remove the stream. This
                                    // takes care of any shimmed _senders.
                                    pc.removeStream(stream);
                                } else {
                                    // relying on the same odd chrome behaviour as above.
                                    stream.removeTrack(sender.track);
                                }
                                pc.dispatchEvent(new Event('negotiationneeded'));
                            }
                        };
                    },

                    shimPeerConnection: function(window) {
                        var browserDetails = utils.detectBrowser(window);

                        // The RTCPeerConnection object.
                        if (!window.RTCPeerConnection) {
                            window.RTCPeerConnection = function(pcConfig, pcConstraints) {
                                // Translate iceTransportPolicy to iceTransports,
                                // see https://code.google.com/p/webrtc/issues/detail?id=4869
                                // this was fixed in M56 along with unprefixing RTCPeerConnection.
                                logging('PeerConnection');
                                if (pcConfig && pcConfig.iceTransportPolicy) {
                                    pcConfig.iceTransports = pcConfig.iceTransportPolicy;
                                }

                                return new window.webkitRTCPeerConnection(pcConfig, pcConstraints);
                            };
                            window.RTCPeerConnection.prototype =
                                window.webkitRTCPeerConnection.prototype;
                            // wrap static methods. Currently just generateCertificate.
                            if (window.webkitRTCPeerConnection.generateCertificate) {
                                Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
                                    get: function() {
                                        return window.webkitRTCPeerConnection.generateCertificate;
                                    }
                                });
                            }
                        } else {
                            // migrate from non-spec RTCIceServer.url to RTCIceServer.urls
                            var OrigPeerConnection = window.RTCPeerConnection;
                            window.RTCPeerConnection = function(pcConfig, pcConstraints) {
                                if (pcConfig && pcConfig.iceServers) {
                                    var newIceServers = [];
                                    for (var i = 0; i < pcConfig.iceServers.length; i++) {
                                        var server = pcConfig.iceServers[i];
                                        if (!server.hasOwnProperty('urls') &&
                                            server.hasOwnProperty('url')) {
                                            utils.deprecated('RTCIceServer.url', 'RTCIceServer.urls');
                                            server = JSON.parse(JSON.stringify(server));
                                            server.urls = server.url;
                                            newIceServers.push(server);
                                        } else {
                                            newIceServers.push(pcConfig.iceServers[i]);
                                        }
                                    }
                                    pcConfig.iceServers = newIceServers;
                                }
                                return new OrigPeerConnection(pcConfig, pcConstraints);
                            };
                            window.RTCPeerConnection.prototype = OrigPeerConnection.prototype;
                            // wrap static methods. Currently just generateCertificate.
                            Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
                                get: function() {
                                    return OrigPeerConnection.generateCertificate;
                                }
                            });
                        }

                        var origGetStats = window.RTCPeerConnection.prototype.getStats;
                        window.RTCPeerConnection.prototype.getStats = function(selector,
                            successCallback, errorCallback) {
                            var self = this;
                            var args = arguments;

                            // If selector is a function then we are in the old style stats so just
                            // pass back the original getStats format to avoid breaking old users.
                            if (arguments.length > 0 && typeof selector === 'function') {
                                return origGetStats.apply(this, arguments);
                            }

                            // When spec-style getStats is supported, return those when called with
                            // either no arguments or the selector argument is null.
                            if (origGetStats.length === 0 && (arguments.length === 0 ||
                                    typeof arguments[0] !== 'function')) {
                                return origGetStats.apply(this, []);
                            }

                            var fixChromeStats_ = function(response) {
                                var standardReport = {};
                                var reports = response.result();
                                reports.forEach(function(report) {
                                    var standardStats = {
                                        id: report.id,
                                        timestamp: report.timestamp,
                                        type: {
                                            localcandidate: 'local-candidate',
                                            remotecandidate: 'remote-candidate'
                                        }[report.type] || report.type
                                    };
                                    report.names().forEach(function(name) {
                                        standardStats[name] = report.stat(name);
                                    });
                                    standardReport[standardStats.id] = standardStats;
                                });

                                return standardReport;
                            };

                            // shim getStats with maplike support
                            var makeMapStats = function(stats) {
                                return new Map(Object.keys(stats).map(function(key) {
                                    return [key, stats[key]];
                                }));
                            };

                            if (arguments.length >= 2) {
                                var successCallbackWrapper_ = function(response) {
                                    args[1](makeMapStats(fixChromeStats_(response)));
                                };

                                return origGetStats.apply(this, [successCallbackWrapper_,
                                    arguments[0]
                                ]);
                            }

                            // promise-support
                            return new Promise(function(resolve, reject) {
                                origGetStats.apply(self, [
                                    function(response) {
                                        resolve(makeMapStats(fixChromeStats_(response)));
                                    },
                                    reject
                                ]);
                            }).then(successCallback, errorCallback);
                        };

                        // add promise support -- natively available in Chrome 51
                        if (browserDetails.version < 51) {
                            ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
                            .forEach(function(method) {
                                var nativeMethod = window.RTCPeerConnection.prototype[method];
                                window.RTCPeerConnection.prototype[method] = function() {
                                    var args = arguments;
                                    var self = this;
                                    var promise = new Promise(function(resolve, reject) {
                                        nativeMethod.apply(self, [args[0], resolve, reject]);
                                    });
                                    if (args.length < 2) {
                                        return promise;
                                    }
                                    return promise.then(function() {
                                            args[1].apply(null, []);
                                        },
                                        function(err) {
                                            if (args.length >= 3) {
                                                args[2].apply(null, [err]);
                                            }
                                        });
                                };
                            });
                        }

                        // promise support for createOffer and createAnswer. Available (without
                        // bugs) since M52: crbug/619289
                        if (browserDetails.version < 52) {
                            ['createOffer', 'createAnswer'].forEach(function(method) {
                                var nativeMethod = window.RTCPeerConnection.prototype[method];
                                window.RTCPeerConnection.prototype[method] = function() {
                                    var self = this;
                                    if (arguments.length < 1 || (arguments.length === 1 &&
                                            typeof arguments[0] === 'object')) {
                                        var opts = arguments.length === 1 ? arguments[0] : undefined;
                                        return new Promise(function(resolve, reject) {
                                            nativeMethod.apply(self, [resolve, reject, opts]);
                                        });
                                    }
                                    return nativeMethod.apply(this, arguments);
                                };
                            });
                        }

                        // shim implicit creation of RTCSessionDescription/RTCIceCandidate
                        ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
                        .forEach(function(method) {
                            var nativeMethod = window.RTCPeerConnection.prototype[method];
                            window.RTCPeerConnection.prototype[method] = function() {
                                arguments[0] = new((method === 'addIceCandidate') ?
                                    window.RTCIceCandidate :
                                    window.RTCSessionDescription)(arguments[0]);
                                return nativeMethod.apply(this, arguments);
                            };
                        });

                        // support for addIceCandidate(null or undefined)
                        var nativeAddIceCandidate =
                            window.RTCPeerConnection.prototype.addIceCandidate;
                        window.RTCPeerConnection.prototype.addIceCandidate = function() {
                            if (!arguments[0]) {
                                if (arguments[1]) {
                                    arguments[1].apply(null);
                                }
                                return Promise.resolve();
                            }
                            return nativeAddIceCandidate.apply(this, arguments);
                        };
                    }
                };


                // Expose public methods.
                module.exports = {
                    shimMediaStream: chromeShim.shimMediaStream,
                    shimOnTrack: chromeShim.shimOnTrack,
                    shimAddTrackRemoveTrack: chromeShim.shimAddTrackRemoveTrack,
                    shimGetSendersWithDtmf: chromeShim.shimGetSendersWithDtmf,
                    shimSourceObject: chromeShim.shimSourceObject,
                    shimPeerConnection: chromeShim.shimPeerConnection,
                    shimGetUserMedia: require('./getusermedia')
                };

            }, {
                "../utils.js": 12,
                "./getusermedia": 5
            }],
            5: [function(require, module, exports) {
                /*
                 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
                 *
                 *  Use of this source code is governed by a BSD-style license
                 *  that can be found in the LICENSE file in the root of the source
                 *  tree.
                 */
                /* eslint-env node */
                'use strict';
                var utils = require('../utils.js');
                var logging = utils.log;

                // Expose public methods.
                module.exports = function(window) {
                    var browserDetails = utils.detectBrowser(window);
                    var navigator = window && window.navigator;

                    var constraintsToChrome_ = function(c) {
                        if (typeof c !== 'object' || c.mandatory || c.optional) {
                            return c;
                        }
                        var cc = {};
                        Object.keys(c).forEach(function(key) {
                            if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
                                return;
                            }
                            var r = (typeof c[key] === 'object') ? c[key] : {
                                ideal: c[key]
                            };
                            if (r.exact !== undefined && typeof r.exact === 'number') {
                                r.min = r.max = r.exact;
                            }
                            var oldname_ = function(prefix, name) {
                                if (prefix) {
                                    return prefix + name.charAt(0).toUpperCase() + name.slice(1);
                                }
                                return (name === 'deviceId') ? 'sourceId' : name;
                            };
                            if (r.ideal !== undefined) {
                                cc.optional = cc.optional || [];
                                var oc = {};
                                if (typeof r.ideal === 'number') {
                                    oc[oldname_('min', key)] = r.ideal;
                                    cc.optional.push(oc);
                                    oc = {};
                                    oc[oldname_('max', key)] = r.ideal;
                                    cc.optional.push(oc);
                                } else {
                                    oc[oldname_('', key)] = r.ideal;
                                    cc.optional.push(oc);
                                }
                            }
                            if (r.exact !== undefined && typeof r.exact !== 'number') {
                                cc.mandatory = cc.mandatory || {};
                                cc.mandatory[oldname_('', key)] = r.exact;
                            } else {
                                ['min', 'max'].forEach(function(mix) {
                                    if (r[mix] !== undefined) {
                                        cc.mandatory = cc.mandatory || {};
                                        cc.mandatory[oldname_(mix, key)] = r[mix];
                                    }
                                });
                            }
                        });
                        if (c.advanced) {
                            cc.optional = (cc.optional || []).concat(c.advanced);
                        }
                        return cc;
                    };

                    var shimConstraints_ = function(constraints, func) {
                        constraints = JSON.parse(JSON.stringify(constraints));
                        if (constraints && typeof constraints.audio === 'object') {
                            var remap = function(obj, a, b) {
                                if (a in obj && !(b in obj)) {
                                    obj[b] = obj[a];
                                    delete obj[a];
                                }
                            };
                            constraints = JSON.parse(JSON.stringify(constraints));
                            remap(constraints.audio, 'autoGainControl', 'googAutoGainControl');
                            remap(constraints.audio, 'noiseSuppression', 'googNoiseSuppression');
                            constraints.audio = constraintsToChrome_(constraints.audio);
                        }
                        if (constraints && typeof constraints.video === 'object') {
                            // Shim facingMode for mobile & surface pro.
                            var face = constraints.video.facingMode;
                            face = face && ((typeof face === 'object') ? face : {
                                ideal: face
                            });
                            var getSupportedFacingModeLies = browserDetails.version < 61;

                            if ((face && (face.exact === 'user' || face.exact === 'environment' ||
                                    face.ideal === 'user' || face.ideal === 'environment')) &&
                                !(navigator.mediaDevices.getSupportedConstraints &&
                                    navigator.mediaDevices.getSupportedConstraints().facingMode &&
                                    !getSupportedFacingModeLies)) {
                                delete constraints.video.facingMode;
                                var matches;
                                if (face.exact === 'environment' || face.ideal === 'environment') {
                                    matches = ['back', 'rear'];
                                } else if (face.exact === 'user' || face.ideal === 'user') {
                                    matches = ['front'];
                                }
                                if (matches) {
                                    // Look for matches in label, or use last cam for back (typical).
                                    return navigator.mediaDevices.enumerateDevices()
                                        .then(function(devices) {
                                            devices = devices.filter(function(d) {
                                                return d.kind === 'videoinput';
                                            });
                                            var dev = devices.find(function(d) {
                                                return matches.some(function(match) {
                                                    return d.label.toLowerCase().indexOf(match) !== -1;
                                                });
                                            });
                                            if (!dev && devices.length && matches.indexOf('back') !== -1) {
                                                dev = devices[devices.length - 1]; // more likely the back cam
                                            }
                                            if (dev) {
                                                constraints.video.deviceId = face.exact ? {
                                                    exact: dev.deviceId
                                                } : {
                                                    ideal: dev.deviceId
                                                };
                                            }
                                            constraints.video = constraintsToChrome_(constraints.video);
                                            logging('chrome: ' + JSON.stringify(constraints));
                                            return func(constraints);
                                        });
                                }
                            }
                            constraints.video = constraintsToChrome_(constraints.video);
                        }
                        logging('chrome: ' + JSON.stringify(constraints));
                        return func(constraints);
                    };

                    var shimError_ = function(e) {
                        return {
                            name: {
                                PermissionDeniedError: 'NotAllowedError',
                                InvalidStateError: 'NotReadableError',
                                DevicesNotFoundError: 'NotFoundError',
                                ConstraintNotSatisfiedError: 'OverconstrainedError',
                                TrackStartError: 'NotReadableError',
                                MediaDeviceFailedDueToShutdown: 'NotReadableError',
                                MediaDeviceKillSwitchOn: 'NotReadableError'
                            }[e.name] || e.name,
                            message: e.message,
                            constraint: e.constraintName,
                            toString: function() {
                                return this.name + (this.message && ': ') + this.message;
                            }
                        };
                    };

                    var getUserMedia_ = function(constraints, onSuccess, onError) {
                        shimConstraints_(constraints, function(c) {
                            navigator.webkitGetUserMedia(c, onSuccess, function(e) {
                                onError(shimError_(e));
                            });
                        });
                    };

                    navigator.getUserMedia = getUserMedia_;

                    // Returns the result of getUserMedia as a Promise.
                    var getUserMediaPromise_ = function(constraints) {
                        return new Promise(function(resolve, reject) {
                            navigator.getUserMedia(constraints, resolve, reject);
                        });
                    };

                    if (!navigator.mediaDevices) {
                        navigator.mediaDevices = {
                            getUserMedia: getUserMediaPromise_,
                            enumerateDevices: function() {
                                return new Promise(function(resolve) {
                                    var kinds = {
                                        audio: 'audioinput',
                                        video: 'videoinput'
                                    };
                                    return window.MediaStreamTrack.getSources(function(devices) {
                                        resolve(devices.map(function(device) {
                                            return {
                                                label: device.label,
                                                kind: kinds[device.kind],
                                                deviceId: device.id,
                                                groupId: ''
                                            };
                                        }));
                                    });
                                });
                            },
                            getSupportedConstraints: function() {
                                return {
                                    deviceId: true,
                                    echoCancellation: true,
                                    facingMode: true,
                                    frameRate: true,
                                    height: true,
                                    width: true
                                };
                            }
                        };
                    }

                    // A shim for getUserMedia method on the mediaDevices object.
                    // TODO(KaptenJansson) remove once implemented in Chrome stable.
                    if (!navigator.mediaDevices.getUserMedia) {
                        navigator.mediaDevices.getUserMedia = function(constraints) {
                            return getUserMediaPromise_(constraints);
                        };
                    } else {
                        // Even though Chrome 45 has navigator.mediaDevices and a getUserMedia
                        // function which returns a Promise, it does not accept spec-style
                        // constraints.
                        var origGetUserMedia = navigator.mediaDevices.getUserMedia.
                        bind(navigator.mediaDevices);
                        navigator.mediaDevices.getUserMedia = function(cs) {
                            return shimConstraints_(cs, function(c) {
                                return origGetUserMedia(c).then(function(stream) {
                                    if (c.audio && !stream.getAudioTracks().length ||
                                        c.video && !stream.getVideoTracks().length) {
                                        stream.getTracks().forEach(function(track) {
                                            track.stop();
                                        });
                                        throw new DOMException('', 'NotFoundError');
                                    }
                                    return stream;
                                }, function(e) {
                                    return Promise.reject(shimError_(e));
                                });
                            });
                        };
                    }

                    // Dummy devicechange event methods.
                    // TODO(KaptenJansson) remove once implemented in Chrome stable.
                    if (typeof navigator.mediaDevices.addEventListener === 'undefined') {
                        navigator.mediaDevices.addEventListener = function() {
                            logging('Dummy mediaDevices.addEventListener called.');
                        };
                    }
                    if (typeof navigator.mediaDevices.removeEventListener === 'undefined') {
                        navigator.mediaDevices.removeEventListener = function() {
                            logging('Dummy mediaDevices.removeEventListener called.');
                        };
                    }
                };

            }, {
                "../utils.js": 12
            }],
            6: [function(require, module, exports) {
                /*
                 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
                 *
                 *  Use of this source code is governed by a BSD-style license
                 *  that can be found in the LICENSE file in the root of the source
                 *  tree.
                 */
                /* eslint-env node */
                'use strict';

                var utils = require('../utils');
                var shimRTCPeerConnection = require('./rtcpeerconnection_shim');

                module.exports = {
                    shimGetUserMedia: require('./getusermedia'),
                    shimPeerConnection: function(window) {
                        var browserDetails = utils.detectBrowser(window);

                        if (window.RTCIceGatherer) {
                            // ORTC defines an RTCIceCandidate object but no constructor.
                            // Not implemented in Edge.
                            if (!window.RTCIceCandidate) {
                                window.RTCIceCandidate = function(args) {
                                    return args;
                                };
                            }
                            // ORTC does not have a session description object but
                            // other browsers (i.e. Chrome) that will support both PC and ORTC
                            // in the future might have this defined already.
                            if (!window.RTCSessionDescription) {
                                window.RTCSessionDescription = function(args) {
                                    return args;
                                };
                            }
                            // this adds an additional event listener to MediaStrackTrack that signals
                            // when a tracks enabled property was changed. Workaround for a bug in
                            // addStream, see below. No longer required in 15025+
                            if (browserDetails.version < 15025) {
                                var origMSTEnabled = Object.getOwnPropertyDescriptor(
                                    window.MediaStreamTrack.prototype, 'enabled');
                                Object.defineProperty(window.MediaStreamTrack.prototype, 'enabled', {
                                    set: function(value) {
                                        origMSTEnabled.set.call(this, value);
                                        var ev = new Event('enabled');
                                        ev.enabled = value;
                                        this.dispatchEvent(ev);
                                    }
                                });
                            }
                        }

                        // ORTC defines the DTMF sender a bit different.
                        // https://github.com/w3c/ortc/issues/714
                        if (window.RTCRtpSender && !('dtmf' in window.RTCRtpSender.prototype)) {
                            Object.defineProperty(window.RTCRtpSender.prototype, 'dtmf', {
                                get: function() {
                                    if (this._dtmf === undefined) {
                                        if (this.track.kind === 'audio') {
                                            this._dtmf = new window.RTCDtmfSender(this);
                                        } else if (this.track.kind === 'video') {
                                            this._dtmf = null;
                                        }
                                    }
                                    return this._dtmf;
                                }
                            });
                        }

                        window.RTCPeerConnection =
                            shimRTCPeerConnection(window, browserDetails.version);
                    },
                    shimReplaceTrack: function(window) {
                        // ORTC has replaceTrack -- https://github.com/w3c/ortc/issues/614
                        if (window.RTCRtpSender &&
                            !('replaceTrack' in window.RTCRtpSender.prototype)) {
                            window.RTCRtpSender.prototype.replaceTrack =
                                window.RTCRtpSender.prototype.setTrack;
                        }
                    }
                };

            }, {
                "../utils": 12,
                "./getusermedia": 7,
                "./rtcpeerconnection_shim": 8
            }],
            7: [function(require, module, exports) {
                /*
                 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
                 *
                 *  Use of this source code is governed by a BSD-style license
                 *  that can be found in the LICENSE file in the root of the source
                 *  tree.
                 */
                /* eslint-env node */
                'use strict';

                // Expose public methods.
                module.exports = function(window) {
                    var navigator = window && window.navigator;

                    var shimError_ = function(e) {
                        return {
                            name: {
                                PermissionDeniedError: 'NotAllowedError'
                            }[e.name] || e.name,
                            message: e.message,
                            constraint: e.constraint,
                            toString: function() {
                                return this.name;
                            }
                        };
                    };

                    // getUserMedia error shim.
                    var origGetUserMedia = navigator.mediaDevices.getUserMedia.
                    bind(navigator.mediaDevices);
                    navigator.mediaDevices.getUserMedia = function(c) {
                        return origGetUserMedia(c).catch(function(e) {
                            return Promise.reject(shimError_(e));
                        });
                    };
                };

            }, {}],
            8: [function(require, module, exports) {
                /*
                 *  Copyright (c) 2017 The WebRTC project authors. All Rights Reserved.
                 *
                 *  Use of this source code is governed by a BSD-style license
                 *  that can be found in the LICENSE file in the root of the source
                 *  tree.
                 */
                /* eslint-env node */
                'use strict';

                var SDPUtils = require('sdp');

                // sort tracks such that they follow an a-v-a-v...
                // pattern.
                function sortTracks(tracks) {
                    var audioTracks = tracks.filter(function(track) {
                        return track.kind === 'audio';
                    });
                    var videoTracks = tracks.filter(function(track) {
                        return track.kind === 'video';
                    });
                    tracks = [];
                    while (audioTracks.length || videoTracks.length) {
                        if (audioTracks.length) {
                            tracks.push(audioTracks.shift());
                        }
                        if (videoTracks.length) {
                            tracks.push(videoTracks.shift());
                        }
                    }
                    return tracks;
                }

                // Edge does not like
                // 1) stun:
                // 2) turn: that does not have all of turn:host:port?transport=udp
                // 3) turn: with ipv6 addresses
                // 4) turn: occurring muliple times
                function filterIceServers(iceServers, edgeVersion) {
                    var hasTurn = false;
                    iceServers = JSON.parse(JSON.stringify(iceServers));
                    return iceServers.filter(function(server) {
                        if (server && (server.urls || server.url)) {
                            var urls = server.urls || server.url;
                            if (server.url && !server.urls) {
                                console.warn('RTCIceServer.url is deprecated! Use urls instead.');
                            }
                            var isString = typeof urls === 'string';
                            if (isString) {
                                urls = [urls];
                            }
                            urls = urls.filter(function(url) {
                                var validTurn = url.indexOf('turn:') === 0 &&
                                    url.indexOf('transport=udp') !== -1 &&
                                    url.indexOf('turn:[') === -1 &&
                                    !hasTurn;

                                if (validTurn) {
                                    hasTurn = true;
                                    return true;
                                }
                                return url.indexOf('stun:') === 0 && edgeVersion >= 14393;
                            });

                            delete server.url;
                            server.urls = isString ? urls[0] : urls;
                            return !!urls.length;
                        }
                        return false;
                    });
                }

                // Determines the intersection of local and remote capabilities.
                function getCommonCapabilities(localCapabilities, remoteCapabilities) {
                    var commonCapabilities = {
                        codecs: [],
                        headerExtensions: [],
                        fecMechanisms: []
                    };

                    var findCodecByPayloadType = function(pt, codecs) {
                        pt = parseInt(pt, 10);
                        for (var i = 0; i < codecs.length; i++) {
                            if (codecs[i].payloadType === pt ||
                                codecs[i].preferredPayloadType === pt) {
                                return codecs[i];
                            }
                        }
                    };

                    var rtxCapabilityMatches = function(lRtx, rRtx, lCodecs, rCodecs) {
                        var lCodec = findCodecByPayloadType(lRtx.parameters.apt, lCodecs);
                        var rCodec = findCodecByPayloadType(rRtx.parameters.apt, rCodecs);
                        return lCodec && rCodec &&
                            lCodec.name.toLowerCase() === rCodec.name.toLowerCase();
                    };

                    localCapabilities.codecs.forEach(function(lCodec) {
                        for (var i = 0; i < remoteCapabilities.codecs.length; i++) {
                            var rCodec = remoteCapabilities.codecs[i];
                            if (lCodec.name.toLowerCase() === rCodec.name.toLowerCase() &&
                                lCodec.clockRate === rCodec.clockRate) {
                                if (lCodec.name.toLowerCase() === 'rtx' &&
                                    lCodec.parameters && rCodec.parameters.apt) {
                                    // for RTX we need to find the local rtx that has a apt
                                    // which points to the same local codec as the remote one.
                                    if (!rtxCapabilityMatches(lCodec, rCodec,
                                            localCapabilities.codecs, remoteCapabilities.codecs)) {
                                        continue;
                                    }
                                }
                                rCodec = JSON.parse(JSON.stringify(rCodec)); // deepcopy
                                // number of channels is the highest common number of channels
                                rCodec.numChannels = Math.min(lCodec.numChannels,
                                    rCodec.numChannels);
                                // push rCodec so we reply with offerer payload type
                                commonCapabilities.codecs.push(rCodec);

                                // determine common feedback mechanisms
                                rCodec.rtcpFeedback = rCodec.rtcpFeedback.filter(function(fb) {
                                    for (var j = 0; j < lCodec.rtcpFeedback.length; j++) {
                                        if (lCodec.rtcpFeedback[j].type === fb.type &&
                                            lCodec.rtcpFeedback[j].parameter === fb.parameter) {
                                            return true;
                                        }
                                    }
                                    return false;
                                });
                                // FIXME: also need to determine .parameters
                                //  see https://github.com/openpeer/ortc/issues/569
                                break;
                            }
                        }
                    });

                    localCapabilities.headerExtensions.forEach(function(lHeaderExtension) {
                        for (var i = 0; i < remoteCapabilities.headerExtensions.length; i++) {
                            var rHeaderExtension = remoteCapabilities.headerExtensions[i];
                            if (lHeaderExtension.uri === rHeaderExtension.uri) {
                                commonCapabilities.headerExtensions.push(rHeaderExtension);
                                break;
                            }
                        }
                    });

                    // FIXME: fecMechanisms
                    return commonCapabilities;
                }

                // is action=setLocalDescription with type allowed in signalingState
                function isActionAllowedInSignalingState(action, type, signalingState) {
                    return {
                        offer: {
                            setLocalDescription: ['stable', 'have-local-offer'],
                            setRemoteDescription: ['stable', 'have-remote-offer']
                        },
                        answer: {
                            setLocalDescription: ['have-remote-offer', 'have-local-pranswer'],
                            setRemoteDescription: ['have-local-offer', 'have-remote-pranswer']
                        }
                    }[type][action].indexOf(signalingState) !== -1;
                }

                module.exports = function(window, edgeVersion) {
                    var RTCPeerConnection = function(config) {
                        var self = this;

                        var _eventTarget = document.createDocumentFragment();
                        ['addEventListener', 'removeEventListener', 'dispatchEvent']
                        .forEach(function(method) {
                            self[method] = _eventTarget[method].bind(_eventTarget);
                        });

                        this.needNegotiation = false;

                        this.onicecandidate = null;
                        this.onaddstream = null;
                        this.ontrack = null;
                        this.onremovestream = null;
                        this.onsignalingstatechange = null;
                        this.oniceconnectionstatechange = null;
                        this.onicegatheringstatechange = null;
                        this.onnegotiationneeded = null;
                        this.ondatachannel = null;
                        this.canTrickleIceCandidates = null;

                        this.localStreams = [];
                        this.remoteStreams = [];
                        this.getLocalStreams = function() {
                            return self.localStreams;
                        };
                        this.getRemoteStreams = function() {
                            return self.remoteStreams;
                        };

                        this.localDescription = new window.RTCSessionDescription({
                            type: '',
                            sdp: ''
                        });
                        this.remoteDescription = new window.RTCSessionDescription({
                            type: '',
                            sdp: ''
                        });
                        this.signalingState = 'stable';
                        this.iceConnectionState = 'new';
                        this.iceGatheringState = 'new';

                        this.iceOptions = {
                            gatherPolicy: 'all',
                            iceServers: []
                        };
                        if (config && config.iceTransportPolicy) {
                            switch (config.iceTransportPolicy) {
                                case 'all':
                                case 'relay':
                                    this.iceOptions.gatherPolicy = config.iceTransportPolicy;
                                    break;
                                default:
                                    // don't set iceTransportPolicy.
                                    break;
                            }
                        }
                        this.usingBundle = config && config.bundlePolicy === 'max-bundle';

                        if (config && config.iceServers) {
                            this.iceOptions.iceServers = filterIceServers(config.iceServers,
                                edgeVersion);
                        }
                        this._config = config || {};

                        // per-track iceGathers, iceTransports, dtlsTransports, rtpSenders, ...
                        // everything that is needed to describe a SDP m-line.
                        this.transceivers = [];

                        // since the iceGatherer is currently created in createOffer but we
                        // must not emit candidates until after setLocalDescription we buffer
                        // them in this array.
                        this._localIceCandidatesBuffer = [];

                        this._sdpSessionId = SDPUtils.generateSessionId();
                    };

                    RTCPeerConnection.prototype._emitGatheringStateChange = function() {
                        var event = new Event('icegatheringstatechange');
                        this.dispatchEvent(event);
                        if (this.onicegatheringstatechange !== null) {
                            this.onicegatheringstatechange(event);
                        }
                    };

                    RTCPeerConnection.prototype._emitBufferedCandidates = function() {
                        var self = this;
                        var sections = SDPUtils.splitSections(self.localDescription.sdp);
                        // FIXME: need to apply ice candidates in a way which is async but
                        // in-order
                        this._localIceCandidatesBuffer.forEach(function(event) {
                            var end = !event.candidate || Object.keys(event.candidate).length === 0;
                            if (end) {
                                for (var j = 1; j < sections.length; j++) {
                                    if (sections[j].indexOf('\r\na=end-of-candidates\r\n') === -1) {
                                        sections[j] += 'a=end-of-candidates\r\n';
                                    }
                                }
                            } else {
                                sections[event.candidate.sdpMLineIndex + 1] +=
                                    'a=' + event.candidate.candidate + '\r\n';
                            }
                            self.localDescription.sdp = sections.join('');
                            self.dispatchEvent(event);
                            if (self.onicecandidate !== null) {
                                self.onicecandidate(event);
                            }
                            if (!event.candidate && self.iceGatheringState !== 'complete') {
                                var complete = self.transceivers.every(function(transceiver) {
                                    return transceiver.iceGatherer &&
                                        transceiver.iceGatherer.state === 'completed';
                                });
                                if (complete && self.iceGatheringStateChange !== 'complete') {
                                    self.iceGatheringState = 'complete';
                                    self._emitGatheringStateChange();
                                }
                            }
                        });
                        this._localIceCandidatesBuffer = [];
                    };

                    RTCPeerConnection.prototype.getConfiguration = function() {
                        return this._config;
                    };

                    // internal helper to create a transceiver object.
                    // (whih is not yet the same as the WebRTC 1.0 transceiver)
                    RTCPeerConnection.prototype._createTransceiver = function(kind) {
                        var hasBundleTransport = this.transceivers.length > 0;
                        var transceiver = {
                            track: null,
                            iceGatherer: null,
                            iceTransport: null,
                            dtlsTransport: null,
                            localCapabilities: null,
                            remoteCapabilities: null,
                            rtpSender: null,
                            rtpReceiver: null,
                            kind: kind,
                            mid: null,
                            sendEncodingParameters: null,
                            recvEncodingParameters: null,
                            stream: null,
                            wantReceive: true
                        };
                        if (this.usingBundle && hasBundleTransport) {
                            transceiver.iceTransport = this.transceivers[0].iceTransport;
                            transceiver.dtlsTransport = this.transceivers[0].dtlsTransport;
                        } else {
                            var transports = this._createIceAndDtlsTransports();
                            transceiver.iceTransport = transports.iceTransport;
                            transceiver.dtlsTransport = transports.dtlsTransport;
                        }
                        this.transceivers.push(transceiver);
                        return transceiver;
                    };

                    RTCPeerConnection.prototype.addTrack = function(track, stream) {
                        var transceiver;
                        for (var i = 0; i < this.transceivers.length; i++) {
                            if (!this.transceivers[i].track &&
                                this.transceivers[i].kind === track.kind) {
                                transceiver = this.transceivers[i];
                            }
                        }
                        if (!transceiver) {
                            transceiver = this._createTransceiver(track.kind);
                        }

                        transceiver.track = track;
                        transceiver.stream = stream;
                        transceiver.rtpSender = new window.RTCRtpSender(track,
                            transceiver.dtlsTransport);

                        this._maybeFireNegotiationNeeded();
                        return transceiver.rtpSender;
                    };

                    RTCPeerConnection.prototype.addStream = function(stream) {
                        var self = this;
                        if (edgeVersion >= 15025) {
                            this.localStreams.push(stream);
                            stream.getTracks().forEach(function(track) {
                                self.addTrack(track, stream);
                            });
                        } else {
                            // Clone is necessary for local demos mostly, attaching directly
                            // to two different senders does not work (build 10547).
                            // Fixed in 15025 (or earlier)
                            var clonedStream = stream.clone();
                            stream.getTracks().forEach(function(track, idx) {
                                var clonedTrack = clonedStream.getTracks()[idx];
                                track.addEventListener('enabled', function(event) {
                                    clonedTrack.enabled = event.enabled;
                                });
                            });
                            clonedStream.getTracks().forEach(function(track) {
                                self.addTrack(track, clonedStream);
                            });
                            this.localStreams.push(clonedStream);
                        }
                        this._maybeFireNegotiationNeeded();
                    };

                    RTCPeerConnection.prototype.removeStream = function(stream) {
                        var idx = this.localStreams.indexOf(stream);
                        if (idx > -1) {
                            this.localStreams.splice(idx, 1);
                            this._maybeFireNegotiationNeeded();
                        }
                    };

                    RTCPeerConnection.prototype.getSenders = function() {
                        return this.transceivers.filter(function(transceiver) {
                                return !!transceiver.rtpSender;
                            })
                            .map(function(transceiver) {
                                return transceiver.rtpSender;
                            });
                    };

                    RTCPeerConnection.prototype.getReceivers = function() {
                        return this.transceivers.filter(function(transceiver) {
                                return !!transceiver.rtpReceiver;
                            })
                            .map(function(transceiver) {
                                return transceiver.rtpReceiver;
                            });
                    };

                    // Create ICE gatherer and hook it up.
                    RTCPeerConnection.prototype._createIceGatherer = function(mid,
                        sdpMLineIndex) {
                        var self = this;
                        var iceGatherer = new window.RTCIceGatherer(self.iceOptions);
                        iceGatherer.onlocalcandidate = function(evt) {
                            var event = new Event('icecandidate');
                            event.candidate = {
                                sdpMid: mid,
                                sdpMLineIndex: sdpMLineIndex
                            };

                            var cand = evt.candidate;
                            var end = !cand || Object.keys(cand).length === 0;
                            // Edge emits an empty object for RTCIceCandidateComplete‥
                            if (end) {
                                // polyfill since RTCIceGatherer.state is not implemented in
                                // Edge 10547 yet.
                                if (iceGatherer.state === undefined) {
                                    iceGatherer.state = 'completed';
                                }
                            } else {
                                // RTCIceCandidate doesn't have a component, needs to be added
                                cand.component = 1;
                                event.candidate.candidate = SDPUtils.writeCandidate(cand);
                            }

                            // update local description.
                            var sections = SDPUtils.splitSections(self.localDescription.sdp);
                            if (!end) {
                                sections[event.candidate.sdpMLineIndex + 1] +=
                                    'a=' + event.candidate.candidate + '\r\n';
                            } else {
                                sections[event.candidate.sdpMLineIndex + 1] +=
                                    'a=end-of-candidates\r\n';
                            }
                            self.localDescription.sdp = sections.join('');
                            var transceivers = self._pendingOffer ? self._pendingOffer :
                                self.transceivers;
                            var complete = transceivers.every(function(transceiver) {
                                return transceiver.iceGatherer &&
                                    transceiver.iceGatherer.state === 'completed';
                            });

                            // Emit candidate if localDescription is set.
                            // Also emits null candidate when all gatherers are complete.
                            switch (self.iceGatheringState) {
                                case 'new':
                                    if (!end) {
                                        self._localIceCandidatesBuffer.push(event);
                                    }
                                    if (end && complete) {
                                        self._localIceCandidatesBuffer.push(
                                            new Event('icecandidate'));
                                    }
                                    break;
                                case 'gathering':
                                    self._emitBufferedCandidates();
                                    if (!end) {
                                        self.dispatchEvent(event);
                                        if (self.onicecandidate !== null) {
                                            self.onicecandidate(event);
                                        }
                                    }
                                    if (complete) {
                                        self.dispatchEvent(new Event('icecandidate'));
                                        if (self.onicecandidate !== null) {
                                            self.onicecandidate(new Event('icecandidate'));
                                        }
                                        self.iceGatheringState = 'complete';
                                        self._emitGatheringStateChange();
                                    }
                                    break;
                                case 'complete':
                                    // should not happen... currently!
                                    break;
                                default: // no-op.
                                    break;
                            }
                        };
                        return iceGatherer;
                    };

                    // Create ICE transport and DTLS transport.
                    RTCPeerConnection.prototype._createIceAndDtlsTransports = function() {
                        var self = this;
                        var iceTransport = new window.RTCIceTransport(null);
                        iceTransport.onicestatechange = function() {
                            self._updateConnectionState();
                        };

                        var dtlsTransport = new window.RTCDtlsTransport(iceTransport);
                        dtlsTransport.ondtlsstatechange = function() {
                            self._updateConnectionState();
                        };
                        dtlsTransport.onerror = function() {
                            // onerror does not set state to failed by itself.
                            Object.defineProperty(dtlsTransport, 'state', {
                                value: 'failed',
                                writable: true
                            });
                            self._updateConnectionState();
                        };

                        return {
                            iceTransport: iceTransport,
                            dtlsTransport: dtlsTransport
                        };
                    };

                    // Destroy ICE gatherer, ICE transport and DTLS transport.
                    // Without triggering the callbacks.
                    RTCPeerConnection.prototype._disposeIceAndDtlsTransports = function(
                        sdpMLineIndex) {
                        var iceGatherer = this.transceivers[sdpMLineIndex].iceGatherer;
                        if (iceGatherer) {
                            delete iceGatherer.onlocalcandidate;
                            delete this.transceivers[sdpMLineIndex].iceGatherer;
                        }
                        var iceTransport = this.transceivers[sdpMLineIndex].iceTransport;
                        if (iceTransport) {
                            delete iceTransport.onicestatechange;
                            delete this.transceivers[sdpMLineIndex].iceTransport;
                        }
                        var dtlsTransport = this.transceivers[sdpMLineIndex].dtlsTransport;
                        if (dtlsTransport) {
                            delete dtlsTransport.ondtlsstatechange;
                            delete dtlsTransport.onerror;
                            delete this.transceivers[sdpMLineIndex].dtlsTransport;
                        }
                    };

                    // Start the RTP Sender and Receiver for a transceiver.
                    RTCPeerConnection.prototype._transceive = function(transceiver,
                        send, recv) {
                        var params = getCommonCapabilities(transceiver.localCapabilities,
                            transceiver.remoteCapabilities);
                        if (send && transceiver.rtpSender) {
                            params.encodings = transceiver.sendEncodingParameters;
                            params.rtcp = {
                                cname: SDPUtils.localCName,
                                compound: transceiver.rtcpParameters.compound
                            };
                            if (transceiver.recvEncodingParameters.length) {
                                params.rtcp.ssrc = transceiver.recvEncodingParameters[0].ssrc;
                            }
                            transceiver.rtpSender.send(params);
                        }
                        if (recv && transceiver.rtpReceiver) {
                            // remove RTX field in Edge 14942
                            if (transceiver.kind === 'video' &&
                                transceiver.recvEncodingParameters &&
                                edgeVersion < 15019) {
                                transceiver.recvEncodingParameters.forEach(function(p) {
                                    delete p.rtx;
                                });
                            }
                            params.encodings = transceiver.recvEncodingParameters;
                            params.rtcp = {
                                cname: transceiver.rtcpParameters.cname,
                                compound: transceiver.rtcpParameters.compound
                            };
                            if (transceiver.sendEncodingParameters.length) {
                                params.rtcp.ssrc = transceiver.sendEncodingParameters[0].ssrc;
                            }
                            transceiver.rtpReceiver.receive(params);
                        }
                    };

                    RTCPeerConnection.prototype.setLocalDescription = function(description) {
                        var self = this;

                        if (!isActionAllowedInSignalingState('setLocalDescription',
                                description.type, this.signalingState)) {
                            var e = new Error('Can not set local ' + description.type +
                                ' in state ' + this.signalingState);
                            e.name = 'InvalidStateError';
                            if (arguments.length > 2 && typeof arguments[2] === 'function') {
                                window.setTimeout(arguments[2], 0, e);
                            }
                            return Promise.reject(e);
                        }

                        var sections;
                        var sessionpart;
                        if (description.type === 'offer') {
                            // FIXME: What was the purpose of this empty if statement?
                            // if (!this._pendingOffer) {
                            // } else {
                            if (this._pendingOffer) {
                                // VERY limited support for SDP munging. Limited to:
                                // * changing the order of codecs
                                sections = SDPUtils.splitSections(description.sdp);
                                sessionpart = sections.shift();
                                sections.forEach(function(mediaSection, sdpMLineIndex) {
                                    var caps = SDPUtils.parseRtpParameters(mediaSection);
                                    self._pendingOffer[sdpMLineIndex].localCapabilities = caps;
                                });
                                this.transceivers = this._pendingOffer;
                                delete this._pendingOffer;
                            }
                        } else if (description.type === 'answer') {
                            sections = SDPUtils.splitSections(self.remoteDescription.sdp);
                            sessionpart = sections.shift();
                            var isIceLite = SDPUtils.matchPrefix(sessionpart,
                                'a=ice-lite').length > 0;
                            sections.forEach(function(mediaSection, sdpMLineIndex) {
                                var transceiver = self.transceivers[sdpMLineIndex];
                                var iceGatherer = transceiver.iceGatherer;
                                var iceTransport = transceiver.iceTransport;
                                var dtlsTransport = transceiver.dtlsTransport;
                                var localCapabilities = transceiver.localCapabilities;
                                var remoteCapabilities = transceiver.remoteCapabilities;

                                var rejected = SDPUtils.isRejected(mediaSection);

                                if (!rejected && !transceiver.isDatachannel) {
                                    var remoteIceParameters = SDPUtils.getIceParameters(
                                        mediaSection, sessionpart);
                                    var remoteDtlsParameters = SDPUtils.getDtlsParameters(
                                        mediaSection, sessionpart);
                                    if (isIceLite) {
                                        remoteDtlsParameters.role = 'server';
                                    }

                                    if (!self.usingBundle || sdpMLineIndex === 0) {
                                        iceTransport.start(iceGatherer, remoteIceParameters,
                                            isIceLite ? 'controlling' : 'controlled');
                                        dtlsTransport.start(remoteDtlsParameters);
                                    }

                                    // Calculate intersection of capabilities.
                                    var params = getCommonCapabilities(localCapabilities,
                                        remoteCapabilities);

                                    // Start the RTCRtpSender. The RTCRtpReceiver for this
                                    // transceiver has already been started in setRemoteDescription.
                                    self._transceive(transceiver,
                                        params.codecs.length > 0,
                                        false);
                                }
                            });
                        }

                        this.localDescription = {
                            type: description.type,
                            sdp: description.sdp
                        };
                        switch (description.type) {
                            case 'offer':
                                this._updateSignalingState('have-local-offer');
                                break;
                            case 'answer':
                                this._updateSignalingState('stable');
                                break;
                            default:
                                throw new TypeError('unsupported type "' + description.type +
                                    '"');
                        }

                        // If a success callback was provided, emit ICE candidates after it
                        // has been executed. Otherwise, emit callback after the Promise is
                        // resolved.
                        var hasCallback = arguments.length > 1 &&
                            typeof arguments[1] === 'function';
                        if (hasCallback) {
                            var cb = arguments[1];
                            window.setTimeout(function() {
                                cb();
                                if (self.iceGatheringState === 'new') {
                                    self.iceGatheringState = 'gathering';
                                    self._emitGatheringStateChange();
                                }
                                self._emitBufferedCandidates();
                            }, 0);
                        }
                        var p = Promise.resolve();
                        p.then(function() {
                            if (!hasCallback) {
                                if (self.iceGatheringState === 'new') {
                                    self.iceGatheringState = 'gathering';
                                    self._emitGatheringStateChange();
                                }
                                // Usually candidates will be emitted earlier.
                                window.setTimeout(self._emitBufferedCandidates.bind(self), 500);
                            }
                        });
                        return p;
                    };

                    RTCPeerConnection.prototype.setRemoteDescription = function(description) {
                        var self = this;

                        if (!isActionAllowedInSignalingState('setRemoteDescription',
                                description.type, this.signalingState)) {
                            var e = new Error('Can not set remote ' + description.type +
                                ' in state ' + this.signalingState);
                            e.name = 'InvalidStateError';
                            if (arguments.length > 2 && typeof arguments[2] === 'function') {
                                window.setTimeout(arguments[2], 0, e);
                            }
                            return Promise.reject(e);
                        }

                        var streams = {};
                        var receiverList = [];
                        var sections = SDPUtils.splitSections(description.sdp);
                        var sessionpart = sections.shift();
                        var isIceLite = SDPUtils.matchPrefix(sessionpart,
                            'a=ice-lite').length > 0;
                        var usingBundle = SDPUtils.matchPrefix(sessionpart,
                            'a=group:BUNDLE ').length > 0;
                        this.usingBundle = usingBundle;
                        var iceOptions = SDPUtils.matchPrefix(sessionpart,
                            'a=ice-options:')[0];
                        if (iceOptions) {
                            this.canTrickleIceCandidates = iceOptions.substr(14).split(' ')
                                .indexOf('trickle') >= 0;
                        } else {
                            this.canTrickleIceCandidates = false;
                        }

                        sections.forEach(function(mediaSection, sdpMLineIndex) {
                            var lines = SDPUtils.splitLines(mediaSection);
                            var kind = SDPUtils.getKind(mediaSection);
                            var rejected = SDPUtils.isRejected(mediaSection);
                            var protocol = lines[0].substr(2).split(' ')[2];

                            var direction = SDPUtils.getDirection(mediaSection, sessionpart);
                            var remoteMsid = SDPUtils.parseMsid(mediaSection);

                            var mid = SDPUtils.getMid(mediaSection) || SDPUtils.generateIdentifier();

                            // Reject datachannels which are not implemented yet.
                            if (kind === 'application' && protocol === 'DTLS/SCTP') {
                                self.transceivers[sdpMLineIndex] = {
                                    mid: mid,
                                    isDatachannel: true
                                };
                                return;
                            }

                            var transceiver;
                            var iceGatherer;
                            var iceTransport;
                            var dtlsTransport;
                            var rtpReceiver;
                            var sendEncodingParameters;
                            var recvEncodingParameters;
                            var localCapabilities;

                            var track;
                            // FIXME: ensure the mediaSection has rtcp-mux set.
                            var remoteCapabilities = SDPUtils.parseRtpParameters(mediaSection);
                            var remoteIceParameters;
                            var remoteDtlsParameters;
                            if (!rejected) {
                                remoteIceParameters = SDPUtils.getIceParameters(mediaSection,
                                    sessionpart);
                                remoteDtlsParameters = SDPUtils.getDtlsParameters(mediaSection,
                                    sessionpart);
                                remoteDtlsParameters.role = 'client';
                            }
                            recvEncodingParameters =
                                SDPUtils.parseRtpEncodingParameters(mediaSection);

                            var rtcpParameters = SDPUtils.parseRtcpParameters(mediaSection);

                            var isComplete = SDPUtils.matchPrefix(mediaSection,
                                'a=end-of-candidates', sessionpart).length > 0;
                            var cands = SDPUtils.matchPrefix(mediaSection, 'a=candidate:')
                                .map(function(cand) {
                                    return SDPUtils.parseCandidate(cand);
                                })
                                .filter(function(cand) {
                                    return cand.component === '1' || cand.component === 1;
                                });

                            // Check if we can use BUNDLE and dispose transports.
                            if ((description.type === 'offer' || description.type === 'answer') &&
                                !rejected && usingBundle && sdpMLineIndex > 0 &&
                                self.transceivers[sdpMLineIndex]) {
                                self._disposeIceAndDtlsTransports(sdpMLineIndex);
                                self.transceivers[sdpMLineIndex].iceGatherer =
                                    self.transceivers[0].iceGatherer;
                                self.transceivers[sdpMLineIndex].iceTransport =
                                    self.transceivers[0].iceTransport;
                                self.transceivers[sdpMLineIndex].dtlsTransport =
                                    self.transceivers[0].dtlsTransport;
                                if (self.transceivers[sdpMLineIndex].rtpSender) {
                                    self.transceivers[sdpMLineIndex].rtpSender.setTransport(
                                        self.transceivers[0].dtlsTransport);
                                }
                                if (self.transceivers[sdpMLineIndex].rtpReceiver) {
                                    self.transceivers[sdpMLineIndex].rtpReceiver.setTransport(
                                        self.transceivers[0].dtlsTransport);
                                }
                            }
                            if (description.type === 'offer' && !rejected) {
                                transceiver = self.transceivers[sdpMLineIndex] ||
                                    self._createTransceiver(kind);
                                transceiver.mid = mid;

                                if (!transceiver.iceGatherer) {
                                    transceiver.iceGatherer = usingBundle && sdpMLineIndex > 0 ?
                                        self.transceivers[0].iceGatherer :
                                        self._createIceGatherer(mid, sdpMLineIndex);
                                }

                                if (isComplete && cands.length &&
                                    (!usingBundle || sdpMLineIndex === 0)) {
                                    transceiver.iceTransport.setRemoteCandidates(cands);
                                }

                                localCapabilities = window.RTCRtpReceiver.getCapabilities(kind);

                                // filter RTX until additional stuff needed for RTX is implemented
                                // in adapter.js
                                if (edgeVersion < 15019) {
                                    localCapabilities.codecs = localCapabilities.codecs.filter(
                                        function(codec) {
                                            return codec.name !== 'rtx';
                                        });
                                }

                                sendEncodingParameters = [{
                                    ssrc: (2 * sdpMLineIndex + 2) * 1001
                                }];

                                if (direction === 'sendrecv' || direction === 'sendonly') {
                                    rtpReceiver = new window.RTCRtpReceiver(transceiver.dtlsTransport,
                                        kind);

                                    track = rtpReceiver.track;
                                    // FIXME: does not work with Plan B.
                                    if (remoteMsid) {
                                        if (!streams[remoteMsid.stream]) {
                                            streams[remoteMsid.stream] = new window.MediaStream();
                                            Object.defineProperty(streams[remoteMsid.stream], 'id', {
                                                get: function() {
                                                    return remoteMsid.stream;
                                                }
                                            });
                                        }
                                        Object.defineProperty(track, 'id', {
                                            get: function() {
                                                return remoteMsid.track;
                                            }
                                        });
                                        streams[remoteMsid.stream].addTrack(track);
                                        receiverList.push([track, rtpReceiver,
                                            streams[remoteMsid.stream]
                                        ]);
                                    } else {
                                        if (!streams.default) {
                                            streams.default = new window.MediaStream();
                                        }
                                        streams.default.addTrack(track);
                                        receiverList.push([track, rtpReceiver, streams.default]);
                                    }
                                }

                                transceiver.localCapabilities = localCapabilities;
                                transceiver.remoteCapabilities = remoteCapabilities;
                                transceiver.rtpReceiver = rtpReceiver;
                                transceiver.rtcpParameters = rtcpParameters;
                                transceiver.sendEncodingParameters = sendEncodingParameters;
                                transceiver.recvEncodingParameters = recvEncodingParameters;

                                // Start the RTCRtpReceiver now. The RTPSender is started in
                                // setLocalDescription.
                                self._transceive(self.transceivers[sdpMLineIndex],
                                    false,
                                    direction === 'sendrecv' || direction === 'sendonly');
                            } else if (description.type === 'answer' && !rejected) {
                                transceiver = self.transceivers[sdpMLineIndex];
                                iceGatherer = transceiver.iceGatherer;
                                iceTransport = transceiver.iceTransport;
                                dtlsTransport = transceiver.dtlsTransport;
                                rtpReceiver = transceiver.rtpReceiver;
                                sendEncodingParameters = transceiver.sendEncodingParameters;
                                localCapabilities = transceiver.localCapabilities;

                                self.transceivers[sdpMLineIndex].recvEncodingParameters =
                                    recvEncodingParameters;
                                self.transceivers[sdpMLineIndex].remoteCapabilities =
                                    remoteCapabilities;
                                self.transceivers[sdpMLineIndex].rtcpParameters = rtcpParameters;

                                if (!usingBundle || sdpMLineIndex === 0) {
                                    if ((isIceLite || isComplete) && cands.length) {
                                        iceTransport.setRemoteCandidates(cands);
                                    }
                                    iceTransport.start(iceGatherer, remoteIceParameters,
                                        'controlling');
                                    dtlsTransport.start(remoteDtlsParameters);
                                }

                                self._transceive(transceiver,
                                    direction === 'sendrecv' || direction === 'recvonly',
                                    direction === 'sendrecv' || direction === 'sendonly');

                                if (rtpReceiver &&
                                    (direction === 'sendrecv' || direction === 'sendonly')) {
                                    track = rtpReceiver.track;
                                    if (remoteMsid) {
                                        if (!streams[remoteMsid.stream]) {
                                            streams[remoteMsid.stream] = new window.MediaStream();
                                        }
                                        streams[remoteMsid.stream].addTrack(track);
                                        receiverList.push([track, rtpReceiver, streams[remoteMsid.stream]]);
                                    } else {
                                        if (!streams.default) {
                                            streams.default = new window.MediaStream();
                                        }
                                        streams.default.addTrack(track);
                                        receiverList.push([track, rtpReceiver, streams.default]);
                                    }
                                } else {
                                    // FIXME: actually the receiver should be created later.
                                    delete transceiver.rtpReceiver;
                                }
                            }
                        });

                        this.remoteDescription = {
                            type: description.type,
                            sdp: description.sdp
                        };
                        switch (description.type) {
                            case 'offer':
                                this._updateSignalingState('have-remote-offer');
                                break;
                            case 'answer':
                                this._updateSignalingState('stable');
                                break;
                            default:
                                throw new TypeError('unsupported type "' + description.type +
                                    '"');
                        }
                        Object.keys(streams).forEach(function(sid) {
                            var stream = streams[sid];
                            if (stream.getTracks().length) {
                                self.remoteStreams.push(stream);
                                var event = new Event('addstream');
                                event.stream = stream;
                                self.dispatchEvent(event);
                                if (self.onaddstream !== null) {
                                    window.setTimeout(function() {
                                        self.onaddstream(event);
                                    }, 0);
                                }

                                receiverList.forEach(function(item) {
                                    var track = item[0];
                                    var receiver = item[1];
                                    if (stream.id !== item[2].id) {
                                        return;
                                    }
                                    var trackEvent = new Event('track');
                                    trackEvent.track = track;
                                    trackEvent.receiver = receiver;
                                    trackEvent.streams = [stream];
                                    self.dispatchEvent(trackEvent);
                                    if (self.ontrack !== null) {
                                        window.setTimeout(function() {
                                            self.ontrack(trackEvent);
                                        }, 0);
                                    }
                                });
                            }
                        });

                        // check whether addIceCandidate({}) was called within four seconds after
                        // setRemoteDescription.
                        window.setTimeout(function() {
                            if (!(self && self.transceivers)) {
                                return;
                            }
                            self.transceivers.forEach(function(transceiver) {
                                if (transceiver.iceTransport &&
                                    transceiver.iceTransport.state === 'new' &&
                                    transceiver.iceTransport.getRemoteCandidates().length > 0) {
                                    console.warn('Timeout for addRemoteCandidate. Consider sending ' +
                                        'an end-of-candidates notification');
                                    transceiver.iceTransport.addRemoteCandidate({});
                                }
                            });
                        }, 4000);

                        if (arguments.length > 1 && typeof arguments[1] === 'function') {
                            window.setTimeout(arguments[1], 0);
                        }
                        return Promise.resolve();
                    };

                    RTCPeerConnection.prototype.close = function() {
                        this.transceivers.forEach(function(transceiver) {
                            /* not yet
                            if (transceiver.iceGatherer) {
                              transceiver.iceGatherer.close();
                            }
                            */
                            if (transceiver.iceTransport) {
                                transceiver.iceTransport.stop();
                            }
                            if (transceiver.dtlsTransport) {
                                transceiver.dtlsTransport.stop();
                            }
                            if (transceiver.rtpSender) {
                                transceiver.rtpSender.stop();
                            }
                            if (transceiver.rtpReceiver) {
                                transceiver.rtpReceiver.stop();
                            }
                        });
                        // FIXME: clean up tracks, local streams, remote streams, etc
                        this._updateSignalingState('closed');
                    };

                    // Update the signaling state.
                    RTCPeerConnection.prototype._updateSignalingState = function(newState) {
                        this.signalingState = newState;
                        var event = new Event('signalingstatechange');
                        this.dispatchEvent(event);
                        if (this.onsignalingstatechange !== null) {
                            this.onsignalingstatechange(event);
                        }
                    };

                    // Determine whether to fire the negotiationneeded event.
                    RTCPeerConnection.prototype._maybeFireNegotiationNeeded = function() {
                        var self = this;
                        if (this.signalingState !== 'stable' || this.needNegotiation === true) {
                            return;
                        }
                        this.needNegotiation = true;
                        window.setTimeout(function() {
                            if (self.needNegotiation === false) {
                                return;
                            }
                            self.needNegotiation = false;
                            var event = new Event('negotiationneeded');
                            self.dispatchEvent(event);
                            if (self.onnegotiationneeded !== null) {
                                self.onnegotiationneeded(event);
                            }
                        }, 0);
                    };

                    // Update the connection state.
                    RTCPeerConnection.prototype._updateConnectionState = function() {
                        var self = this;
                        var newState;
                        var states = {
                            'new': 0,
                            closed: 0,
                            connecting: 0,
                            checking: 0,
                            connected: 0,
                            completed: 0,
                            disconnected: 0,
                            failed: 0
                        };
                        this.transceivers.forEach(function(transceiver) {
                            states[transceiver.iceTransport.state]++;
                            states[transceiver.dtlsTransport.state]++;
                        });
                        // ICETransport.completed and connected are the same for this purpose.
                        states.connected += states.completed;

                        newState = 'new';
                        if (states.failed > 0) {
                            newState = 'failed';
                        } else if (states.connecting > 0 || states.checking > 0) {
                            newState = 'connecting';
                        } else if (states.disconnected > 0) {
                            newState = 'disconnected';
                        } else if (states.new > 0) {
                            newState = 'new';
                        } else if (states.connected > 0 || states.completed > 0) {
                            newState = 'connected';
                        }

                        if (newState !== self.iceConnectionState) {
                            self.iceConnectionState = newState;
                            var event = new Event('iceconnectionstatechange');
                            this.dispatchEvent(event);
                            if (this.oniceconnectionstatechange !== null) {
                                this.oniceconnectionstatechange(event);
                            }
                        }
                    };

                    RTCPeerConnection.prototype.createOffer = function() {
                        var self = this;
                        if (this._pendingOffer) {
                            throw new Error('createOffer called while there is a pending offer.');
                        }
                        var offerOptions;
                        if (arguments.length === 1 && typeof arguments[0] !== 'function') {
                            offerOptions = arguments[0];
                        } else if (arguments.length === 3) {
                            offerOptions = arguments[2];
                        }

                        var numAudioTracks = this.transceivers.filter(function(t) {
                            return t.kind === 'audio';
                        }).length;
                        var numVideoTracks = this.transceivers.filter(function(t) {
                            return t.kind === 'video';
                        }).length;

                        // Determine number of audio and video tracks we need to send/recv.
                        if (offerOptions) {
                            // Reject Chrome legacy constraints.
                            if (offerOptions.mandatory || offerOptions.optional) {
                                throw new TypeError(
                                    'Legacy mandatory/optional constraints not supported.');
                            }
                            if (offerOptions.offerToReceiveAudio !== undefined) {
                                if (offerOptions.offerToReceiveAudio === true) {
                                    numAudioTracks = 1;
                                } else if (offerOptions.offerToReceiveAudio === false) {
                                    numAudioTracks = 0;
                                } else {
                                    numAudioTracks = offerOptions.offerToReceiveAudio;
                                }
                            }
                            if (offerOptions.offerToReceiveVideo !== undefined) {
                                if (offerOptions.offerToReceiveVideo === true) {
                                    numVideoTracks = 1;
                                } else if (offerOptions.offerToReceiveVideo === false) {
                                    numVideoTracks = 0;
                                } else {
                                    numVideoTracks = offerOptions.offerToReceiveVideo;
                                }
                            }
                        }

                        this.transceivers.forEach(function(transceiver) {
                            if (transceiver.kind === 'audio') {
                                numAudioTracks--;
                                if (numAudioTracks < 0) {
                                    transceiver.wantReceive = false;
                                }
                            } else if (transceiver.kind === 'video') {
                                numVideoTracks--;
                                if (numVideoTracks < 0) {
                                    transceiver.wantReceive = false;
                                }
                            }
                        });

                        // Create M-lines for recvonly streams.
                        while (numAudioTracks > 0 || numVideoTracks > 0) {
                            if (numAudioTracks > 0) {
                                this._createTransceiver('audio');
                                numAudioTracks--;
                            }
                            if (numVideoTracks > 0) {
                                this._createTransceiver('video');
                                numVideoTracks--;
                            }
                        }
                        // reorder tracks
                        var transceivers = sortTracks(this.transceivers);

                        var sdp = SDPUtils.writeSessionBoilerplate(this._sdpSessionId);
                        transceivers.forEach(function(transceiver, sdpMLineIndex) {
                            // For each track, create an ice gatherer, ice transport,
                            // dtls transport, potentially rtpsender and rtpreceiver.
                            var track = transceiver.track;
                            var kind = transceiver.kind;
                            var mid = SDPUtils.generateIdentifier();
                            transceiver.mid = mid;

                            if (!transceiver.iceGatherer) {
                                transceiver.iceGatherer = self.usingBundle && sdpMLineIndex > 0 ?
                                    transceivers[0].iceGatherer :
                                    self._createIceGatherer(mid, sdpMLineIndex);
                            }

                            var localCapabilities = window.RTCRtpSender.getCapabilities(kind);
                            // filter RTX until additional stuff needed for RTX is implemented
                            // in adapter.js
                            if (edgeVersion < 15019) {
                                localCapabilities.codecs = localCapabilities.codecs.filter(
                                    function(codec) {
                                        return codec.name !== 'rtx';
                                    });
                            }
                            localCapabilities.codecs.forEach(function(codec) {
                                // work around https://bugs.chromium.org/p/webrtc/issues/detail?id=6552
                                // by adding level-asymmetry-allowed=1
                                if (codec.name === 'H264' &&
                                    codec.parameters['level-asymmetry-allowed'] === undefined) {
                                    codec.parameters['level-asymmetry-allowed'] = '1';
                                }
                            });

                            // generate an ssrc now, to be used later in rtpSender.send
                            var sendEncodingParameters = [{
                                ssrc: (2 * sdpMLineIndex + 1) * 1001
                            }];
                            if (track) {
                                // add RTX
                                if (edgeVersion >= 15019 && kind === 'video') {
                                    sendEncodingParameters[0].rtx = {
                                        ssrc: (2 * sdpMLineIndex + 1) * 1001 + 1
                                    };
                                }
                            }

                            if (transceiver.wantReceive) {
                                transceiver.rtpReceiver = new window.RTCRtpReceiver(
                                    transceiver.dtlsTransport,
                                    kind
                                );
                            }

                            transceiver.localCapabilities = localCapabilities;
                            transceiver.sendEncodingParameters = sendEncodingParameters;
                        });

                        // always offer BUNDLE and dispose on return if not supported.
                        if (this._config.bundlePolicy !== 'max-compat') {
                            sdp += 'a=group:BUNDLE ' + transceivers.map(function(t) {
                                return t.mid;
                            }).join(' ') + '\r\n';
                        }
                        sdp += 'a=ice-options:trickle\r\n';

                        transceivers.forEach(function(transceiver, sdpMLineIndex) {
                            sdp += SDPUtils.writeMediaSection(transceiver,
                                transceiver.localCapabilities, 'offer', transceiver.stream);
                            sdp += 'a=rtcp-rsize\r\n';
                        });

                        this._pendingOffer = transceivers;
                        var desc = new window.RTCSessionDescription({
                            type: 'offer',
                            sdp: sdp
                        });
                        if (arguments.length && typeof arguments[0] === 'function') {
                            window.setTimeout(arguments[0], 0, desc);
                        }
                        return Promise.resolve(desc);
                    };

                    RTCPeerConnection.prototype.createAnswer = function() {
                        var sdp = SDPUtils.writeSessionBoilerplate(this._sdpSessionId);
                        if (this.usingBundle) {
                            sdp += 'a=group:BUNDLE ' + this.transceivers.map(function(t) {
                                return t.mid;
                            }).join(' ') + '\r\n';
                        }
                        this.transceivers.forEach(function(transceiver, sdpMLineIndex) {
                            if (transceiver.isDatachannel) {
                                sdp += 'm=application 0 DTLS/SCTP 5000\r\n' +
                                    'c=IN IP4 0.0.0.0\r\n' +
                                    'a=mid:' + transceiver.mid + '\r\n';
                                return;
                            }

                            // FIXME: look at direction.
                            if (transceiver.stream) {
                                var localTrack;
                                if (transceiver.kind === 'audio') {
                                    localTrack = transceiver.stream.getAudioTracks()[0];
                                } else if (transceiver.kind === 'video') {
                                    localTrack = transceiver.stream.getVideoTracks()[0];
                                }
                                if (localTrack) {
                                    // add RTX
                                    if (edgeVersion >= 15019 && transceiver.kind === 'video') {
                                        transceiver.sendEncodingParameters[0].rtx = {
                                            ssrc: (2 * sdpMLineIndex + 2) * 1001 + 1
                                        };
                                    }
                                }
                            }

                            // Calculate intersection of capabilities.
                            var commonCapabilities = getCommonCapabilities(
                                transceiver.localCapabilities,
                                transceiver.remoteCapabilities);

                            var hasRtx = commonCapabilities.codecs.filter(function(c) {
                                return c.name.toLowerCase() === 'rtx';
                            }).length;
                            if (!hasRtx && transceiver.sendEncodingParameters[0].rtx) {
                                delete transceiver.sendEncodingParameters[0].rtx;
                            }

                            sdp += SDPUtils.writeMediaSection(transceiver, commonCapabilities,
                                'answer', transceiver.stream);
                            if (transceiver.rtcpParameters &&
                                transceiver.rtcpParameters.reducedSize) {
                                sdp += 'a=rtcp-rsize\r\n';
                            }
                        });

                        var desc = new window.RTCSessionDescription({
                            type: 'answer',
                            sdp: sdp
                        });
                        if (arguments.length && typeof arguments[0] === 'function') {
                            window.setTimeout(arguments[0], 0, desc);
                        }
                        return Promise.resolve(desc);
                    };

                    RTCPeerConnection.prototype.addIceCandidate = function(candidate) {
                        if (!candidate) {
                            for (var j = 0; j < this.transceivers.length; j++) {
                                this.transceivers[j].iceTransport.addRemoteCandidate({});
                                if (this.usingBundle) {
                                    return Promise.resolve();
                                }
                            }
                        } else {
                            var mLineIndex = candidate.sdpMLineIndex;
                            if (candidate.sdpMid) {
                                for (var i = 0; i < this.transceivers.length; i++) {
                                    if (this.transceivers[i].mid === candidate.sdpMid) {
                                        mLineIndex = i;
                                        break;
                                    }
                                }
                            }
                            var transceiver = this.transceivers[mLineIndex];
                            if (transceiver) {
                                var cand = Object.keys(candidate.candidate).length > 0 ?
                                    SDPUtils.parseCandidate(candidate.candidate) : {};
                                // Ignore Chrome's invalid candidates since Edge does not like them.
                                if (cand.protocol === 'tcp' && (cand.port === 0 || cand.port === 9)) {
                                    return Promise.resolve();
                                }
                                // Ignore RTCP candidates, we assume RTCP-MUX.
                                if (cand.component &&
                                    !(cand.component === '1' || cand.component === 1)) {
                                    return Promise.resolve();
                                }
                                transceiver.iceTransport.addRemoteCandidate(cand);

                                // update the remoteDescription.
                                var sections = SDPUtils.splitSections(this.remoteDescription.sdp);
                                sections[mLineIndex + 1] += (cand.type ? candidate.candidate.trim() :
                                    'a=end-of-candidates') + '\r\n';
                                this.remoteDescription.sdp = sections.join('');
                            }
                        }
                        if (arguments.length > 1 && typeof arguments[1] === 'function') {
                            window.setTimeout(arguments[1], 0);
                        }
                        return Promise.resolve();
                    };

                    RTCPeerConnection.prototype.getStats = function() {
                        var promises = [];
                        this.transceivers.forEach(function(transceiver) {
                            ['rtpSender', 'rtpReceiver', 'iceGatherer', 'iceTransport',
                                'dtlsTransport'
                            ].forEach(function(method) {
                                if (transceiver[method]) {
                                    promises.push(transceiver[method].getStats());
                                }
                            });
                        });
                        var cb = arguments.length > 1 && typeof arguments[1] === 'function' &&
                            arguments[1];
                        var fixStatsType = function(stat) {
                            return {
                                inboundrtp: 'inbound-rtp',
                                outboundrtp: 'outbound-rtp',
                                candidatepair: 'candidate-pair',
                                localcandidate: 'local-candidate',
                                remotecandidate: 'remote-candidate'
                            }[stat.type] || stat.type;
                        };
                        return new Promise(function(resolve) {
                            // shim getStats with maplike support
                            var results = new Map();
                            Promise.all(promises).then(function(res) {
                                res.forEach(function(result) {
                                    Object.keys(result).forEach(function(id) {
                                        result[id].type = fixStatsType(result[id]);
                                        results.set(id, result[id]);
                                    });
                                });
                                if (cb) {
                                    window.setTimeout(cb, 0, results);
                                }
                                resolve(results);
                            });
                        });
                    };
                    return RTCPeerConnection;
                };

            }, {
                "sdp": 1
            }],
            9: [function(require, module, exports) {
                /*
                 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
                 *
                 *  Use of this source code is governed by a BSD-style license
                 *  that can be found in the LICENSE file in the root of the source
                 *  tree.
                 */
                /* eslint-env node */
                'use strict';

                var utils = require('../utils');

                var firefoxShim = {
                    shimOnTrack: function(window) {
                        if (typeof window === 'object' && window.RTCPeerConnection && !('ontrack' in
                                window.RTCPeerConnection.prototype)) {
                            Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
                                get: function() {
                                    return this._ontrack;
                                },
                                set: function(f) {
                                    if (this._ontrack) {
                                        this.removeEventListener('track', this._ontrack);
                                        this.removeEventListener('addstream', this._ontrackpoly);
                                    }
                                    this.addEventListener('track', this._ontrack = f);
                                    this.addEventListener('addstream', this._ontrackpoly = function(e) {
                                        e.stream.getTracks().forEach(function(track) {
                                            var event = new Event('track');
                                            event.track = track;
                                            event.receiver = {
                                                track: track
                                            };
                                            event.streams = [e.stream];
                                            this.dispatchEvent(event);
                                        }.bind(this));
                                    }.bind(this));
                                }
                            });
                        }
                    },

                    shimSourceObject: function(window) {
                        // Firefox has supported mozSrcObject since FF22, unprefixed in 42.
                        if (typeof window === 'object') {
                            if (window.HTMLMediaElement &&
                                !('srcObject' in window.HTMLMediaElement.prototype)) {
                                // Shim the srcObject property, once, when HTMLMediaElement is found.
                                Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
                                    get: function() {
                                        return this.mozSrcObject;
                                    },
                                    set: function(stream) {
                                        this.mozSrcObject = stream;
                                    }
                                });
                            }
                        }
                    },

                    shimPeerConnection: function(window) {
                        var browserDetails = utils.detectBrowser(window);

                        if (typeof window !== 'object' || !(window.RTCPeerConnection ||
                                window.mozRTCPeerConnection)) {
                            return; // probably media.peerconnection.enabled=false in about:config
                        }
                        // The RTCPeerConnection object.
                        if (!window.RTCPeerConnection) {
                            window.RTCPeerConnection = function(pcConfig, pcConstraints) {
                                if (browserDetails.version < 38) {
                                    // .urls is not supported in FF < 38.
                                    // create RTCIceServers with a single url.
                                    if (pcConfig && pcConfig.iceServers) {
                                        var newIceServers = [];
                                        for (var i = 0; i < pcConfig.iceServers.length; i++) {
                                            var server = pcConfig.iceServers[i];
                                            if (server.hasOwnProperty('urls')) {
                                                for (var j = 0; j < server.urls.length; j++) {
                                                    var newServer = {
                                                        url: server.urls[j]
                                                    };
                                                    if (server.urls[j].indexOf('turn') === 0) {
                                                        newServer.username = server.username;
                                                        newServer.credential = server.credential;
                                                    }
                                                    newIceServers.push(newServer);
                                                }
                                            } else {
                                                newIceServers.push(pcConfig.iceServers[i]);
                                            }
                                        }
                                        pcConfig.iceServers = newIceServers;
                                    }
                                }
                                return new window.mozRTCPeerConnection(pcConfig, pcConstraints);
                            };
                            window.RTCPeerConnection.prototype =
                                window.mozRTCPeerConnection.prototype;

                            // wrap static methods. Currently just generateCertificate.
                            if (window.mozRTCPeerConnection.generateCertificate) {
                                Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
                                    get: function() {
                                        return window.mozRTCPeerConnection.generateCertificate;
                                    }
                                });
                            }

                            window.RTCSessionDescription = window.mozRTCSessionDescription;
                            window.RTCIceCandidate = window.mozRTCIceCandidate;
                        }

                        // shim away need for obsolete RTCIceCandidate/RTCSessionDescription.
                        ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
                        .forEach(function(method) {
                            var nativeMethod = window.RTCPeerConnection.prototype[method];
                            window.RTCPeerConnection.prototype[method] = function() {
                                arguments[0] = new((method === 'addIceCandidate') ?
                                    window.RTCIceCandidate :
                                    window.RTCSessionDescription)(arguments[0]);
                                return nativeMethod.apply(this, arguments);
                            };
                        });

                        // support for addIceCandidate(null or undefined)
                        var nativeAddIceCandidate =
                            window.RTCPeerConnection.prototype.addIceCandidate;
                        window.RTCPeerConnection.prototype.addIceCandidate = function() {
                            if (!arguments[0]) {
                                if (arguments[1]) {
                                    arguments[1].apply(null);
                                }
                                return Promise.resolve();
                            }
                            return nativeAddIceCandidate.apply(this, arguments);
                        };

                        // shim getStats with maplike support
                        var makeMapStats = function(stats) {
                            var map = new Map();
                            Object.keys(stats).forEach(function(key) {
                                map.set(key, stats[key]);
                                map[key] = stats[key];
                            });
                            return map;
                        };

                        var modernStatsTypes = {
                            inboundrtp: 'inbound-rtp',
                            outboundrtp: 'outbound-rtp',
                            candidatepair: 'candidate-pair',
                            localcandidate: 'local-candidate',
                            remotecandidate: 'remote-candidate'
                        };

                        var nativeGetStats = window.RTCPeerConnection.prototype.getStats;
                        window.RTCPeerConnection.prototype.getStats = function(
                            selector,
                            onSucc,
                            onErr
                        ) {
                            return nativeGetStats.apply(this, [selector || null])
                                .then(function(stats) {
                                    if (browserDetails.version < 48) {
                                        stats = makeMapStats(stats);
                                    }
                                    if (browserDetails.version < 53 && !onSucc) {
                                        // Shim only promise getStats with spec-hyphens in type names
                                        // Leave callback version alone; misc old uses of forEach before Map
                                        try {
                                            stats.forEach(function(stat) {
                                                stat.type = modernStatsTypes[stat.type] || stat.type;
                                            });
                                        } catch (e) {
                                            if (e.name !== 'TypeError') {
                                                throw e;
                                            }
                                            // Avoid TypeError: "type" is read-only, in old versions. 34-43ish
                                            stats.forEach(function(stat, i) {
                                                stats.set(i, Object.assign({}, stat, {
                                                    type: modernStatsTypes[stat.type] || stat.type
                                                }));
                                            });
                                        }
                                    }
                                    return stats;
                                })
                                .then(onSucc, onErr);
                        };
                    }
                };

                // Expose public methods.
                module.exports = {
                    shimOnTrack: firefoxShim.shimOnTrack,
                    shimSourceObject: firefoxShim.shimSourceObject,
                    shimPeerConnection: firefoxShim.shimPeerConnection,
                    shimGetUserMedia: require('./getusermedia')
                };

            }, {
                "../utils": 12,
                "./getusermedia": 10
            }],
            10: [function(require, module, exports) {
                /*
                 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
                 *
                 *  Use of this source code is governed by a BSD-style license
                 *  that can be found in the LICENSE file in the root of the source
                 *  tree.
                 */
                /* eslint-env node */
                'use strict';

                var utils = require('../utils');
                var logging = utils.log;

                // Expose public methods.
                module.exports = function(window) {
                    var browserDetails = utils.detectBrowser(window);
                    var navigator = window && window.navigator;
                    var MediaStreamTrack = window && window.MediaStreamTrack;

                    var shimError_ = function(e) {
                        return {
                            name: {
                                InternalError: 'NotReadableError',
                                NotSupportedError: 'TypeError',
                                PermissionDeniedError: 'NotAllowedError',
                                SecurityError: 'NotAllowedError'
                            }[e.name] || e.name,
                            message: {
                                'The operation is insecure.': 'The request is not allowed by the ' +
                                    'user agent or the platform in the current context.'
                            }[e.message] || e.message,
                            constraint: e.constraint,
                            toString: function() {
                                return this.name + (this.message && ': ') + this.message;
                            }
                        };
                    };

                    // getUserMedia constraints shim.
                    var getUserMedia_ = function(constraints, onSuccess, onError) {
                        var constraintsToFF37_ = function(c) {
                            if (typeof c !== 'object' || c.require) {
                                return c;
                            }
                            var require = [];
                            Object.keys(c).forEach(function(key) {
                                if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
                                    return;
                                }
                                var r = c[key] = (typeof c[key] === 'object') ?
                                    c[key] : {
                                        ideal: c[key]
                                    };
                                if (r.min !== undefined ||
                                    r.max !== undefined || r.exact !== undefined) {
                                    require.push(key);
                                }
                                if (r.exact !== undefined) {
                                    if (typeof r.exact === 'number') {
                                        r.min = r.max = r.exact;
                                    } else {
                                        c[key] = r.exact;
                                    }
                                    delete r.exact;
                                }
                                if (r.ideal !== undefined) {
                                    c.advanced = c.advanced || [];
                                    var oc = {};
                                    if (typeof r.ideal === 'number') {
                                        oc[key] = {
                                            min: r.ideal,
                                            max: r.ideal
                                        };
                                    } else {
                                        oc[key] = r.ideal;
                                    }
                                    c.advanced.push(oc);
                                    delete r.ideal;
                                    if (!Object.keys(r).length) {
                                        delete c[key];
                                    }
                                }
                            });
                            if (require.length) {
                                c.require = require;
                            }
                            return c;
                        };
                        constraints = JSON.parse(JSON.stringify(constraints));
                        if (browserDetails.version < 38) {
                            logging('spec: ' + JSON.stringify(constraints));
                            if (constraints.audio) {
                                constraints.audio = constraintsToFF37_(constraints.audio);
                            }
                            if (constraints.video) {
                                constraints.video = constraintsToFF37_(constraints.video);
                            }
                            logging('ff37: ' + JSON.stringify(constraints));
                        }
                        return navigator.mozGetUserMedia(constraints, onSuccess, function(e) {
                            onError(shimError_(e));
                        });
                    };

                    // Returns the result of getUserMedia as a Promise.
                    var getUserMediaPromise_ = function(constraints) {
                        return new Promise(function(resolve, reject) {
                            getUserMedia_(constraints, resolve, reject);
                        });
                    };

                    // Shim for mediaDevices on older versions.
                    if (!navigator.mediaDevices) {
                        navigator.mediaDevices = {
                            getUserMedia: getUserMediaPromise_,
                            addEventListener: function() {},
                            removeEventListener: function() {}
                        };
                    }
                    navigator.mediaDevices.enumerateDevices =
                        navigator.mediaDevices.enumerateDevices || function() {
                            return new Promise(function(resolve) {
                                var infos = [{
                                        kind: 'audioinput',
                                        deviceId: 'default',
                                        label: '',
                                        groupId: ''
                                    },
                                    {
                                        kind: 'videoinput',
                                        deviceId: 'default',
                                        label: '',
                                        groupId: ''
                                    }
                                ];
                                resolve(infos);
                            });
                        };

                    if (browserDetails.version < 41) {
                        // Work around http://bugzil.la/1169665
                        var orgEnumerateDevices =
                            navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices);
                        navigator.mediaDevices.enumerateDevices = function() {
                            return orgEnumerateDevices().then(undefined, function(e) {
                                if (e.name === 'NotFoundError') {
                                    return [];
                                }
                                throw e;
                            });
                        };
                    }
                    if (browserDetails.version < 49) {
                        var origGetUserMedia = navigator.mediaDevices.getUserMedia.
                        bind(navigator.mediaDevices);
                        navigator.mediaDevices.getUserMedia = function(c) {
                            return origGetUserMedia(c).then(function(stream) {
                                // Work around https://bugzil.la/802326
                                if (c.audio && !stream.getAudioTracks().length ||
                                    c.video && !stream.getVideoTracks().length) {
                                    stream.getTracks().forEach(function(track) {
                                        track.stop();
                                    });
                                    throw new DOMException('The object can not be found here.',
                                        'NotFoundError');
                                }
                                return stream;
                            }, function(e) {
                                return Promise.reject(shimError_(e));
                            });
                        };
                    }
                    if (!(browserDetails.version > 55 &&
                            'autoGainControl' in navigator.mediaDevices.getSupportedConstraints())) {
                        var remap = function(obj, a, b) {
                            if (a in obj && !(b in obj)) {
                                obj[b] = obj[a];
                                delete obj[a];
                            }
                        };

                        var nativeGetUserMedia = navigator.mediaDevices.getUserMedia.
                        bind(navigator.mediaDevices);
                        navigator.mediaDevices.getUserMedia = function(c) {
                            if (typeof c === 'object' && typeof c.audio === 'object') {
                                c = JSON.parse(JSON.stringify(c));
                                remap(c.audio, 'autoGainControl', 'mozAutoGainControl');
                                remap(c.audio, 'noiseSuppression', 'mozNoiseSuppression');
                            }
                            return nativeGetUserMedia(c);
                        };

                        if (MediaStreamTrack && MediaStreamTrack.prototype.getSettings) {
                            var nativeGetSettings = MediaStreamTrack.prototype.getSettings;
                            MediaStreamTrack.prototype.getSettings = function() {
                                var obj = nativeGetSettings.apply(this, arguments);
                                remap(obj, 'mozAutoGainControl', 'autoGainControl');
                                remap(obj, 'mozNoiseSuppression', 'noiseSuppression');
                                return obj;
                            };
                        }

                        if (MediaStreamTrack && MediaStreamTrack.prototype.applyConstraints) {
                            var nativeApplyConstraints = MediaStreamTrack.prototype.applyConstraints;
                            MediaStreamTrack.prototype.applyConstraints = function(c) {
                                if (this.kind === 'audio' && typeof c === 'object') {
                                    c = JSON.parse(JSON.stringify(c));
                                    remap(c, 'autoGainControl', 'mozAutoGainControl');
                                    remap(c, 'noiseSuppression', 'mozNoiseSuppression');
                                }
                                return nativeApplyConstraints.apply(this, [c]);
                            };
                        }
                    }
                    navigator.getUserMedia = function(constraints, onSuccess, onError) {
                        if (browserDetails.version < 44) {
                            return getUserMedia_(constraints, onSuccess, onError);
                        }
                        // Replace Firefox 44+'s deprecation warning with unprefixed version.
                        utils.deprecated('navigator.getUserMedia',
                            'navigator.mediaDevices.getUserMedia');
                        navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
                    };
                };

            }, {
                "../utils": 12
            }],
            11: [function(require, module, exports) {
                /*
                 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
                 *
                 *  Use of this source code is governed by a BSD-style license
                 *  that can be found in the LICENSE file in the root of the source
                 *  tree.
                 */
                'use strict';
                var utils = require('../utils');

                var safariShim = {
                    // TODO: DrAlex, should be here, double check against LayoutTests

                    // TODO: once the back-end for the mac port is done, add.
                    // TODO: check for webkitGTK+
                    // shimPeerConnection: function() { },

                    shimLocalStreamsAPI: function(window) {
                        if (typeof window !== 'object' || !window.RTCPeerConnection) {
                            return;
                        }
                        if (!('getLocalStreams' in window.RTCPeerConnection.prototype)) {
                            window.RTCPeerConnection.prototype.getLocalStreams = function() {
                                if (!this._localStreams) {
                                    this._localStreams = [];
                                }
                                return this._localStreams;
                            };
                        }
                        if (!('getStreamById' in window.RTCPeerConnection.prototype)) {
                            window.RTCPeerConnection.prototype.getStreamById = function(id) {
                                var result = null;
                                if (this._localStreams) {
                                    this._localStreams.forEach(function(stream) {
                                        if (stream.id === id) {
                                            result = stream;
                                        }
                                    });
                                }
                                if (this._remoteStreams) {
                                    this._remoteStreams.forEach(function(stream) {
                                        if (stream.id === id) {
                                            result = stream;
                                        }
                                    });
                                }
                                return result;
                            };
                        }
                        if (!('addStream' in window.RTCPeerConnection.prototype)) {
                            var _addTrack = window.RTCPeerConnection.prototype.addTrack;
                            window.RTCPeerConnection.prototype.addStream = function(stream) {
                                if (!this._localStreams) {
                                    this._localStreams = [];
                                }
                                if (this._localStreams.indexOf(stream) === -1) {
                                    this._localStreams.push(stream);
                                }
                                var self = this;
                                stream.getTracks().forEach(function(track) {
                                    _addTrack.call(self, track, stream);
                                });
                            };

                            window.RTCPeerConnection.prototype.addTrack = function(track, stream) {
                                if (stream) {
                                    if (!this._localStreams) {
                                        this._localStreams = [stream];
                                    } else if (this._localStreams.indexOf(stream) === -1) {
                                        this._localStreams.push(stream);
                                    }
                                }
                                _addTrack.call(this, track, stream);
                            };
                        }
                        if (!('removeStream' in window.RTCPeerConnection.prototype)) {
                            window.RTCPeerConnection.prototype.removeStream = function(stream) {
                                if (!this._localStreams) {
                                    this._localStreams = [];
                                }
                                var index = this._localStreams.indexOf(stream);
                                if (index === -1) {
                                    return;
                                }
                                this._localStreams.splice(index, 1);
                                var self = this;
                                var tracks = stream.getTracks();
                                this.getSenders().forEach(function(sender) {
                                    if (tracks.indexOf(sender.track) !== -1) {
                                        self.removeTrack(sender);
                                    }
                                });
                            };
                        }
                    },
                    shimRemoteStreamsAPI: function(window) {
                        if (typeof window !== 'object' || !window.RTCPeerConnection) {
                            return;
                        }
                        if (!('getRemoteStreams' in window.RTCPeerConnection.prototype)) {
                            window.RTCPeerConnection.prototype.getRemoteStreams = function() {
                                return this._remoteStreams ? this._remoteStreams : [];
                            };
                        }
                        if (!('onaddstream' in window.RTCPeerConnection.prototype)) {
                            Object.defineProperty(window.RTCPeerConnection.prototype, 'onaddstream', {
                                get: function() {
                                    return this._onaddstream;
                                },
                                set: function(f) {
                                    if (this._onaddstream) {
                                        this.removeEventListener('addstream', this._onaddstream);
                                        this.removeEventListener('track', this._onaddstreampoly);
                                    }
                                    this.addEventListener('addstream', this._onaddstream = f);
                                    this.addEventListener('track', this._onaddstreampoly = function(e) {
                                        var stream = e.streams[0];
                                        if (!this._remoteStreams) {
                                            this._remoteStreams = [];
                                        }
                                        if (this._remoteStreams.indexOf(stream) >= 0) {
                                            return;
                                        }
                                        this._remoteStreams.push(stream);
                                        var event = new Event('addstream');
                                        event.stream = e.streams[0];
                                        this.dispatchEvent(event);
                                    }.bind(this));
                                }
                            });
                        }
                    },
                    shimCallbacksAPI: function(window) {
                        if (typeof window !== 'object' || !window.RTCPeerConnection) {
                            return;
                        }
                        var prototype = window.RTCPeerConnection.prototype;
                        var createOffer = prototype.createOffer;
                        var createAnswer = prototype.createAnswer;
                        var setLocalDescription = prototype.setLocalDescription;
                        var setRemoteDescription = prototype.setRemoteDescription;
                        var addIceCandidate = prototype.addIceCandidate;

                        prototype.createOffer = function(successCallback, failureCallback) {
                            var options = (arguments.length >= 2) ? arguments[2] : arguments[0];
                            var promise = createOffer.apply(this, [options]);
                            if (!failureCallback) {
                                return promise;
                            }
                            promise.then(successCallback, failureCallback);
                            return Promise.resolve();
                        };

                        prototype.createAnswer = function(successCallback, failureCallback) {
                            var options = (arguments.length >= 2) ? arguments[2] : arguments[0];
                            var promise = createAnswer.apply(this, [options]);
                            if (!failureCallback) {
                                return promise;
                            }
                            promise.then(successCallback, failureCallback);
                            return Promise.resolve();
                        };

                        var withCallback = function(description, successCallback, failureCallback) {
                            var promise = setLocalDescription.apply(this, [description]);
                            if (!failureCallback) {
                                return promise;
                            }
                            promise.then(successCallback, failureCallback);
                            return Promise.resolve();
                        };
                        prototype.setLocalDescription = withCallback;

                        withCallback = function(description, successCallback, failureCallback) {
                            var promise = setRemoteDescription.apply(this, [description]);
                            if (!failureCallback) {
                                return promise;
                            }
                            promise.then(successCallback, failureCallback);
                            return Promise.resolve();
                        };
                        prototype.setRemoteDescription = withCallback;

                        withCallback = function(candidate, successCallback, failureCallback) {
                            var promise = addIceCandidate.apply(this, [candidate]);
                            if (!failureCallback) {
                                return promise;
                            }
                            promise.then(successCallback, failureCallback);
                            return Promise.resolve();
                        };
                        prototype.addIceCandidate = withCallback;
                    },
                    shimGetUserMedia: function(window) {
                        var navigator = window && window.navigator;

                        if (!navigator.getUserMedia) {
                            if (navigator.webkitGetUserMedia) {
                                navigator.getUserMedia = navigator.webkitGetUserMedia.bind(navigator);
                            } else if (navigator.mediaDevices &&
                                navigator.mediaDevices.getUserMedia) {
                                navigator.getUserMedia = function(constraints, cb, errcb) {
                                    navigator.mediaDevices.getUserMedia(constraints)
                                        .then(cb, errcb);
                                }.bind(navigator);
                            }
                        }
                    },
                    shimRTCIceServerUrls: function(window) {
                        // migrate from non-spec RTCIceServer.url to RTCIceServer.urls
                        var OrigPeerConnection = window.RTCPeerConnection;
                        window.RTCPeerConnection = function(pcConfig, pcConstraints) {
                            if (pcConfig && pcConfig.iceServers) {
                                var newIceServers = [];
                                for (var i = 0; i < pcConfig.iceServers.length; i++) {
                                    var server = pcConfig.iceServers[i];
                                    if (!server.hasOwnProperty('urls') &&
                                        server.hasOwnProperty('url')) {
                                        utils.deprecated('RTCIceServer.url', 'RTCIceServer.urls');
                                        server = JSON.parse(JSON.stringify(server));
                                        server.urls = server.url;
                                        delete server.url;
                                        newIceServers.push(server);
                                    } else {
                                        newIceServers.push(pcConfig.iceServers[i]);
                                    }
                                }
                                pcConfig.iceServers = newIceServers;
                            }
                            return new OrigPeerConnection(pcConfig, pcConstraints);
                        };
                        window.RTCPeerConnection.prototype = OrigPeerConnection.prototype;
                        // wrap static methods. Currently just generateCertificate.
                        Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
                            get: function() {
                                return OrigPeerConnection.generateCertificate;
                            }
                        });
                    }
                };

                // Expose public methods.
                module.exports = {
                    shimCallbacksAPI: safariShim.shimCallbacksAPI,
                    shimLocalStreamsAPI: safariShim.shimLocalStreamsAPI,
                    shimRemoteStreamsAPI: safariShim.shimRemoteStreamsAPI,
                    shimGetUserMedia: safariShim.shimGetUserMedia,
                    shimRTCIceServerUrls: safariShim.shimRTCIceServerUrls
                    // TODO
                    // shimPeerConnection: safariShim.shimPeerConnection
                };

            }, {
                "../utils": 12
            }],
            12: [function(require, module, exports) {
                /*
                 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
                 *
                 *  Use of this source code is governed by a BSD-style license
                 *  that can be found in the LICENSE file in the root of the source
                 *  tree.
                 */
                /* eslint-env node */
                'use strict';

                var logDisabled_ = true;
                var deprecationWarnings_ = true;

                // Utility methods.
                var utils = {
                    disableLog: function(bool) {
                        if (typeof bool !== 'boolean') {
                            return new Error('Argument type: ' + typeof bool +
                                '. Please use a boolean.');
                        }
                        logDisabled_ = bool;
                        return (bool) ? 'adapter.js logging disabled' :
                            'adapter.js logging enabled';
                    },

                    /**
                     * Disable or enable deprecation warnings
                     * @param {!boolean} bool set to true to disable warnings.
                     */
                    disableWarnings: function(bool) {
                        if (typeof bool !== 'boolean') {
                            return new Error('Argument type: ' + typeof bool +
                                '. Please use a boolean.');
                        }
                        deprecationWarnings_ = !bool;
                        return 'adapter.js deprecation warnings ' + (bool ? 'disabled' : 'enabled');
                    },

                    log: function() {
                        if (typeof window === 'object') {
                            if (logDisabled_) {
                                return;
                            }
                            if (typeof console !== 'undefined' && typeof console.log === 'function') {
                                console.log.apply(console, arguments);
                            }
                        }
                    },

                    /**
                     * Shows a deprecation warning suggesting the modern and spec-compatible API.
                     */
                    deprecated: function(oldMethod, newMethod) {
                        if (!deprecationWarnings_) {
                            return;
                        }
                        console.warn(oldMethod + ' is deprecated, please use ' + newMethod +
                            ' instead.');
                    },

                    /**
                     * Extract browser version out of the provided user agent string.
                     *
                     * @param {!string} uastring userAgent string.
                     * @param {!string} expr Regular expression used as match criteria.
                     * @param {!number} pos position in the version string to be returned.
                     * @return {!number} browser version.
                     */
                    extractVersion: function(uastring, expr, pos) {
                        var match = uastring.match(expr);
                        return match && match.length >= pos && parseInt(match[pos], 10);
                    },

                    /**
                     * Browser detector.
                     *
                     * @return {object} result containing browser and version
                     *     properties.
                     */
                    detectBrowser: function(window) {
                        var navigator = window && window.navigator;

                        // Returned result object.
                        var result = {};
                        result.browser = null;
                        result.version = null;

                        // Fail early if it's not a browser
                        if (typeof window === 'undefined' || !window.navigator) {
                            result.browser = 'Not a browser.';
                            return result;
                        }

                        // Firefox.
                        if (navigator.mozGetUserMedia) {
                            result.browser = 'firefox';
                            result.version = this.extractVersion(navigator.userAgent,
                                /Firefox\/(\d+)\./, 1);
                        } else if (navigator.webkitGetUserMedia) {
                            // Chrome, Chromium, Webview, Opera, all use the chrome shim for now
                            if (window.webkitRTCPeerConnection) {
                                result.browser = 'chrome';
                                result.version = this.extractVersion(navigator.userAgent,
                                    /Chrom(e|ium)\/(\d+)\./, 2);
                            } else { // Safari (in an unpublished version) or unknown webkit-based.
                                if (navigator.userAgent.match(/Version\/(\d+).(\d+)/)) {
                                    result.browser = 'safari';
                                    result.version = this.extractVersion(navigator.userAgent,
                                        /AppleWebKit\/(\d+)\./, 1);
                                } else { // unknown webkit-based browser.
                                    result.browser = 'Unsupported webkit-based browser ' +
                                        'with GUM support but no WebRTC support.';
                                    return result;
                                }
                            }
                        } else if (navigator.mediaDevices &&
                            navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)) { // Edge.
                            result.browser = 'edge';
                            result.version = this.extractVersion(navigator.userAgent,
                                /Edge\/(\d+).(\d+)$/, 2);
                        } else if (navigator.mediaDevices &&
                            navigator.userAgent.match(/AppleWebKit\/(\d+)\./)) {
                            // Safari, with webkitGetUserMedia removed.
                            result.browser = 'safari';
                            result.version = this.extractVersion(navigator.userAgent,
                                /AppleWebKit\/(\d+)\./, 1);
                        } else { // Default fallthrough: not supported.
                            result.browser = 'Not a supported browser.';
                            return result;
                        }

                        return result;
                    },

                    // shimCreateObjectURL must be called before shimSourceObject to avoid loop.

                    shimCreateObjectURL: function(window) {
                        var URL = window && window.URL;

                        if (!(typeof window === 'object' && window.HTMLMediaElement &&
                                'srcObject' in window.HTMLMediaElement.prototype)) {
                            // Only shim CreateObjectURL using srcObject if srcObject exists.
                            return undefined;
                        }

                        var nativeCreateObjectURL = URL.createObjectURL.bind(URL);
                        var nativeRevokeObjectURL = URL.revokeObjectURL.bind(URL);
                        var streams = new Map(),
                            newId = 0;

                        URL.createObjectURL = function(stream) {
                            if ('getTracks' in stream) {
                                var url = 'polyblob:' + (++newId);
                                streams.set(url, stream);
                                utils.deprecated('URL.createObjectURL(stream)',
                                    'elem.srcObject = stream');
                                return url;
                            }
                            return nativeCreateObjectURL(stream);
                        };
                        URL.revokeObjectURL = function(url) {
                            nativeRevokeObjectURL(url);
                            streams.delete(url);
                        };

                        var dsc = Object.getOwnPropertyDescriptor(window.HTMLMediaElement.prototype,
                            'src');
                        Object.defineProperty(window.HTMLMediaElement.prototype, 'src', {
                            get: function() {
                                return dsc.get.apply(this);
                            },
                            set: function(url) {
                                this.srcObject = streams.get(url) || null;
                                return dsc.set.apply(this, [url]);
                            }
                        });

                        var nativeSetAttribute = window.HTMLMediaElement.prototype.setAttribute;
                        window.HTMLMediaElement.prototype.setAttribute = function() {
                            if (arguments.length === 2 &&
                                ('' + arguments[0]).toLowerCase() === 'src') {
                                this.srcObject = streams.get(arguments[1]) || null;
                            }
                            return nativeSetAttribute.apply(this, arguments);
                        };
                    }
                };

                // Export.
                module.exports = {
                    log: utils.log,
                    deprecated: utils.deprecated,
                    disableLog: utils.disableLog,
                    disableWarnings: utils.disableWarnings,
                    extractVersion: utils.extractVersion,
                    shimCreateObjectURL: utils.shimCreateObjectURL,
                    detectBrowser: utils.detectBrowser.bind(utils)
                };

            }, {}]
        }, {}, [2])(2)
    });

    // globals.js

    var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    var isFirefox = typeof window.InstallTrigger !== 'undefined';
    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    var isChrome = !!window.chrome && !isOpera;
    var isIE = !!document.documentMode;

    var isMobileDevice = !!navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i);

    if (typeof cordova !== 'undefined') {
        isMobileDevice = true;
        isChrome = true;
    }

    if (navigator && navigator.userAgent && navigator.userAgent.indexOf('Crosswalk') !== -1) {
        isMobileDevice = true;
        isChrome = true;
    }

    // detect node-webkit
    var isNodeWebkit = !!(window.process && (typeof window.process === 'object') && window.process.versions && window.process.versions['node-webkit']);

    var chromeVersion = 50;
    var matchArray = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
    if (isChrome && matchArray && matchArray[2]) {
        chromeVersion = parseInt(matchArray[2], 10);
    }

    var firefoxVersion = 50;
    matchArray = navigator.userAgent.match(/Firefox\/(.*)/);
    if (isFirefox && matchArray && matchArray[1]) {
        firefoxVersion = parseInt(matchArray[1], 10);
    }

    function fireEvent(obj, eventName, args) {
        if (typeof CustomEvent === 'undefined') {
            return;
        }

        var eventDetail = {
            arguments: args,
            __exposedProps__: args
        };

        var event = new CustomEvent(eventName, eventDetail);
        obj.dispatchEvent(event);
    }

    function setHarkEvents(connection, streamEvent) {
        if (!connection || !streamEvent) {
            throw 'Both arguments are required.';
        }

        if (!connection.onspeaking || !connection.onsilence) {
            return;
        }

        if (typeof hark === 'undefined') {
            throw 'hark.js not found.';
        }

        hark(streamEvent.stream, {
            onspeaking: function() {
                connection.onspeaking(streamEvent);
            },
            onsilence: function() {
                connection.onsilence(streamEvent);
            },
            onvolumechange: function(volume, threshold) {
                if (!connection.onvolumechange) {
                    return;
                }
                connection.onvolumechange(merge({
                    volume: volume,
                    threshold: threshold
                }, streamEvent));
            }
        });
    }

    function setMuteHandlers(connection, streamEvent) {
        if (!streamEvent.stream || !streamEvent.stream || !streamEvent.stream.addEventListener) return;

        streamEvent.stream.addEventListener('mute', function(event) {
            event = connection.streamEvents[streamEvent.streamid];

            event.session = {
                audio: event.muteType === 'audio',
                video: event.muteType === 'video'
            };

            connection.onmute(event);
        }, false);

        streamEvent.stream.addEventListener('unmute', function(event) {
            event = connection.streamEvents[streamEvent.streamid];

            event.session = {
                audio: event.unmuteType === 'audio',
                video: event.unmuteType === 'video'
            };

            connection.onunmute(event);
        }, false);
    }

    function getRandomString() {
        if (window.crypto && window.crypto.getRandomValues && navigator.userAgent.indexOf('Safari') === -1) {
            var a = window.crypto.getRandomValues(new Uint32Array(3)),
                token = '';
            for (var i = 0, l = a.length; i < l; i++) {
                token += a[i].toString(36);
            }
            return token;
        } else {
            return (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '');
        }
    }

    // Get HTMLAudioElement/HTMLVideoElement accordingly

    function getRMCMediaElement(stream, callback, connection) {
        var isAudioOnly = false;
        if (!!stream.getVideoTracks && !stream.getVideoTracks().length && !stream.isVideo && !stream.isScreen) {
            isAudioOnly = true;
        }

        var mediaElement = document.createElement(isAudioOnly ? 'audio' : 'video');

        mediaElement.srcObject = stream;
        mediaElement.controls = true;

        // http://goo.gl/WZ5nFl
        // Firefox don't yet support onended for any stream (remote/local)
        if (isFirefox) {
            var streamEndedEvent = 'ended';

            if ('oninactive' in mediaElement) {
                streamEndedEvent = 'inactive';
            }

            mediaElement.addEventListener(streamEndedEvent, function() {
                // fireEvent(stream, streamEndedEvent, stream);
                currentUserMediaRequest.remove(stream.idInstance);

                if (stream.type === 'local') {
                    streamEndedEvent = 'ended';

                    if ('oninactive' in stream) {
                        streamEndedEvent = 'inactive';
                    }

                    StreamsHandler.onSyncNeeded(stream.streamid, streamEndedEvent);

                    connection.attachStreams.forEach(function(aStream, idx) {
                        if (stream.streamid === aStream.streamid) {
                            delete connection.attachStreams[idx];
                        }
                    });

                    var newStreamsArray = [];
                    connection.attachStreams.forEach(function(aStream) {
                        if (aStream) {
                            newStreamsArray.push(aStream);
                        }
                    });
                    connection.attachStreams = newStreamsArray;

                    var streamEvent = connection.streamEvents[stream.streamid];

                    if (streamEvent) {
                        connection.onstreamended(streamEvent);
                        return;
                    }
                    if (this.parentNode) {
                        this.parentNode.removeChild(this);
                    }
                }
            }, false);
        }

        mediaElement.play();
        callback(mediaElement);
    }

    // if IE
    if (!window.addEventListener) {
        window.addEventListener = function(el, eventName, eventHandler) {
            if (!el.attachEvent) {
                return;
            }
            el.attachEvent('on' + eventName, eventHandler);
        };
    }

    function listenEventHandler(eventName, eventHandler) {
        window.removeEventListener(eventName, eventHandler);
        window.addEventListener(eventName, eventHandler, false);
    }

    window.attachEventListener = function(video, type, listener, useCapture) {
        video.addEventListener(type, listener, useCapture);
    };

    function removeNullEntries(array) {
        var newArray = [];
        array.forEach(function(item) {
            if (item) {
                newArray.push(item);
            }
        });
        return newArray;
    }


    function isData(session) {
        return !session.audio && !session.video && !session.screen && session.data;
    }

    function isNull(obj) {
        return typeof obj === 'undefined';
    }

    function isString(obj) {
        return typeof obj === 'string';
    }

    var MediaStream = window.MediaStream;

    if (typeof MediaStream === 'undefined' && typeof webkitMediaStream !== 'undefined') {
        MediaStream = webkitMediaStream;
    }

    /*global MediaStream:true */
    if (typeof MediaStream !== 'undefined') {
        if (!('getVideoTracks' in MediaStream.prototype)) {
            MediaStream.prototype.getVideoTracks = function() {
                if (!this.getTracks) {
                    return [];
                }

                var tracks = [];
                this.getTracks.forEach(function(track) {
                    if (track.kind.toString().indexOf('video') !== -1) {
                        tracks.push(track);
                    }
                });
                return tracks;
            };

            MediaStream.prototype.getAudioTracks = function() {
                if (!this.getTracks) {
                    return [];
                }

                var tracks = [];
                this.getTracks.forEach(function(track) {
                    if (track.kind.toString().indexOf('audio') !== -1) {
                        tracks.push(track);
                    }
                });
                return tracks;
            };
        }

        if (!('stop' in MediaStream.prototype)) {
            MediaStream.prototype.stop = function() {
                this.getAudioTracks().forEach(function(track) {
                    if (!!track.stop) {
                        track.stop();
                    }
                });

                this.getVideoTracks().forEach(function(track) {
                    if (!!track.stop) {
                        track.stop();
                    }
                });
            };
        }
    }

    function isAudioPlusTab(connection, audioPlusTab) {
        if (connection.session.audio && connection.session.audio === 'two-way') {
            return false;
        }

        if (isFirefox && audioPlusTab !== false) {
            return true;
        }

        if (!isChrome || chromeVersion < 50) return false;

        if (typeof audioPlusTab === true) {
            return true;
        }

        if (typeof audioPlusTab === 'undefined' && connection.session.audio && connection.session.screen && !connection.session.video) {
            audioPlusTab = true;
            return true;
        }

        return false;
    }

    function getAudioScreenConstraints(screen_constraints) {
        if (isFirefox) {
            return true;
        }

        if (!isChrome) return false;

        return {
            mandatory: {
                chromeMediaSource: screen_constraints.mandatory.chromeMediaSource,
                chromeMediaSourceId: screen_constraints.mandatory.chromeMediaSourceId
            }
        };
    }

    window.iOSDefaultAudioOutputDevice = window.iOSDefaultAudioOutputDevice || 'speaker'; // earpiece or speaker

    // Last time updated: 2017-04-29 7:05:22 AM UTC

    // Latest file can be found here: https://cdn.webrtc-experiment.com/DetectRTC.js

    // Muaz Khan     - www.MuazKhan.com
    // MIT License   - www.WebRTC-Experiment.com/licence
    // Documentation - github.com/muaz-khan/DetectRTC
    // ____________
    // DetectRTC.js

    // DetectRTC.hasWebcam (has webcam device!)
    // DetectRTC.hasMicrophone (has microphone device!)
    // DetectRTC.hasSpeakers (has speakers!)

    (function() {

        'use strict';

        var browserFakeUserAgent = 'Fake/5.0 (FakeOS) AppleWebKit/123 (KHTML, like Gecko) Fake/12.3.4567.89 Fake/123.45';

        var isNodejs = typeof process === 'object' && typeof process.versions === 'object' && process.versions.node;
        if (isNodejs) {
            var version = process.versions.node.toString().replace('v', '');
            browserFakeUserAgent = 'Nodejs/' + version + ' (NodeOS) AppleWebKit/' + version + ' (KHTML, like Gecko) Nodejs/' + version + ' Nodejs/' + version
        }

        (function(that) {
            if (typeof window !== 'undefined') {
                return;
            }

            if (typeof window === 'undefined' && typeof global !== 'undefined') {
                global.navigator = {
                    userAgent: browserFakeUserAgent,
                    getUserMedia: function() {}
                };

                /*global window:true */
                that.window = global;
            } else if (typeof window === 'undefined') {
                // window = this;
            }

            if (typeof document === 'undefined') {
                /*global document:true */
                that.document = {};

                document.createElement = document.captureStream = document.mozCaptureStream = function() {
                    return {};
                };
            }

            if (typeof location === 'undefined') {
                /*global location:true */
                that.location = {
                    protocol: 'file:',
                    href: '',
                    hash: ''
                };
            }

            if (typeof screen === 'undefined') {
                /*global screen:true */
                that.screen = {
                    width: 0,
                    height: 0
                };
            }
        })(typeof global !== 'undefined' ? global : window);

        /*global navigator:true */
        var navigator = window.navigator;

        if (typeof navigator !== 'undefined') {
            if (typeof navigator.webkitGetUserMedia !== 'undefined') {
                navigator.getUserMedia = navigator.webkitGetUserMedia;
            }

            if (typeof navigator.mozGetUserMedia !== 'undefined') {
                navigator.getUserMedia = navigator.mozGetUserMedia;
            }
        } else {
            navigator = {
                getUserMedia: function() {},
                userAgent: browserFakeUserAgent
            };
        }

        var isMobileDevice = !!(/Android|webOS|iPhone|iPad|iPod|BB10|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(navigator.userAgent || ''));

        var isEdge = navigator.userAgent.indexOf('Edge') !== -1 && (!!navigator.msSaveOrOpenBlob || !!navigator.msSaveBlob);

        var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
        var isFirefox = typeof window.InstallTrigger !== 'undefined';
        var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
        var isChrome = !!window.chrome && !isOpera;
        var isIE = !!document.documentMode && !isEdge;

        // this one can also be used:
        // https://www.websocket.org/js/stuff.js (DetectBrowser.js)

        function getBrowserInfo() {
            var nVer = navigator.appVersion;
            var nAgt = navigator.userAgent;
            var browserName = navigator.appName;
            var fullVersion = '' + parseFloat(navigator.appVersion);
            var majorVersion = parseInt(navigator.appVersion, 10);
            var nameOffset, verOffset, ix;

            // In Opera, the true version is after 'Opera' or after 'Version'
            if (isOpera) {
                browserName = 'Opera';
                try {
                    fullVersion = navigator.userAgent.split('OPR/')[1].split(' ')[0];
                    majorVersion = fullVersion.split('.')[0];
                } catch (e) {
                    fullVersion = '0.0.0.0';
                    majorVersion = 0;
                }
            }
            // In MSIE, the true version is after 'MSIE' in userAgent
            else if (isIE) {
                verOffset = nAgt.indexOf('MSIE');
                browserName = 'IE';
                fullVersion = nAgt.substring(verOffset + 5);
            }
            // In Chrome, the true version is after 'Chrome' 
            else if (isChrome) {
                verOffset = nAgt.indexOf('Chrome');
                browserName = 'Chrome';
                fullVersion = nAgt.substring(verOffset + 7);
            }
            // In Safari, the true version is after 'Safari' or after 'Version' 
            else if (isSafari) {
                verOffset = nAgt.indexOf('Safari');
                browserName = 'Safari';
                fullVersion = nAgt.substring(verOffset + 7);

                if ((verOffset = nAgt.indexOf('Version')) !== -1) {
                    fullVersion = nAgt.substring(verOffset + 8);
                }
            }
            // In Firefox, the true version is after 'Firefox' 
            else if (isFirefox) {
                verOffset = nAgt.indexOf('Firefox');
                browserName = 'Firefox';
                fullVersion = nAgt.substring(verOffset + 8);
            }

            // In most other browsers, 'name/version' is at the end of userAgent 
            else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
                browserName = nAgt.substring(nameOffset, verOffset);
                fullVersion = nAgt.substring(verOffset + 1);

                if (browserName.toLowerCase() === browserName.toUpperCase()) {
                    browserName = navigator.appName;
                }
            }

            if (isEdge) {
                browserName = 'Edge';
                // fullVersion = navigator.userAgent.split('Edge/')[1];
                fullVersion = parseInt(navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)[2], 10).toString();
            }

            // trim the fullVersion string at semicolon/space if present
            if ((ix = fullVersion.indexOf(';')) !== -1) {
                fullVersion = fullVersion.substring(0, ix);
            }

            if ((ix = fullVersion.indexOf(' ')) !== -1) {
                fullVersion = fullVersion.substring(0, ix);
            }

            majorVersion = parseInt('' + fullVersion, 10);

            if (isNaN(majorVersion)) {
                fullVersion = '' + parseFloat(navigator.appVersion);
                majorVersion = parseInt(navigator.appVersion, 10);
            }

            return {
                fullVersion: fullVersion,
                version: majorVersion,
                name: browserName,
                isPrivateBrowsing: false
            };
        }

        // via: https://gist.github.com/cou929/7973956

        function retry(isDone, next) {
            var currentTrial = 0,
                maxRetry = 50,
                interval = 10,
                isTimeout = false;
            var id = window.setInterval(
                function() {
                    if (isDone()) {
                        window.clearInterval(id);
                        next(isTimeout);
                    }
                    if (currentTrial++ > maxRetry) {
                        window.clearInterval(id);
                        isTimeout = true;
                        next(isTimeout);
                    }
                },
                10
            );
        }

        function isIE10OrLater(userAgent) {
            var ua = userAgent.toLowerCase();
            if (ua.indexOf('msie') === 0 && ua.indexOf('trident') === 0) {
                return false;
            }
            var match = /(?:msie|rv:)\s?([\d\.]+)/.exec(ua);
            if (match && parseInt(match[1], 10) >= 10) {
                return true;
            }
            return false;
        }

        function detectPrivateMode(callback) {
            var isPrivate;

            try {

                if (window.webkitRequestFileSystem) {
                    window.webkitRequestFileSystem(
                        window.TEMPORARY, 1,
                        function() {
                            isPrivate = false;
                        },
                        function(e) {
                            isPrivate = true;
                        }
                    );
                } else if (window.indexedDB && /Firefox/.test(window.navigator.userAgent)) {
                    var db;
                    try {
                        db = window.indexedDB.open('test');
                        db.onerror = function() {
                            return true;
                        };
                    } catch (e) {
                        isPrivate = true;
                    }

                    if (typeof isPrivate === 'undefined') {
                        retry(
                            function isDone() {
                                return db.readyState === 'done' ? true : false;
                            },
                            function next(isTimeout) {
                                if (!isTimeout) {
                                    isPrivate = db.result ? false : true;
                                }
                            }
                        );
                    }
                } else if (isIE10OrLater(window.navigator.userAgent)) {
                    isPrivate = false;
                    try {
                        if (!window.indexedDB) {
                            isPrivate = true;
                        }
                    } catch (e) {
                        isPrivate = true;
                    }
                } else if (window.localStorage && /Safari/.test(window.navigator.userAgent)) {
                    try {
                        window.localStorage.setItem('test', 1);
                    } catch (e) {
                        isPrivate = true;
                    }

                    if (typeof isPrivate === 'undefined') {
                        isPrivate = false;
                        window.localStorage.removeItem('test');
                    }
                }

            } catch (e) {
                isPrivate = false;
            }

            retry(
                function isDone() {
                    return typeof isPrivate !== 'undefined' ? true : false;
                },
                function next(isTimeout) {
                    callback(isPrivate);
                }
            );
        }

        var isMobile = {
            Android: function() {
                return navigator.userAgent.match(/Android/i);
            },
            BlackBerry: function() {
                return navigator.userAgent.match(/BlackBerry|BB10/i);
            },
            iOS: function() {
                return navigator.userAgent.match(/iPhone|iPad|iPod/i);
            },
            Opera: function() {
                return navigator.userAgent.match(/Opera Mini/i);
            },
            Windows: function() {
                return navigator.userAgent.match(/IEMobile/i);
            },
            any: function() {
                return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
            },
            getOsName: function() {
                var osName = 'Unknown OS';
                if (isMobile.Android()) {
                    osName = 'Android';
                }

                if (isMobile.BlackBerry()) {
                    osName = 'BlackBerry';
                }

                if (isMobile.iOS()) {
                    osName = 'iOS';
                }

                if (isMobile.Opera()) {
                    osName = 'Opera Mini';
                }

                if (isMobile.Windows()) {
                    osName = 'Windows';
                }

                return osName;
            }
        };

        // via: http://jsfiddle.net/ChristianL/AVyND/
        function detectDesktopOS() {
            var unknown = '-';

            var nVer = navigator.appVersion;
            var nAgt = navigator.userAgent;

            var os = unknown;
            var clientStrings = [{
                s: 'Windows 10',
                r: /(Windows 10.0|Windows NT 10.0)/
            }, {
                s: 'Windows 8.1',
                r: /(Windows 8.1|Windows NT 6.3)/
            }, {
                s: 'Windows 8',
                r: /(Windows 8|Windows NT 6.2)/
            }, {
                s: 'Windows 7',
                r: /(Windows 7|Windows NT 6.1)/
            }, {
                s: 'Windows Vista',
                r: /Windows NT 6.0/
            }, {
                s: 'Windows Server 2003',
                r: /Windows NT 5.2/
            }, {
                s: 'Windows XP',
                r: /(Windows NT 5.1|Windows XP)/
            }, {
                s: 'Windows 2000',
                r: /(Windows NT 5.0|Windows 2000)/
            }, {
                s: 'Windows ME',
                r: /(Win 9x 4.90|Windows ME)/
            }, {
                s: 'Windows 98',
                r: /(Windows 98|Win98)/
            }, {
                s: 'Windows 95',
                r: /(Windows 95|Win95|Windows_95)/
            }, {
                s: 'Windows NT 4.0',
                r: /(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/
            }, {
                s: 'Windows CE',
                r: /Windows CE/
            }, {
                s: 'Windows 3.11',
                r: /Win16/
            }, {
                s: 'Android',
                r: /Android/
            }, {
                s: 'Open BSD',
                r: /OpenBSD/
            }, {
                s: 'Sun OS',
                r: /SunOS/
            }, {
                s: 'Linux',
                r: /(Linux|X11)/
            }, {
                s: 'iOS',
                r: /(iPhone|iPad|iPod)/
            }, {
                s: 'Mac OS X',
                r: /Mac OS X/
            }, {
                s: 'Mac OS',
                r: /(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/
            }, {
                s: 'QNX',
                r: /QNX/
            }, {
                s: 'UNIX',
                r: /UNIX/
            }, {
                s: 'BeOS',
                r: /BeOS/
            }, {
                s: 'OS/2',
                r: /OS\/2/
            }, {
                s: 'Search Bot',
                r: /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/
            }];
            for (var i = 0, cs; cs = clientStrings[i]; i++) {
                if (cs.r.test(nAgt)) {
                    os = cs.s;
                    break;
                }
            }

            var osVersion = unknown;

            if (/Windows/.test(os)) {
                if (/Windows (.*)/.test(os)) {
                    osVersion = /Windows (.*)/.exec(os)[1];
                }
                os = 'Windows';
            }

            switch (os) {
                case 'Mac OS X':
                    if (/Mac OS X (10[\.\_\d]+)/.test(nAgt)) {
                        osVersion = /Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1];
                    }
                    break;
                case 'Android':
                    if (/Android ([\.\_\d]+)/.test(nAgt)) {
                        osVersion = /Android ([\.\_\d]+)/.exec(nAgt)[1];
                    }
                    break;
                case 'iOS':
                    if (/OS (\d+)_(\d+)_?(\d+)?/.test(nAgt)) {
                        osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
                        osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0);
                    }
                    break;
            }

            return {
                osName: os,
                osVersion: osVersion
            };
        }

        var osName = 'Unknown OS';
        var osVersion = 'Unknown OS Version';

        function getAndroidVersion(ua) {
            ua = (ua || navigator.userAgent).toLowerCase();
            var match = ua.match(/android\s([0-9\.]*)/);
            return match ? match[1] : false;
        }

        var osInfo = detectDesktopOS();

        if (osInfo && osInfo.osName && osInfo.osName != '-') {
            osName = osInfo.osName;
            osVersion = osInfo.osVersion;
        } else if (isMobile.any()) {
            osName = isMobile.getOsName();

            if (osName == 'Android') {
                osVersion = getAndroidVersion();
            }
        }

        var isNodejs = typeof process === 'object' && typeof process.versions === 'object' && process.versions.node;

        if (osName === 'Unknown OS' && isNodejs) {
            osName = 'Nodejs';
            osVersion = process.versions.node.toString().replace('v', '');
        }

        var isCanvasSupportsStreamCapturing = false;
        var isVideoSupportsStreamCapturing = false;
        ['captureStream', 'mozCaptureStream', 'webkitCaptureStream'].forEach(function(item) {
            if (!isCanvasSupportsStreamCapturing && item in document.createElement('canvas')) {
                isCanvasSupportsStreamCapturing = true;
            }

            if (!isVideoSupportsStreamCapturing && item in document.createElement('video')) {
                isVideoSupportsStreamCapturing = true;
            }
        });

        // via: https://github.com/diafygi/webrtc-ips
        function DetectLocalIPAddress(callback) {
            if (!DetectRTC.isWebRTCSupported) {
                return;
            }

            if (DetectRTC.isORTCSupported) {
                return;
            }

            getIPs(function(ip) {
                //local IPs
                if (ip.match(/^(192\.168\.|169\.254\.|10\.|172\.(1[6-9]|2\d|3[01]))/)) {
                    callback('Local: ' + ip);
                }

                //assume the rest are public IPs
                else {
                    callback('Public: ' + ip);
                }
            });
        }

        //get the IP addresses associated with an account
        function getIPs(callback) {
            var ipDuplicates = {};

            //compatibility for firefox and chrome
            var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
            var useWebKit = !!window.webkitRTCPeerConnection;

            // bypass naive webrtc blocking using an iframe
            if (!RTCPeerConnection) {
                var iframe = document.getElementById('iframe');
                if (!iframe) {
                    //<iframe id="iframe" sandbox="allow-same-origin" style="display: none"></iframe>
                    throw 'NOTE: you need to have an iframe in the page right above the script tag.';
                }
                var win = iframe.contentWindow;
                RTCPeerConnection = win.RTCPeerConnection || win.mozRTCPeerConnection || win.webkitRTCPeerConnection;
                useWebKit = !!win.webkitRTCPeerConnection;
            }

            // if still no RTCPeerConnection then it is not supported by the browser so just return
            if (!RTCPeerConnection) {
                return;
            }

            //minimal requirements for data connection
            var mediaConstraints = {
                optional: [{
                    RtpDataChannels: true
                }]
            };

            //firefox already has a default stun server in about:config
            //    media.peerconnection.default_iceservers =
            //    [{"url": "stun:stun.services.mozilla.com"}]
            var servers;

            //add same stun server for chrome
            if (useWebKit) {
                servers = {
                    iceServers: [{
                        urls: 'stun:stun.services.mozilla.com'
                    }]
                };

                if (typeof DetectRTC !== 'undefined' && DetectRTC.browser.isFirefox && DetectRTC.browser.version <= 38) {
                    servers[0] = {
                        url: servers[0].urls
                    };
                }
            }

            //construct a new RTCPeerConnection
            var pc = new RTCPeerConnection(servers, mediaConstraints);

            function handleCandidate(candidate) {
                //match just the IP address
                var ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
                var match = ipRegex.exec(candidate);
                if (!match) {
                    console.warn('Could not match IP address in', candidate);
                    return;
                }
                var ipAddress = match[1];

                //remove duplicates
                if (ipDuplicates[ipAddress] === undefined) {
                    callback(ipAddress);
                }

                ipDuplicates[ipAddress] = true;
            }

            //listen for candidate events
            pc.onicecandidate = function(ice) {
                //skip non-candidate events
                if (ice.candidate) {
                    handleCandidate(ice.candidate.candidate);
                }
            };

            //create a bogus data channel
            pc.createDataChannel('');

            //create an offer sdp
            pc.createOffer(function(result) {

                //trigger the stun server request
                pc.setLocalDescription(result, function() {}, function() {});

            }, function() {});

            //wait for a while to let everything done
            setTimeout(function() {
                //read candidate info from local description
                var lines = pc.localDescription.sdp.split('\n');

                lines.forEach(function(line) {
                    if (line.indexOf('a=candidate:') === 0) {
                        handleCandidate(line);
                    }
                });
            }, 1000);
        }

        var MediaDevices = [];

        var audioInputDevices = [];
        var audioOutputDevices = [];
        var videoInputDevices = [];

        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
            // Firefox 38+ seems having support of enumerateDevices
            // Thanks @xdumaine/enumerateDevices
            navigator.enumerateDevices = function(callback) {
                navigator.mediaDevices.enumerateDevices().then(callback).catch(function() {
                    callback([]);
                });
            };
        }

        // Media Devices detection
        var canEnumerate = false;

        /*global MediaStreamTrack:true */
        if (typeof MediaStreamTrack !== 'undefined' && 'getSources' in MediaStreamTrack) {
            canEnumerate = true;
        } else if (navigator.mediaDevices && !!navigator.mediaDevices.enumerateDevices) {
            canEnumerate = true;
        }

        var hasMicrophone = false;
        var hasSpeakers = false;
        var hasWebcam = false;

        var isWebsiteHasMicrophonePermissions = false;
        var isWebsiteHasWebcamPermissions = false;

        // http://dev.w3.org/2011/webrtc/editor/getusermedia.html#mediadevices
        function checkDeviceSupport(callback) {
            if (!canEnumerate) {
                if (callback) {
                    callback();
                }
                return;
            }

            if (!navigator.enumerateDevices && window.MediaStreamTrack && window.MediaStreamTrack.getSources) {
                navigator.enumerateDevices = window.MediaStreamTrack.getSources.bind(window.MediaStreamTrack);
            }

            if (!navigator.enumerateDevices && navigator.enumerateDevices) {
                navigator.enumerateDevices = navigator.enumerateDevices.bind(navigator);
            }

            if (!navigator.enumerateDevices) {
                if (callback) {
                    callback();
                }
                return;
            }

            MediaDevices = [];

            audioInputDevices = [];
            audioOutputDevices = [];
            videoInputDevices = [];

            isWebsiteHasMicrophonePermissions = false;
            isWebsiteHasWebcamPermissions = false;

            // to prevent duplication
            var alreadyUsedDevices = {};

            navigator.enumerateDevices(function(devices) {
                devices.forEach(function(_device) {
                    var device = {};
                    for (var d in _device) {
                        try {
                            if (typeof _device[d] !== 'function') {
                                device[d] = _device[d];
                            }
                        } catch (e) {}
                    }

                    if (alreadyUsedDevices[device.deviceId + device.label]) {
                        return;
                    }

                    // if it is MediaStreamTrack.getSources
                    if (device.kind === 'audio') {
                        device.kind = 'audioinput';
                    }

                    if (device.kind === 'video') {
                        device.kind = 'videoinput';
                    }

                    if (!device.deviceId) {
                        device.deviceId = device.id;
                    }

                    if (!device.id) {
                        device.id = device.deviceId;
                    }

                    if (!device.label) {
                        device.label = 'Please invoke getUserMedia once.';
                        if (DetectRTC.browser.isChrome && DetectRTC.browser.version >= 46 && !/^(https:|chrome-extension:)$/g.test(location.protocol || '')) {
                            if (document.domain.search && document.domain.search(/localhost|127.0./g) === -1) {
                                device.label = 'HTTPs is required to get label of this ' + device.kind + ' device.';
                            }
                        }
                    } else {
                        if (device.kind === 'videoinput' && !isWebsiteHasWebcamPermissions) {
                            isWebsiteHasWebcamPermissions = true;
                        }

                        if (device.kind === 'audioinput' && !isWebsiteHasMicrophonePermissions) {
                            isWebsiteHasMicrophonePermissions = true;
                        }
                    }

                    if (device.kind === 'audioinput') {
                        hasMicrophone = true;

                        if (audioInputDevices.indexOf(device) === -1) {
                            audioInputDevices.push(device);
                        }
                    }

                    if (device.kind === 'audiooutput') {
                        hasSpeakers = true;

                        if (audioOutputDevices.indexOf(device) === -1) {
                            audioOutputDevices.push(device);
                        }
                    }

                    if (device.kind === 'videoinput') {
                        hasWebcam = true;

                        if (videoInputDevices.indexOf(device) === -1) {
                            videoInputDevices.push(device);
                        }
                    }

                    // there is no 'videoouput' in the spec.
                    MediaDevices.push(device);

                    alreadyUsedDevices[device.deviceId + device.label] = device;
                });

                if (typeof DetectRTC !== 'undefined') {
                    // to sync latest outputs
                    DetectRTC.MediaDevices = MediaDevices;
                    DetectRTC.hasMicrophone = hasMicrophone;
                    DetectRTC.hasSpeakers = hasSpeakers;
                    DetectRTC.hasWebcam = hasWebcam;

                    DetectRTC.isWebsiteHasWebcamPermissions = isWebsiteHasWebcamPermissions;
                    DetectRTC.isWebsiteHasMicrophonePermissions = isWebsiteHasMicrophonePermissions;

                    DetectRTC.audioInputDevices = audioInputDevices;
                    DetectRTC.audioOutputDevices = audioOutputDevices;
                    DetectRTC.videoInputDevices = videoInputDevices;
                }

                if (callback) {
                    callback();
                }
            });
        }

        // check for microphone/camera support!
        checkDeviceSupport();

        var DetectRTC = window.DetectRTC || {};

        // ----------
        // DetectRTC.browser.name || DetectRTC.browser.version || DetectRTC.browser.fullVersion
        DetectRTC.browser = getBrowserInfo();

        detectPrivateMode(function(isPrivateBrowsing) {
            DetectRTC.browser.isPrivateBrowsing = !!isPrivateBrowsing;
        });

        // DetectRTC.isChrome || DetectRTC.isFirefox || DetectRTC.isEdge
        DetectRTC.browser['is' + DetectRTC.browser.name] = true;

        // -----------
        DetectRTC.osName = osName;
        DetectRTC.osVersion = osVersion;

        var isNodeWebkit = typeof process === 'object' && typeof process.versions === 'object' && process.versions['node-webkit'];

        // --------- Detect if system supports WebRTC 1.0 or WebRTC 1.1.
        var isWebRTCSupported = false;
        ['RTCPeerConnection', 'webkitRTCPeerConnection', 'mozRTCPeerConnection', 'RTCIceGatherer'].forEach(function(item) {
            if (isWebRTCSupported) {
                return;
            }

            if (item in window) {
                isWebRTCSupported = true;
            }
        });
        DetectRTC.isWebRTCSupported = isWebRTCSupported;

        //-------
        DetectRTC.isORTCSupported = typeof RTCIceGatherer !== 'undefined';

        // --------- Detect if system supports screen capturing API
        var isScreenCapturingSupported = false;
        if (DetectRTC.browser.isChrome && DetectRTC.browser.version >= 35) {
            isScreenCapturingSupported = true;
        } else if (DetectRTC.browser.isFirefox && DetectRTC.browser.version >= 34) {
            isScreenCapturingSupported = true;
        }

        if (!/^(https:|chrome-extension:)$/g.test(location.protocol || '')) {
            if (document.domain.search && document.domain.search(/localhost|127.0./g) === -1) {
                // DetectRTC.browser.isChrome
                isScreenCapturingSupported = false;
            }

            if (DetectRTC.browser.isFirefox) {
                isScreenCapturingSupported = false;
            }
        }
        DetectRTC.isScreenCapturingSupported = isScreenCapturingSupported;

        // --------- Detect if WebAudio API are supported
        var webAudio = {
            isSupported: false,
            isCreateMediaStreamSourceSupported: false
        };

        ['AudioContext', 'webkitAudioContext', 'mozAudioContext', 'msAudioContext'].forEach(function(item) {
            if (webAudio.isSupported) {
                return;
            }

            if (item in window) {
                webAudio.isSupported = true;

                if (window[item] && 'createMediaStreamSource' in window[item].prototype) {
                    webAudio.isCreateMediaStreamSourceSupported = true;
                }
            }
        });
        DetectRTC.isAudioContextSupported = webAudio.isSupported;
        DetectRTC.isCreateMediaStreamSourceSupported = webAudio.isCreateMediaStreamSourceSupported;

        // ---------- Detect if SCTP/RTP channels are supported.

        var isRtpDataChannelsSupported = false;
        if (DetectRTC.browser.isChrome && DetectRTC.browser.version > 31) {
            isRtpDataChannelsSupported = true;
        }
        DetectRTC.isRtpDataChannelsSupported = isRtpDataChannelsSupported;

        var isSCTPSupportd = false;
        if (DetectRTC.browser.isFirefox && DetectRTC.browser.version > 28) {
            isSCTPSupportd = true;
        } else if (DetectRTC.browser.isChrome && DetectRTC.browser.version > 25) {
            isSCTPSupportd = true;
        } else if (DetectRTC.browser.isOpera && DetectRTC.browser.version >= 11) {
            isSCTPSupportd = true;
        }
        DetectRTC.isSctpDataChannelsSupported = isSCTPSupportd;

        // ---------

        DetectRTC.isMobileDevice = isMobileDevice; // "isMobileDevice" boolean is defined in "getBrowserInfo.js"

        // ------
        var isGetUserMediaSupported = false;
        if (navigator.getUserMedia) {
            isGetUserMediaSupported = true;
        } else if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            isGetUserMediaSupported = true;
        }

        if (DetectRTC.browser.isChrome && DetectRTC.browser.version >= 46 && !/^(https:|chrome-extension:)$/g.test(location.protocol || '')) {
            if (document.domain.search && document.domain.search(/localhost|127.0./g) === -1) {
                isGetUserMediaSupported = 'Requires HTTPs';
            }
        }

        if (DetectRTC.osName === 'Nodejs') {
            isGetUserMediaSupported = false;
        }
        DetectRTC.isGetUserMediaSupported = isGetUserMediaSupported;

        var displayResolution = '';
        if (screen.width) {
            var width = (screen.width) ? screen.width : '';
            var height = (screen.height) ? screen.height : '';
            displayResolution += '' + width + ' x ' + height;
        }
        DetectRTC.displayResolution = displayResolution;

        // ----------
        DetectRTC.isCanvasSupportsStreamCapturing = isCanvasSupportsStreamCapturing;
        DetectRTC.isVideoSupportsStreamCapturing = isVideoSupportsStreamCapturing;

        if (DetectRTC.browser.name == 'Chrome' && DetectRTC.browser.version >= 53) {
            if (!DetectRTC.isCanvasSupportsStreamCapturing) {
                DetectRTC.isCanvasSupportsStreamCapturing = 'Requires chrome flag: enable-experimental-web-platform-features';
            }

            if (!DetectRTC.isVideoSupportsStreamCapturing) {
                DetectRTC.isVideoSupportsStreamCapturing = 'Requires chrome flag: enable-experimental-web-platform-features';
            }
        }

        // ------
        DetectRTC.DetectLocalIPAddress = DetectLocalIPAddress;

        DetectRTC.isWebSocketsSupported = 'WebSocket' in window && 2 === window.WebSocket.CLOSING;
        DetectRTC.isWebSocketsBlocked = !DetectRTC.isWebSocketsSupported;

        if (DetectRTC.osName === 'Nodejs') {
            DetectRTC.isWebSocketsSupported = true;
            DetectRTC.isWebSocketsBlocked = false;
        }

        DetectRTC.checkWebSocketsSupport = function(callback) {
            callback = callback || function() {};
            try {
                var websocket = new WebSocket('wss://echo.websocket.org:443/');
                websocket.onopen = function() {
                    DetectRTC.isWebSocketsBlocked = false;
                    callback();
                    websocket.close();
                    websocket = null;
                };
                websocket.onerror = function() {
                    DetectRTC.isWebSocketsBlocked = true;
                    callback();
                };
            } catch (e) {
                DetectRTC.isWebSocketsBlocked = true;
                callback();
            }
        };

        // -------
        DetectRTC.load = function(callback) {
            callback = callback || function() {};
            checkDeviceSupport(callback);
        };

        DetectRTC.MediaDevices = MediaDevices;
        DetectRTC.hasMicrophone = hasMicrophone;
        DetectRTC.hasSpeakers = hasSpeakers;
        DetectRTC.hasWebcam = hasWebcam;

        DetectRTC.isWebsiteHasWebcamPermissions = isWebsiteHasWebcamPermissions;
        DetectRTC.isWebsiteHasMicrophonePermissions = isWebsiteHasMicrophonePermissions;

        DetectRTC.audioInputDevices = audioInputDevices;
        DetectRTC.audioOutputDevices = audioOutputDevices;
        DetectRTC.videoInputDevices = videoInputDevices;

        // ------
        var isSetSinkIdSupported = false;
        if ('setSinkId' in document.createElement('video')) {
            isSetSinkIdSupported = true;
        }
        DetectRTC.isSetSinkIdSupported = isSetSinkIdSupported;

        // -----
        var isRTPSenderReplaceTracksSupported = false;
        if (DetectRTC.browser.isFirefox && typeof mozRTCPeerConnection !== 'undefined' /*&& DetectRTC.browser.version > 39*/ ) {
            /*global mozRTCPeerConnection:true */
            if ('getSenders' in mozRTCPeerConnection.prototype) {
                isRTPSenderReplaceTracksSupported = true;
            }
        } else if (DetectRTC.browser.isChrome && typeof webkitRTCPeerConnection !== 'undefined') {
            /*global webkitRTCPeerConnection:true */
            if ('getSenders' in webkitRTCPeerConnection.prototype) {
                isRTPSenderReplaceTracksSupported = true;
            }
        }
        DetectRTC.isRTPSenderReplaceTracksSupported = isRTPSenderReplaceTracksSupported;

        //------
        var isRemoteStreamProcessingSupported = false;
        if (DetectRTC.browser.isFirefox && DetectRTC.browser.version > 38) {
            isRemoteStreamProcessingSupported = true;
        }
        DetectRTC.isRemoteStreamProcessingSupported = isRemoteStreamProcessingSupported;

        //-------
        var isApplyConstraintsSupported = false;

        /*global MediaStreamTrack:true */
        if (typeof MediaStreamTrack !== 'undefined' && 'applyConstraints' in MediaStreamTrack.prototype) {
            isApplyConstraintsSupported = true;
        }
        DetectRTC.isApplyConstraintsSupported = isApplyConstraintsSupported;

        //-------
        var isMultiMonitorScreenCapturingSupported = false;
        if (DetectRTC.browser.isFirefox && DetectRTC.browser.version >= 43) {
            // version 43 merely supports platforms for multi-monitors
            // version 44 will support exact multi-monitor selection i.e. you can select any monitor for screen capturing.
            isMultiMonitorScreenCapturingSupported = true;
        }
        DetectRTC.isMultiMonitorScreenCapturingSupported = isMultiMonitorScreenCapturingSupported;

        DetectRTC.isPromisesSupported = !!('Promise' in window);

        if (typeof DetectRTC === 'undefined') {
            window.DetectRTC = {};
        }

        var MediaStream = window.MediaStream;

        if (typeof MediaStream === 'undefined' && typeof webkitMediaStream !== 'undefined') {
            MediaStream = webkitMediaStream;
        }

        if (typeof MediaStream !== 'undefined') {
            DetectRTC.MediaStream = Object.keys(MediaStream.prototype);
        } else DetectRTC.MediaStream = false;

        if (typeof MediaStreamTrack !== 'undefined') {
            DetectRTC.MediaStreamTrack = Object.keys(MediaStreamTrack.prototype);
        } else DetectRTC.MediaStreamTrack = false;

        var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;

        if (typeof RTCPeerConnection !== 'undefined') {
            DetectRTC.RTCPeerConnection = Object.keys(RTCPeerConnection.prototype);
        } else DetectRTC.RTCPeerConnection = false;

        window.DetectRTC = DetectRTC;

        if (typeof module !== 'undefined' /* && !!module.exports*/ ) {
            module.exports = DetectRTC;
        }

        if (typeof define === 'function' && define.amd) {
            define('DetectRTC', [], function() {
                return DetectRTC;
            });
        }
    })();

    // ios-hacks.js

    function setCordovaAPIs() {
        if (DetectRTC.osName !== 'iOS') return;
        if (typeof cordova === 'undefined' || typeof cordova.plugins === 'undefined' || typeof cordova.plugins.iosrtc === 'undefined') return;

        var iosrtc = cordova.plugins.iosrtc;
        window.webkitRTCPeerConnection = iosrtc.RTCPeerConnection;
        window.RTCSessionDescription = iosrtc.RTCSessionDescription;
        window.RTCIceCandidate = iosrtc.RTCIceCandidate;
        window.MediaStream = iosrtc.MediaStream;
        window.MediaStreamTrack = iosrtc.MediaStreamTrack;
        navigator.getUserMedia = navigator.webkitGetUserMedia = iosrtc.getUserMedia;

        iosrtc.debug.enable('iosrtc*');
        if (typeof iosrtc.selectAudioOutput == 'function') {
            iosrtc.selectAudioOutput(window.iOSDefaultAudioOutputDevice || 'speaker'); // earpiece or speaker
        }
        iosrtc.registerGlobals();
    }

    document.addEventListener('deviceready', setCordovaAPIs, false);
    setCordovaAPIs();

    // RTCPeerConnection.js

    var defaults = {};

    function setSdpConstraints(config) {
        var sdpConstraints = {
            OfferToReceiveAudio: !!config.OfferToReceiveAudio,
            OfferToReceiveVideo: !!config.OfferToReceiveVideo,
            VoiceActivityDetection: false
        };

        return sdpConstraints;
    }

    var RTCPeerConnection;
    if (typeof window.RTCPeerConnection !== 'undefined') {
        RTCPeerConnection = window.RTCPeerConnection;
    } else if (typeof mozRTCPeerConnection !== 'undefined') {
        RTCPeerConnection = mozRTCPeerConnection;
    } else if (typeof webkitRTCPeerConnection !== 'undefined') {
        RTCPeerConnection = webkitRTCPeerConnection;
    }

    var RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
    var RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate;
    var MediaStreamTrack = window.MediaStreamTrack;

    function PeerInitiator(config) {
        if (typeof window.RTCPeerConnection !== 'undefined') {
            RTCPeerConnection = window.RTCPeerConnection;
        } else if (typeof mozRTCPeerConnection !== 'undefined') {
            RTCPeerConnection = mozRTCPeerConnection;
        } else if (typeof webkitRTCPeerConnection !== 'undefined') {
            RTCPeerConnection = webkitRTCPeerConnection;
        }

        RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
        RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate;
        MediaStreamTrack = window.MediaStreamTrack;

        if (!RTCPeerConnection) {
            throw 'WebRTC 1.0 (RTCPeerConnection) API are NOT available in this browser.';
        }

        var connection = config.rtcMultiConnection;

        this.extra = config.remoteSdp ? config.remoteSdp.extra : connection.extra;
        this.userid = config.userid;
        this.streams = [];
        this.channels = config.channels || [];
        this.connectionDescription = config.connectionDescription;

        this.addStream = function(session) {
            connection.addStream(session, this.userid);
        };

        this.removeStream = function(streamid) {
            connection.removeStream(streamid, this.userid);
        };

        var self = this;

        if (config.remoteSdp) {
            this.connectionDescription = config.remoteSdp.connectionDescription;
        }

        var allRemoteStreams = {};

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
        connection.attachStreams.forEach(function(stream) {
            if (!!stream) {
                localStreams.push(stream);
            }
        });

        if (!renegotiatingPeer) {
            var iceTransports = 'all';
            if (connection.candidates.turn || connection.candidates.relay) {
                if (!connection.candidates.stun && !connection.candidates.reflexive && !connection.candidates.host) {
                    iceTransports = 'relay';
                }
            }

            try {
                peer = new RTCPeerConnection(navigator.onLine ? {
                    iceServers: connection.iceServers,
                    iceTransportPolicy: connection.iceTransportPolicy || iceTransports,
                    // rtcpMuxPolicy: connection.rtcpMuxPolicy || 'negotiate'
                } : null, connection.optionalArgument);
            } catch (e) {
                try {
                    peer = new RTCPeerConnection({
                        iceServers: connection.iceServers
                    });
                } catch (e) {
                    peer = new RTCPeerConnection();
                }
            }

            if (!connection.iceServers.length) {
                peer = new RTCPeerConnection(null, null);
            }
        } else {
            peer = config.peerRef;
        }

        function getLocalStreams() {
            // if-block is temporarily disabled
            if (typeof window.InstallTrigger !== 'undefined' && 'getSenders' in peer && typeof peer.getSenders === 'function') {
                var streamObject2 = new MediaStream();
                peer.getSenders().forEach(function(sender) {
                    streamObject2.addTrack(sender.track);
                });
                return streamObject2;
            }
            return peer.getLocalStreams();
        }

        peer.onicecandidate = function(event) {
            if (!event.candidate) {
                if (!connection.trickleIce) {
                    var localSdp = peer.localDescription;
                    config.onLocalSdp({
                        type: localSdp.type,
                        sdp: localSdp.sdp,
                        remotePeerSdpConstraints: config.remotePeerSdpConstraints || false,
                        renegotiatingPeer: !!config.renegotiatingPeer || false,
                        connectionDescription: self.connectionDescription,
                        dontGetRemoteStream: !!config.dontGetRemoteStream,
                        extra: connection ? connection.extra : {},
                        streamsToShare: streamsToShare,
                        isFirefoxOffered: isFirefox
                    });
                }
                return;
            }

            if (!connection.trickleIce) return;
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

            localStream = connection.beforeAddingStream(localStream, self);

            if (!localStream) return;

            if (getLocalStreams().forEach) {
                getLocalStreams().forEach(function(stream) {
                    if (localStream && stream.id == localStream.id) {
                        localStream = null;
                    }
                });
            }

            if (localStream) {
                localStream.getTracks().forEach(function(track) {
                    peer.addTrack(track, localStream);
                });
            }
        });

        peer.oniceconnectionstatechange = peer.onsignalingstatechange = function() {
            var extra = self.extra;
            if (connection.peers[self.userid]) {
                extra = connection.peers[self.userid].extra || extra;
            }

            if (!peer) {
                return;
            }

            config.onPeerStateChanged({
                iceConnectionState: peer.iceConnectionState,
                iceGatheringState: peer.iceGatheringState,
                signalingState: peer.signalingState,
                extra: extra,
                userid: self.userid
            });

            if (peer && peer.iceConnectionState && peer.iceConnectionState.search(/closed|failed/gi) !== -1 && self.streams instanceof Array) {
                self.streams.forEach(function(stream) {
                    var streamEvent = connection.streamEvents[stream.id] || {
                        streamid: stream.id,
                        stream: stream,
                        type: 'remote'
                    };

                    connection.onstreamended(streamEvent);
                });
            }
        };

        var sdpConstraints = {
            OfferToReceiveAudio: !!localStreams.length,
            OfferToReceiveVideo: !!localStreams.length
        };

        if (config.localPeerSdpConstraints) sdpConstraints = config.localPeerSdpConstraints;

        defaults.sdpConstraints = setSdpConstraints(sdpConstraints);

        var streamObject;
        var dontDuplicate = {};
        peer.addEventListener('track', function(event) {
            if (!event) return;

            event.stream = event.streams[event.streams.length - 1];
            if (dontDuplicate[event.stream.id]) return;
            dontDuplicate[event.stream.id] = event.stream.id;

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
            } else {
                event.stream.isVideo = true;
            }

            event.stream.streamid = event.stream.id;
            if (isFirefox || !event.stream.stop) {
                event.stream.stop = function() {
                    var streamEndedEvent = 'ended';

                    if ('oninactive' in event.stream) {
                        streamEndedEvent = 'inactive';
                    }
                    fireEvent(event.stream, streamEndedEvent);
                };
            }
            allRemoteStreams[event.stream.id] = event.stream;
            config.onRemoteStream(event.stream);
        }, false);

        peer.onremovestream = function(event) {
            // this event doesn't works anymore
            event.stream.streamid = event.stream.id;

            if (allRemoteStreams[event.stream.id]) {
                delete allRemoteStreams[event.stream.id];
            }

            config.onRemoteStreamRemoved(event.stream);
        };

        this.addRemoteCandidate = function(remoteCandidate) {
            peer.addIceCandidate(new RTCIceCandidate(remoteCandidate)).then(function() {
                // success
            }, function(error) {
                // failure
            });
        };

        this.addRemoteSdp = function(remoteSdp, cb) {
            remoteSdp.sdp = connection.processSdp(remoteSdp.sdp);
            peer.setRemoteDescription(new RTCSessionDescription(remoteSdp)).then(cb || function() {}, function(error) {
                if (!!connection.enableLogs) {
                    console.error('setRemoteDescription failed', '\n', error, '\n', remoteSdp.sdp);
                }
            });
        };

        var isOfferer = true;

        if (config.remoteSdp) {
            isOfferer = false;
        }

        this.createDataChannel = function() {
            var channel = peer.createDataChannel('sctp', {});
            setChannelEvents(channel);
        };

        if (connection.session.data === true && !renegotiatingPeer) {
            if (!isOfferer) {
                peer.ondatachannel = function(event) {
                    var channel = event.channel;
                    setChannelEvents(channel);
                };
            } else {
                this.createDataChannel();
            }
        }

        if (config.remoteSdp) {
            if (config.remoteSdp.remotePeerSdpConstraints) {
                sdpConstraints = config.remoteSdp.remotePeerSdpConstraints;
            }
            defaults.sdpConstraints = setSdpConstraints(sdpConstraints);
            this.addRemoteSdp(config.remoteSdp, function() {
                createOfferOrAnswer('createAnswer');
            });
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

        if (connection.session.audio == 'two-way' || connection.session.video == 'two-way' || connection.session.screen == 'two-way') {
            defaults.sdpConstraints = setSdpConstraints({
                OfferToReceiveAudio: connection.session.audio == 'two-way' || (config.remoteSdp && config.remoteSdp.remotePeerSdpConstraints && config.remoteSdp.remotePeerSdpConstraints.OfferToReceiveAudio),
                OfferToReceiveVideo: connection.session.video == 'two-way' || connection.session.screen == 'two-way' || (config.remoteSdp && config.remoteSdp.remotePeerSdpConstraints && config.remoteSdp.remotePeerSdpConstraints.OfferToReceiveAudio)
            });
        }

        var streamsToShare = {};
        if (getLocalStreams().forEach) {
            getLocalStreams().forEach(function(stream) {
                streamsToShare[stream.streamid] = {
                    isAudio: !!stream.isAudio,
                    isVideo: !!stream.isVideo,
                    isScreen: !!stream.isScreen
                };
            });
        }

        function createOfferOrAnswer(_method) {
            peer[_method](defaults.sdpConstraints).then(function(localSdp) {
                localSdp.sdp = connection.processSdp(localSdp.sdp);
                peer.setLocalDescription(localSdp).then(function() {
                    if (!connection.trickleIce) return;
                    config.onLocalSdp({
                        type: localSdp.type,
                        sdp: localSdp.sdp,
                        remotePeerSdpConstraints: config.remotePeerSdpConstraints || false,
                        renegotiatingPeer: !!config.renegotiatingPeer || false,
                        connectionDescription: self.connectionDescription,
                        dontGetRemoteStream: !!config.dontGetRemoteStream,
                        extra: connection ? connection.extra : {},
                        streamsToShare: streamsToShare,
                        isFirefoxOffered: isFirefox
                    });

                    connection.onSettingLocalDescription(self);
                }, function(error) {
                    if (!connection.enableLogs) return;
                    console.error('setLocalDescription error', error);
                });
            }, function(error) {
                if (!!connection.enableLogs) {
                    console.error('sdp-error', error);
                }
            });
        }

        if (isOfferer) {
            createOfferOrAnswer('createOffer');
        }

        peer.nativeClose = peer.close;
        peer.close = function() {
            if (!peer) {
                return;
            }

            try {
                if (peer.iceConnectionState.search(/closed|failed/gi) === -1) {
                    peer.getRemoteStreams().forEach(function(stream) {
                        stream.stop();
                    });
                }
                peer.nativeClose();
            } catch (e) {}

            peer = null;
            self.peer = null;
        };

        this.peer = peer;
    }

    // CodecsHandler.js

    var CodecsHandler = (function() {
        var isMobileDevice = !!navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i);
        if (typeof cordova !== 'undefined') {
            isMobileDevice = true;
        }

        if (navigator && navigator.userAgent && navigator.userAgent.indexOf('Crosswalk') !== -1) {
            isMobileDevice = true;
        }

        // "removeVPX" and "removeNonG722" methods are taken from github/mozilla/webrtc-landing
        function removeVPX(sdp) {
            if (!sdp || typeof sdp !== 'string') {
                throw 'Invalid arguments.';
            }

            // this method is NOT reliable

            sdp = sdp.replace('a=rtpmap:100 VP8/90000\r\n', '');
            sdp = sdp.replace('a=rtpmap:101 VP9/90000\r\n', '');

            sdp = sdp.replace(/m=video ([0-9]+) RTP\/SAVPF ([0-9 ]*) 100/g, 'm=video $1 RTP\/SAVPF $2');
            sdp = sdp.replace(/m=video ([0-9]+) RTP\/SAVPF ([0-9 ]*) 101/g, 'm=video $1 RTP\/SAVPF $2');

            sdp = sdp.replace(/m=video ([0-9]+) RTP\/SAVPF 100([0-9 ]*)/g, 'm=video $1 RTP\/SAVPF$2');
            sdp = sdp.replace(/m=video ([0-9]+) RTP\/SAVPF 101([0-9 ]*)/g, 'm=video $1 RTP\/SAVPF$2');

            sdp = sdp.replace('a=rtcp-fb:120 nack\r\n', '');
            sdp = sdp.replace('a=rtcp-fb:120 nack pli\r\n', '');
            sdp = sdp.replace('a=rtcp-fb:120 ccm fir\r\n', '');

            sdp = sdp.replace('a=rtcp-fb:101 nack\r\n', '');
            sdp = sdp.replace('a=rtcp-fb:101 nack pli\r\n', '');
            sdp = sdp.replace('a=rtcp-fb:101 ccm fir\r\n', '');

            return sdp;
        }

        function disableNACK(sdp) {
            if (!sdp || typeof sdp !== 'string') {
                throw 'Invalid arguments.';
            }

            sdp = sdp.replace('a=rtcp-fb:126 nack\r\n', '');
            sdp = sdp.replace('a=rtcp-fb:126 nack pli\r\n', 'a=rtcp-fb:126 pli\r\n');
            sdp = sdp.replace('a=rtcp-fb:97 nack\r\n', '');
            sdp = sdp.replace('a=rtcp-fb:97 nack pli\r\n', 'a=rtcp-fb:97 pli\r\n');

            return sdp;
        }

        function prioritize(codecMimeType, peer) {
            if (!peer || !peer.getSenders || !peer.getSenders().length) {
                return;
            }

            if (!codecMimeType || typeof codecMimeType !== 'string') {
                throw 'Invalid arguments.';
            }

            peer.getSenders().forEach(function(sender) {
                var params = sender.getParameters();
                for (var i = 0; i < params.codecs.length; i++) {
                    if (params.codecs[i].mimeType == codecMimeType) {
                        params.codecs.unshift(params.codecs.splice(i, 1));
                        break;
                    }
                }
                sender.setParameters(params);
            });
        }

        function removeNonG722(sdp) {
            return sdp.replace(/m=audio ([0-9]+) RTP\/SAVPF ([0-9 ]*)/g, 'm=audio $1 RTP\/SAVPF 9');
        }

        function setBAS(sdp, bandwidth, isScreen) {
            if (!bandwidth) {
                return sdp;
            }

            if (typeof isFirefox !== 'undefined' && isFirefox) {
                return sdp;
            }

            if (isMobileDevice) {
                return sdp;
            }

            if (isScreen) {
                if (!bandwidth.screen) {
                    console.warn('It seems that you are not using bandwidth for screen. Screen sharing is expected to fail.');
                } else if (bandwidth.screen < 300) {
                    console.warn('It seems that you are using wrong bandwidth value for screen. Screen sharing is expected to fail.');
                }
            }

            // if screen; must use at least 300kbs
            if (bandwidth.screen && isScreen) {
                sdp = sdp.replace(/b=AS([^\r\n]+\r\n)/g, '');
                sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + bandwidth.screen + '\r\n');
            }

            // remove existing bandwidth lines
            if (bandwidth.audio || bandwidth.video || bandwidth.data) {
                sdp = sdp.replace(/b=AS([^\r\n]+\r\n)/g, '');
            }

            if (bandwidth.audio) {
                sdp = sdp.replace(/a=mid:audio\r\n/g, 'a=mid:audio\r\nb=AS:' + bandwidth.audio + '\r\n');
            }

            if (bandwidth.video) {
                sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + (isScreen ? bandwidth.screen : bandwidth.video) + '\r\n');
            }

            return sdp;
        }

        // Find the line in sdpLines that starts with |prefix|, and, if specified,
        // contains |substr| (case-insensitive search).
        function findLine(sdpLines, prefix, substr) {
            return findLineInRange(sdpLines, 0, -1, prefix, substr);
        }

        // Find the line in sdpLines[startLine...endLine - 1] that starts with |prefix|
        // and, if specified, contains |substr| (case-insensitive search).
        function findLineInRange(sdpLines, startLine, endLine, prefix, substr) {
            var realEndLine = endLine !== -1 ? endLine : sdpLines.length;
            for (var i = startLine; i < realEndLine; ++i) {
                if (sdpLines[i].indexOf(prefix) === 0) {
                    if (!substr ||
                        sdpLines[i].toLowerCase().indexOf(substr.toLowerCase()) !== -1) {
                        return i;
                    }
                }
            }
            return null;
        }

        // Gets the codec payload type from an a=rtpmap:X line.
        function getCodecPayloadType(sdpLine) {
            var pattern = new RegExp('a=rtpmap:(\\d+) \\w+\\/\\d+');
            var result = sdpLine.match(pattern);
            return (result && result.length === 2) ? result[1] : null;
        }

        function setVideoBitrates(sdp, params) {
            if (isMobileDevice) {
                return sdp;
            }

            params = params || {};
            var xgoogle_min_bitrate = params.min;
            var xgoogle_max_bitrate = params.max;

            var sdpLines = sdp.split('\r\n');

            // VP8
            var vp8Index = findLine(sdpLines, 'a=rtpmap', 'VP8/90000');
            var vp8Payload;
            if (vp8Index) {
                vp8Payload = getCodecPayloadType(sdpLines[vp8Index]);
            }

            if (!vp8Payload) {
                return sdp;
            }

            var rtxIndex = findLine(sdpLines, 'a=rtpmap', 'rtx/90000');
            var rtxPayload;
            if (rtxIndex) {
                rtxPayload = getCodecPayloadType(sdpLines[rtxIndex]);
            }

            if (!rtxIndex) {
                return sdp;
            }

            var rtxFmtpLineIndex = findLine(sdpLines, 'a=fmtp:' + rtxPayload.toString());
            if (rtxFmtpLineIndex !== null) {
                var appendrtxNext = '\r\n';
                appendrtxNext += 'a=fmtp:' + vp8Payload + ' x-google-min-bitrate=' + (xgoogle_min_bitrate || '228') + '; x-google-max-bitrate=' + (xgoogle_max_bitrate || '228');
                sdpLines[rtxFmtpLineIndex] = sdpLines[rtxFmtpLineIndex].concat(appendrtxNext);
                sdp = sdpLines.join('\r\n');
            }

            return sdp;
        }

        function setOpusAttributes(sdp, params) {
            if (isMobileDevice) {
                return sdp;
            }

            params = params || {};

            var sdpLines = sdp.split('\r\n');

            // Opus
            var opusIndex = findLine(sdpLines, 'a=rtpmap', 'opus/48000');
            var opusPayload;
            if (opusIndex) {
                opusPayload = getCodecPayloadType(sdpLines[opusIndex]);
            }

            if (!opusPayload) {
                return sdp;
            }

            var opusFmtpLineIndex = findLine(sdpLines, 'a=fmtp:' + opusPayload.toString());
            if (opusFmtpLineIndex === null) {
                return sdp;
            }

            var appendOpusNext = '';
            appendOpusNext += '; stereo=' + (typeof params.stereo != 'undefined' ? params.stereo : '1');
            appendOpusNext += '; sprop-stereo=' + (typeof params['sprop-stereo'] != 'undefined' ? params['sprop-stereo'] : '1');

            if (typeof params.maxaveragebitrate != 'undefined') {
                appendOpusNext += '; maxaveragebitrate=' + (params.maxaveragebitrate || 128 * 1024 * 8);
            }

            if (typeof params.maxplaybackrate != 'undefined') {
                appendOpusNext += '; maxplaybackrate=' + (params.maxplaybackrate || 128 * 1024 * 8);
            }

            if (typeof params.cbr != 'undefined') {
                appendOpusNext += '; cbr=' + (typeof params.cbr != 'undefined' ? params.cbr : '1');
            }

            if (typeof params.useinbandfec != 'undefined') {
                appendOpusNext += '; useinbandfec=' + params.useinbandfec;
            }

            if (typeof params.usedtx != 'undefined') {
                appendOpusNext += '; usedtx=' + params.usedtx;
            }

            if (typeof params.maxptime != 'undefined') {
                appendOpusNext += '\r\na=maxptime:' + params.maxptime;
            }

            sdpLines[opusFmtpLineIndex] = sdpLines[opusFmtpLineIndex].concat(appendOpusNext);

            sdp = sdpLines.join('\r\n');
            return sdp;
        }

        function preferVP9(sdp) {
            if (sdp.indexOf('SAVPF 100 101') === -1 || sdp.indexOf('VP9/90000') === -1) {
                return sdp;
            }

            return sdp.replace('SAVPF 100 101', 'SAVPF 101 100');
        }

        // forceStereoAudio => via webrtcexample.com
        // requires getUserMedia => echoCancellation:false
        function forceStereoAudio(sdp) {
            var sdpLines = sdp.split('\r\n');
            var fmtpLineIndex = null;
            for (var i = 0; i < sdpLines.length; i++) {
                if (sdpLines[i].search('opus/48000') !== -1) {
                    var opusPayload = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
                    break;
                }
            }
            for (var i = 0; i < sdpLines.length; i++) {
                if (sdpLines[i].search('a=fmtp') !== -1) {
                    var payload = extractSdp(sdpLines[i], /a=fmtp:(\d+)/);
                    if (payload === opusPayload) {
                        fmtpLineIndex = i;
                        break;
                    }
                }
            }
            if (fmtpLineIndex === null) return sdp;
            sdpLines[fmtpLineIndex] = sdpLines[fmtpLineIndex].concat('; stereo=1; sprop-stereo=1');
            sdp = sdpLines.join('\r\n');
            return sdp;
        }

        return {
            removeVPX: removeVPX,
            disableNACK: disableNACK,
            prioritize: prioritize,
            removeNonG722: removeNonG722,
            setApplicationSpecificBandwidth: function(sdp, bandwidth, isScreen) {
                return setBAS(sdp, bandwidth, isScreen);
            },
            setVideoBitrates: function(sdp, params) {
                return setVideoBitrates(sdp, params);
            },
            setOpusAttributes: function(sdp, params) {
                return setOpusAttributes(sdp, params);
            },
            preferVP9: preferVP9,
            forceStereoAudio: forceStereoAudio
        };
    })();

    // backward compatibility
    window.BandwidthHandler = CodecsHandler;

    // OnIceCandidateHandler.js

    var OnIceCandidateHandler = (function() {
        function processCandidates(connection, icePair) {
            var candidate = icePair.candidate;

            var iceRestrictions = connection.candidates;
            var stun = iceRestrictions.stun;
            var turn = iceRestrictions.turn;

            if (!isNull(iceRestrictions.reflexive)) {
                stun = iceRestrictions.reflexive;
            }

            if (!isNull(iceRestrictions.relay)) {
                turn = iceRestrictions.relay;
            }

            if (!iceRestrictions.host && !!candidate.match(/typ host/g)) {
                return;
            }

            if (!turn && !!candidate.match(/typ relay/g)) {
                return;
            }

            if (!stun && !!candidate.match(/typ srflx/g)) {
                return;
            }

            var protocol = connection.iceProtocols;

            if (!protocol.udp && !!candidate.match(/ udp /g)) {
                return;
            }

            if (!protocol.tcp && !!candidate.match(/ tcp /g)) {
                return;
            }

            if (connection.enableLogs) {
                console.debug('Your candidate pairs:', candidate);
            }

            return {
                candidate: candidate,
                sdpMid: icePair.sdpMid,
                sdpMLineIndex: icePair.sdpMLineIndex
            };
        }

        return {
            processCandidates: processCandidates
        };
    })();

    // IceServersHandler.js

    var IceServersHandler = (function() {
        function getIceServers(connection) {
            var iceServers = [];

            iceServers.push(getSTUNObj('stun:stun.l.google.com:19302'));

            // iceServers.push(getTURNObj('stun:webrtcweb.com:7788', 'muazkh', 'muazkh')); // coTURN
            iceServers.push(getTURNObj('turn:webrtcweb.com:7788', 'muazkh', 'muazkh')); // coTURN
            // iceServers.push(getTURNObj('turn:webrtcweb.com:8877', 'muazkh', 'muazkh')); // coTURN

            if (!(typeof window.InstallTrigger !== 'undefined')) {
                // Firefox doesn't supports "turns:" yet.
                iceServers.push(getTURNObj('turns:webrtcweb.com:7788', 'muazkh', 'muazkh')); // coTURN
            }
            // iceServers.push(getTURNObj('turns:webrtcweb.com:8877', 'muazkh', 'muazkh')); // coTURN

            // iceServers.push(getTURNObj('turn:webrtcweb.com:3344', 'muazkh', 'muazkh')); // resiprocate
            // iceServers.push(getTURNObj('turn:webrtcweb.com:4433', 'muazkh', 'muazkh')); // resiprocate

            // check if restund is still active: http://webrtcweb.com:4050/
            // iceServers.push(getTURNObj('stun:webrtcweb.com:4455', 'muazkh', 'muazkh')); // restund
            iceServers.push(getTURNObj('turn:webrtcweb.com:4455', 'muazkh', 'muazkh')); // restund
            // iceServers.push(getTURNObj('turn:webrtcweb.com:5544?transport=tcp', 'muazkh', 'muazkh')); // restund

            return iceServers;
        }

        function getSTUNObj(stunStr) {
            var urlsParam = 'urls';
            var obj = {};
            obj[urlsParam] = stunStr;
            return obj;
        }

        function getTURNObj(turnStr, username, credential) {
            var urlsParam = 'urls';
            var obj = {
                username: username,
                credential: credential
            };
            obj[urlsParam] = turnStr;
            return obj;
        }

        return {
            getIceServers: getIceServers
        };
    })();

    // getUserMediaHandler.js

    function setStreamType(constraints, stream) {
        if (constraints.mandatory && constraints.mandatory.chromeMediaSource) {
            stream.isScreen = true;
        } else if (constraints.mozMediaSource || constraints.mediaSource) {
            stream.isScreen = true;
        } else if (constraints.video) {
            stream.isVideo = true;
        } else if (constraints.audio) {
            stream.isAudio = true;
        }
    }

    // allow users to manage this object (to support re-capturing of screen/etc.)
    window.currentUserMediaRequest = {
        streams: [],
        mutex: false,
        queueRequests: [],
        remove: function(idInstance) {
            this.mutex = false;

            var stream = this.streams[idInstance];
            if (!stream) {
                return;
            }

            stream = stream.stream;

            var options = stream.currentUserMediaRequestOptions;

            if (this.queueRequests.indexOf(options)) {
                delete this.queueRequests[this.queueRequests.indexOf(options)];
                this.queueRequests = removeNullEntries(this.queueRequests);
            }

            this.streams[idInstance].stream = null;
            delete this.streams[idInstance];
        }
    };

    function getUserMediaHandler(options) {
        if (currentUserMediaRequest.mutex === true) {
            currentUserMediaRequest.queueRequests.push(options);
            return;
        }
        currentUserMediaRequest.mutex = true;

        // easy way to match
        var idInstance = JSON.stringify(options.localMediaConstraints);

        function streaming(stream, returnBack) {
            setStreamType(options.localMediaConstraints, stream);
            options.onGettingLocalMedia(stream, returnBack);

            var streamEndedEvent = 'ended';

            if ('oninactive' in stream) {
                streamEndedEvent = 'inactive';
            }
            stream.addEventListener(streamEndedEvent, function() {
                delete currentUserMediaRequest.streams[idInstance];

                currentUserMediaRequest.mutex = false;
                if (currentUserMediaRequest.queueRequests.indexOf(options)) {
                    delete currentUserMediaRequest.queueRequests[currentUserMediaRequest.queueRequests.indexOf(options)];
                    currentUserMediaRequest.queueRequests = removeNullEntries(currentUserMediaRequest.queueRequests);
                }
            }, false);

            currentUserMediaRequest.streams[idInstance] = {
                stream: stream
            };
            currentUserMediaRequest.mutex = false;

            if (currentUserMediaRequest.queueRequests.length) {
                getUserMediaHandler(currentUserMediaRequest.queueRequests.shift());
            }
        }

        if (currentUserMediaRequest.streams[idInstance]) {
            streaming(currentUserMediaRequest.streams[idInstance].stream, true);
        } else {
            var isBlackBerry = !!(/BB10|BlackBerry/i.test(navigator.userAgent || ''));
            if (isBlackBerry || typeof navigator.mediaDevices === 'undefined' || typeof navigator.mediaDevices.getUserMedia !== 'function') {
                navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
                navigator.getUserMedia(options.localMediaConstraints, function(stream) {
                    stream.streamid = stream.streamid || stream.id || getRandomString();
                    stream.idInstance = idInstance;
                    streaming(stream);
                }, function(error) {
                    options.onLocalMediaError(error, options.localMediaConstraints);
                });
                return;
            }

            if (DetectRTC.browser.name === 'Safari') {
                if (options.localMediaConstraints.audio !== false) {
                    options.localMediaConstraints.audio = true;
                }

                if (options.localMediaConstraints.video !== false) {
                    options.localMediaConstraints.video = true;
                }
            }

            navigator.mediaDevices.getUserMedia(options.localMediaConstraints).then(function(stream) {
                stream.streamid = stream.streamid || stream.id || getRandomString();
                stream.idInstance = idInstance;
                streaming(stream);
            }).catch(function(error) {
                if (DetectRTC.browser.name === 'Safari') {
                    return;
                }
                options.onLocalMediaError(error, options.localMediaConstraints);
            });
        }
    }

    // StreamsHandler.js

    var StreamsHandler = (function() {
        function handleType(type) {
            if (!type) {
                return;
            }

            if (typeof type === 'string' || typeof type === 'undefined') {
                return type;
            }

            if (type.audio && type.video) {
                return null;
            }

            if (type.audio) {
                return 'audio';
            }

            if (type.video) {
                return 'video';
            }

            return;
        }

        function setHandlers(stream, syncAction, connection) {
            if (!stream || !stream.addEventListener) return;

            if (typeof syncAction == 'undefined' || syncAction == true) {
                var streamEndedEvent = 'ended';

                if ('oninactive' in stream) {
                    streamEndedEvent = 'inactive';
                }

                stream.addEventListener(streamEndedEvent, function() {
                    StreamsHandler.onSyncNeeded(this.streamid, streamEndedEvent);
                }, false);
            }

            stream.mute = function(type, isSyncAction) {
                type = handleType(type);

                if (typeof isSyncAction !== 'undefined') {
                    syncAction = isSyncAction;
                }

                if (typeof type == 'undefined' || type == 'audio') {
                    stream.getAudioTracks().forEach(function(track) {
                        track.enabled = false;
                        connection.streamEvents[stream.streamid].isAudioMuted = true;
                    });
                }

                if (typeof type == 'undefined' || type == 'video') {
                    stream.getVideoTracks().forEach(function(track) {
                        track.enabled = false;
                    });
                }

                if (typeof syncAction == 'undefined' || syncAction == true) {
                    StreamsHandler.onSyncNeeded(stream.streamid, 'mute', type);
                }

                connection.streamEvents[stream.streamid].muteType = type || 'both';

                fireEvent(stream, 'mute', type);
            };

            stream.unmute = function(type, isSyncAction) {
                type = handleType(type);

                if (typeof isSyncAction !== 'undefined') {
                    syncAction = isSyncAction;
                }

                graduallyIncreaseVolume();

                if (typeof type == 'undefined' || type == 'audio') {
                    stream.getAudioTracks().forEach(function(track) {
                        track.enabled = true;
                        connection.streamEvents[stream.streamid].isAudioMuted = false;
                    });
                }

                if (typeof type == 'undefined' || type == 'video') {
                    stream.getVideoTracks().forEach(function(track) {
                        track.enabled = true;
                    });

                    // make sure that video unmute doesn't affects audio
                    if (typeof type !== 'undefined' && type == 'video' && connection.streamEvents[stream.streamid].isAudioMuted) {
                        (function looper(times) {
                            if (!times) {
                                times = 0;
                            }

                            times++;

                            // check until five-seconds
                            if (times < 100 && connection.streamEvents[stream.streamid].isAudioMuted) {
                                stream.mute('audio');

                                setTimeout(function() {
                                    looper(times);
                                }, 50);
                            }
                        })();
                    }
                }

                if (typeof syncAction == 'undefined' || syncAction == true) {
                    StreamsHandler.onSyncNeeded(stream.streamid, 'unmute', type);
                }

                connection.streamEvents[stream.streamid].unmuteType = type || 'both';

                fireEvent(stream, 'unmute', type);
            };

            function graduallyIncreaseVolume() {
                if (!connection.streamEvents[stream.streamid].mediaElement) {
                    return;
                }

                var mediaElement = connection.streamEvents[stream.streamid].mediaElement;
                mediaElement.volume = 0;
                afterEach(200, 5, function() {
                    try {
                        mediaElement.volume += .20;
                    } catch (e) {
                        mediaElement.volume = 1;
                    }
                });
            }
        }

        function afterEach(setTimeoutInteval, numberOfTimes, callback, startedTimes) {
            startedTimes = (startedTimes || 0) + 1;
            if (startedTimes >= numberOfTimes) return;

            setTimeout(function() {
                callback();
                afterEach(setTimeoutInteval, numberOfTimes, callback, startedTimes);
            }, setTimeoutInteval);
        }

        return {
            setHandlers: setHandlers,
            onSyncNeeded: function(streamid, action, type) {}
        };
    })();

    // Last time updated at Nov 07, 2016, 08:32:23

    // Latest file can be found here: https://cdn.webrtc-experiment.com/Screen-Capturing.js

    // Muaz Khan     - www.MuazKhan.com
    // MIT License   - www.WebRTC-Experiment.com/licence
    // Documentation - https://github.com/muaz-khan/Chrome-Extensions/tree/master/Screen-Capturing.js
    // Demo          - https://www.webrtc-experiment.com/Screen-Capturing/

    // ___________________
    // Screen-Capturing.js

    // Listen for postMessage handler
    // postMessage is used to exchange "sourceId" between chrome extension and you webpage.
    // though, there are tons other options as well, e.g. XHR-signaling, websockets, etc.
    window.addEventListener('message', function(event) {
        if (event.origin != window.location.origin) {
            return;
        }

        onMessageCallback(event.data);
    });

    // via: https://bugs.chromium.org/p/chromium/issues/detail?id=487935#c17
    // you can capture screen on Android Chrome >= 55 with flag: "Experimental ScreenCapture android"
    window.IsAndroidChrome = false;
    try {
        if (navigator.userAgent.toLowerCase().indexOf("android") > -1 && /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)) {
            window.IsAndroidChrome = true;
        }
    } catch (e) {}

    // and the function that handles received messages

    function onMessageCallback(data) {
        // "cancel" button is clicked
        if (data == 'PermissionDeniedError') {
            chromeMediaSource = 'PermissionDeniedError';
            if (screenCallback) {
                return screenCallback('PermissionDeniedError');
            } else {
                throw new Error('PermissionDeniedError: User rejected to share his screen.');
            }
        }

        // extension notified his presence
        if (data == 'rtcmulticonnection-extension-loaded') {
            chromeMediaSource = 'desktop';
        }

        // extension shared temp sourceId
        if (data.sourceId && screenCallback) {
            sourceId = data.sourceId;
            screenCallback(sourceId);
        }
    }

    // global variables
    var chromeMediaSource = 'screen';
    var sourceId;
    var screenCallback;

    // this method can be used to check if chrome extension is installed & enabled.
    function isChromeExtensionAvailable(callback) {
        if (!callback) return;

        if (isFirefox) return isFirefoxExtensionAvailable(callback);

        if (window.IsAndroidChrome) {
            chromeMediaSource = 'screen';
            callback(true);
            return;
        }

        if (chromeMediaSource == 'desktop') {
            callback(true);
            return;
        }

        // ask extension if it is available
        window.postMessage('are-you-there', '*');

        setTimeout(function() {
            if (chromeMediaSource == 'screen') {
                callback(false);
            } else callback(true);
        }, 2000);
    }

    function isFirefoxExtensionAvailable(callback) {
        if (!callback) return;

        if (!isFirefox) return isChromeExtensionAvailable(callback);

        var isFirefoxAddonResponded = false;

        function messageCallback(event) {
            var addonMessage = event.data;

            if (!addonMessage || typeof addonMessage.isScreenCapturingEnabled === 'undefined') return;

            isFirefoxAddonResponded = true;

            if (addonMessage.isScreenCapturingEnabled === true) {
                callback(true);
            } else {
                callback(false);
            }

            window.removeEventListener("message", messageCallback, false);
        }

        window.addEventListener("message", messageCallback, false);

        window.postMessage({
            checkIfScreenCapturingEnabled: true,
            domains: [document.domain]
        }, "*");

        setTimeout(function() {
            if (!isFirefoxAddonResponded) {
                callback(true); // can be old firefox extension
            }
        }, 2000); // wait 2-seconds-- todo: is this enough limit?
    }

    // this function can be used to get "source-id" from the extension
    function getSourceId(callback, audioPlusTab) {
        if (!callback) throw '"callback" parameter is mandatory.';
        if (sourceId) {
            callback(sourceId);
            sourceId = null;
            return;
        }

        screenCallback = callback;

        if (!!audioPlusTab) {
            window.postMessage('audio-plus-tab', '*');
            return;
        }
        window.postMessage('get-sourceId', '*');
    }

    function getChromeExtensionStatus(extensionid, callback) {
        if (window.IsAndroidChrome) {
            chromeMediaSource = 'screen';
            callback('installed-enabled');
            return;
        }

        if (arguments.length != 2) {
            callback = extensionid;
            extensionid = window.RMCExtensionID || 'ajhifddimkapgcifgcodmmfdlknahffk'; // default extension-id
        }

        if (isFirefox) return callback('not-chrome');

        var image = document.createElement('img');
        image.src = 'chrome-extension://' + extensionid + '/icon.png';
        image.onload = function() {
            sourceId = null;
            chromeMediaSource = 'screen';
            window.postMessage('are-you-there', '*');
            setTimeout(function() {
                if (chromeMediaSource == 'screen') {
                    callback(extensionid == extensionid ? 'installed-enabled' : 'installed-disabled');
                } else callback('installed-enabled');
            }, 2000);
        };
        image.onerror = function() {
            callback('not-installed');
        };
    }

    // this function explains how to use above methods/objects
    function getScreenConstraints(callback, audioPlusTab) {
        var firefoxScreenConstraints = {
            mozMediaSource: 'window',
            mediaSource: 'window',
            width: 29999,
            height: 8640
        };

        if (isFirefox) return callback(null, firefoxScreenConstraints);

        // support recapture again & again
        sourceId = null;

        isChromeExtensionAvailable(function(isAvailable) {
            // this statement defines getUserMedia constraints
            // that will be used to capture content of screen
            var screen_constraints = {
                mandatory: {
                    chromeMediaSource: chromeMediaSource,
                    maxWidth: 29999,
                    maxHeight: 8640,
                    minFrameRate: 30,
                    maxFrameRate: 128,
                    minAspectRatio: 1.77 // 2.39
                },
                optional: []
            };

            if (window.IsAndroidChrome) {
                // now invoking native getUserMedia API
                callback(null, screen_constraints);
                return;
            }

            // this statement verifies chrome extension availability
            // if installed and available then it will invoke extension API
            // otherwise it will fallback to command-line based screen capturing API
            if (chromeMediaSource == 'desktop' && !sourceId) {
                getSourceId(function() {
                    screen_constraints.mandatory.chromeMediaSourceId = sourceId;
                    callback(sourceId == 'PermissionDeniedError' ? sourceId : null, screen_constraints);
                    sourceId = null;
                }, audioPlusTab);
                return;
            }

            // this statement sets gets 'sourceId" and sets "chromeMediaSourceId"
            if (chromeMediaSource == 'desktop') {
                screen_constraints.mandatory.chromeMediaSourceId = sourceId;
            }

            sourceId = null;
            chromeMediaSource = 'screen'; // maybe this line is redundant?
            screenCallback = null;

            // now invoking native getUserMedia API
            callback(null, screen_constraints);
        });
    }

    // TextReceiver.js & TextSender.js

    function TextReceiver(connection) {
        var content = {};

        function receive(data, userid, extra) {
            // uuid is used to uniquely identify sending instance
            var uuid = data.uuid;
            if (!content[uuid]) {
                content[uuid] = [];
            }

            content[uuid].push(data.message);

            if (data.last) {
                var message = content[uuid].join('');
                if (data.isobject) {
                    message = JSON.parse(message);
                }

                // latency detection
                var receivingTime = new Date().getTime();
                var latency = receivingTime - data.sendingTime;

                var e = {
                    data: message,
                    userid: userid,
                    extra: extra,
                    latency: latency
                };

                if (connection.autoTranslateText) {
                    e.original = e.data;
                    connection.Translator.TranslateText(e.data, function(translatedText) {
                        e.data = translatedText;
                        connection.onmessage(e);
                    });
                } else {
                    connection.onmessage(e);
                }

                delete content[uuid];
            }
        }

        return {
            receive: receive
        };
    }

    // TextSender.js
    var TextSender = {
        send: function(config) {
            var connection = config.connection;

            var channel = config.channel,
                remoteUserId = config.remoteUserId,
                initialText = config.text,
                packetSize = connection.chunkSize || 1000,
                textToTransfer = '',
                isobject = false;

            if (!isString(initialText)) {
                isobject = true;
                initialText = JSON.stringify(initialText);
            }

            // uuid is used to uniquely identify sending instance
            var uuid = getRandomString();
            var sendingTime = new Date().getTime();

            sendText(initialText);

            function sendText(textMessage, text) {
                var data = {
                    type: 'text',
                    uuid: uuid,
                    sendingTime: sendingTime
                };

                if (textMessage) {
                    text = textMessage;
                    data.packets = parseInt(text.length / packetSize);
                }

                if (text.length > packetSize) {
                    data.message = text.slice(0, packetSize);
                } else {
                    data.message = text;
                    data.last = true;
                    data.isobject = isobject;
                }

                channel.send(data, remoteUserId);

                textToTransfer = text.slice(data.message.length);

                if (textToTransfer.length) {
                    setTimeout(function() {
                        sendText(null, textToTransfer);
                    }, connection.chunkInterval || 100);
                }
            }
        }
    };

    // FileProgressBarHandler.js

    var FileProgressBarHandler = (function() {
        function handle(connection) {
            var progressHelper = {};

            // www.RTCMultiConnection.org/docs/onFileStart/
            connection.onFileStart = function(file) {
                var div = document.createElement('div');
                div.title = file.name;
                div.innerHTML = '<label>0%</label> <progress></progress>';

                if (file.remoteUserId) {
                    div.innerHTML += ' (Sharing with:' + file.remoteUserId + ')';
                }

                if (!connection.filesContainer) {
                    connection.filesContainer = document.body || document.documentElement;
                }

                connection.filesContainer.insertBefore(div, connection.filesContainer.firstChild);

                if (!file.remoteUserId) {
                    progressHelper[file.uuid] = {
                        div: div,
                        progress: div.querySelector('progress'),
                        label: div.querySelector('label')
                    };
                    progressHelper[file.uuid].progress.max = file.maxChunks;
                    return;
                }

                if (!progressHelper[file.uuid]) {
                    progressHelper[file.uuid] = {};
                }

                progressHelper[file.uuid][file.remoteUserId] = {
                    div: div,
                    progress: div.querySelector('progress'),
                    label: div.querySelector('label')
                };
                progressHelper[file.uuid][file.remoteUserId].progress.max = file.maxChunks;
            };

            // www.RTCMultiConnection.org/docs/onFileProgress/
            connection.onFileProgress = function(chunk) {
                var helper = progressHelper[chunk.uuid];
                if (!helper) {
                    return;
                }
                if (chunk.remoteUserId) {
                    helper = progressHelper[chunk.uuid][chunk.remoteUserId];
                    if (!helper) {
                        return;
                    }
                }

                helper.progress.value = chunk.currentPosition || chunk.maxChunks || helper.progress.max;
                updateLabel(helper.progress, helper.label);
            };

            // www.RTCMultiConnection.org/docs/onFileEnd/
            connection.onFileEnd = function(file) {
                var helper = progressHelper[file.uuid];
                if (!helper) {
                    console.error('No such progress-helper element exist.', file);
                    return;
                }

                if (file.remoteUserId) {
                    helper = progressHelper[file.uuid][file.remoteUserId];
                    if (!helper) {
                        return;
                    }
                }

                var div = helper.div;
                if (file.type.indexOf('image') != -1) {
                    div.innerHTML = '<a href="' + file.url + '" download="' + file.name + '">Download <strong style="color:red;">' + file.name + '</strong> </a><br /><img src="' + file.url + '" title="' + file.name + '" style="max-width: 80%;">';
                } else {
                    div.innerHTML = '<a href="' + file.url + '" download="' + file.name + '">Download <strong style="color:red;">' + file.name + '</strong> </a><br /><iframe src="' + file.url + '" title="' + file.name + '" style="width: 80%;border: 0;height: inherit;margin-top:1em;"></iframe>';
                }
            };

            function updateLabel(progress, label) {
                if (progress.position === -1) {
                    return;
                }

                var position = +progress.position.toFixed(2).split('.')[1] || 100;
                label.innerHTML = position + '%';
            }
        }

        return {
            handle: handle
        };
    })();

    // TranslationHandler.js

    var TranslationHandler = (function() {
        function handle(connection) {
            connection.autoTranslateText = false;
            connection.language = 'en';
            connection.googKey = 'AIzaSyCgB5hmFY74WYB-EoWkhr9cAGr6TiTHrEE';

            // www.RTCMultiConnection.org/docs/Translator/
            connection.Translator = {
                TranslateText: function(text, callback) {
                    // if(location.protocol === 'https:') return callback(text);

                    var newScript = document.createElement('script');
                    newScript.type = 'text/javascript';

                    var sourceText = encodeURIComponent(text); // escape

                    var randomNumber = 'method' + connection.token();
                    window[randomNumber] = function(response) {
                        if (response.data && response.data.translations[0] && callback) {
                            callback(response.data.translations[0].translatedText);
                            return;
                        }

                        if (response.error && response.error.message === 'Daily Limit Exceeded') {
                            console.error('Text translation failed. Error message: "Daily Limit Exceeded."');
                            return;
                        }

                        if (response.error) {
                            console.error(response.error.message);
                            return;
                        }

                        console.error(response);
                    };

                    var source = 'https://www.googleapis.com/language/translate/v2?key=' + connection.googKey + '&target=' + (connection.language || 'en-US') + '&callback=window.' + randomNumber + '&q=' + sourceText;
                    newScript.src = source;
                    document.getElementsByTagName('head')[0].appendChild(newScript);
                },
                getListOfLanguages: function(callback) {
                    var xhr = new XMLHttpRequest();
                    xhr.onreadystatechange = function() {
                        if (xhr.readyState == XMLHttpRequest.DONE) {
                            var response = JSON.parse(xhr.responseText);

                            if (response && response.data && response.data.languages) {
                                callback(response.data.languages);
                                return;
                            }

                            if (response.error && response.error.message === 'Daily Limit Exceeded') {
                                console.error('Text translation failed. Error message: "Daily Limit Exceeded."');
                                return;
                            }

                            if (response.error) {
                                console.error(response.error.message);
                                return;
                            }

                            console.error(response);
                        }
                    }
                    var url = 'https://www.googleapis.com/language/translate/v2/languages?key=' + connection.googKey + '&target=en';
                    xhr.open('GET', url, true);
                    xhr.send(null);
                }
            };
        }

        return {
            handle: handle
        };
    })();

    (function(connection) {
        forceOptions = forceOptions || {
            useDefaultDevices: true
        };

        connection.channel = connection.sessionid = (roomid || location.href.replace(/\/|:|#|\?|\$|\^|%|\.|`|~|!|\+|@|\[|\||]|\|*. /g, '').split('\n').join('').split('\r').join('')) + '';

        var mPeer = new MultiPeers(connection);

        var preventDuplicateOnStreamEvents = {};
        mPeer.onGettingLocalMedia = function(stream) {
            if (preventDuplicateOnStreamEvents[stream.streamid]) {
                return;
            }
            preventDuplicateOnStreamEvents[stream.streamid] = true;

            try {
                stream.type = 'local';
            } catch (e) {}

            connection.setStreamEndHandler(stream);

            getRMCMediaElement(stream, function(mediaElement) {
                mediaElement.id = stream.streamid;
                mediaElement.muted = true;
                mediaElement.volume = 0;

                if (connection.attachStreams.indexOf(stream) === -1) {
                    connection.attachStreams.push(stream);
                }

                if (typeof StreamsHandler !== 'undefined') {
                    StreamsHandler.setHandlers(stream, true, connection);
                }

                connection.streamEvents[stream.streamid] = {
                    stream: stream,
                    type: 'local',
                    mediaElement: mediaElement,
                    userid: connection.userid,
                    extra: connection.extra,
                    streamid: stream.streamid,
                    isAudioMuted: true
                };

                setHarkEvents(connection, connection.streamEvents[stream.streamid]);
                setMuteHandlers(connection, connection.streamEvents[stream.streamid]);

                connection.onstream(connection.streamEvents[stream.streamid]);
            }, connection);
        };

        mPeer.onGettingRemoteMedia = function(stream, remoteUserId) {
            try {
                stream.type = 'remote';
            } catch (e) {}

            connection.setStreamEndHandler(stream, 'remote-stream');

            getRMCMediaElement(stream, function(mediaElement) {
                mediaElement.id = stream.streamid;

                if (typeof StreamsHandler !== 'undefined') {
                    StreamsHandler.setHandlers(stream, false, connection);
                }

                connection.streamEvents[stream.streamid] = {
                    stream: stream,
                    type: 'remote',
                    userid: remoteUserId,
                    extra: connection.peers[remoteUserId] ? connection.peers[remoteUserId].extra : {},
                    mediaElement: mediaElement,
                    streamid: stream.streamid
                };

                setMuteHandlers(connection, connection.streamEvents[stream.streamid]);

                connection.onstream(connection.streamEvents[stream.streamid]);
            }, connection);
        };

        mPeer.onRemovingRemoteMedia = function(stream, remoteUserId) {
            var streamEvent = connection.streamEvents[stream.streamid];
            if (!streamEvent) {
                streamEvent = {
                    stream: stream,
                    type: 'remote',
                    userid: remoteUserId,
                    extra: connection.peers[remoteUserId] ? connection.peers[remoteUserId].extra : {},
                    streamid: stream.streamid,
                    mediaElement: connection.streamEvents[stream.streamid] ? connection.streamEvents[stream.streamid].mediaElement : null
                };
            }

            if (connection.peersBackup[streamEvent.userid]) {
                streamEvent.extra = connection.peersBackup[streamEvent.userid].extra;
            }

            connection.onstreamended(streamEvent);

            delete connection.streamEvents[stream.streamid];
        };

        mPeer.onNegotiationNeeded = function(message, remoteUserId, callback) {
            connectSocket(function() {
                connection.socket.emit(connection.socketMessageEvent, 'password' in message ? message : {
                    remoteUserId: message.remoteUserId || remoteUserId,
                    message: message,
                    sender: connection.userid
                }, callback || function() {});
            });
        };

        function onUserLeft(remoteUserId) {
            connection.deletePeer(remoteUserId);
        }

        mPeer.onUserLeft = onUserLeft;
        mPeer.disconnectWith = function(remoteUserId, callback) {
            if (connection.socket) {
                connection.socket.emit('disconnect-with', remoteUserId, callback || function() {});
            }

            connection.deletePeer(remoteUserId);
        };

        connection.broadcasters = [];

        connection.socketOptions = {
            // 'force new connection': true, // For SocketIO version < 1.0
            // 'forceNew': true, // For SocketIO version >= 1.0
            'transport': 'polling' // fixing transport:unknown issues
        };

        function connectSocket(connectCallback) {
            connection.socketAutoReConnect = true;

            if (connection.socket) { // todo: check here readySate/etc. to make sure socket is still opened
                if (connectCallback) {
                    connectCallback(connection.socket);
                }
                return;
            }

            if (typeof SocketConnection === 'undefined') {
                if (typeof FirebaseConnection !== 'undefined') {
                    window.SocketConnection = FirebaseConnection;
                } else if (typeof PubNubConnection !== 'undefined') {
                    window.SocketConnection = PubNubConnection;
                } else {
                    throw 'SocketConnection.js seems missed.';
                }
            }

            new SocketConnection(connection, function(s) {
                if (connectCallback) {
                    connectCallback(connection.socket);
                }
            });
        }

        connection.openOrJoin = function(localUserid, password) {
            connection.checkPresence(localUserid, function(isRoomExists, roomid) {
                if (typeof password === 'function') {
                    password(isRoomExists, roomid);
                    password = null;
                }

                if (isRoomExists) {
                    connection.sessionid = roomid;

                    var localPeerSdpConstraints = false;
                    var remotePeerSdpConstraints = false;
                    var isOneWay = !!connection.session.oneway;
                    var isDataOnly = isData(connection.session);

                    remotePeerSdpConstraints = {
                        OfferToReceiveAudio: connection.sdpConstraints.mandatory.OfferToReceiveAudio,
                        OfferToReceiveVideo: connection.sdpConstraints.mandatory.OfferToReceiveVideo
                    }

                    localPeerSdpConstraints = {
                        OfferToReceiveAudio: isOneWay ? !!connection.session.audio : connection.sdpConstraints.mandatory.OfferToReceiveAudio,
                        OfferToReceiveVideo: isOneWay ? !!connection.session.video || !!connection.session.screen : connection.sdpConstraints.mandatory.OfferToReceiveVideo
                    }

                    var connectionDescription = {
                        remoteUserId: connection.sessionid,
                        message: {
                            newParticipationRequest: true,
                            isOneWay: isOneWay,
                            isDataOnly: isDataOnly,
                            localPeerSdpConstraints: localPeerSdpConstraints,
                            remotePeerSdpConstraints: remotePeerSdpConstraints
                        },
                        sender: connection.userid,
                        password: password || false
                    };

                    beforeJoin(connectionDescription.message, function() {
                        mPeer.onNegotiationNeeded(connectionDescription);
                    });
                    return;
                }

                var oldUserId = connection.userid;
                connection.userid = connection.sessionid = localUserid || connection.sessionid;
                connection.userid += '';

                connection.socket.emit('changed-uuid', connection.userid);

                if (password) {
                    connection.socket.emit('set-password', password);
                }

                connection.isInitiator = true;

                if (isData(connection.session)) {
                    return;
                }

                connection.captureUserMedia();
            });
        };

        connection.open = function(localUserid, isPublicModerator) {
            var oldUserId = connection.userid;
            connection.userid = connection.sessionid = localUserid || connection.sessionid;
            connection.userid += '';

            connection.isInitiator = true;

            connectSocket(function() {
                connection.socket.emit('changed-uuid', connection.userid);

                if (isPublicModerator == true) {
                    connection.becomePublicModerator();
                }
            });

            if (isData(connection.session)) {
                if (typeof isPublicModerator === 'function') {
                    isPublicModerator();
                }
                return;
            }

            connection.captureUserMedia(typeof isPublicModerator === 'function' ? isPublicModerator : null);
        };

        connection.becomePublicModerator = function() {
            if (!connection.isInitiator) return;
            connection.socket.emit('become-a-public-moderator');
        };

        connection.dontMakeMeModerator = function() {
            connection.socket.emit('dont-make-me-moderator');
        };

        connection.deletePeer = function(remoteUserId) {
            if (!remoteUserId) {
                return;
            }

            var eventObject = {
                userid: remoteUserId,
                extra: connection.peers[remoteUserId] ? connection.peers[remoteUserId].extra : {}
            };

            if (connection.peersBackup[eventObject.userid]) {
                eventObject.extra = connection.peersBackup[eventObject.userid].extra;
            }

            connection.onleave(eventObject);

            if (!!connection.peers[remoteUserId]) {
                connection.peers[remoteUserId].streams.forEach(function(stream) {
                    stream.stop();
                });

                var peer = connection.peers[remoteUserId].peer;
                if (peer && peer.iceConnectionState !== 'closed') {
                    try {
                        peer.close();
                    } catch (e) {}
                }

                if (connection.peers[remoteUserId]) {
                    connection.peers[remoteUserId].peer = null;
                    delete connection.peers[remoteUserId];
                }
            }

            if (connection.broadcasters.indexOf(remoteUserId) !== -1) {
                var newArray = [];
                connection.broadcasters.forEach(function(broadcaster) {
                    if (broadcaster !== remoteUserId) {
                        newArray.push(broadcaster);
                    }
                });
                connection.broadcasters = newArray;
                keepNextBroadcasterOnServer();
            }
        }

        connection.rejoin = function(connectionDescription) {
            if (connection.isInitiator || !connectionDescription || !Object.keys(connectionDescription).length) {
                return;
            }

            var extra = {};

            if (connection.peers[connectionDescription.remoteUserId]) {
                extra = connection.peers[connectionDescription.remoteUserId].extra;
                connection.deletePeer(connectionDescription.remoteUserId);
            }

            if (connectionDescription && connectionDescription.remoteUserId) {
                connection.join(connectionDescription.remoteUserId);

                connection.onReConnecting({
                    userid: connectionDescription.remoteUserId,
                    extra: extra
                });
            }
        };

        connection.join = connection.connect = function(remoteUserId, options) {
            connection.sessionid = (remoteUserId ? remoteUserId.sessionid || remoteUserId.remoteUserId || remoteUserId : false) || connection.sessionid;
            connection.sessionid += '';

            var localPeerSdpConstraints = false;
            var remotePeerSdpConstraints = false;
            var isOneWay = false;
            var isDataOnly = false;

            if ((remoteUserId && remoteUserId.session) || !remoteUserId || typeof remoteUserId === 'string') {
                var session = remoteUserId ? remoteUserId.session || connection.session : connection.session;

                isOneWay = !!session.oneway;
                isDataOnly = isData(session);

                remotePeerSdpConstraints = {
                    OfferToReceiveAudio: connection.sdpConstraints.mandatory.OfferToReceiveAudio,
                    OfferToReceiveVideo: connection.sdpConstraints.mandatory.OfferToReceiveVideo
                };

                localPeerSdpConstraints = {
                    OfferToReceiveAudio: isOneWay ? !!connection.session.audio : connection.sdpConstraints.mandatory.OfferToReceiveAudio,
                    OfferToReceiveVideo: isOneWay ? !!connection.session.video || !!connection.session.screen : connection.sdpConstraints.mandatory.OfferToReceiveVideo
                };
            }

            options = options || {};

            var cb = function() {};
            if (typeof options === 'function') {
                cb = options;
                options = {};
            }

            if (typeof options.localPeerSdpConstraints !== 'undefined') {
                localPeerSdpConstraints = options.localPeerSdpConstraints;
            }

            if (typeof options.remotePeerSdpConstraints !== 'undefined') {
                remotePeerSdpConstraints = options.remotePeerSdpConstraints;
            }

            if (typeof options.isOneWay !== 'undefined') {
                isOneWay = options.isOneWay;
            }

            if (typeof options.isDataOnly !== 'undefined') {
                isDataOnly = options.isDataOnly;
            }

            var connectionDescription = {
                remoteUserId: connection.sessionid,
                message: {
                    newParticipationRequest: true,
                    isOneWay: isOneWay,
                    isDataOnly: isDataOnly,
                    localPeerSdpConstraints: localPeerSdpConstraints,
                    remotePeerSdpConstraints: remotePeerSdpConstraints
                },
                sender: connection.userid,
                password: false
            };

            beforeJoin(connectionDescription.message, function() {
                connectSocket(function() {
                    if (!!connection.peers[connection.sessionid]) {
                        // on socket disconnect & reconnect
                        return;
                    }

                    mPeer.onNegotiationNeeded(connectionDescription);
                    cb();
                });
            });
            return connectionDescription;
        };

        function beforeJoin(userPreferences, callback) {
            if (connection.dontCaptureUserMedia || userPreferences.isDataOnly) {
                callback();
                return;
            }

            var localMediaConstraints = {};

            if (userPreferences.localPeerSdpConstraints.OfferToReceiveAudio) {
                localMediaConstraints.audio = connection.mediaConstraints.audio;
            }

            if (userPreferences.localPeerSdpConstraints.OfferToReceiveVideo) {
                localMediaConstraints.video = connection.mediaConstraints.video;
            }

            var session = userPreferences.session || connection.session;

            if (session.oneway && session.audio !== 'two-way' && session.video !== 'two-way' && session.screen !== 'two-way') {
                callback();
                return;
            }

            if (session.oneway && session.audio && session.audio === 'two-way') {
                session = {
                    audio: true
                };
            }

            if (session.audio || session.video || session.screen) {
                if (session.screen) {
                    connection.getScreenConstraints(function(error, screen_constraints) {
                        connection.invokeGetUserMedia({
                            audio: isAudioPlusTab(connection) ? getAudioScreenConstraints(screen_constraints) : false,
                            video: screen_constraints,
                            isScreen: true
                        }, (session.audio || session.video) && !isAudioPlusTab(connection) ? connection.invokeGetUserMedia(null, callback) : callback);
                    });
                } else if (session.audio || session.video) {
                    connection.invokeGetUserMedia(null, callback, session);
                }
            }
        }

        connection.connectWithAllParticipants = function(remoteUserId) {
            mPeer.onNegotiationNeeded('connectWithAllParticipants', remoteUserId || connection.sessionid);
        };

        connection.removeFromBroadcastersList = function(remoteUserId) {
            mPeer.onNegotiationNeeded('removeFromBroadcastersList', remoteUserId || connection.sessionid);

            connection.peers.getAllParticipants(remoteUserId || connection.sessionid).forEach(function(participant) {
                mPeer.onNegotiationNeeded('dropPeerConnection', participant);
                connection.deletePeer(participant);
            });

            connection.attachStreams.forEach(function(stream) {
                stream.stop();
            });
        };

        connection.getUserMedia = connection.captureUserMedia = function(callback, sessionForced) {
            callback = callback || function() {};
            var session = sessionForced || connection.session;

            if (connection.dontCaptureUserMedia || isData(session)) {
                callback();
                return;
            }

            if (session.audio || session.video || session.screen) {
                if (session.screen) {
                    connection.getScreenConstraints(function(error, screen_constraints) {
                        if (error) {
                            throw error;
                        }

                        connection.invokeGetUserMedia({
                            audio: isAudioPlusTab(connection) ? getAudioScreenConstraints(screen_constraints) : false,
                            video: screen_constraints,
                            isScreen: true
                        }, function(stream) {
                            if ((session.audio || session.video) && !isAudioPlusTab(connection)) {
                                var nonScreenSession = {};
                                for (var s in session) {
                                    if (s !== 'screen') {
                                        nonScreenSession[s] = session[s];
                                    }
                                }
                                connection.invokeGetUserMedia(sessionForced, callback, nonScreenSession);
                                return;
                            }
                            callback(stream);
                        });
                    });
                } else if (session.audio || session.video) {
                    connection.invokeGetUserMedia(sessionForced, callback, session);
                }
            }
        };

        function beforeUnload(shiftModerationControlOnLeave, dontCloseSocket) {
            if (!connection.closeBeforeUnload) {
                return;
            }

            if (connection.isInitiator === true) {
                connection.dontMakeMeModerator();
            }

            connection.peers.getAllParticipants().forEach(function(participant) {
                mPeer.onNegotiationNeeded({
                    userLeft: true
                }, participant);

                if (connection.peers[participant] && connection.peers[participant].peer) {
                    connection.peers[participant].peer.close();
                }

                delete connection.peers[participant];
            });

            if (!dontCloseSocket) {
                connection.closeSocket();
            }

            connection.broadcasters = [];
            connection.isInitiator = false;
        }

        connection.closeBeforeUnload = true;
        window.addEventListener('beforeunload', beforeUnload, false);

        connection.userid = getRandomString();
        connection.changeUserId = function(newUserId, callback) {
            callback = callback || function() {};
            connection.userid = newUserId || getRandomString();
            connection.socket.emit('changed-uuid', connection.userid, callback);
        };

        connection.extra = {};
        connection.attachStreams = [];

        connection.session = {
            audio: true,
            video: true
        };

        connection.enableFileSharing = false;

        // all values in kbps
        connection.bandwidth = {
            screen: 512,
            audio: 128,
            video: 512
        };

        connection.codecs = {
            audio: 'opus',
            video: 'VP9'
        };

        connection.processSdp = function(sdp) {
            if (isMobileDevice || isFirefox) {
                return sdp;
            }

            sdp = CodecsHandler.setApplicationSpecificBandwidth(sdp, connection.bandwidth, !!connection.session.screen);
            sdp = CodecsHandler.setVideoBitrates(sdp, {
                min: connection.bandwidth.video * 8 * 1024,
                max: connection.bandwidth.video * 8 * 1024
            });
            sdp = CodecsHandler.setOpusAttributes(sdp, {
                maxaveragebitrate: connection.bandwidth.audio * 8 * 1024,
                maxplaybackrate: connection.bandwidth.audio * 8 * 1024,
                stereo: 1,
                maxptime: 3
            });

            if (connection.codecs.video === 'VP9') {
                sdp = CodecsHandler.preferVP9(sdp);
            }

            if (connection.codecs.video === 'H264') {
                sdp = CodecsHandler.removeVPX(sdp);
            }

            if (connection.codecs.audio === 'G722') {
                sdp = CodecsHandler.removeNonG722(sdp);
            }

            return sdp;
        };

        if (typeof CodecsHandler !== 'undefined') {
            connection.BandwidthHandler = connection.CodecsHandler = CodecsHandler;
        }

        connection.mediaConstraints = {
            audio: {
                mandatory: {},
                optional: [{
                    bandwidth: connection.bandwidth.audio * 8 * 1024 || 128 * 8 * 1024
                }]
            },
            video: {
                mandatory: {},
                optional: [{
                    bandwidth: connection.bandwidth.video * 8 * 1024 || 128 * 8 * 1024
                }, {
                    facingMode: 'user'
                }]
            }
        };

        if (isFirefox) {
            connection.mediaConstraints = {
                audio: true,
                video: true
            };
        }

        if (!forceOptions.useDefaultDevices && !isMobileDevice) {
            DetectRTC.load(function() {
                var lastAudioDevice, lastVideoDevice;
                // it will force RTCMultiConnection to capture last-devices
                // i.e. if external microphone is attached to system, we should prefer it over built-in devices.
                DetectRTC.MediaDevices.forEach(function(device) {
                    if (device.kind === 'audioinput' && connection.mediaConstraints.audio !== false) {
                        lastAudioDevice = device;
                    }

                    if (device.kind === 'videoinput' && connection.mediaConstraints.video !== false) {
                        lastVideoDevice = device;
                    }
                });

                if (lastAudioDevice) {
                    if (isFirefox) {
                        if (connection.mediaConstraints.audio !== true) {
                            connection.mediaConstraints.audio.deviceId = lastAudioDevice.id;
                        } else {
                            connection.mediaConstraints.audio = {
                                deviceId: lastAudioDevice.id
                            }
                        }
                        return;
                    }

                    if (connection.mediaConstraints.audio == true) {
                        connection.mediaConstraints.audio = {
                            mandatory: {},
                            optional: []
                        }
                    }

                    if (!connection.mediaConstraints.audio.optional) {
                        connection.mediaConstraints.audio.optional = [];
                    }

                    var optional = [{
                        sourceId: lastAudioDevice.id
                    }];

                    connection.mediaConstraints.audio.optional = optional.concat(connection.mediaConstraints.audio.optional);
                }

                if (lastVideoDevice) {
                    if (isFirefox) {
                        if (connection.mediaConstraints.video !== true) {
                            connection.mediaConstraints.video.deviceId = lastVideoDevice.id;
                        } else {
                            connection.mediaConstraints.video = {
                                deviceId: lastVideoDevice.id
                            }
                        }
                        return;
                    }

                    if (connection.mediaConstraints.video == true) {
                        connection.mediaConstraints.video = {
                            mandatory: {},
                            optional: []
                        }
                    }

                    if (!connection.mediaConstraints.video.optional) {
                        connection.mediaConstraints.video.optional = [];
                    }

                    var optional = [{
                        sourceId: lastVideoDevice.id
                    }];

                    connection.mediaConstraints.video.optional = optional.concat(connection.mediaConstraints.video.optional);
                }
            });
        }

        connection.sdpConstraints = {
            mandatory: {
                OfferToReceiveAudio: true,
                OfferToReceiveVideo: true
            },
            optional: [{
                VoiceActivityDetection: false
            }]
        };

        connection.rtcpMuxPolicy = 'negotiate'; // or "required"
        connection.iceTransportPolicy = null; // "relay" or "all"
        connection.optionalArgument = {
            optional: [{
                DtlsSrtpKeyAgreement: true
            }, {
                googImprovedWifiBwe: true
            }, {
                googScreencastMinBitrate: 300
            }, {
                googIPv6: true
            }, {
                googDscp: true
            }, {
                googCpuUnderuseThreshold: 55
            }, {
                googCpuOveruseThreshold: 85
            }, {
                googSuspendBelowMinBitrate: true
            }, {
                googCpuOveruseDetection: true
            }],
            mandatory: {}
        };

        connection.iceServers = IceServersHandler.getIceServers(connection);

        connection.candidates = {
            host: true,
            stun: true,
            turn: true
        };

        connection.iceProtocols = {
            tcp: true,
            udp: true
        };

        // EVENTs
        connection.onopen = function(event) {
            if (!!connection.enableLogs) {
                console.info('Data connection has been opened between you & ', event.userid);
            }
        };

        connection.onclose = function(event) {
            if (!!connection.enableLogs) {
                console.warn('Data connection has been closed between you & ', event.userid);
            }
        };

        connection.onerror = function(error) {
            if (!!connection.enableLogs) {
                console.error(error.userid, 'data-error', error);
            }
        };

        connection.onmessage = function(event) {
            if (!!connection.enableLogs) {
                console.debug('data-message', event.userid, event.data);
            }
        };

        connection.send = function(data, remoteUserId) {
            connection.peers.send(data, remoteUserId);
        };

        connection.close = connection.disconnect = connection.leave = function() {
            beforeUnload(false, true);
        };

        connection.closeEntireSession = function(callback) {
            callback = callback || function() {};
            connection.socket.emit('close-entire-session', function looper() {
                if (connection.getAllParticipants().length) {
                    setTimeout(looper, 100);
                    return;
                }

                connection.onEntireSessionClosed({
                    sessionid: connection.sessionid,
                    userid: connection.userid,
                    extra: connection.extra
                });

                connection.changeUserId(null, function() {
                    connection.close();
                    callback();
                });
            });
        };

        connection.onEntireSessionClosed = function(event) {
            if (!connection.enableLogs) return;
            console.info('Entire session is closed: ', event.sessionid, event.extra);
        };

        connection.onstream = function(e) {
            var parentNode = connection.videosContainer;
            parentNode.insertBefore(e.mediaElement, parentNode.firstChild);
            e.mediaElement.play();
            setTimeout(function() {
                e.mediaElement.play();
            }, 5000);
        };

        connection.onstreamended = function(e) {
            if (!e.mediaElement) {
                e.mediaElement = document.getElementById(e.streamid);
            }

            if (!e.mediaElement || !e.mediaElement.parentNode) {
                return;
            }

            e.mediaElement.parentNode.removeChild(e.mediaElement);
        };

        connection.direction = 'many-to-many';

        connection.removeStream = function(streamid, remoteUserId) {
            var stream;
            connection.attachStreams.forEach(function(localStream) {
                if (localStream.id === streamid) {
                    stream = localStream;
                }
            });

            if (!stream) {
                console.warn('No such stream exist.', streamid);
                return;
            }

            connection.peers.getAllParticipants().forEach(function(participant) {
                if (remoteUserId && participant !== remoteUserId) {
                    return;
                }

                var user = connection.peers[participant];
                try {
                    user.peer.removeStream(stream);
                } catch (e) {}
            });

            connection.renegotiate();
        };

        connection.addStream = function(session, remoteUserId) {
            if (!!session.getAudioTracks) {
                if (connection.attachStreams.indexOf(session) === -1) {
                    if (!session.streamid) {
                        session.streamid = session.id;
                    }

                    connection.attachStreams.push(session);
                }
                connection.renegotiate(remoteUserId);
                return;
            }

            if (isData(session)) {
                connection.renegotiate(remoteUserId);
                return;
            }

            if (session.audio || session.video || session.screen) {
                if (session.screen) {
                    connection.getScreenConstraints(function(error, screen_constraints) {
                        if (error) {
                            if (error === 'PermissionDeniedError') {
                                if (session.streamCallback) {
                                    session.streamCallback(null);
                                }
                                if (connection.enableLogs) {
                                    console.error('User rejected to share his screen.');
                                }
                                return;
                            }
                            return alert(error);
                        }

                        connection.invokeGetUserMedia({
                            audio: isAudioPlusTab(connection) ? getAudioScreenConstraints(screen_constraints) : false,
                            video: screen_constraints,
                            isScreen: true
                        }, (session.audio || session.video) && !isAudioPlusTab(connection) ? connection.invokeGetUserMedia(null, gumCallback) : gumCallback);
                    });
                } else if (session.audio || session.video) {
                    connection.invokeGetUserMedia(null, gumCallback);
                }
            }

            function gumCallback(stream) {
                if (session.streamCallback) {
                    session.streamCallback(stream);
                }

                connection.renegotiate(remoteUserId);
            }
        };

        connection.invokeGetUserMedia = function(localMediaConstraints, callback, session) {
            if (!session) {
                session = connection.session;
            }

            if (!localMediaConstraints) {
                localMediaConstraints = connection.mediaConstraints;
            }

            getUserMediaHandler({
                onGettingLocalMedia: function(stream) {
                    var videoConstraints = localMediaConstraints.video;
                    if (videoConstraints) {
                        if (videoConstraints.mediaSource || videoConstraints.mozMediaSource) {
                            stream.isScreen = true;
                        } else if (videoConstraints.mandatory && videoConstraints.mandatory.chromeMediaSource) {
                            stream.isScreen = true;
                        }
                    }

                    if (!stream.isScreen) {
                        stream.isVideo = stream.getVideoTracks().length;
                        stream.isAudio = !stream.isVideo && stream.getAudioTracks().length;
                    }

                    mPeer.onGettingLocalMedia(stream);

                    if (callback) {
                        callback(stream);
                    }
                },
                onLocalMediaError: function(error, constraints) {
                    mPeer.onLocalMediaError(error, constraints);
                },
                localMediaConstraints: localMediaConstraints || {
                    audio: session.audio ? localMediaConstraints.audio : false,
                    video: session.video ? localMediaConstraints.video : false
                }
            });
        };

        function applyConstraints(stream, mediaConstraints) {
            if (!stream) {
                if (!!connection.enableLogs) {
                    console.error('No stream to applyConstraints.');
                }
                return;
            }

            if (mediaConstraints.audio) {
                stream.getAudioTracks().forEach(function(track) {
                    track.applyConstraints(mediaConstraints.audio);
                });
            }

            if (mediaConstraints.video) {
                stream.getVideoTracks().forEach(function(track) {
                    track.applyConstraints(mediaConstraints.video);
                });
            }
        }

        connection.applyConstraints = function(mediaConstraints, streamid) {
            if (!MediaStreamTrack || !MediaStreamTrack.prototype.applyConstraints) {
                alert('track.applyConstraints is NOT supported in your browser.');
                return;
            }

            if (streamid) {
                var stream;
                if (connection.streamEvents[streamid]) {
                    stream = connection.streamEvents[streamid].stream;
                }
                applyConstraints(stream, mediaConstraints);
                return;
            }

            connection.attachStreams.forEach(function(stream) {
                applyConstraints(stream, mediaConstraints);
            });
        };

        function replaceTrack(track, remoteUserId, isVideoTrack) {
            if (remoteUserId) {
                mPeer.replaceTrack(track, remoteUserId, isVideoTrack);
                return;
            }

            connection.peers.getAllParticipants().forEach(function(participant) {
                mPeer.replaceTrack(track, participant, isVideoTrack);
            });
        }

        connection.replaceTrack = function(session, remoteUserId, isVideoTrack) {
            session = session || {};

            if (!RTCPeerConnection.prototype.getSenders) {
                connection.addStream(session);
                return;
            }

            if (session instanceof MediaStreamTrack) {
                replaceTrack(session, remoteUserId, isVideoTrack);
                return;
            }

            if (session instanceof MediaStream) {
                if (session.getVideoTracks().length) {
                    replaceTrack(session.getVideoTracks()[0], remoteUserId, true);
                }

                if (session.getAudioTracks().length) {
                    replaceTrack(session.getAudioTracks()[0], remoteUserId, false);
                }
                return;
            }

            if (isData(session)) {
                throw 'connection.replaceTrack requires audio and/or video and/or screen.';
                return;
            }

            if (session.audio || session.video || session.screen) {
                if (session.screen) {
                    connection.getScreenConstraints(function(error, screen_constraints) {
                        if (error) {
                            return alert(error);
                        }

                        connection.invokeGetUserMedia({
                            audio: isAudioPlusTab(connection) ? getAudioScreenConstraints(screen_constraints) : false,
                            video: screen_constraints,
                            isScreen: true
                        }, (session.audio || session.video) && !isAudioPlusTab(connection) ? connection.invokeGetUserMedia(null, gumCallback) : gumCallback);
                    });
                } else if (session.audio || session.video) {
                    connection.invokeGetUserMedia(null, gumCallback);
                }
            }

            function gumCallback(stream) {
                connection.replaceTrack(stream, remoteUserId, isVideoTrack || session.video || session.screen);
            }
        };

        connection.resetTrack = function(remoteUsersIds, isVideoTrack) {
            if (!remoteUsersIds) {
                remoteUsersIds = connection.getAllParticipants();
            }

            if (typeof remoteUsersIds == 'string') {
                remoteUsersIds = [remoteUsersIds];
            }

            remoteUsersIds.forEach(function(participant) {
                var peer = connection.peers[participant].peer;

                if ((typeof isVideoTrack === 'undefined' || isVideoTrack === true) && peer.lastVideoTrack) {
                    connection.replaceTrack(peer.lastVideoTrack, participant, true);
                }

                if ((typeof isVideoTrack === 'undefined' || isVideoTrack === false) && peer.lastAudioTrack) {
                    connection.replaceTrack(peer.lastAudioTrack, participant, false);
                }
            });
        };

        connection.renegotiate = function(remoteUserId) {
            if (remoteUserId) {
                mPeer.renegotiatePeer(remoteUserId);
                return;
            }

            connection.peers.getAllParticipants().forEach(function(participant) {
                mPeer.renegotiatePeer(participant);
            });
        };

        connection.setStreamEndHandler = function(stream, isRemote) {
            if (!stream || !stream.addEventListener) return;

            isRemote = !!isRemote;

            if (stream.alreadySetEndHandler) {
                return;
            }
            stream.alreadySetEndHandler = true;

            var streamEndedEvent = 'ended';

            if ('oninactive' in stream) {
                streamEndedEvent = 'inactive';
            }

            stream.addEventListener(streamEndedEvent, function() {
                if (stream.idInstance) {
                    currentUserMediaRequest.remove(stream.idInstance);
                }

                if (!isRemote) {
                    // reset attachStreams
                    var streams = [];
                    connection.attachStreams.forEach(function(s) {
                        if (s.id != stream.id) {
                            streams.push(s);
                        }
                    });
                    connection.attachStreams = streams;
                }

                // connection.renegotiate();

                var streamEvent = connection.streamEvents[stream.streamid];
                if (!streamEvent) {
                    streamEvent = {
                        stream: stream,
                        streamid: stream.streamid,
                        type: isRemote ? 'remote' : 'local',
                        userid: connection.userid,
                        extra: connection.extra,
                        mediaElement: connection.streamEvents[stream.streamid] ? connection.streamEvents[stream.streamid].mediaElement : null
                    };
                }

                if (isRemote && connection.peers[streamEvent.userid]) {
                    // reset remote "streams"
                    var peer = connection.peers[streamEvent.userid].peer;
                    var streams = [];
                    peer.getRemoteStreams().forEach(function(s) {
                        if (s.id != stream.id) {
                            streams.push(s);
                        }
                    });
                    connection.peers[streamEvent.userid].streams = streams;
                }

                if (streamEvent.userid === connection.userid && streamEvent.type === 'remote') {
                    return;
                }

                if (connection.peersBackup[streamEvent.userid]) {
                    streamEvent.extra = connection.peersBackup[streamEvent.userid].extra;
                }

                connection.onstreamended(streamEvent);

                delete connection.streamEvents[stream.streamid];
            }, false);
        };

        connection.onMediaError = function(error, constraints) {
            if (!!connection.enableLogs) {
                console.error(error, constraints);
            }
        };

        connection.addNewBroadcaster = function(broadcasterId, userPreferences) {
            if (connection.socket.isIO) {
                return;
            }

            if (connection.broadcasters.length) {
                setTimeout(function() {
                    mPeer.connectNewParticipantWithAllBroadcasters(broadcasterId, userPreferences, connection.broadcasters.join('|-,-|'));
                }, 10 * 1000);
            }

            if (!connection.session.oneway && !connection.session.broadcast && connection.direction === 'many-to-many' && connection.broadcasters.indexOf(broadcasterId) === -1) {
                connection.broadcasters.push(broadcasterId);
                keepNextBroadcasterOnServer();
            }
        };

        connection.autoCloseEntireSession = false;

        function keepNextBroadcasterOnServer() {
            if (!connection.isInitiator) return;

            if (connection.session.oneway || connection.session.broadcast || connection.direction !== 'many-to-many') {
                return;
            }

            var firstBroadcaster = connection.broadcasters[0];
            var otherBroadcasters = [];
            connection.broadcasters.forEach(function(broadcaster) {
                if (broadcaster !== firstBroadcaster) {
                    otherBroadcasters.push(broadcaster);
                }
            });

            if (connection.autoCloseEntireSession) return;
            connection.shiftModerationControl(firstBroadcaster, otherBroadcasters, true);
        };

        connection.filesContainer = connection.videosContainer = document.body || document.documentElement;
        connection.isInitiator = false;

        connection.shareFile = mPeer.shareFile;
        if (typeof FileProgressBarHandler !== 'undefined') {
            FileProgressBarHandler.handle(connection);
        }

        if (typeof TranslationHandler !== 'undefined') {
            TranslationHandler.handle(connection);
        }

        connection.token = getRandomString;

        connection.onNewParticipant = function(participantId, userPreferences) {
            connection.acceptParticipationRequest(participantId, userPreferences);
        };

        connection.acceptParticipationRequest = function(participantId, userPreferences) {
            if (userPreferences.successCallback) {
                userPreferences.successCallback();
                delete userPreferences.successCallback;
            }

            mPeer.createNewPeer(participantId, userPreferences);
        };

        connection.onShiftedModerationControl = function(sender, existingBroadcasters) {
            connection.acceptModerationControl(sender, existingBroadcasters);
        };

        connection.acceptModerationControl = function(sender, existingBroadcasters) {
            connection.isInitiator = true; // NEW initiator!

            connection.broadcasters = existingBroadcasters;
            connection.peers.getAllParticipants().forEach(function(participant) {
                mPeer.onNegotiationNeeded({
                    changedUUID: sender,
                    oldUUID: connection.userid,
                    newUUID: sender
                }, participant);
            });
            connection.userid = sender;
            connection.changeUserId(connection.userid);
        };

        connection.shiftModerationControl = function(remoteUserId, existingBroadcasters, firedOnLeave) {
            mPeer.onNegotiationNeeded({
                shiftedModerationControl: true,
                broadcasters: existingBroadcasters,
                firedOnLeave: !!firedOnLeave
            }, remoteUserId);
        };

        if (typeof StreamsHandler !== 'undefined') {
            connection.StreamsHandler = StreamsHandler;
        }

        connection.onleave = function(userid) {};

        connection.invokeSelectFileDialog = function(callback) {
            var selector = new FileSelector();
            selector.accept = '*.*';
            selector.selectSingleFile(callback);
        };

        connection.getPublicModerators = function(userIdStartsWith, callback) {
            if (typeof userIdStartsWith === 'function') {
                callback = userIdStartsWith;
            }

            connectSocket(function() {
                connection.socket.emit(
                    'get-public-moderators',
                    typeof userIdStartsWith === 'string' ? userIdStartsWith : '',
                    callback
                );
            });
        };

        connection.onmute = function(e) {
            if (!e || !e.mediaElement) {
                return;
            }

            if (e.muteType === 'both' || e.muteType === 'video') {
                e.mediaElement.src = null;
                var paused = e.mediaElement.pause();
                if (typeof paused !== 'undefined') {
                    paused.then(function() {
                        e.mediaElement.poster = e.snapshot || 'https://cdn.webrtc-experiment.com/images/muted.png';
                    });
                } else {
                    e.mediaElement.poster = e.snapshot || 'https://cdn.webrtc-experiment.com/images/muted.png';
                }
            } else if (e.muteType === 'audio') {
                e.mediaElement.muted = true;
            }
        };

        connection.onunmute = function(e) {
            if (!e || !e.mediaElement || !e.stream) {
                return;
            }

            if (e.unmuteType === 'both' || e.unmuteType === 'video') {
                e.mediaElement.poster = null;
                e.mediaElement.srcObject = e.stream;
                e.mediaElement.play();
            } else if (e.unmuteType === 'audio') {
                e.mediaElement.muted = false;
            }
        };

        connection.onExtraDataUpdated = function(event) {
            event.status = 'online';
            connection.onUserStatusChanged(event, true);
        };

        connection.onJoinWithPassword = function(remoteUserId) {
            console.warn(remoteUserId, 'is password protected. Please join with password.');
        };

        connection.onInvalidPassword = function(remoteUserId, oldPassword) {
            console.warn(remoteUserId, 'is password protected. Please join with valid password. Your old password', oldPassword, 'is wrong.');
        };

        connection.onPasswordMaxTriesOver = function(remoteUserId) {
            console.warn(remoteUserId, 'is password protected. Your max password tries exceeded the limit.');
        };

        connection.getAllParticipants = function(sender) {
            return connection.peers.getAllParticipants(sender);
        };

        if (typeof StreamsHandler !== 'undefined') {
            StreamsHandler.onSyncNeeded = function(streamid, action, type) {
                connection.peers.getAllParticipants().forEach(function(participant) {
                    mPeer.onNegotiationNeeded({
                        streamid: streamid,
                        action: action,
                        streamSyncNeeded: true,
                        type: type || 'both'
                    }, participant);
                });
            };
        }

        connection.connectSocket = function(callback) {
            connectSocket(callback);
        };

        connection.closeSocket = function() {
            try {
                io.sockets = {};
            } catch (e) {};

            if (!connection.socket) return;

            if (typeof connection.socket.disconnect === 'function') {
                connection.socket.disconnect();
            }

            if (typeof connection.socket.resetProps === 'function') {
                connection.socket.resetProps();
            }

            connection.socket = null;
        };

        connection.getSocket = function(callback) {
            if (!connection.socket) {
                connectSocket(callback);
            } else if (callback) {
                callback(connection.socket);
            }

            return connection.socket;
        };

        connection.getRemoteStreams = mPeer.getRemoteStreams;

        var skipStreams = ['selectFirst', 'selectAll', 'forEach'];

        connection.streamEvents = {
            selectFirst: function(options) {
                if (!options) {
                    // in normal conferencing, it will always be "local-stream"
                    var firstStream;
                    for (var str in connection.streamEvents) {
                        if (skipStreams.indexOf(str) === -1 && !firstStream) {
                            firstStream = connection.streamEvents[str];
                            continue;
                        }
                    }
                    return firstStream;
                }
            },
            selectAll: function() {}
        };

        connection.socketURL = '/'; // generated via config.json
        connection.socketMessageEvent = 'RTCMultiConnection-Message'; // generated via config.json
        connection.socketCustomEvent = 'RTCMultiConnection-Custom-Message'; // generated via config.json
        connection.DetectRTC = DetectRTC;

        connection.setCustomSocketEvent = function(customEvent) {
            if (customEvent) {
                connection.socketCustomEvent = customEvent;
            }

            if (!connection.socket) {
                return;
            }

            connection.socket.emit('set-custom-socket-event-listener', connection.socketCustomEvent);
        };

        connection.getNumberOfBroadcastViewers = function(broadcastId, callback) {
            if (!connection.socket || !broadcastId || !callback) return;

            connection.socket.emit('get-number-of-users-in-specific-broadcast', broadcastId, callback);
        };

        connection.onNumberOfBroadcastViewersUpdated = function(event) {
            if (!connection.enableLogs || !connection.isInitiator) return;
            console.info('Number of broadcast (', event.broadcastId, ') viewers', event.numberOfBroadcastViewers);
        };

        connection.onUserStatusChanged = function(event, dontWriteLogs) {
            if (!!connection.enableLogs && !dontWriteLogs) {
                console.info(event.userid, event.status);
            }
        };

        connection.getUserMediaHandler = getUserMediaHandler;
        connection.multiPeersHandler = mPeer;
        connection.enableLogs = true;
        connection.setCustomSocketHandler = function(customSocketHandler) {
            if (typeof SocketConnection !== 'undefined') {
                SocketConnection = customSocketHandler;
            }
        };

        // default value is 15k because Firefox's receiving limit is 16k!
        // however 64k works chrome-to-chrome
        connection.chunkSize = 65 * 1000;

        connection.maxParticipantsAllowed = 1000;

        // eject or leave single user
        connection.disconnectWith = mPeer.disconnectWith;

        connection.checkPresence = function(remoteUserId, callback) {
            if (!connection.socket) {
                connection.connectSocket(function() {
                    connection.checkPresence(remoteUserId, callback);
                });
                return;
            }
            connection.socket.emit('check-presence', (remoteUserId || connection.sessionid) + '', callback);
        };

        connection.onReadyForOffer = function(remoteUserId, userPreferences) {
            connection.multiPeersHandler.createNewPeer(remoteUserId, userPreferences);
        };

        connection.setUserPreferences = function(userPreferences) {
            if (connection.dontAttachStream) {
                userPreferences.dontAttachLocalStream = true;
            }

            if (connection.dontGetRemoteStream) {
                userPreferences.dontGetRemoteStream = true;
            }

            return userPreferences;
        };

        connection.updateExtraData = function() {
            connection.socket.emit('extra-data-updated', connection.extra);
        };

        connection.enableScalableBroadcast = false;
        connection.maxRelayLimitPerUser = 3; // each broadcast should serve only 3 users

        connection.dontCaptureUserMedia = false;
        connection.dontAttachStream = false;
        connection.dontGetRemoteStream = false;

        connection.onReConnecting = function(event) {
            if (connection.enableLogs) {
                console.info('ReConnecting with', event.userid, '...');
            }
        };

        connection.beforeAddingStream = function(stream) {
            return stream;
        };

        connection.beforeRemovingStream = function(stream) {
            return stream;
        };

        if (typeof isChromeExtensionAvailable !== 'undefined') {
            connection.checkIfChromeExtensionAvailable = isChromeExtensionAvailable;
        }

        if (typeof isFirefoxExtensionAvailable !== 'undefined') {
            connection.checkIfChromeExtensionAvailable = isFirefoxExtensionAvailable;
        }

        if (typeof getChromeExtensionStatus !== 'undefined') {
            connection.getChromeExtensionStatus = getChromeExtensionStatus;
        }

        connection.getScreenConstraints = function(callback, audioPlusTab) {
            if (isAudioPlusTab(connection, audioPlusTab)) {
                audioPlusTab = true;
            }

            getScreenConstraints(function(error, screen_constraints) {
                if (!error) {
                    screen_constraints = connection.modifyScreenConstraints(screen_constraints);
                    callback(error, screen_constraints);
                }
            }, audioPlusTab);
        };

        connection.modifyScreenConstraints = function(screen_constraints) {
            return screen_constraints;
        };

        connection.onPeerStateChanged = function(state) {
            if (connection.enableLogs) {
                if (state.iceConnectionState.search(/closed|failed/gi) !== -1) {
                    console.error('Peer connection is closed between you & ', state.userid, state.extra, 'state:', state.iceConnectionState);
                }
            }
        };

        connection.isOnline = true;

        listenEventHandler('online', function() {
            connection.isOnline = true;
        });

        listenEventHandler('offline', function() {
            connection.isOnline = false;
        });

        connection.isLowBandwidth = false;
        if (navigator && navigator.connection && navigator.connection.type) {
            connection.isLowBandwidth = navigator.connection.type.toString().toLowerCase().search(/wifi|cell/g) !== -1;
            if (connection.isLowBandwidth) {
                connection.bandwidth = {
                    audio: 30,
                    video: 30,
                    screen: 30
                };

                if (connection.mediaConstraints.audio && connection.mediaConstraints.audio.optional && connection.mediaConstraints.audio.optional.length) {
                    var newArray = [];
                    connection.mediaConstraints.audio.optional.forEach(function(opt) {
                        if (typeof opt.bandwidth === 'undefined') {
                            newArray.push(opt);
                        }
                    });
                    connection.mediaConstraints.audio.optional = newArray;
                }

                if (connection.mediaConstraints.video && connection.mediaConstraints.video.optional && connection.mediaConstraints.video.optional.length) {
                    var newArray = [];
                    connection.mediaConstraints.video.optional.forEach(function(opt) {
                        if (typeof opt.bandwidth === 'undefined') {
                            newArray.push(opt);
                        }
                    });
                    connection.mediaConstraints.video.optional = newArray;
                }
            }
        }

        connection.getExtraData = function(remoteUserId) {
            if (!remoteUserId) throw 'remoteUserId is required.';
            if (!connection.peers[remoteUserId]) return {};
            return connection.peers[remoteUserId].extra;
        };

        if (!!forceOptions.autoOpenOrJoin) {
            connection.openOrJoin(connection.sessionid);
        }

        connection.onUserIdAlreadyTaken = function(useridAlreadyTaken, yourNewUserId) {
            if (connection.enableLogs) {
                console.warn('Userid already taken.', useridAlreadyTaken, 'Your new userid:', yourNewUserId);
            }

            connection.join(useridAlreadyTaken);
        };

        connection.onRoomFull = function(roomid) {
            if (connection.enableLogs) {
                console.warn(roomid, 'is full.');
            }
        };

        connection.trickleIce = true;
        connection.version = '3.4.4';

        connection.onSettingLocalDescription = function(event) {
            if (connection.enableLogs) {
                console.info('Set local description for remote user', event.userid);
            }
        };

        connection.oneRoomAlreadyExist = function(roomid) {
            if (connection.enableLogs) {
                console.info('Server says "Room ', roomid, 'already exist. Joining instead.');
            }
            connection.join(roomid);
        };
    })(this);

};
