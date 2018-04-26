const fs = require('fs');

// 处理异步变迁的历史--->
// 第一阶段：回调函数
function readFile(cb) {
  fs.readFile('./package.json', (err, data) => {
    if (err) return cb(err)
    cb(null, data)
  })
}

readFile((err, data) => {
  if (!err) {
    data = JSON.parse(data)
    console.log('回调编程：', data.name)
  }
})

// 第二阶段：Promise
function readFileAsync(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) return reject(err)
      else resolve(data)
    })
  })
}

readFileAsync('./package.json')
  .then(data => {
    data = JSON.parse(data)
    console.log(`promise编程：${data.name}`)
  })
  .catch(err => {
    console.log(err)
  })

// 第三阶段：generator
const co = require('co');
const util = require('util');

co(function* () {
  let data = yield util.promisify(fs.readFile)('./package.json')

  data = JSON.parse(data)
  console.log(`generator编程：${data.name}`)
})

// 第四个阶段: Async 统一世界
const readAsync = util.promisify(fs.readFile)         //直接拿到Promise

async function init() {
  let data = await readAsync('./package.json')

  data = JSON.parse(data)
  console.log(`async编程：${data.name}`)
}
init()