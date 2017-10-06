var cheerio = require('cheerio');
var moment = require('moment');

moment.updateLocale('es',{
	months: [
		'enero','febrero','marzo','abril','mayo','junio',
		'julio','agosto','septiembre','octubre','noviembre','diciembre'
	]
})

function Crawls(){
	this.base_url = 'http://www.un.org/spanish/News/';
	this.id = 'WS-UN-';
}

Crawls.prototype.get_links = function(html){
	var $ = cheerio.load(html);
	var urls = [];
	var base = this.base_url;
	var address = '';
	var displacer = '/spanish/News/';
	var displacer_len = displacer.length;
	var listed_IDs = [];
	$('#newscontent p a, #newscontent h4 a').each(function(i,x){
		address = $(this).attr('href');
		if (address.search(displacer) !== -1){
			address = address.substr(displacer_len);
		}
		urls.push(base + address);
	})
	return urls;
}

Crawls.prototype.extract_content = function(html,url){
	var $ = cheerio.load(html);
	var article = {
		source:url
	}
	var article_text = $('#fullstory p').text();
	var divider = article_text.search('—');
	var date_text = article_text.substr(0,divider-1);
	var month_comma = date_text.search(',');
	article.content = article_text.substr(divider+1).trim();
	article.title = $("h4#story-headline").text().trim();
	article.date = moment(article_text.substr(0,2)+' '+date_text.slice(6,month_comma)+' '+date_text.substr(month_comma+1).trim(),'DD MMMM YYYY','es');
	article.id = this.id+url.match(/\d+/)
	if (article.content != ''){
		article.ok = true;
	} else {
		article.ok = false;
	}
	return article;
}

module.exports = Crawls;