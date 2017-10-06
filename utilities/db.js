require('dotenv').config()
var mongodb = require('monk')('localhost:'+process.env.MPORT+'/'+process.env.MDB);

function DB(){
	this.articles = mongodb.get('articles');
	this.posts = mongodb.get('posts');
	this.tweets = mongodb.get('tweets');
	this.webpages = mongodb.get('web_pages');
}

DB.prototype.isNew = function(article){
	var conn = this;
	return new Promise(function(resolve, reject){
		conn.articles.find({id:article.id}).then(function(values){
			if (values.length > 0){
				return resolve(false);
			} else {
				return resolve(true);
			}
		})
	})
}

DB.prototype.save = function(article){
	this.articles.insert(article);
}

DB.prototype.extract_articles = function(id, resp){
	this.articles.find({'id':{'$regex':id},'date':{'$regex':'2017-09'}},{limit:10}).then(function(values){
		resp.json(values);
	})
}
DB.prototype.extract_posts = function(id,resp){
	this.posts.find({'from.id':id},{limit:10}).then(function(values){
		resp.json(values);
	})
}
DB.prototype.extract_tweets = function(id,resp){
	this.tweets.find({'user.screen_name':id},{limit:10}).then(function(values){
		resp.json(values);
	})
}

module.exports = DB;