'use strict';

const gulp = require('gulp'),
	del = require('del'),
	pug = require('gulp-pug'),
	sourcemaps = require('gulp-sourcemaps'),
	rename = require('gulp-rename'),
	debug = require('gulp-debug'),
	plumber = require('gulp-plumber'),
	newer = require('gulp-newer'),
	changed = require('gulp-changed');
// browserSync = require('browser-sync').create();

/* styles */
const autoprefixer = require('gulp-autoprefixer'),
	sass = require('gulp-sass'),
	groupcmq = require('gulp-group-css-media-queries'),
	cleanCSS = require('gulp-clean-css'),
	sassGlob = require('gulp-sass-glob');

/* images */
const imagemin = require('gulp-imagemin'),
	jp2000 = require('gulp-jpeg-2000'),
	webp = require('gulp-webp'),
	svgSprite = require('gulp-svg-sprite');

/* fonts */
const ttf2svg = require('gulp-ttf-svg'),
	ttf2woff = require('gulp-ttf2woff'),
	ttf2woff2 = require('gulp-ttf2woff2'),
	ttf2eot = require('gulp-ttf2eot');

/* scripts */
const rollup = require('gulp-better-rollup'),
	commonjs = require('@rollup/plugin-commonjs'),
	babel = require('rollup-plugin-babel'),
	nodeResolve = require('rollup-plugin-node-resolve'),
	polyfills = require('rollup-plugin-node-polyfills'),
	minify = require('gulp-minify');

/* settings */
const dirBuild = 'build',
	dirSrc = 'src',
	path = {
		build: {
			template: dirBuild,
			scss: dirBuild,
			pug: `${dirSrc}/template`,
			css: `${dirBuild}/css`,
			php: `${dirBuild}/php`,
			fonts: `${dirBuild}/fonts`,
			favicon: `${dirBuild}/favicon`,
			img: `${dirBuild}/images`,
			js: `${dirBuild}/js`
		},
		src: {
			template: `${dirSrc}/template/index.php`,
			php: `${dirSrc}/php/**/*`,
			scss: `${dirSrc}/scss/style.scss`,
			pug: `${dirSrc}/pug/**/*.pug`,
			css: `${dirSrc}/css/**/*.css`,
			fonts: `${dirSrc}/fonts/*.{ttf,otf}`,
			favicon: `${dirSrc}/favicon/*`,
			imgBg: `${dirSrc}/images/backgrounds/*`,
			imgPic: `${dirSrc}/images/pictures/*`,
			imgSvg: `${dirSrc}/images/svg/*`,
			js: `${dirSrc}/js/script.js`
		},
		watch: {
			template: `${dirSrc}/template/**/*.php`,
			php: `${dirSrc}/php/**/*.php`,
			scss: `${dirSrc}/scss/**/*.scss`,
			pug: `${dirSrc}/pug/**/*.pug`,
			css: `${dirSrc}/css/**/*.css`,
			fonts: `${dirSrc}/fonts/*`,
			favicon: `${dirSrc}/favicon/*`,
			imgBg: `${dirSrc}/images/backgrounds/*`,
			imgPic: `${dirSrc}/images/pictures/*`,
			imgSvg: `${dirSrc}/images/svg/*`,
			js: [`${dirSrc}/js/**/*.js`, `${dirSrc}/components/**/*.js`, `${dirSrc}/controllers/**/*.js`, `${dirSrc}/models/**/*.js`]
		}
	};

/* clear build dir */
function clean() {
	return del(`${dirBuild}/**`);
}

/* conversion sass */
function gulpSass() {
	return gulp.src(path.src.scss)
		.pipe(sourcemaps.init())
		.pipe(sassGlob())
		.pipe(sass({
			linefeed: 'crlf',
			indentType: 'tab',
			indentWidth: 1,
			outputStyle: 'compressed'
		})
			.on('error', sass.logError))
		.pipe(groupcmq())
		.pipe(autoprefixer({
			grid: true,
			overrideBrowserslist: ['> 0.4%', 'last 4 versions', 'firefox >= 62', 'edge >= 18', 'safari >=12', 'not ie <= 11', 'not dead']
		}))
		.pipe(sourcemaps.write('.'))
		.pipe(debug({
			title: 'scss:'
		}))
		.pipe(gulp.dest(path.build.scss))
		.pipe(cleanCSS())
		.pipe(rename('style.min.css'))
		.pipe(gulp.dest(path.build.scss));
}

/* conversion fonts */
function gulpFonts() {
	return gulp.src(path.src.fonts)
		.pipe(gulp.dest(path.build.fonts))
		.pipe(ttf2svg())
		.pipe(gulp.src(path.src.fonts))
		.pipe(ttf2woff())
		.pipe(gulp.src(path.src.fonts))
		.pipe(ttf2woff2())
		.pipe(gulp.src(path.src.fonts))
		.pipe(ttf2eot())
		.pipe(debug({
			title: 'fonts:'
		}))
		.pipe(gulp.dest(path.build.fonts));
}

/* conversion pug */
function gulpPug() {
	return gulp.src(path.src.pug)
		.pipe(plumber())
		.pipe(changed(path.build.pug))
		.pipe(pug({
			pretty: true
		}))
		.pipe(rename({
			extname: '.php'
		}))
		.pipe(debug({
			title: 'pug:'
		}))
		.pipe(plumber.stop())
		.pipe(gulp.dest(path.build.pug));
}

