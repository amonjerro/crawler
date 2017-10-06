var cheerio = require('cheerio');
var moment = require('moment');

function Crawls(){
	this.base_url = 'http://www.who.int';
	this.id = 'WS-WH-';
}

Crawls.prototype.get_links = function(html){
	var $ = cheerio.load(html);
	var urls = [];
	var base = this.base_url;
	$('.auto_archive a').each(function(i,x){
		urls.push(base + $(this).attr('href'))
	})
	return urls;
}

Crawls.prototype.extract_content = function(html,url){
	var $ = cheerio.load(html);
	var article = {
		source:url,
		title: $("h1.headline").text().trim(),
		content: $('#primary > p').text().trim(),
		date: moment($('[name="DC.date.published"]').attr('content'),'YYYY-MM-DD HH:mm:ss')
	}
	article.id = this.id + $('[name="webit_document_id"]').attr('content');
	article.ok = article.content != '';
	return article;
}

module.exports = Crawls;