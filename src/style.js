define('style',['dom','timmer','util','event'],function(dom,timmer,util,event,exports){
	var domProto = dom.E.prototype,
		$ = dom.get
	var getComputedStyle = window.getComputedStyle,
		camelize = function(prop){
			return prop.replace(/-([a-z])/gi,function(all,letter){return letter.toUpperCase()})
		},
		dasherize = function(str){
		// 格式化属性名
	    return str.replace(/::/g, '/')
	           .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
	           .replace(/([a-z\d])([A-Z])/g, '$1_$2')
	           .replace(/_/g, '-')
	           .toLowerCase()
	    }
	domProto.css = function(obj){
		if(!obj){ return this}
		if(util.isObject(obj)){
			// set
			var styleText = '',
				removedProp = []
			util.each(obj,function(value,prop){
				if(!value && value !== 0){
					// removeProperty 删除 style
					removedProp.push(prop)
				}else{
					styleText += dasherize(prop) + ':' + value + ';'
				}
			})
			this.each(function(){
				var style = this.style
				removedProp.forEach(function(prop){
					style.removeProperty(prop)
				})
				style.cssText += styleText
			})
		}else{
			var ret = {},
				el = this[0]
			if(util.isString(obj)){
				return el.style[camelize(obj)] || getComputedStyle(el,'').getPropertyValue(obj)
			}else if(util.isArray(obj)){
				obj.forEach(function(prop){
					// 优先获取 style 标签中的属性
					ret[prop] = el.style[camelize(prop)] || getComputedStyle(el,'').getPropertyValue(prop)
				})
				return ret	
			}
		}
		return this
	}
	domProto.offset = function(obj){
		// document.documentElement.scrollTop
		var obj = this[0].getBoundingClientRect()
		return {
			left: obj.left + window.pageXOffset,
			top: obj.top + window.pageYOffset,
			width: Math.round(obj.width),
			height: Math.round(obj.height)
		}
	}
	domProto.hide = function(){
		return this.css({display: 'none'})
	}
	domProto.show = function(){
		// getComputedStyle('display','') --> none?
		return this.css({display: ''})
	}
	domProto.toggle = function(){
		return this.each(function(){
			var $this = $(this)
			$this.css('display') === 'none' ? $this.show() : $this.hide()
		})
	}
	var effect = {
		fadeIn: {
			name: 'fadeIn',
			callback: function(){
				this.css({'display': 'block'})
			}
		},
		fadeOut: {
			name: 'fadeOut',
			callback: function(){
				this.css({'display': 'none'})
			}
		},
		slideDown: {
			name: 'bounceInDown',
			callback: function(){
				this.css({'display': 'block'})
			}
		},
		slideUp: {
			name: 'bounceOutUp',
			callback: function(){
				this.css({'display': 'none'})
			}
		}
	}
	util.each(effect,function(fx,fnName){
		domProto[fnName] = function(callback){
			var className = ['animated'].concat(fx.name)
			// this.css({'display': ''}) // reset display
			setTimeout((function(){
				this.each(function(){
					this.animating = true
				})
				this.css({'display': ''})
				this.addClass(className)		
			}).bind(this),20)
			this.one('animationend',function(){
				delete this.animating
				$(this).removeClass(className)
				fx.callback && fx.callback.call($(this))
				callback && callback.call(this)
			})
			return this
		}
	})
	var toggleEffect = {
		fadeToggle: ['fadeIn','fadeOut'],
		slideToggle: ['slideDown','slideUp']
	}
	util.each(toggleEffect,function(effect,fnName){
		domProto[fnName] = function(){
			return this.each(function(){
				if(this.animating){return}
				var $this = $(this)
				if($this.css('display') === 'none'){
					$this[effect[0]]()
				}else{
					$this[effect[1]]()
				}
			})
		}
	})
})