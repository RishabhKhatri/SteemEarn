var steem = require('steem');
var express = require('express');
var app = express();

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var url = "mongodb://steemearn.api-central.net:27017/steem-earn"

app.set('port', process.env.PORT || 8888);
app.use(express.json());
app.use(express.urlencoded());

app.get('/max/:id', function(req,res){
	ids = req.params.id.split(',');
	averages = new Array();
	for(i=0;i<ids.length;i++)
	{
		averages.push({category: ids[i]});
	}
	MongoClient.connect(url, function(err, db) {
		db.collection('steemit').aggregate(
			[
				{
					$match: {
						$or: averages
					}
				},
				{
					$group: {
						_id: {
							category: "$category",
						},
						avg_votes: {
							$avg: "$net_votes"
						}
					}
				}
			],
		function(err, result)
		{
			res.setHeader('Content-Type', 'application/json');
			res.json(result);
		});
	});
});

app.get('/api/:id', function(req,res){
	ids = req.params.id.split(',');
	nids = new Array();
	for(i=0;i<ids.length;i++)
	{
		nids.push({category: ids[i]});
	}
	MongoClient.connect(url, function(err, db) {
		db.collection('steemit').aggregate(
			[
				{
					$match:
					{
						$or: nids
					}
				},
				{
					$group:
					{
						_id: { date: "$created", category: "$category" },
						avg_price: { $avg: "$net_votes" }
					}
				}
			],
		function(err, result)
		{
			res.setHeader('Content-Type', 'application/json');
			res.json(result);
		});
	});
});

app.listen(8000, function () {
  console.log('Example app listening on port 3000!')
});