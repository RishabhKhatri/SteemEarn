var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var request = require('request');
var url = "mongodb://steemearn.api-central.net:27017/steem-earn";
var params = process.argv[2];
var medium_url = "https://medium.com/search/posts?q="+params;

MongoClient.connect(url, function(err, db) {
	assert.equal(null, err);
	// db.collection('medium').deleteMany( {}, function(err, results) {
	// 	console.log("DB cleared.");
	// });
	request.post({
		url: medium_url,
		headers: {
			"Host": "medium.com",
			"Origin": "https://medium.com",
			"X-XSRF-Token": "1",
			"Content-Type": "application/json",
			"Accept": "application/json",
			"Accept-Language": "en-US,en;q=0.9,hi;q=0.8",
			"Cache-Control": "no-cache"
		},
		body: '{"page": 1, "pageSize": 10}'
	}, function(err, response, body) {
		if (err) {
			console.log(err);
		}
		else {
			result = JSON.parse(body.replace("])}while(1);</x>", ""));
			for(i=0;i<result.payload.value.length;i++)
			{
				result.payload.value[i]['category'] = params;
				result.payload.value[i].firstPublishedAt = new Date(result.payload.value[i].firstPublishedAt);
				result.payload.value[i].firstPublishedAt.setHours(0, 0, 0, 0);
				// console.log(result.payload.value[i].firstPublishedAt);
				// console.log(result.payload.value[i]);
			}
			db.collection('medium').insert(result.payload.value, function(err) {
				if (err) {
					console.log(err);
				}
				else
				{
					paging(result, 1);
				}
			});
		}
	});

	function paging(result, flag)
	{
		if (flag==100) {
			console.log("Done");
			db.close();
			return;
		}
		var body_content = '{"ignoredIds": [';
		var ignoredIds = result.payload.paging.next.ignoredIds;
		for(i=0;i<ignoredIds.length;i++)
		{
			if (i==ignoredIds.length-1) {
				body_content += '"' + ignoredIds[i] + '"';
			}
			else
			{
				body_content += '"' + ignoredIds[i] + '", ';
			}
		}
		body_content += '], ';
		body_content += '"page": ' + result.payload.paging.next.page;
		body_content += ', "pageSize": 10}';
		console.log(body_content);
		request.post({
			url: medium_url,
			headers: {
				"Host": "medium.com",
				"Origin": "https://medium.com",
				"X-XSRF-Token": "1",
				"Content-Type": "application/json",
				"Accept": "application/json",
				"Accept-Language": "en-US,en;q=0.9,hi;q=0.8",
				"Cache-Control": "no-cache"
			},
			body: body_content
		}, function(err, response, body) {
			if (err) {
				console.log(err);
			}
			else
			{
				result = JSON.parse(body.replace("])}while(1);</x>", ""));
				for(i=0;i<result.payload.value.length;i++)
				{
					result.payload.value[i]['category'] = params;
					result.payload.value[i].firstPublishedAt = new Date(result.payload.value[i].firstPublishedAt);
					result.payload.value[i].firstPublishedAt.setHours(0, 0, 0, 0);
				}
				db.collection('medium').insert(result.payload.value, function(err) {
					if (err) {
						console.log(err);
					}
					else
					{
						paging(result, flag+1);
					}
				});
			}
		});
	}
});
