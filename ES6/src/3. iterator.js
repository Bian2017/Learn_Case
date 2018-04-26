// 简易迭代器
function makeIterator(arr) {
  let index = 0;

  // 返回一个迭代器对象
  return {
    next: () => {
      if (index < arr.length) {
        return {
          value: arr[index++],
          done: false
        }
      } else {
        return {
          done: true
        }
      }
    }
  }
}

let ite = makeIterator(['eat', 'sleep', 'wakeup'])

// 每次迭代的值都反映了被迭代对象内部的状态
console.log('First', ite.next().value)
console.log('Second', ite.next().value)
console.log('Third', ite.next().value)
console.log('Last', ite.next().done)

/***********************************************************/

// 生成器：生成器的本质是迭代器。每次迭代都是通过yield关键字来实现。通过生成器函数简化了创建迭代器的过程。
function *generator(arr) {
  for (let i = 0; i < arr.length; i++) {
    yield arr[i];
  }
}

let gen = generator(['eat', 'sleep', 'wakeup'])

console.log('First', gen.next())
console.log('Second', gen.next())
console.log('Third', gen.next())
console.log('Last', gen.done)