define('touch','core',function(core,exports){
	var $ = core.get,
		domProto = core.E.prototype,
		emiter = new core.EventEmitter
	$('body').on('touchstart',function(e){
		var target = e.touches[0].target
		$(target).trigger('swipe')
	})
	;['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown',
    'doubleTap', 'tap', 'singleTap', 'longTap'].forEach(function(fn){
    	domProto[fn] = function(callack){
    		this.on(fn,callack)
    	}
    })
})