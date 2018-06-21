 

## 介绍
我的论坛是以Nodeclub开源项目作为基础和参考，进行动静分离的改造；以restful接口形式给各类客户端提供web服务

web端采用Node.js作为开发语言 MongoDB 作为数据服务 redis做session 持久化；APP端采用appcan做开发，web前端采用
 
## 安装部署

*不保证 Windows 系统的兼容性*

线上跑的是 [Node.js](https://nodejs.org) v4.4.0，[MongoDB](https://www.mongodb.org) 是 v3.0.5，[Redis](http://redis.io) 是 v3.0.3。

```
1. 安装 `Node.js[必须]` `MongoDB[必须]` `Redis[必须]`
2. 启动 MongoDB 和 Redis
3. `$ make install` 安装 Nodeclub 的依赖包
4. `cp config.default.js config.js` 请根据需要修改配置文件
5. `$ make test` 确保各项服务都正常
6. `$ node app.js`
7. visit `http://localhost:3000`
8. done!
```


有任何意见或建议都欢迎提 issue，或者直接提给 [moxunbai](https://github.com/moxunbai)

## License

MIT
