## Koa      

  核心服务：接收客户端请求、解析、响应、中间件、执行上下文(HTTP请求周期内的作用域环境，来托管请求响应和中间件，方便它们之间互相访问)。

```
Application       Context
Request           Response
Middlewares
Session           Cookie
```

### Koa源码解读

  如何解读源码：通过删减法读源码，把非核心、不影响流程的代码干掉，然后看代码核心解决了什么问题。

#### 1. application.js核心源码解读

```JS
// 判断当前的function是否是标准的generator function
const isGeneratorFunction = require('is-generator-function');
// 轻量级的js debug调试工具
const debug = require('debug')('koa:application');
// 事件监听：当HTTP请求关闭完成或者出错时调用注册函数
const onFinished = require('on-finished');
// 响应请求
const response = require('./response');
// 中间件的函数数组，koa所有的中间件必须是中间件数组。koa-compose实现特别精妙，建议读下源码
const compose = require('koa-compose');
// 判断数据是否是JSON数据
const isJSON = require('koa-is-json');
// 整个运行服务的上下文，不仅可以访问HTTP来源的携带信息，也可以访问向用户返回数据的一些属性和方法
const context = require('./context');
// 客户端的请求以及所携带的数据
const request = require('./request');
// 请求的状态码
const statuses = require('statuses');
// 通常记录用户信息，做一些业务埋点
const Cookies = require('cookies');
// 约定哪些数据可以被服务器端接收，涉及到内容协商，主要是协议和资源的控制
const accepts = require('accepts');
// 事件循环：在特定的时机触发动作，动作会触发某个主题或者执行某个注册函数
const Emitter = require('events');
// 断言：判断代码执行结果是否符合预期
const assert = require('assert');
// 持续流动的数据
const Stream = require('stream')
// NodeJS最核心的模块，针对HTTP协议封装的上层web接口
const http = require('http');
// 白名单选择，把对象中的某些key给过滤出来
const only = require('only');
// 针对老些koa的generator中间件做兼容，转化成标准的promise中间件
const convert = require('koa-convert');
// 简单判断当前koa某些接口或者方法是否废弃，然后给出升级提示
const deprecate = require('depd')('koa');


// 最核心：暴露一个类，通过这个类new一个新实例
module.exports = class Application extends Emitter {
  constructor() {
    super();

    this.proxy = false;
    this.middleware = [];
    this.subdomainOffset = 2;
    this.env = process.env.NODE_ENV || 'development';
    this.context = Object.create(context);
    this.request = Object.create(request);
    this.response = Object.create(response);
  }

  listen(...args) {
    const server = http.createServer(this.callback());      //生成了一个服务器实例
    return server.listen(...args);
  }

  use(fn) {           
    this.middleware.push(fn);     //把中间件推到中间件数组里
    return this;
  }

  callback() {
    const fn = compose(this.middleware);      //通过compose处理整个中间件数组

    const handleRequest = (req, res) => {     //把当前的req、res生成一个上下文，
      const ctx = this.createContext(req, res);
      return this.handleRequest(ctx, fn);
    };

    return handleRequest;
  }

  // 先把整个请求的上下文对象交给中间件数组，中间件进行处理，然后将处理结果传给handleResponse。
  // 最后由handleResponse来负责返回客户端特定数据
  handleRequest(ctx, fnMiddleware) {
    const res = ctx.res;
    res.statusCode = 404;
    const onerror = err => ctx.onerror(err);
    const handleResponse = () => respond(ctx);
    onFinished(res, onerror);
    return fnMiddleware(ctx).then(handleResponse)     //中间件数组处理整个链路，然后把处理结果传给handleResponse
  }

  // 把上面这些对象挂载来挂载去，方便访问进来或者出去的请求
  createContext(req, res) {
    const context = Object.create(this.context);
    // 把request、response的方法属性全部汇聚到context上
    const request = context.request = Object.create(this.request);
    // 注意Object.create和new的区别
    const response = context.response = Object.create(this.response);
    context.app = request.app = response.app = this;
    context.req = request.req = response.req = req;
    context.res = request.res = response.res = res;
    request.ctx = response.ctx = context;
    request.response = response;
    response.request = request;
    context.originalUrl = request.originalUrl = req.url;
    context.cookies = new Cookies(req, res, {
      keys: this.keys,
      secure: request.secure
    });
    request.ip = request.ips[0] || req.socket.remoteAddress || '';
    context.accept = request.accept = accepts(req);
    context.state = {};
    return context;
  }
};

// 向客户端返回数据
function respond(ctx) {
  // allow bypassing koa
  if (false === ctx.respond) return;

  const res = ctx.res;
  if (!ctx.writable) return;

  let body = ctx.body;
  const code = ctx.status;

  // ignore body
  if (statuses.empty[code]) {
    // strip headers
    ctx.body = null;
    return res.end();
  }

  if ('HEAD' == ctx.method) {
    if (!res.headersSent && isJSON(body)) {
      ctx.length = Buffer.byteLength(JSON.stringify(body));
    }
    return res.end();
  }

  // status body
  if (null == body) {
    body = ctx.message || String(code);
    if (!res.headersSent) {
      ctx.type = 'text';
      ctx.length = Buffer.byteLength(body);
    }
    return res.end(body);
  }

  // responses
  if (Buffer.isBuffer(body)) return res.end(body);
  if ('string' == typeof body) return res.end(body);
  if (body instanceof Stream) return body.pipe(res);

  // body: json
  body = JSON.stringify(body);
  if (!res.headersSent) {
    ctx.length = Buffer.byteLength(body);
  }
  res.end(body);
}
```

