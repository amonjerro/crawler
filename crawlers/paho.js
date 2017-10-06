var cheerio = require('cheerio');
var moment = require('moment');
var crawlerError = require('../utilities/crawlerError.js');

function Crawls(){
	this.base_url = 'http://www.paho.org';
	this.id = 'WS-PA-';
}

Crawls.prototype.get_links = function(html){
	var $ = cheerio.load(html);
	var urls = [];
	var base = this.base_url
	$('.newsfeed a, .mcnews a').each(function(i,x){
		if ($(this).attr('href').charAt(0) != '/'){
			urls.push($(this).attr('href'));	
		} else{
			urls.push(base + $(this).attr('href'));
		}
	})
	return urls;
}

Crawls.prototype.extract_content = function(html,url){
	var $ = cheerio.load(html);
	var article = {
		source:url,
		title: $('.heading h1').text().trim(),
		content: $('.text-block').text().trim()
	}
	article.date = moment($('[name="review_date"]').attr('content'),'YYYY-MM-DD');
	article.id = this.id + article.source.match(/&id=\d+/).join('').substr(4);
	article.ok = article.content != '';
	if (!article.ok){
		article.title = $('h1[itemprop="name"]').text().trim();
		article.content = $('[itemprop="articleBody"]').text().trim();
		article.date = moment();
		article.ok = true;
	}
	return article;
}


module.exports = Crawls;