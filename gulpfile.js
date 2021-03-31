const gulp = require('gulp');
const rimrafcb = require('rimraf');
const webpack = require('webpack-stream');
const vsce = require('vsce');
const zip = require('gulp-zip');
const path = require('path');
const fs = require('fs');
const rename = require('gulp-rename');

function getRuntime() {
	const yarnrc = fs.readFileSync(path.join(__dirname, '.yarnrc'), 'utf8');
	const runtime = /^runtime "(.*)"$/m.exec(yarnrc)[1];
	return runtime;
}

function getVersion() {
	const yarnrc = fs.readFileSync(path.join(__dirname, '.yarnrc'), 'utf8');
	const target = /^target "(.*)"$/m.exec(yarnrc)[1];
	return target;
}

function rimraf(path) {
    return new Promise((res, rej) => rimrafcb(path, e => e ? rej(e) : res()));
}

gulp.task('clean', () => {
    return Promise.all([rimraf('out'), rimraf('dist'), rimraf('*.vsix'), rimraf('*.zip')]);
});

gulp.task('compile', gulp.series('clean', () => {
    return gulp.src('src/**')
        .pipe(webpack(require('./webpack.config.js')))
        .pipe(gulp.dest('./out'));
}));

const runtime = getRuntime();
const runTimeVersion = getVersion();
const platform = process.platform;

gulp.task('zip', async () => {
    const files = await vsce.listFiles();
    return gulp.src(files, { base: './' })
        .pipe(zip(`azuredatastudio-sqlite-${platform}-${runtime}-${runTimeVersion}.zip`, {  }))
        .pipe(gulp.dest('./artifacts'));
});

gulp.task('vsix', async () => {
    await vsce.createVSIX();
    return gulp.src('*.vsix', {  })
        .pipe(rename(`azuredatastudio-sqlite-${platform}-${runtime}-${runTimeVersion}.vsix`))
        .pipe(gulp.dest('./artifacts'));
});

gulp.task('package', gulp.series('compile', gulp.parallel('zip', 'vsix')));
