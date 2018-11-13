var fs = require('fs');
var path = require('path');
var url = require('url');

/*
var firstParameter = {
    config: __dirname + resolveURL('/config.json'),
    logs: __dirname + resolveURL('/logs.json')
};
*/

require('rtcmulticonnection-server')(null, function(request, response, config, root, BASH_COLORS_HELPER, pushLogs, resolveURL, isAdminAuthorized, getJsonFile) {
    try {
        var uri, filename;

        try {
            if (!config.dirPath || !config.dirPath.length) {
                config.dirPath = null;
            }

            uri = url.parse(request.url).pathname;
            filename = path.join(config.dirPath ? resolveURL(config.dirPath) : process.cwd(), uri);
        } catch (e) {
            pushLogs(root, 'url.parse', e);
        }

        filename = (filename || '').toString();

        if (request.method !== 'GET' || uri.indexOf('..') !== -1) {
            try {
                response.writeHead(401, {
                    'Content-Type': 'text/plain'
                });
                response.write('401 Unauthorized: ' + path.join('/', uri) + '\n');
                response.end();
                return;
            } catch (e) {
                pushLogs(root, '!GET or ..', e);
            }
        }

        var matched = false;
        ['/demos/', '/dev/', '/dist/', '/socket.io/', '/node_modules/canvas-designer/'].forEach(function(item) {
            if (filename.indexOf(resolveURL(item)) !== -1) {
                matched = true;
            }
        });

        if (config.enableAdmin === true && filename.indexOf(resolveURL('/admin/')) !== -1) {
            matched = true;
        }

        // files from node_modules
        ['RecordRTC.js', 'FileBufferReader.js', 'getStats.js', 'getScreenId.js', 'adapter.js', 'MultiStreamsMixer.js'].forEach(function(item) {
            if (filename.indexOf(resolveURL('/node_modules/')) !== -1 && filename.indexOf(resolveURL(item)) !== -1) {
                matched = true;
            }
        });

        if (config.enableAdmin === true && filename.indexOf(resolveURL('/logs.json')) !== -1) {
            filename = path.join(config.dirPath ? resolveURL(config.dirPath) : process.cwd(), '/logs.json');

            try {
                if (isAdminAuthorized(request, config) && fs.existsSync(root.logs)) {
                    var logs = getJsonFile(root.logs);
                    response.writeHead(200, {
                        'Content-Type': 'text/plain'
                    });
                    response.write(JSON.stringify(logs));
                    response.end();
                    return;
                }
            } catch (e) {
                pushLogs(root, '/logs.json', e);
            }
        }

        // handle /admin/ page
        if (config.enableAdmin === true && filename.indexOf(resolveURL('/admin/')) !== -1) {
            if (!isAdminAuthorized(request, config)) {
                try {
                    var adminAuthorization = require('basic-auth');
                    var credentials = adminAuthorization(request);

                    response.writeHead(401, {
                        'WWW-Authenticate': 'Basic realm="Node"'
                    });
                    response.write('401 Unauthorized\n');
                    response.end();
                    return;
                } catch (e) {
                    pushLogs(root, '/admin/ auth issues', e);
                }
            }

            if (filename.indexOf(resolveURL('/admin-ui.js')) !== -1) {
                filename = path.join(config.dirPath ? resolveURL(config.dirPath) : process.cwd(), '/admin/admin-ui.js');
            } else {
                filename = path.join(config.dirPath ? resolveURL(config.dirPath) : process.cwd(), '/admin/index.html');
            }
            fs.readFile(filename, 'binary', function(err, file) {
                try {
                    if (err) {
                        response.writeHead(500, {
                            'Content-Type': 'text/plain'
                        });
                        response.write('404 Not Found: admin/index.html\n');
                        response.end();
                        return;
                    }

                    response.writeHead(200, {
                        'Content-Type': 'text/html'
                    });
                    response.write(file, 'binary');
                    response.end();
                } catch (e) {
                    pushLogs(root, 'admin/index.html', e);
                }
            });
            return;
        }

        if (filename.search(/.js|.json/g) !== -1 && !matched) {
            try {
                response.writeHead(404, {
                    'Content-Type': 'text/plain'
                });
                response.write('404 Not Found: ' + path.join('/', uri) + '\n');
                response.end();
                return;
            } catch (e) {
                pushLogs(root, '404 Not Found', e);
            }
        }

        ['Video-Broadcasting', 'Screen-Sharing', 'Switch-Cameras'].forEach(function(fname) {
            try {
                if (filename.indexOf(fname + '.html') !== -1) {
                    filename = filename.replace(fname + '.html', fname.toLowerCase() + '.html');
                }
            } catch (e) {
                pushLogs(root, 'forEach', e);
            }
        });

        var stats;

        try {
            stats = fs.lstatSync(filename);

            if (filename.search(/demos/g) === -1 && stats.isDirectory() && config.homePage === '/demos/index.html') {
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

        try {
            if (fs.statSync(filename).isDirectory()) {
                response.writeHead(404, {
                    'Content-Type': 'text/html'
                });

                if (filename.indexOf(resolveURL('/demos/MultiRTC/')) !== -1) {
                    filename = filename.replace(resolveURL('/demos/MultiRTC/'), '');
                    filename += resolveURL('/demos/MultiRTC/index.html');
                } else if (filename.indexOf(resolveURL('/demos/dashboard/')) !== -1) {
                    filename = filename.replace(resolveURL('/demos/dashboard/'), '');
                    filename += resolveURL('/demos/dashboard/index.html');
                } else if (filename.indexOf(resolveURL('/demos')) !== -1) {
                    filename = filename.replace(resolveURL('/demos/'), '');
                    filename = filename.replace(resolveURL('/demos'), '');
                    filename += resolveURL('/demos/index.html');
                } else {
                    filename += resolveURL(config.homePage);
                }
            }
        } catch (e) {
            pushLogs(root, 'statSync.isDirectory', e);
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
                file = file.replace('connection.socketURL = \'/\';', 'connection.socketURL = \'' + config.socketURL + '\';');
            } catch (e) {}

            response.writeHead(200, {
                'Content-Type': contentType
            });
            response.write(file, 'binary');
            response.end();
        });
    } catch (e) {
        pushLogs(root, 'Unexpected', e);

        response.writeHead(404, {
            'Content-Type': 'text/plain'
        });
        response.write('404 Not Found: Unexpected error.\n' + e.message + '\n\n' + e.stack);
        response.end();
    }
});
