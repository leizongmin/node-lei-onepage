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


function parseImportTag (type) {
  return function (context, name, body) {
    var blocks = arrayRemoveEmptyString(splitText(body, [' ']));
    var options = {
      file: stripQuoteWrap(blocks[0])
    };
    if (blocks[1] === 'as' && blocks[2]) {
      options.attr_id = stripQuoteWrap(blocks[2]);
    }

    var tpl = "{{app_name|import_" + type + ":'" + JSON.stringify(options) + "'}}";
    var ast = tinyliquid.parse(tpl);
    context.astStack.push(ast);
  };
}

exports['import_script'] = parseImportTag('script');
exports['import_style'] = parseImportTag('style');
exports['import_html'] = parseImportTag('html');
