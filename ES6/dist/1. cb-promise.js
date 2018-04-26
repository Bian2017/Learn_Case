'use strict';

var fs = require('fs');

// 回调式编程
fs.readFile('./package.json', function (err, data) {
  if (err) return console.log(err);

  data = JSON.parse(data);
  console.log('\u56DE\u8C03\u5F0F\u7F16\u7A0B\uFF1A' + data.name);
});

// 使用Promise: 过渡式写法
function readFileAsync(path) {
  return new Promise(function (resolve, reject) {
    fs.readFile(path, function (err, data) {
      if (err) return reject(err);else resolve(data);
    });
  });
}

readFileAsync('./package.json').then(function (data) {
  data = JSON.parse(data);
  console.log('Promise\u7F16\u7A0B\uFF1A' + data.name);
}).catch(function (err) {
  console.log(err);
});

// 将回调转化成Promise
var util = require('util');

util.promisify(fs.readFile)('./package.json').then(JSON.parse).then(function (data) {
  console.log('util\u5C06\u56DE\u8C03\u8F6C\u5316promise\uFF1A' + data.name);
}).catch(function (err) {
  console.log(err);
});
//# sourceMappingURL=1. cb-promise.js.map