const fs = require('fs');

function Aggregator(options){
	if (options != null){
		this.bin_marker = options.bin_marker;
		this.origin = options.origin;
		this.max = options.max;
		this.set_max = options.set_max;
	} else {
		this.bin_marker = 100;
		this.origin = 0;
		this.max = 1400;
		this.set_max = 4000;
	}
	this.bins = this.makeBins();
	this.sets_written = 0;
}

Aggregator.prototype.makeBins = function(){
	var bins = {};
	for (var i = this.origin; i <= this.max; i += this.bin_marker){
		if (i == this.origin){
			continue;
		}
		bins[i.toString()] = [];
	}
	return bins;
}

Aggregator.prototype.outputDocData = function(obj){
	var keys = Object.keys(obj);
	for (var i = 0; i < keys.length; i++){
		if (obj[keys[i]].length == 0){
			delete obj[keys[i]];
		}
	}
	var doc_data = {doc_data:obj};
	fs.writeFile(__dirname+'/doc_data.json',JSON.stringify(doc_data),'utf-8',function(err){
		if (err){
			console.log(err);
		}
	})
}

Aggregator.prototype.makeSet = function(json,instance){
	var setWords = 0;
	var setDocs = [];
	var doc;
	var json_keys = Object.keys(json);
	var layer_words = 0;
	var layer = json_keys.length - 1;
	//console.log(json[json_keys[layer]])
	try{
		while (setWords < instance.set_max){
			if (json[json_keys[layer]].length == 0){
				if (layer == 0){
					break;
				} else {
					layer--;
				} 
			}
			layer_words = parseInt(json_keys[layer]);
			if ((setWords+layer_words+instance.bin_marker) < instance.set_max){
				doc = json[json_keys[layer]].pop();
				setDocs.push(doc.doc_path);
				setWords += doc.words;
			} else {
				if (layer == 0){
					break;
				} else {
					layer--;
				}
			}
		}
	} catch(e){
		console.log(layer);
	}
	console.log('Words in Set: ',setWords);
	console.log('Set Documents: ',setDocs);
	for (var i = 0; i < json_keys.length; i++){
		if (json[json_keys[i]].length == 0){
			delete json[json_keys[i]];
		}
	}
	instance.sets_written++;
	instance.writeSet({setDocs:setDocs,setWords:setWords},instance);
	json_keys = Object.keys(json);
	if (json_keys.length > 0){
		instance.makeSet(json,instance);
	}
}

Aggregator.prototype.writeSet = function(data,instance){
	fs.writeFile(__dirname.substr(0,__dirname.length-9)+'sets/set'+instance.sets_written+'.json',JSON.stringify(data),'utf-8',function(err){
		if(err){
			console.log(err);
		}
	})
}

Aggregator.prototype.sortIntoBins = function(arr){
	var category = 0;
	for (var i = 0; i < arr.length; i++){
		category = Math.floor(arr[i].words/this.bin_marker);
		if (category*this.bin_marker > this.max){
			category = this.max/this.bin_marker;
		}
		if (category == 0){
			category += 1;
		}
		this.bins[(category*this.bin_marker).toString()].push(arr[i]);
	}
	this.outputDocData(this.bins);
}

Aggregator.prototype.getData = function(callback){
	var instance = this;
	fs.readFile(__dirname + '/doc_data.json','utf-8',function(err,json){
		var data = JSON.parse(json);
		callback(data.doc_data, instance);
	});
}

Aggregator.prototype.analyzeBins = function(data,instance){
	var keys = Object.keys(data);
	for (var i = 0; i < keys.length; i++){
		console.log(keys[i],':',data[keys[i]].length);
	}
}

module.exports = Aggregator;