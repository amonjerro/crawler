var cheerio = require('cheerio');
var moment = require('moment');
var crawlerError = require('../utilities/crawlerError.js');

function Crawls(){
	this.base_url = 'http://www.minsa.gob.pe/index.asp';
	this.id = 'WS-MI-';
}

Crawls.prototype.get_links = function(html){
	var $ = cheerio.load(html);
	var urls = [];
	var base = this.base_url
	$('.txt_prensa_lista a.txt2').each(function(i,x){
		urls.push(base + $(this).attr('href'));
	})
	return urls;
}

Crawls.prototype.extract_content = function(html,url){
	var $ = cheerio.load(html);
	var article = {
		source:url
	}
	article.date = moment($('.fecha').text().trim(),'ddd, D MMM YYYY','es');
	article.title = $(".conten > .txt1").text().trim();
	article.content = $('.cont_not').text().trim();
	article.id = this.id + article.source.match(/\d+$/);
	article.ok = article.content != '';
	return article;
}


module.exports = Crawls;