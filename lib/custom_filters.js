/**
 * TinyLiquid Custom Filters
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var path = require('path');
var fs = require('fs');
var tinyliquid = require('tinyliquid');
var debug = require('debug')('lei:onepage:custom_filters');
var minify = require('./minify');

module.exports = function (one) {
  var exports = {};

  function generateImportFilter (processImport) {
    return function (appName, options, callback, context) {
      try {
        options = JSON.parse(options);
      } catch (err) {
        return callback(err + '\n' + options);
      }

      if (!one._appIsExist(appName)) return callback(new Error('app "' + appName + '" does not exist'));
      var dir = one._getAppDir(appName);
      var filename = path.resolve(dir, options.file);
      fs.exists(filename, function (exists) {
        if (!exists) return callback(new Error('import file "' + filename + '" of app "' + appName + '" does not exist'));
        options.filename = filename;

        fs.readFile(filename, function (err, content) {
          if (err) return callback(err);

          options.content = content.toString();
          processImport(appName, options, callback, context);
        });
      });
    };
  }

  exports['import_script'] = generateImportFilter(function (appName, options, callback, context) {
    if (!one.isDebug()) options.content = minify.js(options.content);
    var attrs = ['script'];
    if (options.attr_id) attrs.push('id="' + options.attr_id + '"');
    var html = ['<' + attrs.join(' ') + '>', options.content, '</script>'].join('\n');
    callback(null, html);
  });

  exports['import_style'] = generateImportFilter(function (appName, options, callback, context) {
    if (!one.isDebug()) options.content = minify.css(options.content);
    var attrs = ['style'];
    if (options.attr_id) attrs.push('id="' + options.attr_id + '"');
    var html = ['<' + attrs.join(' ') + '>', options.content, '</style>'].join('\n');
    callback(null, html);
  });

  exports['import_html'] = generateImportFilter(function (appName, options, callback, context) {
    if (!one.isDebug()) options.content = minify.html(options.content);
    if (options.attr_id) {
      var attrs = ['div'];
      if (options.attr_id) attrs.push('id="' + options.attr_id + '"');
      var html = ['<' + attrs.join(' ') + '>', options.content, '</div>'].join('\n');
    } else {
      var html = options.content;
    }
    callback(null, html);
  });

  return exports;
};
