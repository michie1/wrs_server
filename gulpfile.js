var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var casperjs = require('gulp-casperjs');

gulp.task('start', function() {
    nodemon({
        script: 'server.js',
        ext: 'js',
        env: {
            'NODE_ENV': 'development'
        }
    })
});

gulp.task('test', function() {
    gulp.src('test/*.js').pipe(casperjs());
});
    
