
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , routes = require('./routes')
  , users = require('./routes/users.js')
  , threads = require('./routes/threads');

var app = express();

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


app.get('/users', users.getUsers);


/* Finds threads for a given forum, fetches it's articles and stores them in the database.
 * Supports pagination.
 */

app.get('/threads', threads.getArticles); 


/* Returns the top 10 threads in a forum. The forum name is passed as the 'forum'
 * parameter in the request. The sum of threads to be examined is passed as
 * the 'limit' parameter.
 */

app.get('/threads/top', threads.topThreads);


/* Returns the post per thread ratio for a forum. The forum name is
 * passed as the 'forum' parameter in the request.
 */

app.get('/threads/avg', threads.avgPostsPerThread);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});