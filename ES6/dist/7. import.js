'use strict';

var _util = require('util');

var _path = require('path');

var _fs = require('fs');

var _querystring = require('querystring');

var qs = _interopRequireWildcard(_querystring);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// require是运行时加载，而不是静态加载。
// 静态加载：代码编译时就能获取方法。
(0, _util.promisify)(_fs.readFile)((0, _path.resolve)(__dirname, '../package.json')) //修改成绝对路径
.then(function (data) {
  data = JSON.parse(data);
  console.log(data.name);
  (0, _fs.writeFileSync)((0, _path.resolve)(__dirname, './name'), String(data.name), 'utf8');
}).catch(function (err) {
  return console.log('err: ', err);
});
//# sourceMappingURL=7. import.js.map