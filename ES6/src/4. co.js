const co = require('co');
const fetch = require('node-fetch');

function run(generator) {
  const iterator = generator()
  const it = iterator.next()
  const promise = it.value

  promise.then(data => {                //value的值可以直接转换成promise？？？
    const it2 = iterator.next(data)
    const promise2 = it2.value
    
    promise2.then(data2 => {
      iterator.next(data2)
    })
  })
}

run(function *() {
  const res = yield fetch('https://api.douban.com/v2/movie/1291843');
  const movie = yield res.json();
  const summary = movie.summary

  console.log('run-summary:', summary)
})

/***********************************************************/

// co实现了generator的自动执行，不需要手动执行。co源码很短，查看源码：npm i co -D
co(function *() {
  const res = yield fetch('https://api.douban.com/v2/movie/1291843');
  const movie = yield res.json();
  const summary = movie.summary

  console.log('co-summary:', summary)
})