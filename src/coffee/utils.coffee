define ['jquery', 'doT', 'text!../templates/_alert.tpl', 'base64'], ($, doT, TplAlert) ->
	ieMode	= document.documentMode
	isIE	= !!window.ActiveXObject
	isIE6	= isIE and not window.XMLHttpRequest
	isIE7	= isIE and not isIE6 and not ieMode or ieMode is 7
	isIE8	= isIE and ieMode is 8
	isIE9	= isIE and ieMode is 9

	class Utils
		###
		 # 拷贝对象（针对解析多维数据成一维数据给Backbone.Collection）
		 # @param obj [Object] 必填。将要拷贝的对象
		###
		copy: (obj) ->
			re = {}
			for own o, val of obj
				continue if o is 'children'
				re[o] = val
			re

		getRoutePath: ->
			location.hash.replace /^#/, ''
			
		getRouteName: ->
			s = @getRoutePath()
			i = s.indexOf '\/'
			if i is -1 then s else s.substr 0, i

		###
		 # 获得指定日期规范格式<yyyy-MM-dd>的字符串数组
		 # @param param [Object] 选填。JSON对象。
		 # @param param - date [Date/String] 选填。欲格式化的Date/String类型的数据。如为空，则返回当前日期。
		 # @param param - forward [Number] 选填。提前的天数。支持0和负整数。如果调用时带有此参数，将返回一个包含两个元素的数组，第一个日期早于第二个日期。
		###
		getDate: (param) ->
			return if not param
			date = param['date'] or new Date()
			date = new Date(date) if typeof date is 'string'

			if /^-?\d+$/.test param['forward']	# forward为整数时（包括0和正负整数）
				af_day = date.getTime()
				be_day = af_day - param['forward'] * 24 * 60 * 60 * 1000
				af_day = date.getFormatDate new Date(af_day)
				be_day = date.getFormatDate new Date(be_day)

				return [be_day, af_day]
			return

		###
		 # 注释实现多行文本拼接 -- 参考文献：http://www.ghugo.com/function-multiline-text-in-comments/
		 # @param fn [Function] 必填。一个匿名函数，函数体是一个块注释。(注意：需要带上!@preserve)（用法详见参考文献）
		###
		multiline: (fn) ->
			reCommentContents = /\/\*!?(?:\@preserve)?[ \t]*(?:\r\n|\n)([\s\S]*?)(?:\r\n|\n)[ \t]*\*\//
			match = reCommentContents.exec fn.toString()

			if not match
				throw new TypeError 'Multiline comment missing.'

			match[1]

#****************************** 内部函数 ******************************#

		###
		 # 获得指定日期、时间规范格式<yyyy-MM-dd>|<HH:mm:ss>|<yyyy-MM-dd HH:mm:ss>的字符串
		 # @param param [Object] 选填。JSON对象。
		 # @param param - date [Date] 选填。欲格式化的Date类型的数据。如为空，则默认当前日期。
		 # @param param - hasDate [Boolean] 选填。返回的规范化字符串带有“日期”。
		 # @param param - hasTime [Boolean] 选填。返回的规范化字符串带有“时间”。
		 # @param param - forward [Number] 选填。提前的天数。支持0和负整数。如果调用时带有此参数，将返回一个包含两个元素的数组，第一个日期早于第二个日期。
		 # 注：此函数是用来追加到Date prototype的，不能直接调用。
		###
		_formatDate = (param) ->
			date = param['date'] or @
			y	 = date.getFullYear()
			M	 = date.getMonth() + 1
			M	 = if (M + '').length > 1 then M else '0' + M
			d	 = date.getDate()
			d	 = if (d + '').length > 1 then d else '0' + d
			H	 = date.getHours()
			H	 = if (H + '').length > 1 then H else '0' + H
			m	 = date.getMinutes()
			m	 = if (m + '').length > 1 then m else '0' + m
			s	 = date.getSeconds()
			s	 = if (s + '').length > 1 then s else '0' + s
			hD	 = param.hasDate
			hT	 = param.hasTime
			rD	 = if hD then (y + '-' + M + '-' + d) else ''
			rT	 = if hT then (H + ':' + m + ':' + s) else ''
			re	 = "#{ rD }#{ if hD and hT then ' ' else '' }#{ rT }"
			date = undefined
			re
	
		###
		 # 获得指定月份最后一天的规范格式<yyyy-MM-dd>的字符串
		 # @param date [Date/String] 必填。指定月份的Date对象或可以转换成Date对象的字符串
		###
		_getEndDayOfMonth = (date) ->
			date = new Date date if typeof date is 'string'
			date = new Date date.setDate(1)
			re	 = date.setMonth(date.getMonth() + 1) - 1 * 24 * 60 * 60 * 1000
			_formatDate.call @, {date: new Date(re), hasDate: 1}

