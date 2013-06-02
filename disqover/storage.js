var mongo = require('mongodb');

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;
 
var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('disqus', server);


db.open(function(err, db) {
    if(!err) {
        console.log("Connected to 'disqus' database");
    }
});


exports.addUser = function(user) {
	
	//check if collection exists
	db.collection('users', {strict:true}, function(err, collection) {
        if (err) {
            console.log("The 'users' collection doesn't exist. Creating it with sample data...");
            populateUsers();
        }
    });
	
    db.collection('users', function(err, collection) {
        collection.insert(user, {safe:true}, function(err, result) {
            if (err) {
                console.log({'error':'An error has occurred while inserting the object'});
            } else {
                //console.log('Success: ' + JSON.stringify(result[0]));
                //console.log(result[0]);
                console.log('Success! ');
            }
        });
    });
};


exports.addArticle = function(article) {
	
	//check if collection exists
	 db.collection('articles', {strict:true}, function(err, collection) {
         if (err) {
             console.log("The 'articles' collection doesn't exist. Creating it with sample data...");
             populateArticles();
         }
     });
	 
    console.log('Adding article: ' + JSON.stringify(article));
    db.collection('articles', function(err, collection) {
        collection.insert(article, {safe:true}, function(err, result) {
            if (err) {
                console.log({'error':'An error has occurred while inserting the object'});
            } else {
                //console.log('Success: ' + JSON.stringify(result[0]));
                //console.log(result[0]);
                console.log('Success: ');
            }
        });
    });
};


//TODO
exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving article: ' + id);
    db.collection('articles', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};


//TODO
exports.findAll = function(req, res) {
    db.collection('articles', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
};


//TODO
exports.updateArticle = function(req, res) {
    var id = req.params.id;
    var article = req.body;
    console.log('Updating article: ' + id);
    console.log(JSON.stringify(article));
    db.collection('articles', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, article, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating article: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(article);
            }
        });
    });
};


//TODO
exports.deleteArticle = function(req, res) {
    var id = req.params.id;
    console.log('Deleting article: ' + id);
    db.collection('articles', function(err, collection) {
        collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
};
 
/*--------------------------------------------------------------------------------------------------------------------*/
// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
var populateArticles = function() {

    var articles = [
    {
        title: "google",
        link: "https://www.google.gr/",
        text: "Hello, this is google"
    },
    {
        title: "apple",
        link: "https://www.apple.com/",
        text: "Hello, this is apple"
    }];
 
    db.collection('articles', function(err, collection) {
        collection.insert(articles, {safe:true}, function(err, result) {});
    });
 
};

var populateUsers = function() {

    var users = [
		{ username: 'djstelios',
			  about: '',
			  name: 'Stelios',
			  url: 'http://www.10dailythings.com',
			  joinedAt: '2008-04-08T06:27:06',
			  rep: 1.237601,
			  isFollowing: false,
			  isFollowedBy: false,
			  profileUrl: 'http://disqus.com/djstelios/',
			  emailHash: '804b676acc2ca764d1ae6f4136710738',
			  reputation: 1.237601,
			  location: '',
			  isPrimary: true,
			  isAnonymous: false,
			  id: '20979',
			  avatar: 
			   { small: 
			      { permalink: 'https://disqus.com/api/users/avatars/djstelios.jpg',
			        cache: 'https://securecdn.disqus.com/uploads/users/20979/avatar32.jpg?1369144360' },
			     isCustom: false,
			     permalink: 'https://disqus.com/api/users/avatars/djstelios.jpg',
			     cache: 'https://securecdn.disqus.com/uploads/users/20979/avatar92.jpg?1369144360',
			     large: 
			      { permalink: 'https://disqus.com/api/users/avatars/djstelios.jpg',
			        cache: 'https://securecdn.disqus.com/uploads/users/20979/avatar92.jpg?1369144360' } }, 
		  forum: "dummy"},
			{ username: 'Charbax',
			  about: 'Video-blogger http://ARMdevices.net',
			  name: 'Charbax',
			  url: 'http://ARMdevices.net/',
			  joinedAt: '2008-06-01T02:26:28',
			  rep: 2.559565,
			  isFollowing: false,
			  isFollowedBy: false,
			  profileUrl: 'http://disqus.com/Charbax/',
			  emailHash: '5b013ac7f22e41d6424e48f0a7ba8509',
			  reputation: 2.559565,
			  location: 'Copenhagen Denmark',
			  isPrimary: true,
			  isAnonymous: false,
			  id: '39978',
			  avatar: 
			   { small: 
			      { permalink: 'https://disqus.com/api/users/avatars/Charbax.jpg',
			        cache: 'https://securecdn.disqus.com/uploads/users/3/9978/avatar32.jpg?1365134613' },
			     isCustom: false,
			     permalink: 'https://disqus.com/api/users/avatars/Charbax.jpg',
			     cache: 'https://securecdn.disqus.com/uploads/users/3/9978/avatar92.jpg?1365134613',
			     large: 
			      { permalink: 'https://disqus.com/api/users/avatars/Charbax.jpg',
			        cache: 'https://securecdn.disqus.com/uploads/users/3/9978/avatar92.jpg?1365134613' } },
			  forum: "dummy"}
			        ];
 
    db.collection('users', function(err, collection) {
        collection.insert(users, {safe:true}, function(err, result) {});
    });
 
};