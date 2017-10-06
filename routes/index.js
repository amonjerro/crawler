const express = require('express');
const router = express.Router();
const Promise = require('promise');
const request = require('request');
const bodyParser = require('body-parser');
const db = require('../utilities/db.js');
const fb = require('../utilities/facebook-connector.js');
const tw = require('../utilities/twitter_connector.js');
const nlu = require('../utilities/nlu_wrapper.js');
const fs = require('fs');

const FB_CONN = new fb();
const CONN = new db();
const TW_CONN = new tw();
const NLU_CONN = new nlu();

// router.use(function(req,res,next){
// 	console.log(req.method +' method received for URL: ' + req.url);
// 	next();
// })

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}))

router.get('/', function(req, res) {
  res.render('home');
});

router.get('/crawl/urls',function(req,resp){
	var urls = [
		{url:'http://www.proetica.org.pe/',source:'proetica'}, //0
		{url:'http://www.ccss.sa.cr/',source:'ccss'}, //1
		{url:'http://elcomercio.pe',source:'comercio'}, //2
		{url:'http://www.nacion.com/',source:'nacion'}, //3
		{url:'http://www.un.org/spanish/News/',source:'un'}, //4
		{url:'http://www.who.int/mediacentre/es/',source:'who'}, //5
		{url:'http://www.cacia.org/',source:'cacia'}, //6
		{url:'https://www.efe.com/efe/cono-sur/9',source:'efe'}, //7
		{url:'http://www.minsa.gob.pe/index.asp?op=5#Prensa',source:'minsa'}, //8
		{url:'http://www.paho.org/hq/index.php?option=com_content&view=article&id=964&Itemid=958&lang=es',source:'paho'} //9
	];
	resp.json(urls);
})

router.get('/crawl/facebook',function(req,resp){
	var users = [
		{userId:'393255887419653',fullName:'Contribuyentes Por Respeto', userName:'cpr.pe'}, //0
		{userId:'239988804218',fullName:'Defensoría del Pueblo Perú', userName:'defensoriaperu'}, //1
		{userId:'238168552902723',fullName:'Seguro Social de Salud del Perú - EsSalud', userName:'EsSaludPeruOficial'}, //2
		{userId:'340706806078141',fullName:'SUSALUDPerú', userName:'susalud.peru'}, //3
		{userId:'89613772643',fullName:'CNN en Español', userName:'CNNee'}, //4
		{userId:'233762686665234',fullName:'Congreso de la República del Perú', userName:'CongresoPeru'}, //5
		{userId:'198440935694',fullName:'ANASOVI', userName:'ANASOVI'}, //6
		{userId:'94604237016',fullName:'Diario La República', userName:'larepublicape'}, //7
		{userId:'50842855867',fullName:'Perú21.pe', userName:'peru21'}, //8
		{userId:'116942331674902',fullName:'Glenda Umaña',userName:'GlendaUmanaH'}, //10
		{userId:'119189668150973',fullName:'Semanario Universidad', userName :'sem.universidad'}, //11
		{userId:'107504462605732',fullName:'Teletica 7', userName:'Teletica'}, //12
		{userId:'152914224736727',fullName:'Banco Mundial', userName:'bancomundial'}, //13 
 		{userId:'143615227116',fullName:'Defensoría de los Habitantes de la República de Costa Rica', userName:'defensoriacr'}, //14
		{userId:'58895017663',fullName:'Banco Interamericano de Desarrollo', userName:'BancoInteramericano'},  //15
		{userId:'346203887439',fullName:'Naciones Unidas',userName:'nacionesunidas'}, //16
		{userId:'199246583438202',fullName:'Luis Guillero Solis Rivera',userName:'luisguillermosolisr'}, //17
		{userId:'33827916464',fullName:'OCDE en Español', userName:'OCDEenEspanol'}, //18
		{userId:'154298834585547',fullName:'Cepal', userName:'cepal.onu'} //19
	];
	resp.json(users);
})

router.get('/crawl/twitter',function(req,resp){
	var accounts = [
		{userId:'jdealthaus', sourceName:"Jaime de Althaus"}, //0
		{userId:'UrsulaLetonaP', sourceName:"Úrsula Letona"}, //1
		{userId:'Minsa_Peru', sourceName:"MINSA"}, //2
		{userId:'drhuerta', sourceName:"Elmer Huerta"}, //3
		{userId:'ppkamigo', sourceName:"Pedro Pablo Kuczynski"}, //4
		{userId:'KenjiFujimoriH', sourceName:"Kenji Fujimori"}, //5
		{userId:'RPPNoticias', sourceName:"RPP"}, //6
		{userId:'KeikoFujimori', sourceName:"Keiko Fujimori"}, //7
		{userId:'VeroLinaresC', sourceName:"Verónica Linares"}, //8
		{userId:'uterope', sourceName:"Utero"}, //9
		{userId:'claudiaizaguirr', sourceName:"Claudia Izaguirre"}, //10
		{userId:'ameliarueda', sourceName:"Amelia Rueda"}, //11
		{userId:'LorellyTs', sourceName:"Lorelly Trejos"}, //12
		{userId:'GardodeCQ', sourceName:"Edgardo Araya"}, //13
		{userId:'matrncio63', sourceName:"Marvin Atencio"}, //14
		{userId:'DiputadoLimon', sourceName:"Gerardo Vargas Rojas"}, //15
		{userId:'alvarez_desanti', sourceName:"Antonio Álvarez Desanti"}, //16
		{userId:'PizaRodolfo', sourceName:"Rodolfo Piza"}, //17
		{userId:'rortizfab', sourceName:"Rafael Ortiz"}, //18
		{userId:'caretas',sourceName:'Revista Caretas'}, //1
		{userId:'telenoticias7', sourceName:"Telenoticias"} //20
	];
	resp.json(accounts)
})

