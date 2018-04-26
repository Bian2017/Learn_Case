

## 配置babelrc

### 1. 安装babel
    
    npm i babel-cli babel-preset-env -D
    npm i -S babel-plugin-transform-runtime babel-runtime     //async是ES7的特性，需要配插件。

### 2. 配置.babelrc

```JS
{
  "presets": [
    [
      "env", {                  // 运行环境的描述
        "targets": {
          "node": "current"     // 使用当前node环境
        }
      }
    ]
  ],
  "plugins": [                  // 针对ES7特性，需要安装plugins
    [
      "transform-runtime", {
        "polyfill": false,
        "regenerator": true
      }
    ]
  ]
}
```

### 3. 配置package.json

#### 开发环境配置

    "dev": "nodemon -w src --exec \"babel-node src --presets env\"",

#### 生产环境配置

    "build": "babel src -s -D -d dist --presets env",


