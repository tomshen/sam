var path = require('path');

var koa = require('koa');
var route = require('koa-route');
var serve = require('koa-static');
var views = require('co-views');

var render = views('views', {
  map: { html: 'swig' }
});


var app = koa();

app.use(serve(path.join(__dirname, 'static')));

app.use(route.get('/', function *() {
    this.body = yield render('index');
}));

app.listen(3000);
