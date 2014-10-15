/**
 * TinyLiquid Custom Tags
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var tinyliquid = require('tinyliquid');
var splitText = tinyliquid.utils.splitText;
var arrayRemoveEmptyString = tinyliquid.utils.arrayRemoveEmptyString;
var stripQuoteWrap = tinyliquid.utils.stripQuoteWrap;
var OPCODE = tinyliquid.OPCODE;
var debug = require('debug')('lei:onepage:custom_tags');


exports['import'] = function (context, name, body) {
  var blocks = arrayRemoveEmptyString(splitText(body, [' ']));
  if (blocks.length > 0) {
    var name = 'import_' + blocks[0];
    var body = blocks.slice(1).join(' ');
    if (typeof exports[name] === 'function') {
      exports[name](context, name, body);
    } else {
      var tpl = '{{"not support import ' + blocks[0] + '"|error_message}}';
      var ast = tinyliquid.parse(tpl);
      context.astStack.push(ast);
    }
  } else {
    var tpl = '{{"import syntax error"|error_message}}';
    var ast = tinyliquid.parse(tpl);
    context.astStack.push(ast);
  }
}

function parseImportTag (type) {
  return function (context, name, body) {
    var blocks = arrayRemoveEmptyString(splitText(body, [' ']));
    if (blocks.length > 0) {
      var options = {
        file: stripQuoteWrap(blocks[0])
      };
      if (blocks[1] === 'as' && blocks[2]) {
        options.attr_id = stripQuoteWrap(blocks[2]);
      }
      var tpl = "{{app_name|import_" + type + ":'" + JSON.stringify(options) + "'}}";
    } else {
      var tpl = '{{"missing import file"|error_message}}';
    }
    var ast = tinyliquid.parse(tpl);
    context.astStack.push(ast);
  };
}

exports['import_script'] = parseImportTag('script');
exports['import_style'] = parseImportTag('style');
exports['import_html'] = parseImportTag('html');

exports['import_lib'] = function (context, name, body) {
  var blocks = arrayRemoveEmptyString(splitText(body, [' ']));
  if (blocks.length > 0) {
    var name = stripQuoteWrap(blocks[0]);
    var tpl = '{{"' + name + '"|import_lib}}{% assign is_import_lib_' + name + '=true %}';
  } else {
    var tpl = '{{"missing import library name"|error_message}}';
  }
  var ast = tinyliquid.parse(tpl);
  context.astStack.push(ast);
};

exports['import_tpl'] = function (context, name, body) {
  var blocks = arrayRemoveEmptyString(splitText(body, [' ']));
  if (blocks.length > 0) {
    var name = stripQuoteWrap(blocks[0]);
    if (blocks[1] === 'as' && blocks[2]) {
      var id = stripQuoteWrap(blocks[2]);
    } else {
      var id = name;
    }
    var options = {
      file: name,
      id:   id
    };
    var tpl = '{% unless is_import_lib_tpl %}{{"tpl"|import_lib}}{% assign is_import_lib_tpl=true %}{% endunless %}<script type="text/one-page-tpl" id="one-page-tpl-' + id + '">{{app_name|import_tpl:\'' + JSON.stringify(options) + '\'}}</script>';
  } else {
    var tpl = '{{"missing import library name"|error_message}}';
  }
  var ast = tinyliquid.parse(tpl);
  context.astStack.push(ast);
};
