/**
 * notes数据操作
 */

var notes = window.notes = {};

notes._keyPrefix = 'notes:';

notes._getKey = function (timestamp) {
  return notes._keyPrefix + timestamp;
};

notes.save = function (data, callback) {
  if (!(data.timestamp > 0)) data.timestamp = Date.now();
  data.lastupdate = Date.now();
  min.hmset(notes._getKey(data.timestamp), data, function (err, ret) {
    min.save();
    callback(err, data);
  });
};

notes.get = function (timestamp, callback) {
  min.hgetall(notes._getKey(timestamp), callback);
};

notes.del = function (timestamp, callback) {
  min.del(notes._getKey(timestamp), function (err, ret) {
    min.save();
    callback(err, ret);
  });
};

notes.list = function (callback) {
  min.keys(notes._keyPrefix + '*', function (err, keys) {
    if (err) return callback(err);
    var multi = min.multi();
    keys.forEach(function (key) {
      multi.get(key);
    });
    multi.exec(function (err, replies) {
      if (err) return callback(err);
      var list = replies.map(function (ret) {
        return ret[0];
      });
      callback(null, list);
    });
  });
};
