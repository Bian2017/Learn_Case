const fs = require('fs');

// 回调式编程
fs.readFile('./package.json', (err, data) => {
  if (err) return console.log(err)

  data = JSON.parse(data)
  console.log(`回调式编程：${data.name}`)
})

// 使用Promise: 过渡式写法
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
    console.log(`Promise编程：${data.name}`)
  })
  .catch(err => {
    console.log(err)
  })


// 将回调转化成Promise
const util = require('util')

util.promisify(fs.readFile)('./package.json')
  .then(JSON.parse)
  .then(data => {
    console.log(`util将回调转化promise：${data.name}`)
  })
  .catch(err => {
    console.log(err)
  })