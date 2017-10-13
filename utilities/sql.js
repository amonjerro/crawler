/*
Full CRUD support enabled. 
Returns promises to external users of this class but internally handles itself by Async calls.
*/


//Dependencies
var pg = require('pg');
var Promise = require('promise');

//Environment variables for Cloud Foundry.
var env = JSON.parse(process.env.VCAP_SERVICES);
var pgUri = env['elephantsql'][0]['credentials']['uri'] 


//Exportable module. Needs to be more configurable based on the database being used.
function DB(){
	this.pool = new pg.Pool({connectionString: pgUri});
}


//Creation of pool client - implementation requirement for PostgreSQL. Your mileage may vary.
DB.prototype.make_client = function(){
	var conn = this;
	return new Promise(function(resolve, reject){
		//console.log('Client Created');
		conn.pool.connect().then(function(client){
			return resolve(client);
		}).catch(function(err){
			return reject(err)
		})
	})
}


//Executes the query and releases the created back to the pool.
DB.prototype.query = function(client, sql, parameters=null,callback){
	var conn = this;

	//Debug of SQL statements
	//console.log(sql)
	

	if (!parameters){
		client.query(sql,function(err,data){
			if (err){
				console.log(err.stack);
				client.release();
				callback(null);
			} else {
				client.release();
				callback(data.rows);
			}
		})
	} else{
		client.query(sql,parameters,function(err,data){
			if (err){
				console.log(err.stack);
				client.release();
				callback(null)
			} else {
				client.release();
				callback(data.rows);
			}
		});
	}
}


//Generates the where statement and adjusts the binding of parameters if parameters have been bound by other functions
DB.prototype.where = function(client, sql, where=null,callback,param_counter=1,prior_params=null){
	var conn = this;
	if (!where){
		conn.query(client,sql,null,callback);
	} else {
		if (param_counter > 1){
			var params = prior_params;
		} else {
			var params = [];
		}
		sql += ' WHERE ';
		if( Math.floor(where.length/4) >= 1 ){
			//This where statement has an AND or OR connector in there.
			var y = 0;
			var field;
			var operator;
			var connector;
			for (var i = 0; i <= Math.floor(where.length/4); i++){
				field = where[y++];
				operator = where[y++];
				if (operator == 'IN' || operator == 'NOT IN'){
					sql += field + ' ' + operator + ' (';
					for (var j = 0; j < where[y].length; j++){
						if ((j+1) == where[y].length){
							sql += '$'+(param_counter) + ')';
						} else {
							sql += '$'+(param_counter) + ','; 
						}
						param_counter++;
						params.push(where[y][j]);
					}
					y++;
				} else {
					params.push(where[y++]);
					sql += field + ' ' + operator + ' ' + '$'+param_counter;
					param_counter++;
				}
				if (y < where.length-1){
					connector = where[y++];
					sql += ' '+connector+' ';
				}
			}
			sql += ';';
		} else {
			/*
				Where statement has no logic connector (AND / OR) but may
				still contain IN or NOT IN selectors. 
			*/
			if (where[1] == 'IN' || where[1] == 'NOT IN'){
				sql += where[0] + ' ' + where[1] + '(';
				for(var i = 0; i < where[2].length; i++){
					if ((i+1) == where[2].length){
						sql += '$'+(param_counter++) + ');';
					} else {
						sql += '$'+(param_counter++) + ','; 
					}
					params.push(where[2][i]);
				}
			} else {
				sql += where[0] + ' ' + where[1] + ' $'+param_counter+';';
				params.push(where[2]);
			}
		}
		conn.query(client,sql,params,callback);
	}
}


//SELECT statement generator
DB.prototype.get = function(table,fields=null, where=null){
	var conn = this;
	return new Promise(function(resolve, reject){
		conn.make_client().then(function(client){
			var text = '';
			if (!fields){
				text += 'SELECT * FROM '+table;
			} else {
				text += 'SELECT '+fields.join()+' FROM '+table;
			}
			conn.where(client, text, where,resolve);
		}).catch(function(err){
			reject(err);
		})
	})
}


//INSERT INTO statement generator. Currently only handles individual inserts. Will affect performance if inserting massively.
DB.prototype.insert = function(table,values){
	var conn = this;
	return new Promise(function(resolve,reject){
		conn.make_client().then(function(client){
			var columns = Object.keys(values);
			var sql = 'INSERT INTO '+table+'('+columns.join()+') VALUES (';
			var params = [];
			for(var i = 0; i < columns.length; i++){
				if ((i+1) == columns.length){
					sql += '$'+(i+1) + ');';
				} else {
					sql += '$'+(i+1) + ','; 
				}
				params.push(values[columns[i]]);
			}
			conn.query(client,sql,params,resolve);
		})
	})
}


//DELETE statement, requires a where statement that is not blank so that individual queries can never delete the entire table
DB.prototype.delete = function(table,where){
	var conn = this;
	return new Promise(function(resolve,reject){
		if (where == null || where.length < 3){
			return reject({message:'Remote table truncation is disallowed'})
		}
		conn.make_client().then(function(client){
			var sql = 'DELETE FROM '+table;
			conn.where(client,sql,where,resolve);
		}).catch(function(err){
			reject(err);
		})
	})
}


//UPDATE statement.
DB.prototype.update = function(table, settables, where){
	var conn = this;
	return new Promise(function(resolve,reject){
		conn.make_client().then(function(client){
			var sql = 'UPDATE '+table+' SET ';
			var settable_columns = Object.keys(settables);
			var param_counter = 1;
			var params = [];
			for (var i = 0; i < settable_columns.length; i++){
				if ((i+1) == settable_columns.length){
					sql += settable_columns[i] + '= $'+param_counter;
				} else {
					sql += settable_columns[i] + '= $'+param_counter+',';
				}
				params.push(settables[settable_columns[i]]);
				param_counter++;
			}
			conn.where(client,sql,where,resolve,param_counter,params);
		}).catch(function(err){
			reject(err);
		})
	})
}



module.exports = DB;

