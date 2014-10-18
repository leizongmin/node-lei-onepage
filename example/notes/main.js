/**
 * 入口文件
 */

one.on('load', function () {
  one.router.init();

  // 添加初始数据
  var notes = one.ns('notes');
  var showError = one.ns('showError');
  notes.list(function (err, list) {
    if (err) return showError(err);
    if (list.length < 1) {
      notes.save({title: '我的第一条笔记', content: '随便写些啥呗'}, showError);
      swal({type: 'info', title: '欢迎使用！点击底部的【+】按钮添加笔记'});
    }
    one.emit('notes list change');
  });

  // 自动保存
  setInterval(function () {
    one.emit('auto save');
  }, 2000);

});

// 程序更新
one.on('application cache downloading', function () {
  swal({type: 'info', title: '发现新版本，程序正在更新', text: '请稍候...'});
});
one.on('application cache update ready', function () {
  swal({type: 'info', title: '程序已更新完毕！', text: '请刷新页面'});
});

// 在线状态
one.on('application online', function () {
  swal({type: 'info', title: '当前已在线'});
});
one.on('application offline', function () {
  swal({type: 'info', title: '当前已离线'});
});
