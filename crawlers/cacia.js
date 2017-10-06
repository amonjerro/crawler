var cheerio = require('cheerio');
var moment = require('moment');

function Crawls(){
	this.base_url = 'http://www.cacia.org/';
	this.id = 'WS-CA-';
}

Crawls.prototype.get_links = function(html){
	var $ = cheerio.load(html);
	var urls = [];
	$('.touchcarousel-item h4 a').each(function(i,x){
		urls.push($(this).attr('href'))
	})
	return urls;
}

Crawls.prototype.extract_content = function(html,url){
	var $ = cheerio.load(html);
	var article = {
		source:url,
		title: $('.entry-title').text().trim(),
		content: $('.content p').text().trim(),
		date: moment($('[property="article:published_time"]').attr('content'),moment.ISO_8601)
	}
	article.id = this.id + $('[rel="shortlink"]').attr('href').match(/\d+/);
	article.ok = true;
	return article;
}

module.exports = Crawls;