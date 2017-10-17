const Promise = require('promise');

module.exports = class Entity{

	constructor(db){
		this.db = db;
		this.entity_table = 'entidades';
		this.relationship_table = 'relaciones';
		this.source_table = 'fuentes';
	};
	getEntidades(){
		var slf = this;
		return new Promise(function(resolve, reject){
			slf.db.get(slf.entity_table,null,null).then(function(values){
				resolve(values)
			}).catch(function(err){
				reject(err);
			})
		})
	}
}