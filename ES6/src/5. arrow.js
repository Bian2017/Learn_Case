// 箭头函数跟父作用域共享this。
const luke = {
  id: 2,
  say: function () {
    setTimeout(function () {
      console.log('id:', this.id)
    })
  },
  sayWithThis: function () {
    let _ = this;
    setTimeout(function () {
      console.log('this id:', _.id)               //这是引用
    }, 500)
  },
  sayWithArrow: function () {
    setTimeout(() => {
      console.log('arrow id', this.id)            //this指向定义时所属的作用域下，而不是运行时的作用域
    }, 1500)
  },
  //定义属性时不要使用箭头函数，因为未定义，此时指向global或者window
  sayWithGlobalArrow: () => {                   
    setTimeout(() => {
      console.log('global arrow id', this.id)
    }, 2000)
  }
}

luke.say()
luke.sayWithThis()
luke.sayWithArrow()
luke.sayWithGlobalArrow()