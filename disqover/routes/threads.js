var Disqus = require('disqus')
  , _ = require('underscore')
  , request = require('request')
  , Readability = require("readabilitySAX/readabilitySAX.js")
  , Parser = require("readabilitySAX/node_modules/htmlparser2/lib/Parser.js")
  , readable = new Readability({})
  , parser = new Parser(readable, {})
  , credentials = require('../credentials.js')
  , auxiliary = require('../auxiliary.js')
  , storage = require('../storage.js');

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

exports.getArticles = function(req, res) {
  
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
		      		console.log(article.title);
		      		//store article in database then reset parser
		      		//storage.addArticle({ 'title': article.title, 'link': article.link, 'text': readable.getArticle().html.replace(noHTML, "").replace(/\s{2,}/g, ' ')});
		      		parser.reset();
		    	  } 
		  		});
	      });
		}
	  });
	}//for
	
	}//else
}

exports.topThreads = function(req, res) {
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
}

exports.avgPostsPerThread = function(req, res) {
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
}