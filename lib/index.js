/**
 * Lei-OnePage
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var path = require('path');
var fs = require('fs');
var crypto = require('crypto');
var connect = require('connect');
var tinyliquid = require('tinyliquid');
var expressLiquid = require('express-liquid');
var debug = require('debug')('lei:onepage');
var customTags = require('./custom_tags');
var customFilters = require('./custom_filters');


function fillDefaultOptions (options) {
  options = options || {};

  options.prefix = options.prefix || '/lei-onepage';
  if (options.prefix[0] !== '/') options.prefix = '/' + options.prefix;

  if (!('debug' in options)) options.debug = true;
  options.debug = !!options.debug;

  return options;
}

function md5 (text) {
  return crypto.createHash('md5').update(text).digest('hex');
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
  this._options = options = fillDefaultOptions(options);

  var liquidContext = tinyliquid.newContext();
  var filters = customFilters(this);
  Object.keys(filters).forEach(function (name) {
    liquidContext.setAsyncFilter(name, filters[name]);
  });
  this._renderLiquid = expressLiquid({
    context:    liquidContext,
    customTags: customTags
  });

  var mw = this.middleware = connect();
  var me = this;
  mw.use(function (req, res, next) {
    res.renderOnePage = function (name, options) {
      var html = me._getAppCache(name);
      if (html) {
        output(html);
      } else {
        me.render(name, options, function (err, html) {
          if (err) return next(err);
          output(html);
          if (!me.isDebug()) me._setAppCache(name, html);
        });
      }
      function output (html) {
        res.header('content-type', 'text/html');
        res.end(html);
      }
    };
    next();
  });
  mw.use(options.prefix + '/manifest', function (req, res, next) {
    var name = req.query.n;
    me._getManifest(name, function (err, data) {
      if (err) return next(err);
      res.header('content-type', 'text/cache-manifest');
      res.end(data);
    });
  });
  mw.use(options.prefix + '/app', function (req, res, next) {
    var name = req.query.n;
    res.renderOnePage(name);
  });

  debug('init');
}

OnePage.prototype.isDebug = function () {
  return this._options.debug;
};

/**
 * Add Page
 *
 * @param {String} name
 * @param {String} dir
 */
OnePage.prototype.add = function (name, dir) {
  dir = path.resolve(dir);
  name = name.trim();
  this._app[name] = {dir: dir};
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

  options.context = options.context || tinyliquid.newContext();
  options.context.setLocals('app_name', name);
  options.context.setLocals('manifest_file', me._options.prefix + '/manifest?n=' + name);
  options.settings = options.settings || {};
  options.settings.views = me._getAppDir(name);
  options.cache = !me._options.debug;

  me._getAppDefaultFile(name, function (err, filename) {
    if (err) return callback(err);
    debug('render: [%s] %s', name, filename);

    me._renderLiquid(filename, options, callback);
  });
};


OnePage.prototype._getManifest = function (name, callback) {
  var me = this;
  if (!me._appIsExist(name)) return callback(new Error('app "' + name + '" does not exist'));
  debug('get manifest: %s', name);
  me._getAppVersion(name, function (err, version) {
    if (err) return callback(err);
    debug('manifest app version: [%s] %s', name, version);
    var lines = [
      'CACHE MANIFEST',
      '# AppName: ' + name,
      '# Version: ' + version,
      'NETWORK:',
      '*'
    ];
    callback(null, lines.join('\n'));
  });
};

OnePage.prototype._getAppCache = function (name) {
  debug('get page cache: %s', name);
  return !this.isDebug() && this._app[name].pageCache;
};

OnePage.prototype._setAppCache = function (name, html) {
  debug('set page cache: %s [%s]', name, html.length);
  this._app[name].version = md5(html);
  return this._app[name].pageCache = html;
};

OnePage.prototype._getAppDefaultFile = function (name, callback) {
  var me = this;
  if (!me._appIsExist(name)) return callback(new Error('app "' + name + '" does not exist'));
  var filename = path.resolve(me._getAppDir(name), 'index.html');
  fs.exists(filename, function (exists) {
    if (!exists) return callback(new Error('default file of app "' + name + '" does not exist'));
    callback(null, filename);
  });
};

OnePage.prototype._getAppVersion = function (name, callback) {
  var me = this;
  var version = me._app[name].version;
  if (version) return callback(null, version);
  me.render(name, function (err, html) {
    if (err) return callback(err);
    var version = md5(html);
    callback(null, version);
  });
};

OnePage.prototype._appIsExist = function (name) {
  return (name in this._app);
};

OnePage.prototype._getAppDir = function (name) {
  return path.resolve(this._app[name].dir);
};

module.exports = exports = OnePage;
