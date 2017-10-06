var cheerio = require('cheerio');
var moment = require('moment');

function Crawls(){
	this.base_url = 'http://www.efe.com';
	this.id = 'WS-EF-';
}

Crawls.prototype.get_links = function(html){
	var $ = cheerio.load(html);
	var urls = [];
	var base = this.base_url;
	$('.caption a, .resto a').each(function(i,x){
		if (!$(this).attr('href').match(/\/cu\w+\/|\/dep\w+\/|\/tu\w+\//)){
			//No nos interesa deportes, cultura o turismo.
			urls.push(base + $(this).attr('href'))
		}
	});
	return urls;
}

Crawls.prototype.extract_content = function(html,url){
	var $ = cheerio.load(html);
	var article = {
		source:url
	}
	article.date = moment($('[itemprop="datePublished"]').attr('content'),moment.ISO_8601);
	if (article.date == null){
		article.date = moment($('[itemprop="dateModified"]').attr('datetime'),moment.ISO_8601);
	}
	article.id = this.id + url.match(/\d+-\d+/);
	if ($('#div_textos').length > 0){
		article.title = $('h1#titulo').text().trim();
		article.content = $('#div_textos').text().trim();
	}else{
		article.title = $('#div_titulo').text().trim();
		article.content = $('#div_texto').text().trim();
	}
	article.ok = article.content != '';
	if (!article.ok){
		console.log(article.source)
	}
	return article;
}

module.exports = Crawls;