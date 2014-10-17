/**
 * 事件处理
 */

one.on('notes list change', function () {
  one.ns('refreshNotesList')();
});

one.on('auto save', function () {
  one.ns('saveCurrentNotes')();
});
