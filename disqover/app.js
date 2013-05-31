
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , Disqus = require('disqus')
  , _ = require('underscore')
  , path = require('path')
  , request = require('request')
  , Readability = require("readabilitySAX/readabilitySAX.js")
  , Parser = require("readabilitySAX/node_modules/htmlparser2/lib/Parser.js")
  , readable = new Readability({})
  , parser = new Parser(readable, {})
  , credentials = require('./credentials.js')
  , auxiliary = require('./auxiliary.js')
  , users = require('./users.js')
  , routes = require('./routes')
  , articles = require('./routes/articles');

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

var posts = [];
var sum = 0;
var avg = 0;
var threads = [];
var topThreads = [];
var cursor = {};
var noHTML = /(<([^>]+)>)/ig; // regex for removing HTML tags

var disqus = new Disqus({
    api_secret : credentials.api_secret,
    api_key : credentials.api_key,
    access_token : credentials.access_token
});

app.get('/', routes.index);

app.get('/users/top', function(req, res) {
  var topUsers = _.sortBy(users, function(users){return users.numPosts}).slice(90,100).reverse();
  res.render('users-top', {data: topUsers });
  //res.render('avg-posts', { data: {forum: req.query.forum, posts: posts.length, avg: avg} });
});


/* Finds threads for a given forum, fetches it's articles and stores them in the database.
 * Supports pagination.
 */
app.get('/threads', function(req, res) {
  
  //define limit per call, and number of calls
  var limit = 0;
  var calls = 0;
  if(req.query.limit <= 100) {
    limit = req.query.limit;
    calls = 1;
  } else {
    limit = 100;
    calls = auxiliary.calculateCalls(req.query.limit);
  }
  
  if(req.query.limit > 950) {
    console.log('Limit exceeds api quota');
  } else {
  
  	for(var i=0; i<calls; i++) {
	  disqus.request('threads/list', { forum: req.query.forum, cursor: cursor, limit: limit }, function(data) {
	    if (data.error) {
	      console.log('Something went wrong...');
	    } else {
	      data = JSON.parse(data);
	      //update cursor
	      cursor = data.cursor.next;
	      //update limit
	      if(calls*100-req.query.limit<100)
	      limit = calls*100-req.query.limit;
	      _.each(data.response, function(article) {
	      	//get the article for each link
		      	request(article.link,  function (error, response, body) {
		    	  if (!error && response.statusCode == 200) {
		      		parser.write(body);
		      		//store article in database then reset parser
		      		articles.addArticle({ 'title': article.title, 'link': article.link, 'text': readable.getArticle().html.replace(noHTML, "").replace(/\s{2,}/g, ' ')});
		      		parser.reset();
		    	  } 
		  		});
	      });
		}
	  });
	}//for
	}//else
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
      console.log(data.response);
      //console.log(data.response.slice(90,100).reverse());
      
      //get the links from the top 10 articles
      _.each(data.response, function(article) {
      
      	//get the article for each link
      	request(article.link,  function (error, response, body) {
    	  if (!error && response.statusCode == 200) {
      		parser.write(body);
      		console.log(readable.getArticle());
      		//build the response
      		topThreads.push({ forum: req.query.forum, title: article.title, link: article.link, text: readable.getArticle().html.replace(noHTML, "").replace(/\s{2,}/g, ' '),  posts: article.posts, reactions: article.reactions, votes: article.likes+article.dislikes});
      		console.log(topThreads.length); 
      		if(topThreads.length==10){
      		  res.render('threads-top', { data: _.sortBy(topThreads, function(article){return article.reactions+article.votes+article.posts}).reverse() });
      		}
    	  }
  		});
      });
      //res.render('threads-top', { data: {topThreads} });
      topThreads = []; //reset
	}
  });
});


/* Returns the post per thread ratio for a forum. The forum name is
 * passed as the 'forum' parameter in the request.
 */
app.get('/threads/avg', function(req, res) {
  disqus.request('threads/list', { forum : req.query.forum, limit: req.query.limit }, function(data) {
    if (data.error) {
      console.log('Something went wrong...');
    } else {
      data = JSON.parse(data);
      posts = _.pluck(data.response, 'posts');
      sum = _.reduce(posts, function(memo, num){ return memo + num; }, 0);
      avg = sum/posts.length;
      res.render('avg-posts', { data: {forum: req.query.forum, posts: posts.length, avg: avg} });
	  }
	});
});

/*
app.get('posts/top', function(req, res) {
  disqus.request(''
});
*/
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});