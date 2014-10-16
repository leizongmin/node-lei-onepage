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
  one.tpl.render('#main', 'more', {window: Object.keys(window[e.params.name])});
});

one.router.init();
