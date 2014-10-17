/**
 * 路由处理
 */

var notes = one.ns('notes');
var showError = one.ns('showError');


one.router.on('/', function (e) {
  one.tpl.render('#main', 'home');
});

one.router.on('/new', function (e) {
  notes.save({title: '新建笔记', content: '这里是内容'}, function (err, data) {
    if (err) return showError(err, data.id);
    one.router.redirect('/notes/' + data.id);
  })
});

one.router.on('/notes/:id', function (e) {
  one.ns('saveCurrentNotes')(function () {
    notes.get(e.params.id, function (err, data) {
      if (err) return showError(err);
      one.tpl.render('#main', 'notes-detail', {notes: data}, showError);
      one.emit('notes list change');
    });
  });
});

one.router.on('/notes/:id/del', function (e) {
  swal({
    title: '确定要删除此记录？',
    text: '删除后将无法恢复',
    type: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#DD6B55',
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    closeOnConfirm: false
  }, function() {
    notes.del(e.params.id, function (err) {
      if (err) showError(err);
      one.emit('notes list change');
    });
  });
  one.router.redirect('/');
});
