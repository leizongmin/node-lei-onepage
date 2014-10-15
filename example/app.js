/**
 * OnePage Example
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var express = require('express');
var OnePage = require('../');

var one = new OnePage({debug: false});
one.add('demo', __dirname + '/demo');

var app = express();
app.use(one.middleware);

app.get('/', function (req, res, next) {
  console.log('GET %s', req.url);
  res.renderOnePage('demo');
});

app.listen(8080);
