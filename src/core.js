define('core',['dom','util','ajax','storage'],function(dom,util,ajax,storage,exports){
	var add = function(mods){
		mods = [].concat(mods);
		util.each(mods,function(mod){
			util.extend(exports,mod)
		})
		return add;
	}
	// exports.util = util;
	// exports.ajax = ajax;
	add([util,ajax,dom,storage])
	exports.version = '1.0'
	exports.author = 'otarim'
	window.$ = dom.get;
})