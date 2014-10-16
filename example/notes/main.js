setTimeout(function () {
  one.router.init();
}, 0);

function showError (err, detail) {
  if (err) {
    swal({type: 'error', title: err, text: detail});
    console.error(err.stack || err);
  }
}

function saveNotes(timestamp, title, content, callback) {
  if (timestamp < 1) timestamp = Date.now();
  min.set('notes:list:' + timestamp, JSON.stringify({
    title: title,
    timestamp: timestamp
  }), function (err) {
    if (err) return callback(err);
    min.set('notes:content:' + timestamp, content, function (err) {
      callback(err, timestamp);
    });
  });
}

function getNotes (timestamp, callback) {
  setTimeout(function () {
    min.get('notes:list:' + timestamp, function (err, data) {
      if (err) return showError(err, 'notes list');
      data = JSON.parse(data);
      min.get('notes:content:' + timestamp, function (err, content) {
        data.content = content || '';
        callback(null, data);
      });
    });
  }, 100);
}

function delNotes (timestamp, callback) {
  min.del('notes:list:' + timestamp, function (err) {
    min.del('notes:content:' + timestamp, function (err) {
      callback && callback();
    });
  });
}

function refreshNotesList () {
  min.keys('notes:list:*', function (err, keys) {
    if (err) return showError(err);
    if (keys.length < 1) return renderNotesList([]);
    async.mapSeries(keys, function (key, next) {
      min.get(key, function (err, data) {
        if (data) data = JSON.parse(data);
        next(err, data);
      });
    }, function (err, list) {
      if (err) return showError(err);
      renderNotesList(list);
    });
  });
}

var currentNotesTimestamp = 0;

function renderNotesList (list) {
  list.sort(function (a, b) {
    return a.timestamp - b.timestamp;
  });
  list.forEach(function (a) {
    a.title = a.title || '[未命名标题]';
  });
  one.tpl.render('#notes-list', 'notes-list', {
    list: list,
    timestamp: currentNotesTimestamp
  }, showError);
}

function saveCurrentNotes (callback) {
  var timestamp = $('.notes-detail-title').data('timestamp');
  var title = $('.notes-detail-title').text();
  var content = $('.notes-detail-content').html();
  saveNotes(timestamp, title, content, function (err) {
    if (err) return showError(err);
    callback && callback();
  });
}

setInterval(saveCurrentNotes, 2000);

// 添加初始数据
min.keys('notes:list:*', function (err, keys) {
  if (err) return showError(err);
  if (keys.length < 1) {
    saveNotes(0, '我的第一条笔记', '老雷为何这么屌');
  }
  refreshNotesList();
});

one.router.on('/new', function (e) {
  saveNotes(0, '新建笔记', '这里是内容', function (err, timestamp) {
    if (err) return showError(err, timestamp);
    one.router.redirect('/notes/' + timestamp);
  })
});

one.router.on('/notes/:timestamp', function (e) {
  saveCurrentNotes(function () {
    getNotes(e.params.timestamp, function (err, notes) {
      if (err) return showError(err);
      one.tpl.render('#main', 'notes-detail', {notes: notes}, showError);
      currentNotesTimestamp = notes.timestamp;
      refreshNotesList();
    });
  });
});

one.router.on('/notes/:timestamp/del', function (e) {
  delNotes(e.params.timestamp, function () {
    refreshNotesList();
  });
});
