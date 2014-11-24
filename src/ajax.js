define('ajax',['util'],function(util,exports){
	// promise
	// Promise.all 全部完成触发 then
	// Promise.race 哪个先触发 reject 或者 resolve 触发then
	// Promise.reject 将对象转变为 promise 对象
	// Promise.resolve 将对象转变为 promise 对象
	var defaultConfig = {
		type: 'get',
		contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
		headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        charset: 'utf-8',
        fresh: true,
        async: true,
        crossdomain: false,
        jsonp: 'callback'
	}
	var rnoContent = /^(?:get|head)$/;
	var ajax = function(config){
		var type = (config.type || defaultConfig.type).toLowerCase();
		var needContentType = !rnoContent.test(type) || config.contentType;
		config = util.extend(config,defaultConfig,true)
		var data = config.data;
		var crossdomain = getUrlHost(config.url) !== location.host;
		var dataType = config.dataType || '';

		// handler data
		if(data){
			if(util.isObject(data)){
				data = encodeData(data)
			}
			if(type === 'get'){
				config.url = addQuery(config.url,data)
				data = null;
			}
		}

		if(dataType.toLowerCase() === 'jsonp'){
			var jsonpCallback = config.jsonpCallback;
			if(!jsonpCallback){
				jsonpCallback = 'misakaCallback' + (config.fresh ? util.now() : '');
			}
			window[jsonpCallback] = window[jsonpCallback] || function(data){
				config.success && config.success(data)
				setTimeout(function(){
					window[jsonpCallback] = null;
				},100)
			}
			config.url = addQuery(config.url,config.jsonp + '=' + jsonpCallback)
			return getScript(config.url,null,config.error,{
				charset: config.charset
			})
		}

		var ajaxPromise = new Promise(function(resolve,reject){
			var xhr = new XMLHttpRequest;
			xhr.open(type,config.url,config.async);
			if(crossdomain){
				if(config.crossdomain){
					xhr.withCredentials = true;
				}
				delete config.headers['X-Requested-With'];
			}
			if(needContentType){
				xhr.setRequestHeader('content-type',config.contentType)
			}
			if(config.headers){
				util.each(config.headers,function(header,key){
					xhr.setRequestHeader(key,header)
				})
			}
			xhr.onload = function(){
				resolve({
					value: this.responseText,
					dataType: dataType,
					onloadCallback: config.success
				})
			}
			xhr.onerror = function(e){
				reject({
					value: e,
					errorCallback: config.error
				})
			}
			xhr.send(data)
		})

		ajaxPromise.then(function(data){
			if(data.dataType.toLowerCase() === 'json'){
				data.value = JSON.parse(data.value)
			}
			return data.onloadCallback(data.value)
		},function(err){
			return err.errorCallback(err.value)
		}).catch(function(err){
			// 异常处理？
			throw new Error(err.message)
		})

		return ajaxPromise;
		
	}

	var fileUpload = function(config){

	}

	var getScript = function(url,onload,onerror,extra){
		if(typeof extra === 'undefined' && util.isObject(onerror)){
			extra = onerror
			onerror = null;
		}
		var s = document.createElement('script'),
			head = document.getElementsByTagName('head')[0];
		s.async = true;
		s.onload = function(){
			head.removeChild(s);
			onload && onload();
			s = null;
		}
		s.onerror = function(e){
			head.removeChild(s);
			onerror && onerror(e);
			s = null;
		}
		extra && util.each(extra,function(value,property){
			s[property] = extra[property];
		})
		s.src = url;
		head.appendChild(s);
	}

	var getUrlHost = (function(){
		var a = document.createElement('a')
		return function(url){
			a.href = url;
			return a.host
		}
	})()
	function encodeData(data){
		var ret = [];
		util.each(data,function(d,key){
			ret.push(key + '=' + encodeURIComponent(d))
		})
		return ret.join('&')
	}
	function addQuery(url,data){
		if(url.indexOf('?') !== -1){
			url += '&' + data
		}else{
			url += '?' + data
		}
		return url;
	}
	exports.ajax = ajax;
	exports.getScript = getScript;
})