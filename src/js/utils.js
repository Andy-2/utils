(function() {
  var hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  define(['jquery', 'doT', 'text!../templates/_alert.tpl', 'base64'], function($, doT, TplAlert) {
    var Utils, ieMode, isIE, isIE6, isIE7, isIE8, isIE9;
    ieMode = document.documentMode;
    isIE = !!window.ActiveXObject;
    isIE6 = isIE && !window.XMLHttpRequest;
    isIE7 = isIE && !isIE6 && !ieMode || ieMode === 7;
    isIE8 = isIE && ieMode === 8;
    isIE9 = isIE && ieMode === 9;
    return Utils = (function() {
      var _formatDate, _getEndDayOfMonth;

      function Utils() {}


      /*
      		  * 拷贝对象（针对解析多维数据成一维数据给Backbone.Collection）
      		  * @param obj [Object] 必填。将要拷贝的对象
       */

      Utils.prototype.copy = function(obj) {
        var o, re, val;
        re = {};
        for (o in obj) {
          if (!hasProp.call(obj, o)) continue;
          val = obj[o];
          if (o === 'children') {
            continue;
          }
          re[o] = val;
        }
        return re;
      };

      Utils.prototype.getRoutePath = function() {
        return location.hash.replace(/^#/, '');
      };

      Utils.prototype.getRouteName = function() {
        var i, s;
        s = this.getRoutePath();
        i = s.indexOf('\/');
        if (i === -1) {
          return s;
        } else {
          return s.substr(0, i);
        }
      };


      /*
      		  * 获得指定日期规范格式<yyyy-MM-dd>的字符串数组
      		  * @param param [Object] 选填。JSON对象。
      		  * @param param - date [Date/String] 选填。欲格式化的Date/String类型的数据。如为空，则返回当前日期。
      		  * @param param - forward [Number] 选填。提前的天数。支持0和负整数。如果调用时带有此参数，将返回一个包含两个元素的数组，第一个日期早于第二个日期。
       */

      Utils.prototype.getDate = function(param) {
        var af_day, be_day, date;
        if (!param) {
          return;
        }
        date = param['date'] || new Date();
        if (typeof date === 'string') {
          date = new Date(date);
        }
        if (/^-?\d+$/.test(param['forward'])) {
          af_day = date.getTime();
          be_day = af_day - param['forward'] * 24 * 60 * 60 * 1000;
          af_day = date.getFormatDate(new Date(af_day));
          be_day = date.getFormatDate(new Date(be_day));
          return [be_day, af_day];
        }
      };


      /*
      		  * 注释实现多行文本拼接 -- 参考文献：http://www.ghugo.com/function-multiline-text-in-comments/
      		  * @param fn [Function] 必填。一个匿名函数，函数体是一个块注释。(注意：需要带上!@preserve)（用法详见参考文献）
       */

      Utils.prototype.multiline = function(fn) {
        var match, reCommentContents;
        reCommentContents = /\/\*!?(?:\@preserve)?[ \t]*(?:\r\n|\n)([\s\S]*?)(?:\r\n|\n)[ \t]*\*\//;
        match = reCommentContents.exec(fn.toString());
        if (!match) {
          throw new TypeError('Multiline comment missing.');
        }
        return match[1];
      };


      /*
      		  * 获得指定日期、时间规范格式<yyyy-MM-dd>|<HH:mm:ss>|<yyyy-MM-dd HH:mm:ss>的字符串
      		  * @param param [Object] 选填。JSON对象。
      		  * @param param - date [Date] 选填。欲格式化的Date类型的数据。如为空，则默认当前日期。
      		  * @param param - hasDate [Boolean] 选填。返回的规范化字符串带有“日期”。
      		  * @param param - hasTime [Boolean] 选填。返回的规范化字符串带有“时间”。
      		  * @param param - forward [Number] 选填。提前的天数。支持0和负整数。如果调用时带有此参数，将返回一个包含两个元素的数组，第一个日期早于第二个日期。
      		  * 注：此函数是用来追加到Date prototype的，不能直接调用。
       */

      _formatDate = function(param) {
        var H, M, d, date, hD, hT, m, rD, rT, re, s, y;
        date = param['date'] || this;
        y = date.getFullYear();
        M = date.getMonth() + 1;
        M = (M + '').length > 1 ? M : '0' + M;
        d = date.getDate();
        d = (d + '').length > 1 ? d : '0' + d;
        H = date.getHours();
        H = (H + '').length > 1 ? H : '0' + H;
        m = date.getMinutes();
        m = (m + '').length > 1 ? m : '0' + m;
        s = date.getSeconds();
        s = (s + '').length > 1 ? s : '0' + s;
        hD = param.hasDate;
        hT = param.hasTime;
        rD = hD ? y + '-' + M + '-' + d : '';
        rT = hT ? H + ':' + m + ':' + s : '';
        re = "" + rD + (hD && hT ? ' ' : '') + rT;
        date = void 0;
        return re;
      };


      /*
      		  * 获得指定月份最后一天的规范格式<yyyy-MM-dd>的字符串
      		  * @param date [Date/String] 必填。指定月份的Date对象或可以转换成Date对象的字符串
       */

      _getEndDayOfMonth = function(date) {
        var re;
        if (typeof date === 'string') {
          date = new Date(date);
        }
        date = new Date(date.setDate(1));
        re = date.setMonth(date.getMonth() + 1) - 1 * 24 * 60 * 60 * 1000;
        return _formatDate.call(this, {
          date: new Date(re),
          hasDate: 1
        });
      };


      /*
      		  * 获取格式化日期：2000-01-01
       */

      Date.prototype.getFormatDate = function(date) {
        return _formatDate.call(this, {
          date: date,
          hasDate: 1
        });
      };


      /*
      		  * 获取格式化时间：00:00:00
       */

      Date.prototype.getFormatTime = function(date) {
        return _formatDate.call(this, {
          date: date,
          hasTime: 1
        });
      };


      /*
      		  * 获取格式化日期+时间：2000-01-01 00:00:00
       */

      Date.prototype.getFormatDateAndTime = function(date) {
        return _formatDate.call(this, {
          date: date,
          hasDate: 1,
          hasTime: 1
        });
      };


      /*
      		  * 获取指定月份最后一天的格式化日期：2000-01-31
      		  * @param date [Date/String]
       */

      Date.prototype.getEndDayOfMonth = function(date) {
        date = date || new Date();
        return _getEndDayOfMonth.call(this, date);
      };


      /*
      		  * 去空格 - 前后空格都去掉
       */

      String.prototype.trim = function() {
        return this.replace(/(^\s*)|(\s*$)/g, '');
      };


      /*
      		  * 去空格 - 去前面的空格
       */

      String.prototype.trimPre = function() {
        return this.replace(/(^\s*)/g, '');
      };


      /*
      		  * 去空格 - 去后面的空格
       */

      String.prototype.trimSuf = function() {
        return this.replace(/(\s*$)/g, '');
      };


      /*
      		  * 处理JSON库
       */

      String.prototype.toJSON = function() {
        return JSON.parse(this);
      };


      /*
      		  * 将 $、<、>、"、'，与 / 转义成 HTML 字符
       */

      String.prototype.encodeHTML = String.prototype.encodeHTML || function() {
        var encodeHTMLRules, matchHTML;
        encodeHTMLRules = {
          "&": "&#38;",
          "<": "&#60;",
          ">": "&#62;",
          '"': '&#34;',
          "'": '&#39;',
          "/": '&#47;'
        };
        matchHTML = /&(?!#?\w+;)|<|>|"|'|\//g;
        if (this) {
          return this.replace(matchHTML, function(m) {
            return encodeHTMLRules[m] || m;
          });
        } else {
          return this;
        }
      };


      /*
      		  * 将 $、<、>、"、'，与 / 从 HTML 字符 反转义成正常字符
       */

      String.prototype.decodeHTML = String.prototype.decodeHTML || function() {
        var decodeHTMLRules, matchHTML;
        decodeHTMLRules = {
          "&#38;": "&",
          "&#60;": "<",
          "&#62;": ">",
          '&#34;': '"',
          '&#39;': "'",
          '&#47;': "/"
        };
        matchHTML = /&#38;|&#60;|&#62;|&#34;|&#39;|&#47;/g;
        if (this) {
          return this.replace(matchHTML, function(m) {
            return decodeHTMLRules[m] || m;
          });
        } else {
          return this;
        }
      };

      String.prototype.utf16to8 = function() {
        var c, i, j, len, out, ref;
        out = '';
        len = this.length;
        for (i = j = 0, ref = len; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
          c = this.charCodeAt(i);
          if (c >= 0x0001 && c <= 0x007F) {
            out += this.charAt(i);
          } else if (c > 0x07FF) {
            out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
            out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
            out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
          } else {
            out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
            out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
          }
        }
        return out;
      };


      /*
      		  * Array: 判断当前 array 中是否存在指定元素
       */

      Array.prototype.has = function(obj) {
        return this.indexOf(obj) !== -1;
      };


      /*
      		  * Array: 获取最后一个元素
       */

      Array.prototype.getLast = function() {
        return this[this.length - 1];
      };


      /*
      		  * Array: 去重
       */

      Array.prototype.unique = function() {
        var hash, i, temp;
        hash = {};
        i = 0;
        temp = this[0];
        while (temp) {
          if (hash[temp]) {
            this.splice(i, 1);
            i--;
          } else {
            hash[temp] = true;
          }
          temp = this[++i];
        }
        return this;
      };


      /*
      		  * 处理Base64库
       */

      if (Object.defineProperty && !isIE8) {
        Base64.extendString();
      } else {
        String.prototype.toBase64 = function(urisafe) {
          return Base64[urisafe ? 'encodeURI' : 'encode'](this);
        };
        String.prototype.toBase64URI = function() {
          return Base64['encodeURI'](this);
        };
        String.prototype.fromBase64 = function() {
          return Base64['decode'](this);
        };
      }


      /*
      		  * 扩展jQuery
       */

      $.zIndex = 1501;

      $.fn.extend({
        modal: function(param) {
          var modal;
          modal = this;
          if (!modal.data('modalInited')) {
            modal.data('param', $.extend({
              'show': true,
              'keyboard': true
            }, param));
            param = modal.data('param');
            modal.on('show', function(event) {
              if (event.target !== this) {
                return;
              }
              modal = $(this);
              modal.after('<div class="modal-backdrop fade in" style="z-index: ' + ($.zIndex += 9) + ';"></div>');
              modal.css('zIndex', $.zIndex += 1);
              setTimeout(function() {
                modal.addClass('in');
              }, 0);
              $('.modal-footer .btn:first', modal).focus();
              return modal.trigger('shown');
            }).on('hide', function(event) {
              if (event.target !== this) {
                return;
              }
              modal = $(this);
              modal.removeClass('in');
              setTimeout(function() {
                modal.next('.modal-backdrop').remove();
                modal.trigger('hidden');
              }, 420);
              return this;
            }).on('click', '[data-dismiss="modal"]', function(event) {
              $(event.currentTarget).parents('.modal').trigger('hide');
            }).on('keyup', function(event) {
              var keyCode;
              keyCode = event.keyCode;
              if (keyCode === 27) {
                modal = $(this);
                if (modal.data('param')['keyboard']) {
                  modal.trigger('hide');
                }
              }
            });
            if (param['show']) {
              modal.trigger('show');
            }
            modal.data('modalInited', 1);
          }
          if (typeof param === 'string') {
            if (param === 'show') {
              modal.trigger('show');
            } else if (param === 'hide') {
              modal.trigger('hide');
            }
          }
          return this;
        },

        /*
        			  * 移动光标到指定位置
        			  * @param position [Number] 光标位置（下标）
         */
        setCursorPosition: function(position) {
          if (this.lengh === 0) {
            return this;
          }
          return $(this).setSelection(position, position);
        },

        /*
        			  * 设置光标选中文本
        			  * @param selectionStart [Number] 开始下标
        			  * @param selectionEnd [Number] 结束下标
         */
        setSelection: function(selectionStart, selectionEnd) {
          var input, range;
          if (this.lengh === 0) {
            return this;
          }
          input = this[0];
          if (input.createTextRange) {
            range = input.createTextRange();
            range.collapse(true);
            range.moveEnd('character', selectionEnd);
            range.moveStart('character', selectionStart);
            range.select();
          } else if (input.setSelectionRange) {
            input.focus();
            input.setSelectionRange(selectionStart, selectionEnd);
          }
          return this;
        },

        /*
        			  * focus 之后，将光标放到最后
         */
        focusEnd: function() {
          this.setCursorPosition(this.val().length);
        },

        /*
        			  * 限制文本输入（目前仅支持 INPUT）
        			  * @param data [JSON Object] 传入参数
        			  * - type [string]	类型（"int", "float"）
        			  * ============================================
        			  * 当 type === 'int'：
        			  * - maxLength [int] 最大长度（默认不限制）
        			  * ============================================
        			  * 当 type === 'float'：
        			  * - intMaxLength [int] 整数部分最大长度（默认不限制）
        			  * - decMaxLength [int] 小数部分最大长度（默认不限制）
         */
        formatInsert: function(data) {
          var _change, _fun, _keydown, _keyup, compositePreKey, j, k, l, len1, len2, len3, len4, len5, len6, n, p, q, ref, ref1, ref2;
          if (!/^INPUT$/.test(this[0].tagName)) {
            return this;
          }
          if (!data) {
            return this;
          }
          _keydown = [];
          _keyup = [];
          _change = [];
          compositePreKey = (function(_this) {
            return function(keyCode) {
              if (keyCode === 17 || keyCode === 224) {
                _this.data({
                  compositeKey: true
                });
                return true;
              }
              return false;
            };
          })(this);
          switch (data.type) {
            case 'int':
              data.maxLength = data.maxLength || Infinity;
              _keydown.push((function(_this) {
                return function(event) {
                  var keyCode, val;
                  keyCode = event.keyCode;
                  if (compositePreKey(keyCode)) {
                    return true;
                  }
                  if (_this.data('compositeKey')) {
                    return true;
                  }
                  if (keyCode === 8 || keyCode === 9) {
                    return true;
                  }
                  if (indexOf.call([48, 49, 50, 51, 52, 53, 54, 55, 56, 57].concat([96, 97, 98, 99, 100, 101, 102, 103, 104, 105]), keyCode) < 0) {
                    return false;
                  }
                  val = $(event.currentTarget).val();
                  if (data.maxLength && val.length >= data.maxLength) {
                    return false;
                  }
                };
              })(this));
              break;
            case 'float':
              data.intMaxLength = data.intMaxLength || Infinity;
              data.decMaxLength = data.decMaxLength || Infinity;
              _keydown.push((function(_this) {
                return function(event) {
                  var hasDot, keyCode, val;
                  keyCode = event.keyCode;
                  if (compositePreKey(keyCode)) {
                    return true;
                  }
                  if (_this.data('compositeKey')) {
                    return true;
                  }
                  if (keyCode === 8 || keyCode === 9) {
                    return true;
                  }
                  if (indexOf.call([190, 110].concat([48, 49, 50, 51, 52, 53, 54, 55, 56, 57].concat([96, 97, 98, 99, 100, 101, 102, 103, 104, 105])), keyCode) < 0) {
                    return false;
                  }
                  val = $(event.currentTarget).val();
                  hasDot = val.indexOf('.') !== -1;
                  if (hasDot && (keyCode === 190 || keyCode === 110)) {
                    return false;
                  }
                  if (data.intMaxLength && val.replace(/\.\d*$/, '').length >= data.intMaxLength) {
                    return false;
                  }
                  if (hasDot && data.decMaxLength && val.replace(/^\d*\./, '').length >= data.decMaxLength) {
                    return false;
                  }
                };
              })(this));
              _change.push((function(_this) {
                return function(event) {
                  var el;
                  el = $(event.currentTarget);
                  return el.val(el.val().replace(/\.$/, ''));
                };
              })(this));
          }
          _keyup.push((function(_this) {
            return function(event) {
              var ref;
              if ((ref = event.keyCode) === 17 || ref === 224) {
                return _this.data({
                  compositeKey: false
                });
              }
            };
          })(this));
          if (this.data._keydown) {
            ref = this.data._keydown;
            for (j = 0, len1 = ref.length; j < len1; j++) {
              _fun = ref[j];
              this.off('keydown', _fun);
            }
          }
          if (this.data._keyup) {
            ref1 = this.data._keyup;
            for (k = 0, len2 = ref1.length; k < len2; k++) {
              _fun = ref1[k];
              this.off('keyup', _fun);
            }
          }
          if (this.data._change) {
            ref2 = this.data._change;
            for (l = 0, len3 = ref2.length; l < len3; l++) {
              _fun = ref2[l];
              this.off('change', _fun);
            }
          }
          this.data._keydown = _keydown;
          this.data._keyup = _keyup;
          this.data._change = _change;
          for (n = 0, len4 = _keydown.length; n < len4; n++) {
            _fun = _keydown[n];
            this.on('keydown', _fun);
          }
          for (p = 0, len5 = _keyup.length; p < len5; p++) {
            _fun = _keyup[p];
            this.on('keyup', _fun);
          }
          for (q = 0, len6 = _change.length; q < len6; q++) {
            _fun = _change[q];
            this.on('change', _fun);
          }
          return this;
        }
      });


      /*
      		  * 非修改对象原型、非Utils类的Common部分
       */


      /*
      		  * EC2.alert & EC2.confirm
      		  *
      		  * @param param [JSON Object]
      		  * 	- title [string]	标题
      		  * 	- content [string]	正文内容
      		  * 	- className [string]	样式类名（会被追加到 .modal 的 class attribute 中）
      		  * 	- ok [JSON Object]	“确定”按钮参数
      		  * 	-	-	text [string]	“确定”按钮显示文字（默认："确定"）
      		  * 	-	-	callback [Function]	“确定”按钮回调函数
      		  * 	-	-	autohide [Boolean]	“确定”按钮点击后自动隐藏（默认：true）
      		  * 	- cancel [JSON Object]	“取消”按钮参数（注：此参数存在与否会作为判断 alert 或 confirm 的依据）
      		  * 	-	-	text [string]	“取消”按钮显示文字（默认："取消"）
      		  * 	-	-	callback [Function]	“取消”按钮回调函数
       */

      EC2.confirm = function(param) {
        var _el;
        if (!param) {
          return;
        }
        param = $.extend({
          icon: {
            name: 'prompt',
            color: 'light-blue'
          }
        }, param);
        if (!/<\//.test(param.content)) {
          param.content = "<p>" + (param.content.encodeHTML()) + "</p>";
        }
        if (param.ok) {
          param.ok = $.extend({
            autohide: true
          }, param.ok);
        }
        _el = $(doT.template(TplAlert)(param)).appendTo('body');
        if (param.className) {
          _el.addClass(param.className);
        }
        _el.on('hidden', function() {
          _el.remove();
        });
        if (param.ok && param.ok.callback) {
          _el.on('click', '.btn[btn-type="ok"]', function() {
            param.ok.callback.apply(_el, arguments);
          });
        }
        if (param.cancel && param.cancel.callback) {
          _el.on('click', '.btn[btn-type="cancel"], .close', function() {
            param.cancel.callback.apply(_el, arguments);
          });
        }
        _el.modal('show');
        $('.modal-footer .btn:eq(0)', _el).focus();
        return _el;
      };


      /*
      		  * 调用方式（两种）
      		  * 1. EC2.alert('string message');
      		  * 2. EC2.alert({content: 'message', ...});
       */

      EC2.alert = function(param) {
        if (typeof param === 'string') {
          param = {
            content: '<p>' + param.encodeHTML() + '</p>'
          };
        } else {
          if (/\\>/.test(param.content)) {
            param.content = '<p>' + param.content.encodeHTML() + '</p>';
          }
        }
        return EC2.confirm($.extend({
          type: 'alert'
        }, param));
      };

      return Utils;

    })();
  });

}).call(this);

//# sourceMappingURL=../../sourceMap/utils.js.map
