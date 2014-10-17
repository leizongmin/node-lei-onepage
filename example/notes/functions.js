/**
 * 全局函数
 */

function showError (err, detail) {
  if (err) {
    swal({type: 'error', title: err, text: detail});
    console.error(err.stack || err);
  }
}
one.ns('showError', showError);

var currentNotesLastTitle = '';
var currentNotesLastContent = '';
function saveCurrentNotes (callback) {
  var data = {
    id: $('.notes-detail-title').data('id'),
    title: $('.notes-detail-title').text(),
    content: $('.notes-detail-content').html()
  }
  var currentTitle = data.title;
  var currentContent = data.content;
  if (!data.id) return callback && callback();

  one.ns('notes').save(data, function (err) {
    if (err) return showError(err);
    callback && callback();

    if (currentNotesLastTitle !== currentTitle || currentNotesLastContent !== currentContent) {
      one.emit('notes list change');
    }
    currentNotesLastTitle = currentTitle;
    currentNotesLastContent = currentContent;
  });
}
one.ns('saveCurrentNotes', saveCurrentNotes);

function refreshNotesList () {
  one.ns('notes').list(function (err, list) {
    if (err) return showError(err);
    renderNotesList(list || []);
  });
}
one.ns('refreshNotesList', refreshNotesList);

function renderNotesList (list) {
  list.sort(function (a, b) {
    return b.lastupdate - a.lastupdate;
  });
  list.forEach(function (a) {
    a.title = a.title || '[未命名标题]';
  });
  one.tpl.render('#notes-list', 'notes-list', {
    list: list,
    current_id: $('.notes-detail-title').data('id')
  }, showError);
}
one.ns('renderNotesList', renderNotesList);

