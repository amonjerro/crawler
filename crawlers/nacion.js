var cheerio = require('cheerio');
var moment = require('moment');

function Crawls(){
	this.base_url = 'http://www.nacion.com';
	this.id = 'WS-NA-';
}

Crawls.prototype.get_links = function(html){
	var $ = cheerio.load(html);
	var urls = [];
	var base = this.base_url;
	//La regex \/[dbo][^p] filtra noticias de deporte, ocio y brandview

	$('.nws a.lnk').each(function(i,x){
		if (!$(this).attr('href').match(/\/[dbo][^p]/)){
			urls.push(base + $(this).attr('href'));
		}
	})
	$('.md-columnist-content-title a').each(function(i,x){
		if (!$(this).attr('href').match(/\/[dbo][^p]/)){
			urls.push(base + $(this).attr('href'));
		}
	})
	$('.md-columnist-content-title a').each(function(i,x){
		if (!$(this).attr('href').match(/\/[dbo][^p]/)){
			urls.push(base + $(this).attr('href'));
		}
	})
	$('a.lnk.lnk_uh').each(function(i,x){
		if (!$(this).attr('href').match(/\/[dbo][^p]/)){
			urls.push(base + $(this).attr('href'));
		}
	})
	$('a.lnk.lnk_masleido').each(function(i,x){
		if (!$(this).attr('href').match(/\/[dbo][^p]/)){
			urls.push(base + $(this).attr('href'));
		}
	})
	$('.md-print-edition a').each(function(i,x){
		if (!$(this).attr('href').match(/\/[dbo][^p]/)){
			urls.push(base + $(this).attr('href'));
		}
	})
	return urls;
}

Crawls.prototype.extract_content = function(html,url){
	var $ = cheerio.load(html);
	var article = {
		source:url,
		title: $('h1.headline_title').text().trim(),
		content: $('.mce').text(),
		date:moment($('[name="article:modified_time"]').attr('content'),moment.ISO_8601),
	}
	article.id = this.id + $('[name="content_id"]').attr('content');
	if (article.content != ''){
		article.ok = true;
		return article;
	}
	article.content = $('#LND_AP_content p').text().trim();
	if (article.content != ''){
		article.ok = true;
		return article;
	}
	article.content = $('main p').text().trim();
	if (article.content != ''){
		article.ok = true;
		return article;
	}
	article.ok = false;
	return article;
}

module.exports = Crawls;