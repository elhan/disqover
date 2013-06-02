var Disqus = require('disqus')
  , _ = require('underscore')
  , request = require('request')
  , credentials = require('../credentials.js')
  , auxiliary = require('../auxiliary.js')
  , storage = require('../storage.js');

var disqus = new Disqus({
    api_secret : credentials.api_secret,
    api_key : credentials.api_key,
    access_token : credentials.access_token
});


exports.getUsers = function(req,res) {
  
  //initialize cursor
  var cursor = {};
  var forum = req.query.forum;
  makeCall(cursor);
  
  function makeCall(cursor) {
    disqus.request('forums/listUsers', { forum: forum, cursor: cursor, limit: 100 }, function(data) {
      console.log('making request...');
      if (res.error) {
        console.log('Something went wrong...');
      } else {
        console.log('calls remaining:...'+data.limit);
        data.body = JSON.parse(data.body);
        
        _.each(data.body.response, function(user) {
          user.forum = req.query.forum;
          storage.addUser(user);
        });
      }
      if(data.limit > 0 && data.body.cursor.hasNext) {
        makeCall(data.body.cursor.next);
      } else {
        console.log('limits reached or no more users to fetch');
      }
    });
  }
};