# nodejs-cache

## 介绍:
缓存函数的执行结果，可以设置过期时间，也可以设置缓存队列长度。当超过长度限制时，老的缓存会被删除。

## 使用:
首先需要加载下
> `var cache_module = new require('./cache');` 

实例化一个对象:
> `var cache  = new cache_module.Cache({'max_size': 10, 'expire': 2})`

异步调用:
> `cache.cache_async(func)(args)`

同步调用
> `cache.cache_sync(func)(args)`