/* copy css vendors in build dir */
function gulpCss() {
	return gulp.src(path.src.css)
		.pipe(gulp.dest(path.build.css));
}

/* copy template in build dir */
function gulpTemplate() {
	return gulp.src(path.src.template)
		.pipe(gulp.dest(path.build.template));
}

/* copy php in build dir */
function gulpPHP() {
	return gulp.src(path.src.php)
		.pipe(gulp.dest(path.build.php));
}

/* optimize images */
function gulpImagesPic() {
	return gulp.src(path.src.imgPic)
		.pipe(newer(path.build.img))
		.pipe(jp2000())
		.pipe(gulp.dest(path.build.img))
		.pipe(gulp.src(path.src.imgPic))
		.pipe(newer(path.build.img))
		.pipe(webp({
			quality: 70
		}))
		.pipe(gulp.dest(path.build.img))
		.pipe(gulp.src(path.src.imgPic))
		.pipe(newer(path.build.img))
		.pipe(imagemin([
			imagemin.mozjpeg({
				quality: 90
			}),
			imagemin.optipng({
				optimizationLevel: 2
			})
		]))
		.pipe(debug({
			title: 'pictures:'
		}))
		.pipe(gulp.dest(path.build.img));
}

function gulpImagesBg() {
	return gulp.src(path.src.imgBg)
		.pipe(newer(path.build.img))
		.pipe(imagemin([
			imagemin.mozjpeg({
				quality: 10
			}),
			imagemin.optipng({
				optimizationLevel: 5
			}),
			imagemin.svgo({
				plugins: [{
					removeViewBox: true
				},
				{
					cleanupIDs: false
				}]
			})
		]))
		.pipe(debug({
			title: 'backgrounds:'
		}))
		.pipe(gulp.dest(path.build.img));
}

function gulpImagesSVG() {
	return gulp.src(path.src.imgSvg)
		.pipe(newer(path.build.img))
		.pipe(svgSprite({
			shape: {
				transform: [
					{
						svgo: {
							plugins: [
								{
									removeAttrs: {
										attrs: ['class', 'style', 'fill', 'stroke.*', 'xmlns']
									}
								}
							]
						}
					}
				]
			},
			mode: {
				symbol: {
					sprite: '../sprite.svg'
				}
			}
		}))
		.pipe(debug({ title: 'svg:' }))
		.pipe(gulp.dest(path.build.img));
}

/* copy favicon in build dir */
function gulpFavicon() {
	return gulp.src(path.src.favicon)
		.pipe(gulp.dest(path.build.favicon));
}

/* conversion js bundle */
function gulpJS() {
	return gulp.src(path.src.js)
		.pipe(sourcemaps.init())
		.pipe(plumber())
		.pipe(rollup({
			plugins: [
				nodeResolve({
					preferBuiltins: true,
					mainFields: ['browser']
				}),
				commonjs(),
				babel({
					presets: [
						'@babel/preset-env',
					],
					plugins: [
						[
							'@babel/plugin-transform-runtime',
							{
								corejs: false,
								helpers: true,
								regenerator: true,
								useESModules: true
							}
						]
					],
					runtimeHelpers: true
				}),
				polyfills()
			]
		}, {
			format: 'umd'
		}))
		.pipe(sourcemaps.write('.'))
		.pipe(minify({
			ext: {
				min: '.min.js'
			}
		}))
		.pipe(debug({
			title: 'js:'
		}))
		.pipe(plumber.stop())
		.pipe(gulp.dest(path.build.js));
}

/* watch src files and show changes in browser */
function gulpWatch() {
	// browserSync.init({
	// 	server: './' + dirBuild
	// });

	gulp.watch(path.watch.scss, gulp.series(gulpSass));
	gulp.watch(path.watch.pug, gulp.series(gulpPug));
	gulp.watch(path.watch.template, gulp.series(gulpTemplate));
	gulp.watch(path.watch.php, gulp.series(gulpPHP));
	gulp.watch(path.watch.css, gulp.series(gulpCss));
	gulp.watch(path.watch.js, gulp.series(gulpJS));
	gulp.watch(path.watch.imgPic, gulp.series(gulpImagesPic));
	gulp.watch(path.watch.imgBg, gulp.series(gulpImagesBg));
	gulp.watch(path.watch.imgSvg, gulp.series(gulpImagesSVG));
	gulp.watch(path.watch.fonts, gulp.series(gulpFonts));
}

const dev = gulp.series(clean, gulp.parallel(gulp.series(gulpImagesPic, gulpImagesBg, gulpImagesSVG), gulpFonts, gulpCss, gulpSass, gulpPHP, gulp.series(gulpPug, gulpTemplate), gulpJS, gulpFavicon));
const build = gulp.series(clean, gulp.parallel(gulp.series(gulpImagesPic, gulpImagesBg, gulpImagesSVG), gulpFonts, gulpCss, gulpSass, gulpTemplate, gulpPHP, gulpJS, gulpFavicon));

exports.default = build;
exports.watch = gulp.series(build, gulpWatch);
exports.dev = gulp.series(dev, gulpWatch);
exports.elem = gulp.series(gulp.parallel(gulpFonts, gulpFavicon, gulpImagesPic, gulpImagesBg, gulpImagesSVG));
exports.clean = clean;
exports.js = gulpJS;
exports.css = gulpCss;
exports.img = gulp.parallel(gulpImagesPic, gulpImagesBg, gulpImagesSVG);
exports.fonts = gulpFonts;
exports.favicon = gulpFavicon;
