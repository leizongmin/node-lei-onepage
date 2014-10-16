/**
 * OnePage Example
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var express = require('express');
var OnePage = require('../');

var one = new OnePage({debug: true});
one.add('demo', __dirname + '/demo');
one.add('notes', __dirname + '/notes');

var app = express();
app.use(one.middleware);

app.get('/demo', function (req, res, next) {
  console.log('GET %s', req.url);
  res.renderOnePage('demo');
});

app.get('/', function (req, res, next) {
  res.renderOnePage('notes');
});

app.listen(8080);