#### 2. context.js核心源码解读

```JS
const util = require('util');
const createError = require('http-errors');
const httpAssert = require('http-assert');
// 代理委托
const delegate = require('delegates');
const statuses = require('statuses');

// 暴露出去一个普通对象，里面放置了一些工具类方法
const proto = module.exports = {
  inspect() {
    if (this === proto) return this;
    return this.toJSON();
  },

  //JSON化的处理
  toJSON() {
    return {
      request: this.request.toJSON(),
      response: this.response.toJSON(),
      app: this.app.toJSON(),
      originalUrl: this.originalUrl,
      req: '<original node req>',
      res: '<original node res>',
      socket: '<original node socket>'
    };
  },
};

// 把response的方法挂载到proto上
delegate(proto, 'response')
  .method('attachment')
  .method('redirect')
  .method('remove')
  .method('vary')
  .method('set')
  .method('append')
  .method('flushHeaders')
  .access('status')
  .access('message')
  .access('body')
  .access('length')
  .access('type')
  .access('lastModified')
  .access('etag')
  .getter('headerSent')
  .getter('writable');

// 把request的方法挂载到proto上
delegate(proto, 'request')
  .method('acceptsLanguages')
  .method('acceptsEncodings')
  .method('acceptsCharsets')
  .method('accepts')
  .method('get')
  .method('is')
  .access('querystring')
  .access('idempotent')
  .access('socket')
  .access('search')
  .access('method')
  .access('query')
  .access('path')
  .access('url')
  .getter('origin')
  .getter('href')
  .getter('subdomains')
  .getter('protocol')
  .getter('host')
  .getter('hostname')
  .getter('URL')
  .getter('header')
  .getter('headers')
  .getter('secure')
  .getter('stale')
  .getter('fresh')
  .getter('ips')
  .getter('ip');
```

#### 3. koa-compose核心源码解读

  koa-compose管理着koa的所有中间件队列。

```JS
function compose (middleware) {
  // compose函数调用后，返回的是以下这个匿名函数
  // 匿名函数接收两个参数，第一个随便传入，根据使用场景决定
  // 第一次调用时候第二个参数next实际上是一个undefined，因为初次调用并不需要传入next参数
  // 这个匿名函数返回一个promise
  return function (context, next) {     //next可以看出是钩子或者回调函数，可以串联到下一个中间件。
    let index = -1
    return dispatch(0)

    function dispatch (i) {
      // 如果传入i为负数且<=-1 返回一个Promise.reject携带着错误信息
      // 所以执行两次next会报出这个错误。将状态rejected，就是确保在一个中间件中next只调用一次
      if (i <= index) return Promise.reject(new Error('next() called multiple times'))      
      index = i
      let fn = middleware[i]      // 根据下标取出一个中间件函数
      // next在这个内部中是一个局部变量，值为undefined
      // 当i已经是数组的length了，说明中间件函数都执行结束，执行结束后把fn设置为undefined
      // 问题：本来middleware[i]如果i为length的话取到的值已经是undefined了，为什么要重新给fn设置为undefined呢？
      if (i === middleware.length) fn = next
      
      // 如果中间件遍历到最后了。那么。此时return Promise.resolve()返回一个成功状态的promise
      // 方面之后做调用then
      if (!fn) return Promise.resolve()

      // 调用后依然返回一个成功的状态的Promise对象
      // 用Promise包裹中间件，方便await调用
      // 调用中间件函数，传入context（根据场景不同可以传入不同的值，在Koa传入的是ctx）
      // 第二个参数是一个next函数，可在中间件函数中调用这个函数
      // 调用next函数后，递归调用dispatch函数，目的是执行下一个中间件函数
      // next函数在中间件函数调用后返回的是一个promise对象
      // 读到这里不得不佩服作者的高明之处。
      try {
        return Promise.resolve(fn(context, function next () {
          return dispatch(i + 1)
        }))
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}
```
