require('dotenv').config();

var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');

function NLUError(message){
	this.message = message;
	this.type = 'NLU Error';
}


function Analyzer(){
	this.nlu = new NaturalLanguageUnderstandingV1({
	    'username' : process.env.NLU_USER,
	    'password' : process.env.NLU_PASSWORD,
	    'version_date' : NaturalLanguageUnderstandingV1.VERSION_DATE_2017_02_27
	});
}

Analyzer.prototype.run_article = function(article,table){
	//Analyze an article through the NLU service.

	//If the article contains no content attribute or has no content, avoid making a useless call to the service.
	if (article.content == '' || article.content == null){
		throw NLUError('Article is devoid of content');
	}

	//If the article has been analyzed before, we should not run a new analysis over it.
	if (article.analysis != null){
		throw NLUError('Article has been run over analysis already');
	}
	console.log("running article");
	//Set up parameters for analysis of article.
	var parameters = {
		text:article.content,
		features:{
			entities:{
				limit:10
			},
			relations:{},
			concepts:{}
		},
		language:'es'
	}

	//Proceed with the analysis call
	this.nlu.analyze(parameters,function(err,response){
		console.log("analyzed");
		if (err){
			console.log(err)
			throw NLUError("NLU Analysis has failed for article");
		} else {
			console.log("run");
			table.update(
				{"id":article.id}, 
				{"$set":{
					analysis:{
						concepts:response.concepts,
						entities:response.entities,
						relations:response.relations
					}
				}});
			return true;
		}
	})
}

Analyzer.prototype.run_post = function(post,table){
		//Analyze an post through the NLU service.

	//If the post contains no content attribute or has no content, avoid making a useless call to the service.
	if (post.message == '' || post.message == null){
		throw NLUError('Post is devoid of content');
	}

	//If the post has been analyzed before, we should not run a new analysis over it.
	if (post.analysis != null){
		throw NLUError('Post has been run over analysis already');
	}

	//Set up parameters for analysis of post.
	var parameters = {
		text:post.message,
		features:{
			entities:{
				limit:10
			},
			relations:{},
			concepts:{}
		},
		language:'es'
	}

	//Proceed with the analysis call
	this.nlu.analyze(parameters,function(err,response){
		if (err){
			console.log(err)
			throw NLUError("NLU Analysis has failed for post");
		} else {
			table.update(
				{"id":post.id}, 
				{"$set":{
					analysis:{
						concepts:response.concepts,
						entities:response.entities,
						relations:response.relations
					}
				}});
			return true;
		}
	})
}

Analyzer.prototype.run_tweet = function(tweet,table){
	//Analyze an tweet through the NLU service.

	//If the tweet contains no content attribute or has no content, avoid making a useless call to the service.
	if (tweet.message == '' || tweet.message == null){
		throw NLUError('Tweet is devoid of content');
	}

	//If the tweet has been analyzed before, we should not run a new analysis over it.
	if (tweet.analysis != null){
		throw NLUError('Tweet has been run over analysis already');
	}

	//Set up parameters for analysis of tweet.
	var parameters = {
		text:tweet.message,
		features:{
			entities:{
				limit:10
			},
			relations:{},
			concepts:{}
		},
		language:'es'
	}

	//Proceed with the analysis call
	this.nlu.analyze(parameters,function(err,response){
		if (err){
			console.log(err)
			throw NLUError("NLU Analysis has failed for tweet");
		} else {
			table.update(
				{"id":tweet.id}, 
				{"$set":{
					analysis:{
						concepts:response.concepts,
						entities:response.entities,
						relations:response.relations
					}
				}});
			return true;
		}
	})
}



module.exports = Analyzer;