var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var get_urls = require('get-urls');
var url = "mongodb://steemearn.api-central.net:27017/steem-earn";
MongoClient.connect(url, function(err, db) {
	assert.equal(null, err);
	db.collection('Links').deleteMany( {}, function(err, results) {
		console.log("DB cleared.");
		db.collection('steemit').find({}, { category: 1, created: 1, body: 1, _id: 0 }, function(err, result) {
			if (err) {
				console.log(err);
			}
			else {
				var count = 0;
				var big_links = [], j=0;
				// console.log(result);
				result.forEach(function(res) {
					// console.log(res);
					string = res.body.split(' ');
					links = [];
					j = 0;
					for (i=0;i<string.length;i++)
					{
						if (string[i].match(/href=[\'"]?([^\'" >]+)/)) {
							links[j++] = string[i].match(/href=[\'"]?([^\'" >]+)/);
						}
					}
					links = links.join(" ").split(",").join(" ");
					try {
						links = get_urls(links);
					}
					catch(err) {
						console.log(err);
					}
					if (links.size!=0) {
						for(var i of links)
						{
							var js = {
								link: i,
								category: res.category,
								date: res.created
							};
							count += 1;
							console.log(count);
							db.collection("Links").insertOne(js);
						}
					}
				});
			}
		});
	});
});
