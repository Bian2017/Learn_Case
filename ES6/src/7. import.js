// require是运行时加载，而不是静态加载。
// 静态加载：代码编译时就能获取方法。
import {
  promisify
} from 'util'

import {
  resolve as r
} from 'path'

import {
  readFile,
  writeFileSync as wfs
} from 'fs'

import * as qs from 'querystring'

promisify(readFile)(r(__dirname, '../package.json')) //修改成绝对路径
  .then(data => {
    data = JSON.parse(data)
    console.log(data.name)
    wfs(r(__dirname, './name'), String(data.name), 'utf8')
  })
  .catch(err => console.log('err: ', err))