'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _marked = /*#__PURE__*/_regenerator2.default.mark(generator);

// 简易迭代器
function makeIterator(arr) {
  var index = 0;

  // 返回一个迭代器对象
  return {
    next: function next() {
      if (index < arr.length) {
        return {
          value: arr[index++],
          done: false
        };
      } else {
        return {
          done: true
        };
      }
    }
  };
}

var ite = makeIterator(['eat', 'sleep', 'wakeup']);

// 每次迭代的值都反映了被迭代对象内部的状态
console.log('First', ite.next().value);
console.log('Second', ite.next().value);
console.log('Third', ite.next().value);
console.log('Last', ite.next().done);

/***********************************************************/

// 生成器：生成器的本质是迭代器。每次迭代都是通过yield关键字来实现。通过生成器函数简化了创建迭代器的过程。
function generator(arr) {
  var i;
  return _regenerator2.default.wrap(function generator$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          i = 0;

        case 1:
          if (!(i < arr.length)) {
            _context.next = 7;
            break;
          }

          _context.next = 4;
          return arr[i];

        case 4:
          i++;
          _context.next = 1;
          break;

        case 7:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked, this);
}

var gen = generator(['eat', 'sleep', 'wakeup']);

console.log('First', gen.next());
console.log('Second', gen.next());
console.log('Third', gen.next());
console.log('Last', gen.done);
//# sourceMappingURL=3. iterator.js.map