#****************************** 修改原型 ******************************#

		###
		 # 获取格式化日期：2000-01-01
		###
		Date::getFormatDate = (date) ->
			_formatDate.call @, {date: date, hasDate: 1}

		###
		 # 获取格式化时间：00:00:00
		###
		Date::getFormatTime = (date) ->
			_formatDate.call @, {date: date, hasTime: 1}

		###
		 # 获取格式化日期+时间：2000-01-01 00:00:00
		###
		Date::getFormatDateAndTime = (date) ->
			_formatDate.call @, {date: date, hasDate: 1, hasTime: 1}

		###
		 # 获取指定月份最后一天的格式化日期：2000-01-31
		 # @param date [Date/String]
		###
		Date::getEndDayOfMonth = (date) ->
			date = date or new Date()
			_getEndDayOfMonth.call @, date

		###
		 # 去空格 - 前后空格都去掉
		###
		String::trim = ->
			@replace /(^\s*)|(\s*$)/g, ''

		###
		 # 去空格 - 去前面的空格
		###
		String::trimPre = ->
			@replace /(^\s*)/g, ''

		###
		 # 去空格 - 去后面的空格
		###
		String::trimSuf = ->
			@replace /(\s*$)/g, ''

		###
		 # 处理JSON库
		###
		String::toJSON = ->
			JSON.parse @

		###
		 # 将 $、<、>、"、'，与 / 转义成 HTML 字符
		###
		String::encodeHTML = String::encodeHTML or ->
			encodeHTMLRules =
				"&": "&#38;"
				"<": "&#60;"
				">": "&#62;"
				'"': '&#34;'
				"'": '&#39;'
				"/": '&#47;'
			matchHTML = /&(?!#?\w+;)|<|>|"|'|\//g
			if @ then @replace(matchHTML, (m) -> encodeHTMLRules[m] or m) else @

		###
		 # 将 $、<、>、"、'，与 / 从 HTML 字符 反转义成正常字符
		###
		String::decodeHTML = String::decodeHTML or ->
			decodeHTMLRules =
				"&#38;": "&"
				"&#60;": "<"
				"&#62;": ">"
				'&#34;': '"'
				'&#39;': "'"
				'&#47;': "/"
			matchHTML = /&#38;|&#60;|&#62;|&#34;|&#39;|&#47;/g
			if @ then @replace(matchHTML, (m) -> decodeHTMLRules[m] or m) else @

		String::utf16to8 = ->
			out = ''
			len = @length
			for i in [0...len]
				c = @charCodeAt(i)
				if c >= 0x0001 and c <= 0x007F
					out += @charAt(i)
				else if c > 0x07FF
					out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F))
					out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F))
					out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F))
				else
					out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F))
					out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F))
			out

		###
		 # Array: 判断当前 array 中是否存在指定元素
		###
		Array::has = (obj) ->
			@indexOf(obj) isnt -1

		###
		 # Array: 获取最后一个元素
		###
		Array::getLast = ->
			@[@length - 1]

		###
		 # Array: 去重
		###
		Array::unique = ->
			hash = {}
			i	 = 0
			temp = @[0]
			while temp
				if hash[temp]
					@splice i, 1
					i--
				else
					hash[temp] = true

				temp = @[++i]
			@

		###
		 # 处理Base64库
		###
		if Object.defineProperty and not isIE8
			Base64.extendString()
		else
			String::toBase64 = (urisafe) ->
				Base64[if urisafe then 'encodeURI' else 'encode'] @
			String::toBase64URI = ->
				Base64['encodeURI'] @
			String::fromBase64 = ->
				Base64['decode'] @

		###
		 # 扩展jQuery
		###
		$.zIndex = 1501
		$.fn.extend
			modal: (param) ->
				modal = @

				if not modal.data 'modalInited'
					# Save the Parameter
					modal.data 'param', $.extend	# Default Parameter
						'show': true
						'keyboard': true
					, param
					param = modal.data 'param'

					# Regist Modal Event
					modal.on('show', (event) ->
						return if event.target isnt @
						modal = $(@)

						# Init Modal Style & Element
						modal.after '<div class="modal-backdrop fade in" style="z-index: ' + ($.zIndex += 9) + ';"></div>'
						modal.css 'zIndex', $.zIndex += 1

						setTimeout ->
							modal.addClass 'in'
							return
						, 0	# 做成 0 秒异步是因为同步状态下，css3的动画会无效

						# Let Modal Get Focus
						# TODO 换成 bootstrap v3 聚焦有问题
						$('.modal-footer .btn:first', modal).focus()
						# Listening Event: shown
						modal.trigger 'shown'

					).on('hide', (event) ->	# Function: Close Modal
						return if event.target isnt @
						modal = $(@)

						# hide modal
						modal.removeClass 'in'
						setTimeout ->
							# remove the backdrop
							modal.next('.modal-backdrop').remove()
							# Listening Event: hidden
							modal.trigger 'hidden'
							return
						, 420

						@
					).on('click', '[data-dismiss="modal"]', (event) ->	# Event: Close Button
						$(event.currentTarget).parents('.modal').trigger('hide')
						return
					).on('keyup', (event) ->
						keyCode = event.keyCode
						if keyCode is 27	# ESC
							modal = $(@)
							if modal.data('param')['keyboard']
								modal.trigger 'hide'
						return
					)

					modal.trigger 'show' if param['show']

					modal.data 'modalInited', 1

				if typeof param is 'string'
					if param is 'show'
						modal.trigger 'show'
					else if param is 'hide'
						modal.trigger 'hide'

				@

			###
			 # 移动光标到指定位置
			 # @param position [Number] 光标位置（下标）
			###
			setCursorPosition: (position) ->
				return @ if @lengh is 0
				return $(@).setSelection position, position

			###
			 # 设置光标选中文本
			 # @param selectionStart [Number] 开始下标
			 # @param selectionEnd [Number] 结束下标
			###
			setSelection: (selectionStart, selectionEnd) ->
				return @ if @lengh is 0
				input = @[0]

				if input.createTextRange
					range = input.createTextRange()
					range.collapse true
					range.moveEnd 'character', selectionEnd
					range.moveStart 'character', selectionStart
					range.select()
				else if input.setSelectionRange
					input.focus()
					input.setSelectionRange selectionStart, selectionEnd

				@

			###
			 # focus 之后，将光标放到最后
			###
			focusEnd: ->
				@setCursorPosition @val().length
				return

			###
			 # 限制文本输入（目前仅支持 INPUT）
			 # @param data [JSON Object] 传入参数
			 # - type [string]	类型（"int", "float"）
			 # ============================================
			 # 当 type === 'int'：
			 # - maxLength [int] 最大长度（默认不限制）
			 # ============================================
			 # 当 type === 'float'：
			 # - intMaxLength [int] 整数部分最大长度（默认不限制）
			 # - decMaxLength [int] 小数部分最大长度（默认不限制）
			###
			formatInsert: (data) ->
				return @ unless /^INPUT$/.test @[0].tagName
				return @ unless data
				_keydown	= []
				_keyup		= []
				_change		= []

				# BackSpace	8
				# Tab		9
				# Ctrl		17
				# Command	224
				# 大键盘	48 - 57
				# 小键盘	96 - 105
				# .			190, 110
				compositePreKey = (keyCode) =>
					if keyCode in [17, 224]
						@data compositeKey: true
						return true
					return false
				switch data.type
					when 'int'
						data.maxLength	= data.maxLength or Infinity
						_keydown.push (event) =>
							keyCode	= event.keyCode
							return true if compositePreKey keyCode
							return true if @data 'compositeKey'
							return true if keyCode in [8, 9]
							return false unless keyCode in [48..57].concat [96..105]
							val	= $(event.currentTarget).val()
							return false if data.maxLength and val.length >= data.maxLength

					when 'float'
						data.intMaxLength	= data.intMaxLength or Infinity
						data.decMaxLength	= data.decMaxLength or Infinity
						_keydown.push (event) =>
							keyCode	= event.keyCode
							return true if compositePreKey keyCode
							return true if @data 'compositeKey'
							return true if keyCode in [8, 9]
							return false unless keyCode in [190, 110].concat [48..57].concat [96..105]
							val		= $(event.currentTarget).val()
							hasDot	= val.indexOf('.') isnt -1
							return false if hasDot and keyCode in [190, 110]
							return false if data.intMaxLength and val.replace(/\.\d*$/, '').length >= data.intMaxLength
							return false if hasDot and data.decMaxLength and val.replace(/^\d*\./, '').length >= data.decMaxLength
						_change.push (event) =>
							el	= $(event.currentTarget)
							el.val el.val().replace(/\.$/, '')

				_keyup.push (event) =>
					@data compositeKey: false if event.keyCode in [17, 224]

				# 注销之前注册的事件（如果有）
				(@off 'keydown', _fun for _fun in @data._keydown) if @data._keydown
				(@off 'keyup', _fun for _fun in @data._keyup) if @data._keyup
				(@off 'change', _fun for _fun in @data._change) if @data._change

				@data._keydown	= _keydown
				@data._keyup	= _keyup
				@data._change	= _change

				# 绑定事件
				@on 'keydown', _fun for _fun in _keydown
				@on 'keyup', _fun for _fun in _keyup
				@on 'change', _fun for _fun in _change

				@

		###
		 # 非修改对象原型、非Utils类的Common部分
		###

		###
		 # EC2.alert & EC2.confirm
		 #
		 # @param param [JSON Object]
		 # 	- title [string]	标题
		 # 	- content [string]	正文内容
		 # 	- className [string]	样式类名（会被追加到 .modal 的 class attribute 中）
		 # 	- ok [JSON Object]	“确定”按钮参数
		 # 	-	-	text [string]	“确定”按钮显示文字（默认："确定"）
		 # 	-	-	callback [Function]	“确定”按钮回调函数
		 # 	-	-	autohide [Boolean]	“确定”按钮点击后自动隐藏（默认：true）
		 # 	- cancel [JSON Object]	“取消”按钮参数（注：此参数存在与否会作为判断 alert 或 confirm 的依据）
		 # 	-	-	text [string]	“取消”按钮显示文字（默认："取消"）
		 # 	-	-	callback [Function]	“取消”按钮回调函数
		###
		EC2.confirm = (param) ->
			return if not param

			# 默认图标：icon-prompt, 默认图标颜色：text-light-blue
			param = $.extend {icon: {name: 'prompt', color: 'light-blue'}}, param

			# 如 content 中不包含任何标签，默认外面套一个 p 标签
			param.content = "<p>#{ param.content.encodeHTML() }</p>" if not /<\//.test(param.content)
			
			# 默认点击关闭
			param.ok = $.extend {autohide: true}, param.ok if param.ok

			# 将 modal element 追加到 body 中
			_el = $(doT.template(TplAlert)(param)).appendTo('body')
			# 添加样式类
			_el.addClass param.className if param.className
			# 绑定 modal 隐藏事件：移除本 modal element
			_el.on 'hidden', ->
				_el.remove()
				return
			# bind Events
			if param.ok and param.ok.callback
				_el.on 'click', '.btn[btn-type="ok"]', ->
					param.ok.callback.apply _el, arguments
					return

			if param.cancel and param.cancel.callback
				_el.on 'click', '.btn[btn-type="cancel"], .close', ->
					param.cancel.callback.apply _el, arguments
					return

			# 显示 modal
			_el.modal 'show'
			# 获取焦点
			$('.modal-footer .btn:eq(0)', _el).focus()
			_el

		###
		 # 调用方式（两种）
		 # 1. EC2.alert('string message');
		 # 2. EC2.alert({content: 'message', ...});
		###
		EC2.alert = (param) ->
			if typeof param is 'string'
				param =
					content: '<p>' + param.encodeHTML() + '</p>'
			else
				if /\\>/.test param.content
					param.content = '<p>' + param.content.encodeHTML() + '</p>'

			EC2.confirm $.extend
				type: 'alert'
			, param
	
