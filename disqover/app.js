
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , Disqus = require('disqus')
  , credentials = require('./credentials.js')
  , _ = require('underscore')
  , path = require('path');

var app = express();
var posts = [];
var sum = 0;
var avg = 0;

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


/* Returns the top 10 threads in a forum. The forum name is passed as the 'forum'
 * parameter in the request. The sum of threads to be examined is passed as
 * the 'limit' parameter.
 */
app.get('/threads/top', function(req, res) {
  disqus.request('threads/list', { forum : req.query.forum, limit: req.query.limit}, function(data) {
    if (data.error) {
      console.log('Something went wrong...');
    } else {
      data = JSON.parse(data);
      data.response = _.sortBy(data.response, function(thread){return thread.posts+thread.likes+thread.dislikes+thread.reactions;});
      console.log(data.response.slice(91,100).reverse());
	}
  });
});


/* Returns the post per thread ratio for a forum. The forum name is
 * passed as the 'forum' parameter in the request.
 */
app.get('/threads/avg', function(req, res) {
  disqus.request('threads/list', { forum : req.query.forum, limit: 100 }, function(data) {
    if (data.error) {
      console.log('Something went wrong...');
    } else {
      data = JSON.parse(data);
      posts = _.pluck(data.response, 'posts');
      sum = _.reduce(posts, function(memo, num){ return memo + num; }, 0);
      avg = sum/posts.length;
      console.log(avg);
      res.send({posts:posts.length, avg: avg});
	  }
	});
});


/* Returns the most active users in a specific forum. The forum name is
 * passed as the 'forum' parameter in the request.
 */
app.get('users/mostActive', function(req, res) {
  disqus.request('forums/listMostLikedUsers', { forum : req.query.forum }, function(data) {
    if (data.error) {
      console.log('Something went wrong...');
    } else {
      data = JSON.parse(data);
      console.log(data.response);
      //res.send({posts:posts.length, avg: avg});
    }
  });
});


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});