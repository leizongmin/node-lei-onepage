/**
 * Minify CSS, JS, HTML
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var path = require('path');
var fs = require('fs');
var HtmlMinifier = require('html-minifier');
var CleanCSS = require('clean-css');
var UglifyJS = require('uglify-js');
var debug = require('debug')('lei:onepage:minify');


exports.html = function (content) {
  return HtmlMinifier.minify(content, {
    removeComments: true,
    conservativeCollapse: true,
    preserveLineBreaks: true,
    minifyJS: true,
    minifyCSS: true
  });
};

exports.css = function (content) {
  return new CleanCSS().minify(content);
};

exports.js = function (content) {
  return UglifyJS.minify(content, {fromString: true}).code;
};