router.post('/crawl/posts',function(req,resp){
	if (req.body.userId == '153838434670411'){
		console.log('Received it');
	}
	FB_CONN.get(req.body.userId,CONN.posts).then(function(){
		resp.json({user:req.body.userId,saved:true});
		return;
	}).catch(function(){
		console.log('Something went really wrong');
	})
})

router.post('/crawl/tweets', function(req,resp){
	TW_CONN.get(req.body.userId,CONN.tweets).then(function(){
		resp.json({user:req.body.userId,saved:true});
		return;
	})
})

router.post('/crawl/links',function(req,resp){
	if (req.body.url == null){
		resp.json({ok:false,error:'No URL requested'})
		return;
	}
	request(req.body.url, function(error,response,html){
		if (error){
			if (error.errno == 'ENOTFOUND'){
				resp.json({ok:false,error:'Address not found'});
				return	
			}
			resp.json({ok:false, error:'Error obtaining data from page'})
		} else {
			switch(req.body.source){
				case 'paho':
					var Crawls = require('../crawlers/paho.js');
				break;
				case 'proetica':
					var Crawls = require('../crawlers/proetica.js');
				break;
				case 'ccss':
					var Crawls = require('../crawlers/ccss.js');
				break;
				case 'comercio':
					var Crawls = require('../crawlers/comercio.js');
				break;
				case 'nacion':
					var Crawls = require('../crawlers/nacion.js');
				break;
				case 'un':
					var Crawls = require('../crawlers/un.js');
				break;
				case 'who':
					var Crawls = require('../crawlers/who.js');
				break;
				case 'cacia':
					var Crawls = require('../crawlers/cacia.js');
				break;
				case 'efe':
					var Crawls = require('../crawlers/efe.js');
				break;
				case 'minsa':
					var Crawls = require('../crawlers/minsa.js');
				break;
			}
			var crawler = new Crawls();
			resp.json({links:crawler.get_links(html),index:req.body.index,ok:true});
		}
	})
})

router.post('/crawl/content',function(req,resp){
	if (req.body.url == null){
		resp.json({ok:false,error:'No URL requested'})
		return;
	}
	request(req.body.url,function(err,response,html){
		if(err){
			if (err.errno == 'ENOTFOUND'){
				resp.json({ok:false,error:'Address not found',url:req.body.url});
				return;	
			}
		} else if (response.request._redirect.redirects.length > 0){
			resp.json({ok:false, redirect:true, url:response.request._redirect.redirects[0].redirectUri, originalDestination:req.body.url})
		} else {
			
			switch(req.body.source){
				case 'paho':
					var Crawls = require('../crawlers/paho.js');
				break;
				case 'minsa':
					var Crawls = require('../crawlers/minsa.js');
				break;
				case 'proetica':
					var Crawls = require('../crawlers/proetica.js');
				break;
				case 'ccss':
					var Crawls = require('../crawlers/ccss.js');
				break;
				case 'comercio':
					var Crawls = require('../crawlers/comercio.js');
				break;
				case 'nacion':
					var Crawls = require('../crawlers/nacion.js');
				break;
				case 'un':
					var Crawls = require('../crawlers/un.js');
				break;
				case 'who':
					var Crawls = require('../crawlers/who.js');
				break;
				case 'cacia':
					var Crawls = require('../crawlers/cacia.js');
				break;
				case 'efe':
					var Crawls = require('../crawlers/efe.js');
				break;
			}
			var crawler = new Crawls();
			resp.json(crawler.extract_content(html, req.body.url));
		}
	})
})

router.get('/crawl/extract',function(req,resp){
	if (req.query.table == 'fb'){
		CONN.extract_posts(req.query.source,resp);
	} else if (req.query.table == 'tw'){
		CONN.extract_tweets(req.query.source,resp);
	} else if (req.query.table = 'ar'){
		CONN.extract_articles(req.query.source,resp);
	}
})

router.post('/save',function(req,resp){
	CONN.isNew(req.body).then(function(is){
		if(is){
			CONN.save(req.body);
			resp.json({saved:true})
			return;
		} else {
			resp.json({saved:false})
			return;
		}
	})
})

router.get('/test/analysis',function(req,resp){
	CONN.articles.find({},{limit:1}).then(function(values){
		try{
			NLU_CONN.run_article(values[0],CONN.articles);
			resp.json({ok:true});
		} catch(e){
			console.log(e);
			resp.json({error:true,error_message:e.message})
		}
	}).catch(function(values){
		resp.json(values);
	})
})

router.post('/write',function(req,resp){
	var path = __dirname;
	path = path.substr(0,path.length-7)
	fs.open(path+'/outputs/'+req.body.dir+'/'+req.body.loc+'/'+req.body.filename+'.txt','w', function(err,fd){
		if (err){
			console.log(err);
			resp.json({ok:false,file:'/outputs/'+req.body.dir+'/'+req.body.loc+'/'+req.body.filename+'.txt'});
			return;
		}
		fs.write(fd,req.body.content,0,'utf-8',function(err,written,string){
			if (err){
				console.log(err);
				resp.json({ok:false,file:'/outputs/'+req.body.dir+'/'+req.body.loc+'/'+req.body.filename+'.txt'})
			} else {
				resp.json({ok:true,file:'/outputs/'+req.body.dir+'/'+req.body.loc+'/'+req.body.filename+'.txt'})
			}
		})
	})	
})

module.exports = router;