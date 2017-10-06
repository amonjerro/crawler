require('dotenv').config()
var Twitter = require('twitter');
var moment = require('moment');
var request = require('request');

function Twitter_Connector(){
	this.client = new Twitter({
		consumer_key: process.env.TW_CONSUMER_KEY,
    	consumer_secret: process.env.TW_CONSUMER_SECRET,
    	access_token_key: process.env.TW_ACCESS_TOKEN,
    	access_token_secret: process.env.TW_SECRET_TOKEN
	})
}

Twitter_Connector.prototype.get = function(id,table=null){
	conn = this.client
	params = {
		from:id,
		since:moment().subtract(7,'day').format('YYYY-MM-DD '),
        until:moment().add(1,'day').format('YYYY-MM-DD'),
        count:100
	}
	return new Promise(function(resolve,reject){
		conn.get('search/tweets',params,function(error, tweets, response){
			if(error){
				return reject(error);
			}
			for (var i = 0; i < tweets.statuses.length; i++){
				tweets.statuses[i].created_at = moment(tweets.statuses[i].created_at,'ddd MMM DD HH:mm:ss Z YYYY').toDate().toISOString()
				table.update(
					{"id_str":tweets.statuses[i].id_str},
					{'$set':
						{
							id_str:tweets.statuses[i].id_str,
							created_at:tweets.statuses[i].created_at,
							text:tweets.statuses[i].text,
							entities:tweets.statuses[i].entities,
							user:{
								id_str:tweets.statuses[i].user.id_str,
								name:tweets.statuses[i].user.name,
								screen_name:tweets.statuses[i].user.screen_name,
								followers_count:tweets.statuses[i].user.followers_count,
							},
							favorite_count:tweets.statuses[i].favorite_count,
							retweet_count:tweets.statuses[i].retweet_count
						}
					},
					{upsert:true});
			}
			return resolve(tweets);
		})
		
	})
}

Twitter_Connector.prototype.get_embeddable = function(twit_id){
	var url = 'https://publish.twitter.com/oembed?url=https%3A%2F%2Ftwitter.com%2FInterior%2Fstatus%2F'+twit_id+'&hide_media=true';
	return new Promise(function(resolve, reject){
		request(url,function(error,response,body){
			var b = JSON.parse(body)
			return resolve(b);
		})
	})
}

Twitter_Connector.prototype.get_stored = function(handle,limit, table){
	conn = this.client;
	return new Promise(function(resolve, reject){
		table.find({"user.screen_name":handle},{limit:limit}).then(function(values){
			return resolve(values);
		})
	})
}

module.exports = Twitter_Connector;