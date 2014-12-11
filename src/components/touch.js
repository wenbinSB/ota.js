define('touch','core',function(core,exports){
	var $ = core.get,
		domProto = core.E.prototype,longTime,tapTime,doubleTapTime
	var touch = {}

	var cancleAllEvent = function(){

	}
	$('body').on('touchstart',function(e){
		var pointer = e.touches[0],
			now = core.now()
		touch.detalTime = now - (touch.lastTime || now)
		touch.target = 'tagName' in pointer.target ? pointer.target : pointer.target.parentNode
		// $(target).trigger('swipe')
		longTime = setTimeout(function(){
			// 长按不会触发 tap以及 doubleTap
			touch.longTimeTrigger = true
			$(target).trigger('longTap')
		},750)
		// isDoubleTap 上下两次 touch 之间的时间间隙
		if(touch.detalTime > 0 && touch.detalTime < 250){ touch.isDoubleTap = true}
		touch.lastTime = now

	}).on('touchmove',function(e){
		clearTimeout(longTime)
	}).on('touchend',function(e){
		clearTimeout(longTime)
		if(!touch.longTimeTrigger){
			if(touch.detalX < 30 || touch.detalY < 30){
				// 不为 swipe,单点 tap
				cancleAllEvent
				touch.target.trigger('tap')

				// doubleTap
				if(touch.isDoubleTap){
					touch.target.trigger('doubleTap')
					// 动作结束
					touch = {}
				}
			}
		}else{
			touch = {}
		}
	})

	$(window).on('scroll',function(){
		clearTimeout(longTime)
	})

	;['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown','doubleTap', 'tap', 'singleTap', 'longTap'].forEach(function(fn){
    	domProto[fn] = function(callack){
    		this.on(fn,callack)
    	}
    })
})