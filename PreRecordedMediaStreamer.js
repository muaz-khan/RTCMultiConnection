// Last time updated at June 19, 2014, 08:32:23

// PreRecordedMediaStreamer.js is part of RTCMultiConnection.js: https://www.rtcmulticonnection.org/latest.js

// Muaz Khan         - www.MuazKhan.com
// MIT License       - www.WebRTC-Experiment.com/licence
// Documentation     - www.RTCMultiConnection.org/docs
// FAQ               - www.RTCMultiConnection.org/FAQ
// changes log       - www.RTCMultiConnection.org/changes-log/
// Demos             - www.WebRTC-Experiment.com/RTCMultiConnection

// ___________________________
// PreRecordedMediaStreamer.js

var PreRecordedMediaStreamer = {
    shareMediaFile: function (args) {
        var file = args.file;
        var video = args.video;
        var streamerid = args.streamerid;
        var connection = args.connection;

        if (file && (typeof file.size == 'undefined' || typeof file.type == 'undefined')) throw 'You MUST attach file using input[type=file] or pass a Blob.';

        warn('Pre-recorded media streaming is added as experimental feature.');

        video = video || document.createElement('video');

        video.autoplay = true;
        video.controls = true;

        var streamer = new Streamer(this);

        streamer.push = function (chunk) {
            connection.send({
                preRecordedMediaChunk: true,
                chunk: chunk,
                streamerid: streamerid
            });
        };

        if (file) {
            streamer.stream(file);
        }

        streamer.video = video;

        streamer.receive();

        connection.preRecordedMedias[streamerid] = {
            video: video,
            streamer: streamer,
            onData: function (data) {
                if (data.end) this.streamer.end();
                else this.streamer.append(data);
            }
        };

        connection.onMediaFile({
            mediaElement: video,
            userid: connection.userid,
            extra: connection.extra
        });

        return streamerid;
    }
};


// this object is used for pre-recorded media streaming!

function Streamer(connection) {
    var prefix = !!navigator.webkitGetUserMedia ? '' : 'moz';
    var self = this;

    self.stream = streamPreRecordedMedia;

    window.MediaSource = window.MediaSource || window.WebKitMediaSource;
    if (!window.MediaSource) throw 'Chrome >=M28 (or Firefox with flag "media.mediasource.enabled=true") is mandatory to test this experiment.';

    function streamPreRecordedMedia(file) {
        if (!self.push) throw '<push> method is mandatory.';

        var reader = new window.FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = function (e) {
            startStreaming(new window.Blob([new window.Uint8Array(e.target.result)]));
        };

        var sourceBuffer, mediaSource = new MediaSource();
        mediaSource.addEventListener(prefix + 'sourceopen', function () {
            sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vorbis,vp8"');
            log('MediaSource readyState: <', this.readyState, '>');
        }, false);

        mediaSource.addEventListener(prefix + 'sourceended', function () {
            log('MediaSource readyState: <', this.readyState, '>');
        }, false);

        function startStreaming(blob) {
            if (!blob) return;
            var size = blob.size,
                startIndex = 0,
                plus = 3000;

            log('one chunk size: <', plus, '>');

            function inner_streamer() {
                reader = new window.FileReader();
                reader.onload = function (e) {
                    self.push(new window.Uint8Array(e.target.result));

                    startIndex += plus;
                    if (startIndex <= size) {
                        setTimeout(inner_streamer, connection.chunkInterval || 100);
                    } else {
                        self.push({
                            end: true
                        });
                    }
                };
                reader.readAsArrayBuffer(blob.slice(startIndex, startIndex + plus));
            }

            inner_streamer();
        }

        startStreaming();
    }

    self.receive = receive;

    function receive() {
        var mediaSource = new MediaSource();

        self.video.src = window.URL.createObjectURL(mediaSource);
        mediaSource.addEventListener(prefix + 'sourceopen', function () {
            self.receiver = mediaSource.addSourceBuffer('video/webm; codecs="vorbis,vp8"');
            self.mediaSource = mediaSource;

            log('MediaSource readyState: <', this.readyState, '>');
        }, false);


        mediaSource.addEventListener(prefix + 'sourceended', function () {
            warn('MediaSource readyState: <', this.readyState, '>');
        }, false);
    }

    this.append = function (data) {
        var that = this;
        if (!self.receiver)
            return setTimeout(function () {
                that.append(data);
            });

        try {
            var uint8array = new window.Uint8Array(data);
            self.receiver.appendBuffer(uint8array);
        } catch (e) {
            error('Pre-recorded media streaming:', e);
        }
    };

    this.end = function () {
        self.mediaSource.endOfStream();
    };
}
