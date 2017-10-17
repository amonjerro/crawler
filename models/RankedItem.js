const Promise = require('promise');

module.exports = class RankedItem {

	static getWeightHash(entities, relations) {
		return new Promise(function(resolve, reject) {
			try {
				var weights = [];
				for (var index in entities) {
					var entity = entities[index];
					var obj = {};
					obj[entity.watsonname] = entity.peso;
					weights.push(obj);
				}
				for (var index in relations) {
					var relation = relations[index];
					var obj = {};
					obj[relation.watsonname] = relation.peso;
					weights.push(obj);
				}
				console.log(weights);
				resolve(weights);
			} catch(e) {
				console.log(e);
				reject(e);
			}
		});
	};
	constructor(id,textoInteres, fecha, href, weights, entities, relations, db) {
		this.table = "items";
		this.id = id;
		//this.fuente = fuente;
		this.textoInteres = textoInteres;
		this.fecha = fecha;
		this.href = href;
		this.weights = weights;
		this.entities = entities;
		this.relations = relations;
		this.score = 0;
		this.db = db;
	};
	getArticleFuente(){
		var slf = this;
		return new Promise(function(resolve, reject){
			slf.db.get('fuentes',['id'],['cadenaid','=',slf.id.substr(0,6)]).then(function(source_id){
				return resolve(source_id[0]);
			})
		})
	}
	setScoreArticle() {
		var slf = this;
		return new Promise(function(resolve, reject) {
			try {
				var score = 0;
				//Add Entities
				for (var index in slf.entities) {
					var entity = slf.entities[index];
					score += entity.relevance * slf.weights[entity.type];
					//Add Keywords
					if (entity.text in slf.weights) {
						score += weights[entity.text];
					}
				}
				//Add Relations
				for (var index in obj.relations) {
					var relation = slf.entities[index];
					score += relation.score * weights[relation.type];
				}
				slf.score = score;
				resolve(slf);
			} catch(e) {
				console.log("RankedItem: Error calculating score for article");
				reject(e);
			}		
		});
	};
	save() {
		var slf = this;
		var params = {
			'fuente': slf.fuente,
			'textointeres': slf.textoInteres,
			'fecha': slf.fecha,
			'href': slf.href,
			'relevancia': slf.score
		};
		slf.db.insert(slf.table,params).then(function(val){
			resolve(val);
		})
		.catch(function(e){
			console.log("RankedItem: Error saving item with params " + JSON.stringify(params))
			console.log(e);
		});
	}
    
}