const express = require( 'express' );
const app = express();
const server = require( 'http' ).Server( app );


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
