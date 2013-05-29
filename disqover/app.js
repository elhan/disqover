
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , Disqus = require('disqus')
  , credentials = require('./credentials.js')
  , path = require('path');

var app = express();

var disqus = new Disqus({
    api_secret : credentials.api_secret,
    api_key : credentials.api_key,
    access_token : credentials.access_token
});

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);


app.get('/posts', function(req, res){

  disqus.request('posts/list', { forum : req.query.forum }, function(data) {
    if (data.error) {
        console.log('Something went wrong...');
    } else {
        console.log(data);
    }
  });
  
});


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});