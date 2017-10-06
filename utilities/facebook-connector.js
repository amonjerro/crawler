require('dotenv').config()

var request = require('request');
var Promise = require('promise');
var moment = require('moment');
function Facebook_Connector(){
	this.app = process.env.APP_ID
	this.secret = process.env.APP_SECRET
}

Facebook_Connector.prototype.get_token = function(){
	var connector = this;
	return new Promise(function(resolve, reject){
		if (this.hasOwnProperty('access_token')){
			return resolve();
		}
		request('https://graph.facebook.com/oauth/access_token?client_id='+connector.app+'&client_secret='+connector.secret+'&grant_type=client_credentials',
			function(error,response,body){
				if(body.error){
					connector.status = 0;
					connector.error = error;
					return reject()
				} else {
					body = JSON.parse(body)
					connector.status = 200;
					console.log(body);
					connector.token = body.access_token;
					connector.token_type = body.token_type;
					return resolve()
				}
			});
	})
}

Facebook_Connector.prototype.get_posts = function(id){
	var conn = this;
	var OP;
	return new Promise(function(resolve, reject){
		cursor = 'https://graph.facebook.com/v2.10/'+id+'/posts?fields=from,id,message,created_time&access_token='+conn.token+'&limit=100';
		request(cursor,function(error,response,body){
			if(!error){
				OP = JSON.parse(body);
				if (OP.error != null){
					return reject(OP.error);
				}
				return resolve(OP)
			} else {
				console.log(error);
				return reject(error);
			}
		})
	})
}

Facebook_Connector.prototype.get_reaction = function(post){
	var conn = this;
	return new Promise(function(rsl, rjc){
		var cursor = 'https://graph.facebook.com/v2.10/'+post.id+'?fields=reactions.type(LOVE).limit(0).summary(total_count).as(love_count),reactions.type(LIKE).limit(0).summary(total_count).as(like_count),reactions.type(WOW).limit(0).summary(total_count).as(wow_count),reactions.type(HAHA).limit(0).summary(total_count).as(haha_count),reactions.type(SAD).limit(0).summary(total_count).as(sad_count),reactions.type(ANGRY).limit(0).summary(total_count).as(angry_count)&access_token='+conn.token;
		request(cursor, function(error, response, body){
			var bod = JSON.parse(body);
			if(!body.error){
				return rsl(bod);
			} else {
				return rjc(bod.error);
			}
		}) 
	})
}

Facebook_Connector.prototype.post_reactions = function(id=null,table=null){
	var conn = this;
	var promises = [];
	return new Promise(function(resolve,reject){
		if(id===null){
			return reject("The function requires an ID to query");
		}
		if (table == null){
			return reject("The function requires a table destination to get from");
		}
		conn.get_token().then(function(token){
			table.find({'from.id':id,"created_time":{"$gt":moment().subtract(7,'day').toDate().toISOString()}}).then(function(posts){
				for (var i = 0; i < posts.length; i++){
					promises.push(conn.get_reaction(posts[i]))
				}
				Promise.all(promises).then(values => {
					for (var i = 0; i < values.length; i++){
						if (values[i].hasOwnProperty('error')){
							ao = {'error':values[i].error.message}
						} else {
							ao = {
								angry_count:values[i].angry_count.summary.total_count,
								haha_count:values[i].haha_count.summary.total_count,
								like_count:values[i].like_count.summary.total_count,
								love_count:values[i].love_count.summary.total_count,
								sad_count:values[i].sad_count.summary.total_count,
								wow_count:values[i].wow_count.summary.total_count,
							}
							ao.total = ao.angry_count+ao.haha_count+ao.like_count+ao.love_count+ao.sad_count+ao.wow_count
						}
						posts[i].reactions = ao;
						table.update({"id":posts[i].id},posts[i]);
					}
					return resolve(posts);
				}).catch(function(error){
					console.log(error)
				})
			})
		})
	})
}

Facebook_Connector.prototype.get = function(id=null, table=null){
	var conn = this;
	return new Promise(function(resolve, reject){
		if(id===null){
			return reject("The function requires an ID to query");
		}
		if (table == null){
			return reject("The function requires a table destination to save")
		}
		conn.get_token().then(function(response){
			conn.get_posts(id).then(function(response){
				for (var i = 0; i < response.data.length;i++){
					response.data[i].created_time = moment(response.data[i].created_time).toDate().toISOString();
					if (response.data[i].message != null){
						table.update({"id":response.data[i].id}, {"$set":response.data[i]},{upsert:true});
					}
				}
				return resolve();
			}).catch(function(reason){
				console.log(reason)
				console.log(conn.token)
				console.log(id);
				return reject(reason);
			})
		})

	})
}

module.exports = Facebook_Connector;