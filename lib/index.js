/**
 * Lei-OnePage
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var path = require('path');
var fs = require('fs');
var connect = require('connect');
var tinyliquid = require('tinyliquid');
var expressLiquid = require('express-liquid');
var debug = require('debug')('lei:onepage');


function fillDefaultOptions (options) {
  options = options || {};

  options.prefix = options.prefix || '/lei-onepage';
  if (options.prefix[0] !== '/') options.prefix = '/' + options.prefix;

  if (!('debug' in options)) options.debug = true;
  options.debug = !!options.debug;

  return options;
}


/**
 * Init OnePage Instance
 *
 * @param {Object} options
 *   - {String} prefix   default to "/lei-onepage"
 *   - {Boolean} debug   default to true
 */
function OnePage (options) {
  this._app = {};
  this._options = fillDefaultOptions(options);

  var liquid = this.liquid = expressLiquid();

  var mw = this.middleware = connect();
  var me = this;
  mw.use(function (req, res, next) {
    res.renderOnePage = function (name, options) {
      me.render(name, options, function (err, html) {
        if (err) return next(err);
        res.header('content-type', 'text/html');
        res.end(html);
      });
    };
  });
  mw.use(options.prefix + '/manifest', function (req, res, next) {
    var name = req.query.n;
    me.getManifest(name, function (err, data) {
      if (err) return next(err);
      res.header('content-type', 'text/cache-manifest');
      res.end(data);
    });
  });

  debug('init');
}

/**
 * Add Page
 *
 * @param {String} name
 * @param {String} dir
 */
OnePage.prototype.add = function (name, dir) {
  dir = path.resolve(dir);
  name = name.trim();
  this._app[name] = dir;
  debug('add: [%s] %s', name, dir);
};

/**
 * Render
 *
 * @param {String} name
 * @param {Object} options
 * @param {Function} callback
 */
OnePage.prototype.render = function (name, options, callback) {
  var me = this;
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = options || {};
  debug('render: %s', name);
};

/**
 * Get Manifest
 *
 * @param {String} name
 * @param {Function} callback
 */
OnePage.prototype.getManifest = function (name, callback) {
  var me = this;
  debug('get manifest: %s', name);
};


module.exports = exports = OnePage;
