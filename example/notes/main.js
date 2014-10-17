setTimeout(function () {
  one.router.init();
}, 0);

function showError (err, detail) {
  if (err) {
    swal({type: 'error', title: err, text: detail});
    console.error(err.stack || err);
  }
}

var currentNotesId = 0;

function refreshNotesList () {
  notes.list(function (err, list) {
    if (err) return showError(err);
    renderNotesList(list || []);
  });
}

function renderNotesList (list) {
  list.sort(function (a, b) {
    return b.lastupdate - a.lastupdate;
  });
  list.forEach(function (a) {
    a.title = a.title || '[未命名标题]';
  });
  one.tpl.render('#notes-list', 'notes-list', {
    list: list,
    current_id: currentNotesId
  }, showError);
}

function saveCurrentNotes (callback) {
  var data = {
    id: $('.notes-detail-title').data('id'),
    title: $('.notes-detail-title').text(),
    content: $('.notes-detail-content').html()
  }
  if (!data.id) return callback && callback();
  notes.save(data, function (err) {
    if (err) return showError(err);
    callback && callback();
  });
}

setInterval(saveCurrentNotes, 2000);

one.router.on('/new', function (e) {
  notes.save({title: '新建笔记', content: '这里是内容'}, function (err, data) {
    if (err) return showError(err, data.id);
    one.router.redirect('/notes/' + data.id);
  })
});

one.router.on('/notes/:id', function (e) {
  saveCurrentNotes(function () {
    notes.get(e.params.id, function (err, data) {
      if (err) return showError(err);
      one.tpl.render('#main', 'notes-detail', {notes: data}, showError);
      currentNotesId = data.id;
      refreshNotesList();
    });
  });
});

one.router.on('/notes/:id/del', function (e) {
  notes.del(e.params.id, function (err) {
    if (err) showError(err);
    refreshNotesList();
  });
});

setTimeout(function () {
  // 添加初始数据
  notes.list(function (err, list) {
    if (err) return showError(err);
    if (list.length < 1) {
      notes.save({title: '我的第一条笔记', content: '随便写些啥呗'}, showError);
      swal({type: 'info', title: '欢迎使用！点击底部的【+】按钮添加笔记'});
    }
    refreshNotesList();
  });
}, 0);
