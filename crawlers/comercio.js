var cheerio = require('cheerio');
var moment = require('moment');
var crawlerError = require('../utilities/crawlerError.js');

// moment.updateLocale('es',{
// 	monthsShort : [
// 		'Ene','Feb','Mar','Abr','May','Jun',
// 		'Jul','Ago','Sep','Oct','Nov','Dic'
// 	]
// })

function Crawls(){
	this.base_url = 'http://elcomercio.pe';
	this.id = 'WS-CO-';
}

Crawls.prototype.get_links = function(html){
	var $ = cheerio.load(html);
	var urls = [];
	var base = this.base_url;
	var link_validity = true;
	var link_content = '';
	$('.page-link').each(function(i,link){
		link_validity = true;
		link_content = $(this).attr('href');
		if (link_content == null){
			link_validity = false;
		}
		if ($(this).hasClass('image') || $(this).hasClass('flow-image-link')){
			//En el comercio las imagenes tambien tienen links y muchas veces son repetidos.
			//Queremos descartar links repetidos
			link_validity = false;
		}
		if (link_content != null && link_content.match(/elcomercio\.pe/)){
			//Base de URL repetida. Puede generar confusión y evitar que el crawler 
			//llegue a su destino correcto
			link_validity = false;
		}
		if(link_content != null && link_content.match(/\/(t?l?[u-w]\w+)?(somos)?\//)){
			//No nos interesan links de TV Mas, Luces, Viu, Vamos o Somos.
			link_validity = false;
		}
		if(link_content != null && link_content.match(/$\/\w+-/)){
			//Tampoco nos interesa tener links de Deporte Total o Casa y Mas
			link_validity = false;
		}
		if(link_content != null && link_content.match(/gia\/\w+[j-]\w+\//)){
			//Tampoco nos interesa noticias sobre redes sociales, videojuegos o tecnología movil
			link_validity = false;
		}
		if (link_validity){
			urls.push(base + link_content);
		}
	})
	return urls;
}

Crawls.prototype.extract_content = function(html,url){
	var $ = cheerio.load(html);
	var article = {
		source:url
	}
	article.content = '';
	article.id = this.id + $('body').attr('data-article-id');
	try{
		var parrafos = $('.parrafo.first-parrafo');
		if (parrafos.length < 1){
			throw new crawlerError('No content found');
		}
		for (var i = 0; i < parrafos.length; i++){
			article.content += $(parrafos[i]).text()+' ';
		}
		article.date = moment($('.news-date').attr('datetime'),moment.ISO_8601)
		article.ok = true;
		article.title = $('h1.news-title').text().trim();
		return article;
	} catch(e){
		article.title = '';
		article.content = '';
		article.ok = false;
		return article;
	}
}


module.exports = Crawls;