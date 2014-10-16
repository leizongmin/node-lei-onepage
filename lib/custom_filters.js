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

  var IMPORT_LIB_DIR = path.resolve(__dirname, 'import_lib');
  var IGNORE_MINIFY_LIBS = ['jquery', 'sweetalert'];

  function isIgnoreLib (name) {
    return (IGNORE_MINIFY_LIBS.indexOf(name) !== -1);
  }

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

  function wrapScript (content) {
    return [
      "(function (one) {",
        content,
      "})(window.LeiOnePage = window.LeiOnePage || {});"
    ].join('\n');
  }

  /**
   * import_script
   *
   * @param {String} appName
   * @param {Object} options
   * @return {String}
   */
  exports['import_script'] = generateImportFilter(function (appName, options, callback, context) {
    if (!one.isDebug()) options.content = minify.js(options.content);
    options.content = wrapScript(options.content);
    var attrs = ['script'];
    if (options.attr_id) attrs.push('id="' + options.attr_id + '"');
    var html = ['<' + attrs.join(' ') + '>', options.content, '</script>'].join('\n');
    callback(null, html);
  });

  /**
   * import_style
   *
   * @param {String} appName
   * @param {Object} options
   * @return {String}
   */
  exports['import_style'] = generateImportFilter(function (appName, options, callback, context) {
    if (!one.isDebug()) options.content = minify.css(options.content);
    var attrs = ['style'];
    if (options.attr_id) attrs.push('id="' + options.attr_id + '"');
    var html = ['<' + attrs.join(' ') + '>', options.content, '</style>'].join('\n');
    callback(null, html);
  });

  /**
   * import_html
   *
   * @param {String} appName
   * @param {Object} options
   * @return {String}
   */
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

  /**
   * import_lib
   *
   * @param {String} name
   * @return {String}
   */
  exports['import_lib'] = function (name, callback, context) {
    var filename = path.resolve(IMPORT_LIB_DIR, name + '.html');
    fs.exists(filename, function (exists) {
      if (!exists) return callback(new Error('library file "' + name + '" does not exist'));
      fs.readFile(filename, function (err, content) {
        if (err) return callback(err);
        content = content.toString();
        if (!one.isDebug() && !isIgnoreLib(name)) content = minify.html(content);
        callback(null, content);
      });
    });
  };

  /**
   * import_tpl
   *
   * @param {String} appName
   * @param {Object} options
   * @return {String}
   */
  exports['import_tpl'] = generateImportFilter(function (appName, options, callback, context) {
    var ast = tinyliquid.parse(options.content);
    var str = JSON.stringify(ast);
    str = str.replace(/<script>/img, function (str) {
      return '<sc#lei-one-page#ript>';
    });
    str = str.replace(/<script /img, function (str) {
      return '<sc#lei-one-page#ript ';
    });
    str = str.replace(/<\/script>/img, function (str) {
      return '</sc#lei-one-page#ript>';
    });
    callback(null, str);
  });

  /**
   * error_message
   *
   * @param {String} msg
   * @return {String}
   */
  exports['error_message'] = function (msg, callback, context) {
    var html = '<div style="background-color:#E40404; color:#fff; font-size:16px; padding:4px; text-align:center; border:none;">' + msg + '</div>';
    callback(null, html);
  };

  return exports;
};
