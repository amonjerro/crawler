function run_analysis(){
	$.get('/test/analysis',function(data){
			console.log(data);
		})
}

function extract(table, source){
	$.get('/crawl/extract?table='+table+'&source='+source,function(data){
		if (table == 'fb'){
			for (var i = 0; i<data.length;i++){
				$.post('/write',
				{
					content:data[i].message,
					loc:data[i].from.name,
					dir:table,
					filename:data[i].id
				},function(data){
					console.log(data);
				})
			}
		} else if (table == 'tw'){
			for (var i = 0; i<data.length;i++){
				$.post('/write',
				{
					content:data[i].text,
					loc:data[i].user.screen_name,
					dir:table,
					filename:data[i].id_str
				},function(data){
					console.log(data);
				})
			}
		} else if (table == 'ar'){
			for (var i = 0; i<data.length;i++){
				$.post('/write',
				{
					content:data[i].content,
					loc:source,
					dir:table,
					filename:data[i].id
				},function(data){
					console.log(data);
				})
			}
		}
	})
}


function get_social(network, inner){
	if (network == 'fb'){
		var outer = 'facebook';
		var inner = inner;
	} else {
		var outer = 'twitter';
		var inner = 'tweets';
	}
	$.get('/crawl/'+outer,function(accounts){
			for (var i = 0; i < accounts.length; i++){
				$.post('/crawl/'+inner,{
					userId:accounts[i].userId
				},function(data){
					console.log(data);
				})
			}
	})
}

function get_web_articles(){
	$.get('/crawl/urls',function(urls){
			console.log('Urls Obtained')
			for (var k=0; k < urls.length; k++){
				$.post('/crawl/links',
					{
						url:urls[k].url,
						source:urls[k].source,
						index:k
					},
					function(links){
						if (links.ok){
							console.log('Links obtained for '+urls[links.index].source);
							for (var i = 0; i < links.links.length; i++){
								$.post('/crawl/content',
								{
									url:links.links[i],
									source:urls[links.index].source
								},function(article){
									console.log('Intentando grabar archivo');
									if (article.ok){
										$.post('/save',article,function(op){
											if (op.saved){
												console.log('Operacion Exitosa');
											} else {
												console.log('Este artículo ya existe en base de datos');
												console.log(article);
											}
										})
									} else {
										if (article.redirect){
											$.post('/crawl/content',{
												url:article.url,
												source:urls[links.index].source
											},function(redirected){
												if (redirected.ok){
													$.post('/save',redirected,function(op){
													if (op.saved){
														console.log('Operacion Exitosa');
													} else {
														console.log('Este artículo ya existe en base de datos');
														console.log(redirected);
													}
													})
												} else {
													console.log('Articulo Rediridigo Mal', article)
												}
											})
										} else {
											console.log('Articulo Mal', article)
										}
									}
								})
							}
						}
				})
			}
		})
}