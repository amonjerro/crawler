const bcrypt = require('bcrypt');
const Promise = require('promise');


module.exports = class Security {
	constructor(db,table,u,p,saltRounds=10){
		this.db = db;
		this.table = table;
		this.user_field = u;
		this.password_field = p;
		this.saltRounds = saltRounds;
	}
	

	verify(user,pw){
		var slf = this;
		return new Promise(function(resolve, reject){
			slf.db.get(slf.table,null,[slf.user_field,'=',user]).then(function(values){
				if (values.length < 1){
					return reject({message:"User "+user+" doesn't exist"});
				}
				bcrypt.compare(pw,values[0][slf.password_field]).then(function(){
					return resolve(true);
				}).catch(function(err){
					return reject({message:"Incorrect Credentials"})
				})
			})
		})
	}

	createAuthorizedUser(id,token){
		var slf = this;
		return new Promise(function(resolve, reject){
			bcrypt.hash(token,slf.saltRounds).then(function(hash){
				params = {'estado':1};
				params[slf.user_field] = id;
				params[slf.password_field] = hash;
				slf.db.insert(slf.table,params).then(function(val){
					resolve(val);
				});
			}).catch(function(err){
				reject(err);
			})
		})
	}

	unsetAuthorizedUser(sys_id){
		var slf = this;
		return new Promise(function(resolve, reject){
			slf.db.delete(slf.table,[slf.user_field,'=',sys_id]).then(function(values){
				resolve(values)
			}).catch(function(err){
				reject(err);
			})
		})
	}

	updateUserState(sys_id,value){
		var slf = this;
		return new Promise(function(resolve, reject){
			slf.db.update(slf.table,{'estado':value},[slf.user_field,'=',sys_id]).then(function(val){
				resolve(val)
			}).catch(function(err){
				reject(err);
			})
		})
	}

	// updateUserPass(sys_id,value){
	// 	var slf = this;
	// 	return new Promise(function(resolve, reject){
	// 		bcrypt.hash(value,slf.saltRounds).then(function(hash){
	// 			var params = {};
	// 			params[slf.password_field] = hash;
	// 			console.log(hash);
	// 			slf.db.update(slf.table,params,[slf.user_field,'=',sys_id]).then(function(val){
	// 				resolve(val);
	// 			}).catch(function(err){
	// 				reject(err);
	// 			})
	// 		})
	// 	})
	// }
}