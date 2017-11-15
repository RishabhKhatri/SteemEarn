var express = require('express');
var app = express();

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var url = "mongodb://steemearn.api-central.net:27017/steem-earn";

app.set('port', process.env.PORT || 8888);
app.use(express.json());
app.use(express.urlencoded());

var cat = "life";
app.get('/api/:id', function(req,res){

MongoClient.connect(url, function(err, db) {
	db.collection('medium').aggregate(
		[
			{
				$match:
				{
					category: req.params.id
				}
			},
			{
				$group:
				{
					_id: { date: "$firstPublishedAt" },
					avg_claps: { $avg: "$virtuals.totalClapCount" },
					recommends: { $avg: "$virtuals.recommends" }
				}
			}
		], 
		function(err, result)
		{
			res.setHeader('Content-Type', 'application/json');
			res.json(result);
			console.log(result);
		});
	});
});

app.listen(8000, function () {
  console.log('Example app listening on port 8000!')
});