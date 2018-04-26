'use strict';

// 箭头函数跟父作用域共享this。
var luke = {
  id: 2,
  say: function say() {
    setTimeout(function () {
      console.log('id:', this.id);
    });
  },
  sayWithThis: function sayWithThis() {
    var _ = this;
    setTimeout(function () {
      console.log('this id:', _.id); //这是引用
    }, 500);
  },
  sayWithArrow: function sayWithArrow() {
    var _this = this;

    setTimeout(function () {
      console.log('arrow id', _this.id); //this指向定义时所属的作用域下，而不是运行时的作用域
    }, 1500);
  },
  //定义属性时不要使用箭头函数，因为未定义，此时指向global或者window
  sayWithGlobalArrow: function sayWithGlobalArrow() {
    setTimeout(function () {
      console.log('global arrow id', undefined.id);
    }, 2000);
  }
};

luke.say();
luke.sayWithThis();
luke.sayWithArrow();
luke.sayWithGlobalArrow();
//# sourceMappingURL=5. arrow.js.map