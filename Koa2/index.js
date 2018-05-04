const Koa = require('koa')
const logger = require('koa-logger')
const session = require('koa-session')
const app = new Koa()

app.keys = ['Hi Luke']

// 第一步：执行自己的业务代码；
// 第二步：用await next()将控制权往下传递，让后面的一系列中间件都执行完毕；
// 第三步：再回来执行剩下的业务代码
const mid1 = async (ctx, next) => {
  ctx.type = 'text/html;charset=utf-8'
  await next()
  ctx.body = ctx.body + ' here'
}

const mid2 = async (ctx, next) => {
  ctx.body = 'Hi'
  await next()
}

const mid3 = async (ctx, next) => {
  ctx.body = ctx.body + ',Luke'
  await next()
}

app.use(logger())       //能监控整个请求从进来那一刻到返回那一刻所执行的时间
app.use(session(app))
app.use(mid1)
app.use(mid2)
app.use(mid3)

app.use(ctx => {
  if (ctx.path === '/favicon.ico')  return

  if (ctx.path === '/') {
    let n = ctx.session.views || 0
    ctx.session.views = ++n
    ctx.body = n + ' 次'
  } else if (ctx.path == '/hi') {
    ctx.body = 'Hi Luke'
  } else {
    ctx.body = '404'
  }
})

app.listen(2338)

// 纯函数：对于唯一的一个输入参数x，一定会输出一个值y。不管调用多少次，只要x相等，那么y一定是相等的。
// 纯函数无副作用，既不依赖，也不会改变全局原来的状态。
function pure(x) {
  return x + 1
}

console.log(pure(1))
console.log(pure(1))

// 尾递归： 函数自己调用自己
// 每次递归时程序都会保存当前方法调用栈。缺点：记录了太多堆栈深度和堆栈状态，浪费性能。
function tail(i) {
  if (i > 3) return
  console.log('修改前1:', i)
  tail(i + 1)
  console.log('修改后1:', i)
}

// 换一种方式
function tail2(i) {
  if (i > 3) return i
  console.log('修改前2:', i)
  return tail2(i + 1)
}

tail(0)
tail2(0)
