var cheerio = require('cheerio');
var moment = require('moment');

moment.updateLocale('es',{
	monthsShort : [
		'Ene','Feb','Mar','Abr','May','Jun',
		'Jul','Ago','Sep','Oct','Nov','Dic'
	]
})

function Crawls(){
	this.base_url = 'http://www.ccss.sa.cr/';
	this.id = 'WS-CS-';
}

Crawls.prototype.get_links = function(html){
	var $ = cheerio.load(html);
	var urls = [];
	var base = this.base_url;
	$('.carousel-inner a').each(function(index,link){
		urls.push($(this).attr('href'));
	})
	return urls;
}

Crawls.prototype.extract_content = function(html,url){
	var $ = cheerio.load(html);
	var article = {
		source:url
	}
	article.title = $(".mt-15 .box-wrapper h1").text().trim();
	article.content = $('#lecturatext').text().trim();
	article.date = $('.fa.fa-calendar').parent().text().trim();
	article.date = moment().toDate().toISOString();
	if (article.content != ''){
		article.id = this.id + article.content.substr(0,40).match(/[^aeiou \(\)\'\"]/g).join('')
		article.ok = true;
	}
	if (article.date == null){
		article.date = moment().toDate().toISOString();
		article.ok = true;
	}
	return article;
}

module.exports = Crawls;