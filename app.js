var steem = require('steem');

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var url = "mongodb://steemearn.api-central.net:27017/steem-earn";

MongoClient.connect(url, function(err, db) {
	assert.equal(null, err);
	db.collection('steemit').deleteMany( {}, function(err, results) {
		console.log("DB cleared.");
		// callback();
	});
	var oldestPermLink = ""
	var oldestAuthor = ""
	steem.api.getDiscussionsByCreated({"tag": "life", "limit": 100}, function(err, result) {
	    if (err === null) {
	        var j, len = result.length;
	        for (j = 0; j < len; j++) {
	            var discussion = result[j];
	            discussion.created = discussion.created.substr(0, 10);
				db.collection('steemit').insert( discussion, function(err, results, callback) {
					// console.log("Inserted a document into the restaurants collection.");
					// callback();
				});
	            // console.log(j, discussion);
	            // Store the last permlink and author
	            if (j == len - 1) {
	                oldestPermLink = discussion.permlink;
	                oldestAuthor = discussion.author;
	            }
	        }
	        console.log('--------------------------------------------------');
	    	console.log(oldestPermLink, oldestAuthor);
	    	lol(1, 300);

	    } else {
	        console.log(err);
	    }
	});

	function lol(x, limit)
	{
		if (x>limit) {
			console.log(x);
			return;
		}
		// console.log("hello " + x);
		steem.api.getDiscussionsByCreated({"tag": "life", "limit": 100, "start_permlink": oldestPermLink, "start_author": oldestAuthor}, function(err, result) {
			if (err) {
				console.log(err);
			}
			else
			{
				var i, len = result.length;
		        for (i = 0; i < len; i++) {
		            var discussion = result[i];
		            discussion.created = discussion.created.substr(0, 10);
		            db.collection('steemit').insert( discussion, function(err, results, callback) {
						// console.log("Inserted a document into the restaurants collection.");
						// callback();
					});
		            // console.log(i, discussion);
		            // Store the last permlink and author
		            if (i == len - 1) {
		                oldestPermLink = discussion.permlink;
		                oldestAuthor = discussion.author;
		            }
		        }
		        console.log('--------------------------------------------------');
				console.log(oldestPermLink, oldestAuthor);
				lol(x+1, limit);
			}
		});
	}
	console.log("Connected correctly to server.");
	// db.close();
});
