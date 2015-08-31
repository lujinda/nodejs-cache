var crypto = require('crypto');

function CacheModel(options) {
    this._max_size = options.max_size || 10; // 设置最多缓存多少条数据
    this._expire = options.expire || 600; // 缓存过期时间
    this.clearup = function(){
        var now = new Date().valueOf();
        for (var index in this._cache_queue){
            var key = this._cache_queue[index];
            if (this._cache_expire[key] < now){
                this._cache_queue.shift();
                this.flush_key(key);
            }else{
                break;
            }
        }

        while (this._cache_queue.length > this._max_size){
            var key = this._cache_queue.shift();
            this.flush_key(key);
        }
    };
    this.get = function(key){
        this.clearup();
        return this._cache_data[key];
    };

    this.set = function(key, value, expire){
        var now = new Date().valueOf();
        this.flush_key(key);
        expire = this._expire || expire;
        this._cache_data[key] = value;
        this._cache_expire[key] = expire  * 1000 + now;
        this._cache_queue.push(key);
        this.clearup();
    }

    this.flush_key = function(key){
        var key_index = this._cache_queue.indexOf(key);
        if (key_index != -1){
            this._cache_queue.splice(key_index);
        }
        delete this._cache_data[key];
        delete this._cache_expire[key];
    };

    this.flush_all = function(){
        this.init();
    };

    this.cache_sync = function(func, expire, key){
        var _cache_model = this;
        this.sync_wrap = function(){
            var args = Array.prototype.slice.call(arguments);
            var _key = key || func.name + ':' + generate_key(args);
            var _cache = _cache_model.get(_key); // 在这里不能用this了，因为这是被外部调用的，this是由调用上下文决定的。
            if (_cache !== undefined){
                return _cache;
            }else{
                var _result = func.apply(null, args);
                _cache_model.set(_key, _result, expire);
                return _result;
            }
        };
        return this.sync_wrap;
    };

    this.cache_async = function(func, expire, key){
        var _cache_model = this;
        this.async_wrap  = function(){
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop(); // 回调函数不参于key的生成
            var _key = key || func.name + ':' + generate_key(args);
            var _cache = _cache_model.get(_key);
            if (_cache != undefined){ // 如果在cache中已经存有数据了，则直接调回调函数
                console.log('in cache');
                callback.apply(null, _cache);
            }else{ // 把用户传入的那个回调函数用下面这个匿名函数替换掉
                args.push(function (){
                    var callback_args = Array.prototype.slice.call(arguments);
                    _cache_model.set(_key, callback_args, expire);
                    callback.apply(null, callback_args);
                });
                func.apply(null, args);
            }
        };
        return this.async_wrap;
    };
    this.init();

};


function generate_key(args, md5){
    var _md5 = md5 || crypto.createHash('md5');
    for (var i in args){
        var arg = args[i];
        if (typeof(arg) == 'object'){
            generate_key(arg, _md5);
        }else{
            _md5.update(i + arg.toString());
        }
    }
    if (!md5){
        return _md5.digest('hex');
    }
}

CacheModel.prototype = {
    init: function(){
        this._cache_queue =  [];
        this._cache_data = {};
        this._cache_expire = {};
    }
}



module.exports.Cache = CacheModel;

