require('dotenv').config();

var env = JSON.parse(process.env.VCAP_SERVICES);
var mongoURI = env["compose-for-mongodb"][0]["credentials"]["uri"];
var mongoSSLCA = env["compose-for-mongodb"][0]["credentials"]["ca_certificate_base64"];
var options = {
    ssl: true,
    sslCA: mongoSSLCA,
};
var mongodb = require('monk')(mongoURI, options);

function DB(){
	this.articles = mongodb.get('articles');
	this.posts = mongodb.get('posts');
	this.comments = mongodb.get('comments');
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