var cache_module = new require('./cache');
var cache  = new cache_module.Cache({'max_size': 10, 'expire': 10});
var fs = require('fs');

function sleep(sec){
    var t = new Date().valueOf();
    sec *= 1000;
    while (t + sec > (new Date().valueOf())){
    }
}

cache.cache_async(fs.readFile)('t.txt', function(err, data){
    console.log(data.toString());
    sleep(4);
    cache.cache_async(fs.readFile)('t.txt', function(err, data){
        console.log(data.toString());
    });

});

function add(x, y){
    console.log("%d + %d", x, y);
    return x + y;
}

add = cache.cache_sync(add);

console.log(add(1, 24));
console.log(add(1, 24));

