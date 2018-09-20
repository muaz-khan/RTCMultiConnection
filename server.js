// Muaz Khan      - www.MuazKhan.com
// MIT License    - www.WebRTC-Experiment.com/licence
// Documentation  - github.com/muaz-khan/RTCMultiConnection

function resolveURL(url) {
    var isWin = !!process.platform.match(/^win/);
    if (!isWin) return url;
    return url.replace(/\//g, '\\');
}

// via: stackoverflow.com/a/41407246/552182
var BASH_COLORS_HELPER = {
    getBlackFG: function(str) {
        return '\x1b[30m' + (str || '%s') + '\x1b[0m';
    },
    getRedFG: function(str) {
        return '\x1b[31m' + (str || '%s') + '\x1b[0m';
    },
    getGreenFG: function(str) {
        return '\x1b[32m' + (str || '%s') + '\x1b[0m';
    },
    getYellowFG: function(str) {
        return '\x1b[33m' + (str || '%s') + '\x1b[0m';
    },
    getBlueFG: function() {
        return '\x1b[34m' + (str || '%s') + '\x1b[0m';
    },
    getPinkFG: function(str) {
        return '\x1b[35m' + (str || '%s') + '\x1b[0m';
    },
    getCyanFG: function(str) {
        return '\x1b[36m' + (str || '%s') + '\x1b[0m';
    },
    getWhiteFG: function(str) {
        return '\x1b[37m' + (str || '%s') + '\x1b[0m';
    },
    getCrimsonFG: function(str) {
        return '\x1b[38m' + (str || '%s') + '\x1b[0m';
    },
    underline: function(str) {
        return '\x1b[4m' + (str || '%s') + '\x1b[0m';
    },
    highlight: function(str) {
        return '\x1b[7m' + (str || '%s') + '\x1b[0m';
    },
    getYellowBG: function(str) {
        // Black:40, Red:41, Green:42, Yellow:43, Blue:44, Magenta:45, Cyan:46, White:47, Crimson:48
        return '\x1b[43m' + (str || '%s') + '\x1b[0m';
    },
    getRedBG: function(str) {
        return '\x1b[41m' + (str || '%s') + '\x1b[0m';
    }
};

// Please use HTTPs on non-localhost domains.
var isUseHTTPs = false;

// force auto reboot on failures
var autoRebootServerOnFailure = false;

// var port = 443;
var port = process.env.PORT || 9001;

var fs = require('fs');
var path = require('path');

var ssl_key, ssl_cert, ssl_cabundle;

try {
    ssl_key = fs.readFileSync(path.join(__dirname, resolveURL('fake-keys/privatekey.pem')));
    ssl_cert = fs.readFileSync(path.join(__dirname, resolveURL('fake-keys/certificate.pem')));
} catch (e) {}

// skip/remove this try-catch block if you're NOT using "config.json"
try {
    var config = require('./config.json');

    if ((config.port || '').toString() !== '9001') {
        port = parseInt(config.port);
    }

    if ((config.autoRebootServerOnFailure || '').toString() === 'true') {
        autoRebootServerOnFailure = true;
    }

    if ((config.isUseHTTPs || '').toString() === 'true') {
        isUseHTTPs = true;
    }

    ['ssl_key', 'ssl_cert', 'ssl_cabundle'].forEach(function(key) {
        if (!config[key] || config[key].toString().length==0) {
            return;
        }

        if (config[key].indexOf('/path/to/') === -1) {
            if (key === 'ssl_key') {
                ssl_key = fs.readFileSync(config['ssl_key']);
            }

            if (key === 'ssl_cert') {
                ssl_cert = fs.readFileSync(config['ssl_cert']);
            }

            if (key === 'ssl_cabundle') {
                ssl_cabundle = fs.readFileSync(config['ssl_cabundle']);
            }
        }
    });
} catch (e) {}

try {
    var argv_array = [];
    process.argv.forEach(function(val, index, array) {
        if (argv_array.length) return;
        argv_array = array;
    });

    argv_array.forEach(function(val) {
        // node server.js --ssl
        if (val === '--ssl') {
            isUseHTTPs = true;
        }

        // node server.js --autoRebootServerOnFailure=false
        if (val.indexOf('--autoRebootServerOnFailure=false') === 0) {
            autoRebootServerOnFailure = false;
        }

        // node server.js --port=9002
        if (val.indexOf('--port') === 0) {
            var inner = val.split('--port=')[1];
            if (inner) {
                inner = inner.split(' ')[0].trim();
                port = inner;
            }
        }

        // node server.js --ssl_key=/home/ssl/ssl.key
        if (val.indexOf('--ssl_key') === 0) {
            var inner = val.split('--ssl_key=')[1];
            if (inner) {
                inner = inner.split(' ')[0].trim();
                ssl_key = fs.readFileSync(inner);
            }
        }

        // node server.js --ssl_cert=/home/ssl/ssl.crt
        if (val.indexOf('--ssl_cert') === 0) {
            var inner = val.split('--ssl_cert=')[1];
            if (inner) {
                inner = inner.split(' ')[0].trim();
                ssl_cert = fs.readFileSync(inner);
            }
        }

        // node server.js --ssl_cabundle=/home/ssl/ssl.cab
        if (val.indexOf('--ssl_cabundle') === 0) {
            var inner = val.split('--ssl_cabundle=')[1];
            if (inner) {
                inner = inner.split(' ')[0].trim();
                ssl_cabundle = fs.readFileSync(inner);
            }
        }

        // node server.js --version
        if (val === '--version') {
            var json = require(path.join(__dirname, resolveURL('package.json')));
            console.log('\n');
            console.log(BASH_COLORS_HELPER.getYellowFG(), '\t' + json.version);
            process.exit(1);
        }

        // node server.js --dependencies
        if (val === '--dependencies') {
            var json = require(path.join(__dirname, resolveURL('package.json')));
            console.log('\n');
            console.log(BASH_COLORS_HELPER.getYellowFG(), 'dependencies:');
            console.log(JSON.stringify(json.dependencies, null, '\t'));
            console.log('\n');
            console.log(BASH_COLORS_HELPER.getYellowFG(), 'devDependencies:');
            console.log(JSON.stringify(json.devDependencies, null, '\t'));
            process.exit(1);
        }

        // node server.js --help
        if (val === '--help') {
            console.log('\n');
            console.log('You can manage configuration in the "config.json" file.');

            console.log('\n');
            console.log(BASH_COLORS_HELPER.getYellowFG(), 'Or use following commands:');
            console.log('\tnode server.js');
            console.log('\tnode server.js', BASH_COLORS_HELPER.getYellowFG('--port=9002'));
            console.log('\tnode server.js', BASH_COLORS_HELPER.getYellowFG('--port=9002 --ssl'));
            console.log('\tnode server.js', BASH_COLORS_HELPER.getYellowFG('--port=9002 --ssl --ssl_key=/home/ssl/ssl.key --ssl_cert=/home/ssl/ssl.crt'));

            console.log('\n');
            console.log('Here is list of all config parameters:');
            console.log(BASH_COLORS_HELPER.getYellowFG(), '--port=80');
            console.log('\tThis parameter allows you set any custom port.');
            console.log(BASH_COLORS_HELPER.getYellowFG(), '--ssl');
            console.log('\tThis parameter allows you force HTTPs. Remove/Skip/Ignore this parameter to use HTTP.');
            console.log(BASH_COLORS_HELPER.getYellowFG(), '--ssl_key=path');
            console.log('\tThis parameter allows you set your domain\'s .key file.');
            console.log(BASH_COLORS_HELPER.getYellowFG(), '--ssl_cert=path');
            console.log('\tThis parameter allows you set your domain\'s .crt file.');
            console.log(BASH_COLORS_HELPER.getYellowFG(), '--ssl_cabundle=path');
            console.log('\tThis parameter allows you set your domain\'s .cab file.');
            console.log(BASH_COLORS_HELPER.getYellowFG(), '--version');
            console.log('\tCheck RTCMultiConnection version number.');
            console.log(BASH_COLORS_HELPER.getYellowFG(), '--dependencies');
            console.log('\tCheck all RTCMultiConnection dependencies.');
            console.log(BASH_COLORS_HELPER.getYellowFG(), '--autoRebootServerOnFailure=false');
            console.log('\tDisable auto-restart server.js on failure.');
            console.log('------------------------------');
            console.log('Need more help? bit.ly/2ff7QGk');
            process.exit(1);
        }
    });
} catch (e) {}

// see how to use a valid certificate:
// https://github.com/muaz-khan/WebRTC-Experiment/issues/62
var options = {
    key: ssl_key,
    cert: ssl_cert,
    ca: ssl_cabundle
};

// You don't need to change anything below

var server = require(isUseHTTPs ? 'https' : 'http');
var url = require('url');

function serverHandler(request, response) {
    try {
        var uri = url.parse(request.url).pathname,
            filename = path.join(process.cwd(), uri);

        if (request.method !== 'GET' || uri.indexOf('..') !== -1) {
            response.writeHead(401, {
                'Content-Type': 'text/plain'
            });
            response.write('401 Unauthorized: ' + path.join('/', uri) + '\n');
            response.end();
            return;
        }

        if (filename && filename.search(/server.js|Scalable-Broadcast.js|Signaling-Server.js/g) !== -1) {
            response.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            response.write('404 Not Found: ' + path.join('/', uri) + '\n');
            response.end();
            return;
        }

        ['Video-Broadcasting', 'Screen-Sharing', 'Switch-Cameras'].forEach(function(fname) {
            if (filename && filename.indexOf(fname + '.html') !== -1) {
                filename = filename.replace(fname + '.html', fname.toLowerCase() + '.html');
            }
        });

        var stats;

        try {
            stats = fs.lstatSync(filename);

            if (filename && filename.search(/demos/g) === -1 && stats.isDirectory()) {
                if (response.redirect) {
                    response.redirect('/demos/');
                } else {
                    response.writeHead(301, {
                        'Location': '/demos/'
                    });
                }
                response.end();
                return;
            }
        } catch (e) {
            response.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            response.write('404 Not Found: ' + path.join('/', uri) + '\n');
            response.end();
            return;
        }

        if (fs.statSync(filename).isDirectory()) {
            response.writeHead(404, {
                'Content-Type': 'text/html'
            });

            if (filename.indexOf(resolveURL('/demos/MultiRTC/')) !== -1) {
                filename = filename.replace(resolveURL('/demos/MultiRTC/'), '');
                filename += resolveURL('/demos/MultiRTC/index.html');
            } else if (filename.indexOf(resolveURL('/demos')) !== -1) {
                filename = filename.replace(resolveURL('/demos/'), '');
                filename = filename.replace(resolveURL('/demos'), '');
                filename += resolveURL('/demos/index.html');
            } else {
                filename += resolveURL('/demos/index.html');
            }
        }

        var contentType = 'text/plain';
        if (filename.toLowerCase().indexOf('.html') !== -1) {
            contentType = 'text/html';
        }
        if (filename.toLowerCase().indexOf('.css') !== -1) {
            contentType = 'text/css';
        }
        if (filename.toLowerCase().indexOf('.png') !== -1) {
            contentType = 'image/png';
        }

        fs.readFile(filename, 'binary', function(err, file) {
            if (err) {
                response.writeHead(500, {
                    'Content-Type': 'text/plain'
                });
                response.write('404 Not Found: ' + path.join('/', uri) + '\n');
                response.end();
                return;
            }

            try {
                var demos = (fs.readdirSync('demos') || []);

                if (demos.length) {
                    var h2 = '<h2 style="text-align:center;display:block;"><a href="https://www.npmjs.com/package/rtcmulticonnection-v3"><img src="https://img.shields.io/npm/v/rtcmulticonnection-v3.svg"></a><a href="https://www.npmjs.com/package/rtcmulticonnection-v3"><img src="https://img.shields.io/npm/dm/rtcmulticonnection-v3.svg"></a><a href="https://travis-ci.org/muaz-khan/RTCMultiConnection"><img src="https://travis-ci.org/muaz-khan/RTCMultiConnection.png?branch=master"></a></h2>';
                    var otherDemos = '<section class="experiment" id="demos"><details><summary style="text-align:center;">Check ' + (demos.length - 1) + ' other RTCMultiConnection-v3 demos</summary>' + h2 + '<ol>';
                    demos.forEach(function(f) {
                        if (f && f !== 'index.html' && f.indexOf('.html') !== -1) {
                            otherDemos += '<li><a href="/demos/' + f + '">' + f + '</a> (<a href="https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/' + f + '">Source</a>)</li>';
                        }
                    });
                    otherDemos += '<ol></details></section><section class="experiment own-widgets latest-commits">';

                    file = file.replace('<section class="experiment own-widgets latest-commits">', otherDemos);
                }
            } catch (e) {}

            try {
                var docs = (fs.readdirSync('docs') || []);

                if (docs.length) {
                    var html = '<section class="experiment" id="docs">';
                    html += '<details><summary style="text-align:center;">RTCMultiConnection Docs</summary>';
                    html += '<h2 style="text-align:center;display:block;"><a href="http://www.rtcmulticonnection.org/docs/">http://www.rtcmulticonnection.org/docs/</a></h2>';
                    html += '<ol>';

                    docs.forEach(function(f) {
                        if (f.indexOf('DS_Store') == -1) {
                            html += '<li><a href="https://github.com/muaz-khan/RTCMultiConnection/tree/master/docs/' + f + '">' + f + '</a></li>';
                        }
                    });

                    html += '</ol></details></section><section class="experiment own-widgets latest-commits">';

                    file = file.replace('<section class="experiment own-widgets latest-commits">', html);
                }
            } catch (e) {}

            response.writeHead(200, {
                'Content-Type': contentType
            });
            response.write(file, 'binary');
            response.end();
        });
    } catch (e) {
        response.writeHead(404, {
            'Content-Type': 'text/plain'
        });
        response.write('<h1>Unexpected error:</h1><br><br>' + e.stack || e.message || JSON.stringify(e));
        response.end();
    }
}

var app;

if (isUseHTTPs) {
    app = server.createServer(options, serverHandler);
} else {
    app = server.createServer(serverHandler);
}

function cmd_exec(cmd, args, cb_stdout, cb_end) {
    var spawn = require('child_process').spawn,
        child = spawn(cmd, args),
        me = this;
    me.exit = 0;
    me.stdout = "";
    child.stdout.on('data', function(data) {
        cb_stdout(me, data)
    });
    child.stdout.on('end', function() {
        cb_end(me)
    });
}

function log_console() {
    console.log(foo.stdout);

    try {
        var pidToBeKilled = foo.stdout.split('\nnode    ')[1].split(' ')[0];
        console.log('------------------------------');
        console.log('Please execute below command:');
        console.log('\x1b[31m%s\x1b[0m ', 'kill ' + pidToBeKilled);
        console.log('Then try to run "server.js" again.');
        console.log('------------------------------');

    } catch (e) {}
}

function runServer() {
    app.on('error', function(e) {
        if (e.code == 'EADDRINUSE') {
            if (e.address === '0.0.0.0') {
                e.address = 'localhost';
            }

            var socketURL = (isUseHTTPs ? 'https' : 'http') + '://' + e.address + ':' + e.port + '/';

            console.log('------------------------------');
            console.log('\x1b[31m%s\x1b[0m ', 'Unable to listen on port: ' + e.port);
            console.log('\x1b[31m%s\x1b[0m ', socketURL + ' is already in use. Please kill below processes using "kill PID".');
            console.log('------------------------------');

            foo = new cmd_exec('lsof', ['-n', '-i4TCP:9001'],
                function(me, data) {
                    me.stdout += data.toString();
                },
                function(me) {
                    me.exit = 1;
                }
            );

            setTimeout(log_console, 250);
        }
    });

    app = app.listen(port, process.env.IP || '0.0.0.0', function(error) {
        var addr = app.address();

        if (addr.address === '0.0.0.0') {
            addr.address = 'localhost';
        }

        var domainURL = (isUseHTTPs ? 'https' : 'http') + '://' + addr.address + ':' + addr.port + '/';

        console.log('\n');

        console.log('Socket.io is listening at:');
        console.log(BASH_COLORS_HELPER.getGreenFG(), '\t' + domainURL);

        if (!isUseHTTPs) {
            console.log('You can use --ssl to enable HTTPs:');
            console.log(BASH_COLORS_HELPER.getYellowFG(), '\t' + 'node server --ssl');
        }

        console.log('Your web-browser (HTML file) MUST set this line:');
        console.log(BASH_COLORS_HELPER.getGreenFG(), '\tconnection.socketURL = "' + domainURL + '";');

        if (addr.address != 'localhost' && !isUseHTTPs) {
            console.log(BASH_COLORS_HELPER.getRedBG(), 'Warning:');
            console.log(BASH_COLORS_HELPER.getRedBG(), 'Please run on HTTPs to make sure audio,video and screen demos can work on Google Chrome as well.');
        }

        console.log('For more help: ', BASH_COLORS_HELPER.getYellowFG('node server.js --help'));
        console.log('\n');
    });

    require('./Signaling-Server.js')(app, function(socket) {
        try {
            var params = socket.handshake.query;

            // "socket" object is totally in your own hands!
            // do whatever you want!

            // in your HTML page, you can access socket as following:
            // connection.socketCustomEvent = 'custom-message';
            // var socket = connection.getSocket();
            // socket.emit(connection.socketCustomEvent, { test: true });

            if (!params.socketCustomEvent) {
                params.socketCustomEvent = 'custom-message';
            }

            socket.on(params.socketCustomEvent, function(message) {
                try {
                    socket.broadcast.emit(params.socketCustomEvent, message);
                } catch (e) {}
            });
        } catch (e) {}
    });
}

if (autoRebootServerOnFailure) {
    // auto restart app on failure
    var cluster = require('cluster');
    if (cluster.isMaster) {
        cluster.fork();

        cluster.on('exit', function(worker, code, signal) {
            cluster.fork();
        });
    }

    if (cluster.isWorker) {
        runServer();
    }
} else {
    runServer();
}
