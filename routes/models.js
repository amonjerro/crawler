
//Dependencias
const express = require('express');
const router = express.Router();
const Promise = require('promise');
const request = require('request');
const bodyParser = require('body-parser');
const no_sql = require('../utilities/no_sql.js');
const NSQL_CONN = new no_sql();


//Capa de Base de Datos;
const sql = require('../utilities/sql.js');
const SQL_CONN = new sql();

//Capa Modelos;
const Sec = require('../models/Security.js');
const Entity = require('../models/Entity.js');
const Relation = require('../models/Relation.js');
const RankedItem = require('../models/RankedItem.js');

const ComSec = new Sec(SQL_CONN,'accesos','sys_id','sys_hash');
const Ent 	= new Entity(SQL_CONN);
const Rel 	= new Relation(SQL_CONN);


router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}))

router.use(function(req,resp,next){
	/*if (req.query.sys_id == null || req.query.sys_token == null){
		return resp.json({message:'Authorization Denied',query:req.query});
	}
	ComSec.verify(req.query.sys_id,req.query.sys_token).then(function(){
		next();
	}).catch(function(error_message){
		return resp.json(error_message);
	})*/
	next();
})

// router.get('/sys_up_password',function(req,resp){
// 	ComSec.updateUserPass('OMQGI%6=OvfHwjE5I|jFemX@v86f@0uA','7r5EsWW75MHDovjI%V8K@fk!=OaArSBP').then(function(values){
// 		resp.json(true);
// 	})
// })


router.get('/entities',function(req,resp){
	Ent.getEntidades().then(function(values){
		resp.json(values)
	}).catch(function(err){
		console.log(err)
		resp.json({error:true,error_object:err});
	})
})
//Get Entidades -> Get Relaciones -> Get Weight Hash -> Get Articles -> Set score per article
router.get('/run', function(req, resp) {
	//Get Entidades
	Ent.getEntidades().then(function(values){
		var entities = values;
		//Get Relaciones
		Rel.getRelaciones().then(function(values) {
			var relations = values;
			//Get Weight Hash
			RankedItem.getWeightHash(entities, relations).then(function(values) {
				var weights = values;
				//Get Articles
				NSQL_CONN.articles.find({'migrated': {$exists : false} }).then(function(values){
					console.log("enterered");
					console.log(values);
					try{
						for (var index in values) {
							var article = values[index];
							var item = new RankedItem(1, article.title, article.date, article.source, weights, article.analysis.entities, article.analysis.relations, SQL_CONN);
							item.setScoreArticle();

							console.log(item);
							resp.json({ok:true});
							return;
						}
						resp.json({ok:true});
					} catch(e){
						console.log(e);
						resp.json({error:true,error_message:e.message})
					}
				}).catch(function(values){
					resp.json(values);
				})
			}).catch(function(err) {
				console.log(err)
				resp.json({error:true,error_object:err});
			});

		}).catch(function(err){
			console.log(err)
			resp.json({error:true,error_object:err});
		});
	}).catch(function(err){
		console.log(err)
		resp.json({error:true,error_object:err});
	})
})


module.exports = router;