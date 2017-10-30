
var express = require( 'express' );
var app = express();
var server = require( 'http' ).Server( app );

var port = process.env.PORT || 9001;
server.listen( port, function(){
    console.log( 'server listening on ' + port );
} );

app.use( express.static( __dirname + '/public' ) );
app.get( '/', function ( req, res ) {
    res.sendfile( 'index.html' );
} );

function runServer() {
    require( './Signaling-Server.js' )( server, function( socket ) {
        try {
            var params = socket.handshake.query;

            if ( !params.socketCustomEvent ) {
                params.socketCustomEvent = 'custom-message';
            }

            socket.on( params.socketCustomEvent, function( message ) {
                try {
                    socket.broadcast.emit( params.socketCustomEvent, message );
                } catch( e ) {}
            } );
        } catch( e ) {}
    } );
}

runServer();
