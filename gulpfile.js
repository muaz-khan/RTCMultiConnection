const gulp = require( 'gulp' ),
    server = require( 'gulp-develop-server' )
    browserify = require( 'browserify' ),
    babelify = require( 'babelify' ),
    source = require( 'vinyl-source-stream' ),
    buffer = require( 'vinyl-buffer' ),
    envify = require( 'envify' ),
    livereload = require( 'gulp-livereload' );

gulp.task( 'server:start', () => {
    server.listen( { path: './src/server.js' }, livereload.listen );
} );

gulp.task( 'watch', [ 'server:start' ], () => {
    livereload.listen();

    const restartServer = file => {
        server.changed( error => {
            if( ! error ) livereload.changed( file.path );
        } );
    }
    gulp.watch( [ './src/*.js' ] ).on( 'change', restartServer );

    const restartClient = file => {
        livereload.changed( file.path );
    }
    gulp.watch( [ './src/public/**/*.*' ] ).on( 'change', restartClient );
} );
