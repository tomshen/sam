var path = require('path');

var koa = require('koa');
var logger = require('koa-logger');
var route = require('koa-route');
var serve = require('koa-static');
var views = require('co-views');

var port = Number(process.env.PORT || 3000);
var soundcloudClientId = process.env.SOUNDCLOUD_CLIENT_ID;
var soundcloudRedirectUri = process.env.SOUNDCLOUD_REDIRECT_URI;

var render = views('views', {
  map: { html: 'swig' }
});

var app = koa();

app.use(logger());

app.use(serve(path.join(__dirname, 'static')));

app.use(route.get('/', function *() {
  this.body = yield render('index', {
    soundcloudClientId: soundcloudClientId,
    soundcloudRedirectUri: soundcloudRedirectUri
  });
}));

app.listen(port);
console.log('App now running on port ' + port);
