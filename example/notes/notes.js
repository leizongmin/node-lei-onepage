/**
 * notes数据操作
 */

/**
 * Generates a GUID string.
 * @returns {String} The generated GUID.
 * @example af8a8416-6e18-a307-bd9c-f2c947bbb3aa
 * @author Slavik Meltser (slavik@meltser.info).
 * @link http://slavik.meltser.info/?p=142
 */
function guid () {
  function _p8 (s) {
    var p = (Math.random().toString(16) + "000000000").substr(2, 8);
    return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
  }
  return _p8() + _p8(true) + _p8(true) + _p8();
}


var notes = {};

notes._keyPrefix = 'notes:';

notes._getKey = function(type, id) {
  return notes._keyPrefix + type + ':' + id;
};

notes.save = function(data, callback) {
  if (!data.id) data.id = guid();
  data.lastupdate = Date.now();
  var content = data.content || '';
  delete data.content;
  data.summary = content.substr(0, 50);
  min.multi()
    .hmset(notes._getKey('list', data.id), data)
    .set(notes._getKey('content', data.id), content)
    .exec(function(err) {
      min.save();
      callback(err, data);
    });
};

notes.get = function(id, callback) {
  min.hgetall(notes._getKey('list', id), function(err, data) {
    if (err) return callback(err);
    min.get(notes._getKey('content', id), function(err, content) {
      data.content = content;
      callback(null, data);
    });
  });
};

notes.del = function(id, callback) {
  min.multi()
    .del(notes._getKey('list', id))
    .del(notes._getKey('content'), id)
    .exec(function(err) {
      callback(err, id);
    });
};

notes.list = function(callback) {
  min.keys(notes._keyPrefix + 'list:*', function(err, keys) {
    if (err) return callback(err);
    min.keys(notes._keyPrefix + 'list:*')
     .then(function(keys) {
        return min.mget(keys);
     })
     .then(function(list) {
      callback(null, list);
     }, callback);
  });
};

one.ns('notes', notes);
