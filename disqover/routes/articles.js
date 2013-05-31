var mongo = require('mongodb');

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;
 
var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('disqus', server);


db.open(function(err, db) {
    if(!err) {
        console.log("Connected to 'disqus' database");
        db.collection('articles', {strict:true}, function(err, collection) {
            if (err) {
                console.log("The 'articles' collection doesn't exist. Creating it with sample data...");
                populateDB();
            }
        });
    }
});


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
 
 
exports.addArticle = function(article) {
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
}


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
}


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
}
 
/*--------------------------------------------------------------------------------------------------------------------*/
// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
var populateDB = function() {

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