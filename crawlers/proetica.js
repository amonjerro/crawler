var cheerio = require('cheerio');
var Promise = require('promise');
var moment = require('moment');

var dataSet = [];


function Crawls(){
	this.base_url = 'http://www.proetica.org.pe';
	this.id = 'WS-PE-';
}

//Links obtenidos
Crawls.prototype.get_links = function(html){
	var $ = cheerio.load(html);
	var urls = [];
	var obj = this;
	var posts = $('.post-home');
	for (var i = 0; i < posts.length; i++){
		urls.push(obj.base_url + $(posts[i]).find('a').attr('href'));
		dataSet.push({
				source:obj.base_url + $(posts[i]).find('a').attr('href'),
				date:$(posts[i]).find('.entry-date').text().trim()	
			})
	}
	return urls;
}

Crawls.prototype.extract_content = function(html,url){
	var $ = cheerio.load(html);
	var article = {}
	article.source = url;
	article.ok = false;
	for (var i = 0; i < dataSet.length; i++){
		if ( article.source == dataSet[i].source ){
			console.log(dataSet[i].date);
			article.date = moment(dataSet[i].date, 'MMM DD,YYYY','en');
			article.ok = true;
		}
	}
	article.title = $(".post-title h1").text().trim();
	article.content = $('.article_content').text().trim();
	article.id = this.id + $('[rel="shortlink"]').attr('href').match(/\d+/g)[0];
	return article
}

module.exports = Crawls;