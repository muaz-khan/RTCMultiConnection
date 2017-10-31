const express = require( 'express' );
const app = express();
const server = require( 'http' ).Server( app );
var io = require( 'socket.io' )( server );

const port = process.env.PORT || 9001;
server.listen( port, function(){
    console.log( 'server listening on ' + port );
} );

app.use( express.static( __dirname + '/public' ) );
app.get( '/', ( req, res ) => {
    res.sendFile( 'index.html' );
} );

app.get( '/robot', ( req, res ) => {
	res.sendFile( __dirname + '/public/index_robot.html' );
} );


io.on( 'connection' , function( socket ) {
    console.log( socket.id );
	sockets.push( socket );

	io.emit( 'connected', { msg: 'hello world' } );

	socket.on( 'disconnect', function() {
		sockets = sockets.filter( function( s ) {
            return s.id !== socket.id;
        } );
	} );

    socket.on( 'username', function( username ) {
        socket.username = username;
    } );

    socket.on( 'msg', function( msg ) {
        io.emit( 'newMsg', { username: socket.username, msg } );
	} );
} );


require( './Signaling-Server.js' )( server, socket => {
    try {
        let params = socket.handshake.query;

        if ( !params.socketCustomEvent ) {
            params.socketCustomEvent = 'custom-message';
        }

        socket.on( params.socketCustomEvent, message => {
            try {
                socket.broadcast.emit( params.socketCustomEvent, message );
            } catch( e ) {}
        } );
    } catch( e ) {}
} );
