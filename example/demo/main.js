one.router.on('/', function (e) {
  one.tpl.render('#main', 'index', {
    now: new Date()
  });
});

one.router.on('/about', function (e) {
  one.tpl.render('#main', 'about');
});

one.router.on('/more', function (e) {
  one.tpl.render('#main', 'more', {window: Object.keys(window).concat(Object.keys(window.__proto__))});
});

one.router.on('/window/:name', function (e) {
  try {
    one.tpl.render('#main', 'more', {window: Object.keys(window[e.params.name])}, function (err) {
      if (err) swal({type: 'error', title: err});
      swal({type: 'success', title: 'window.' + e.params.name});
    });
  } catch (err) {
    swal({type: 'error', title: err});
  }
});

setTimeout(function () {
  one.router.init();
}, 0);
