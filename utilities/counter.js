var fs = require('fs');
var path = __dirname
path = path.substr(0,path.length-9) + 'sets/set15';
const agr = require('./aggregator.js');
const Aggregator = new agr();
//console.log(Aggregator);
var counter = 0;
var docs = 0;
var docs_computed = 0;

var doc_data = [];

function count_words(file_path){
	fs.readFile(file_path,'utf8',function(err,data){
		//console.log(data);
		console.log(data.match(/\w+/g).length,' ;',file_path)
		counter += data.match(/\w+/g).length
		doc_data.push({doc_path:file_path,words:data.match(/\w+/g).length})
		docs_computed++;
		if (docs_computed == docs){
			console.log('Done');
			// console.log('Total Words: ',counter);
			// console.log('Total Docs: ',docs_computed);
			// console.log('Words per source: ', counter/docs_computed);
			//Aggregator.sortIntoBins(doc_data);
		}
	})
}

function test(path){
	fs.stat(path,function(error,stats){
		if (stats.isDirectory()){
			explore(path)
		} else {
			docs++;
			count_words(path);
		}
	})
}

function explore(dir){
	fs.readdir(dir,function(err,files){
		for (var i = 0; i < files.length; i++){
			if (files[i] == '.DS_Store'){
				continue;
			}
			test(dir+'/'+files[i])
		}
	})
}

explore(path);