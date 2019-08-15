/*
 * version:1.2
 * create:2011-12-28
 * rework:2013-03-06
 * author:front-end web develop team(FEDT)
 */
(function(w, d, ns) {
	//'use strict';

	//重复引用判断，自动退出
	if (w[ns] && typeof w[ns] === "object") return;

	//外部加载辅助文件配置
	var outfile = {
		localmsg: {
			id: 'localMsg',
			url: '//style.org.hc360.cn/js/build/source/core/fl/localmsg/localmsg.swf'
		},
		iflm: {
			id: 'iLocalMsg',
			htmlurl: '//style.org.hc360.cn/js/build/source/core/iflm.html',
			jsurl: ''
		},
		bar: {
			url: '//style.org.hc360.cn/js/build/source/core/hc.bar.min.js'
		}
	}

	//全局变量
	var hc = {},
		widgets = {};
	hc.startTime = new Date().getTime();
	hc.barInitialized = false;

	/*
	 * hub管理命名空间的
	 */
	var hub = {
		clickRecorder: function(key) {
			// var url = '//loginfo.hc360.com/click.htm',
			// 	img = new Image(),
			// 	recordID = new Date().getTime() + '_' + Math.random() * Math.pow(10, 18);
			// window['_img_' + recordID] = img;
			// img.onload = img.onerror = function() {
			// 	window['_img_' + recordID] = null;
			// }
			// img.src = url + '?' + key + '&r=' + recordID;
		},
		getBrowser: function() {
			var bs = {},
				u = w.navigator.userAgent;
			var msie = /(MSIE) ([\d.]+)/,
				msiegt10 = /(Trident)\/([\d\.]+)/,
				chrome = /(Chrome)\/([\d.]+)/,
				firefox = /(Firefox)\/([\d.]+)/,
				safari = /(Safari)\/([\d.]+)/,
				opera = /(Opera)\/([\d.]+)/;
			var b = u.match(msie) || u.match(msiegt10) || u.match(chrome) || u.match(firefox) || u.match(safari) || u.match(opera);
			if (b) {
				if (b[1] === 'Opera') b[2] = u.match(/(Version)\/([\d.]+)/)[2];
				var cover = u.match(/(QQBrowser)|(Maxthon)|(360EE)|(360SE)|(SE 2.X MetaSr 1.0)/);
				bs[b[1]] = b[2];
				bs['name'] = b[1];
				bs['version'] = b[2];
				if (cover && cover[0]) bs['cover'] = cover[0];
			}

			return bs;
		},
		addEvent: function(obj, fn, type) {
			obj.addEventListener(type, fn, false);
		},
		removeEvent: function(obj, fn, type) {
			obj.removeEventListener(type, fn, false);
		},
		parseXML: function(s) {
			return new DOMParser().parseFromString(s, 'text/xml');
		},
		addCss: function(url, fn) {
			if (!url) return;
			var link = d.createElement('link');
			link.href = url;
			link.type = 'text/css';
			link.rel = 'stylesheet';
			var ieVersion = /(6.0)|(7.0)|(8.0)/;
			if (ieVersion.test(hc.b.MSIE)) {
				link.onreadystatechange = function() {
					if ((this.readyState === 'loaded' || this.readyState === 'complete') && fn) fn();
				}
			} else link.onload = function() {
				if (fn) fn()
			};
			d.getElementsByTagName('head')[0].appendChild(link);
		},
		addScript: function(url, fn) {
			if (!url) return;
			var s = d.createElement('script');
			var ieVersion = /(6.0)|(7.0)|(8.0)/;
			if (ieVersion.test(hc.b.MSIE)) {
				s.onreadystatechange = function() {
					if ((this.readyState === 'loaded' || this.readyState === 'complete') && fn) fn();
				}
			} else s.onload = function() {
				if (fn) fn()
			};
			s.type = 'text/javascript';
			s.src = url;
			s.setAttribute('charset', 'utf-8');
			d.getElementsByTagName('head')[0].appendChild(s);
		},
		addScriptList: function(urls, fn) {
			var sarr = [];
			var len = urls.length;

			function pul() {
				//console.log(sarr)
				sarr.push(1);
				if (sarr.length === len && fn) fn();
			}
			for (var i = 0; i < len; i++) {
				this.addScript(urls[i], pul);
			}
		},
		jsonp: function(url, opt, callback) {
			var fname = 'HC_' + Math.floor(Math.random() * 1E10) + '_' + new Date().getTime();
			var data = opt.data;
			url += '?' + opt.callback + '=' + fname;
			if (data) {
				for (parm in data) {
					url += "&" + parm + '=' + data[parm];
				}
			}
			window[fname] = function(data) {
					if (typeof callback === "function") callback(data);
					window[fname] = null;
				}
				//console.log("allow domain url: " + url);
			this.addScript(url);
		},
		checkFP: function() {
			//Shockwave Flash 11.2 r202
			var fp = null,
				v = null;
			fp = navigator.plugins['Shockwave Flash'];
			if (fp) v = parseFloat(fp.description.split(' ')[2]);
			return v;
		},
		getSWFObject: function(name) {
			return document.embeds[name];
		},
		addSWF: function(box, swfId, url, flashvars, width, height) {
			var fp = d.createElement('embed');
			if (!width || !height) {
				fp.style.visibility = 'hidden';
				fp.width = 0;
				fp.height = 0;
			} else {
				fp.width = width;
				fp.height = height;
			}
			fp.type = 'application/x-shockwave-flash';
			fp.id = swfId;
			fp.setAttribute('name', swfId);
			fp.setAttribute('allowScriptAccess', 'always');
			fp.setAttribute('flashvars', flashvars);
			fp.src = url;
			box.appendChild(fp);
		},
		addIframe: function(box, url, id, callback, width, height) {
			var frame = d.createElement('iframe');
			frame.id = id;
			frame.setAttribute('name', id);
			frame.width = width;
			frame.height = height;
			if (!width || !height) frame.style.display = 'none';
			box.appendChild(frame);
			this.addEvent(frame, callback, 'load');
			frame.src = url;
		},
		contentLoaded: function(fn) {
			var callback = fn;
			var DOMContentLoaded;

			// Cleanup functions for the document ready method
			if (document.addEventListener) {
				DOMContentLoaded = function() {
					document.removeEventListener("DOMContentLoaded", DOMContentLoaded, false);
					callback();
				};

			} else if (document.attachEvent) {
				DOMContentLoaded = function() {
					// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
					if (document.readyState === "complete") {
						document.detachEvent("onreadystatechange", DOMContentLoaded);
						callback();
					}
				};
			}

			// Mozilla, Opera and webkit nightlies currently support this event
			if (document.addEventListener) {
				// Use the handy event callback
				document.addEventListener("DOMContentLoaded", DOMContentLoaded, false);

				// A fallback to window.onload, that will always work
				window.addEventListener("load", callback, false);

				// If IE event model is used
			} else if (document.attachEvent) {
				// ensure firing before onload,
				// maybe late but safe also for iframes
				document.attachEvent("onreadystatechange", DOMContentLoaded);

				// A fallback to window.onload, that will always work
				window.attachEvent("onload", callback);

				// If IE and not a frame
				// continually check to see if the document is ready
				var toplevel = false;

				try {
					toplevel = window.frameElement == null;
				} catch (e) {}

				if (document.documentElement.doScroll && toplevel) {
					doScrollCheck();
				}
			}

			function doScrollCheck() {
				if (callback) {
					return;
				}

				try {
					// If IE is used, use the trick by Diego Perini
					// //javascript.nwbox.com/IEContentLoaded/
					document.documentElement.doScroll("left");
				} catch (e) {
					setTimeout(doScrollCheck, 1);
					return;
				}

				// and execute any waiting functions
				callback();
			}

		}

	};

	//本地cookie
	/*
	 * 调用方法 HC.HUB.LocalCookie
	 *
	 * @set,设置一个cookie，只接受一个对象参数{key:String, value:String, day:Number, domain:String, path:String}
	 * key和value为必须参数，其他为可选参数。
	 * day:有效期天数，如果不填则为session级别，如果为零则在当天零点过期
	 * domain和path，如果不填则默认当前页面的domain有和path
	 * @get,获取一个cookie的值。
	 * @remove,删除一个coolie。
	 */
	var localCookie = {
		getTodayLastTime: function() {
			//获得当天当前时间到零点的毫秒数
			var d = new Date();
			var h = 23 - d.getHours();
			var m = 59 - d.getMinutes();
			var s = 60 - d.getSeconds();
			return (h * 3600 + m * 60 + s) * 1000;
		},
		getExpireTimeString: function(day) {
			//拼装cookie过期时间字符串
			var time = (day === 0) ? this.getTodayLastTime() : day * 24 * 3600 * 1000;
			var currentTime = new Date().getTime();
			return new Date(currentTime + time).toUTCString();
		},
		set: function(opt) {
			//设置cookie  ,域名要符合规范 ,否则设置无效
			//name,value,day,domain,path
			var expire = ';expires=';
			if (isNaN(opt.day)) expire = '';
			else expire += this.getExpireTimeString(opt.day);
			var domain = (opt.domain) ? ';domain=' + opt.domain : '';
			var path = (opt.path) ? ';path=' + opt.path : '';
			d.cookie = opt.key + '=' + encodeURIComponent(opt.value) + expire + domain + path;
		},
		get: function(key) {
			var arr, reg = new RegExp("(^| )" + key + "=([^;]*)(;|$)");
			if (arr = document.cookie.match(reg)) return decodeURIComponent(arr[2]);
			else return null;
		},
		remove: function(key) {
			this.set({
				'key': key,
				'value': '',
				'day': -1
			});
		}
	};
	hub['LocalCookie'] = localCookie;

	//替换补丁
	/*
	 * 针对IE运行环境实现的公共方法
	 *
	 * @checkFP,全称是 check flash player，用来检测浏览器是否安装和启用了flash插件，没有检测到返回null ，有则返回flash player的版本号（一个浮点数字）
	 *
	 * @getSWFObject，根据flash的Id获取swf文件的调用
	 *
	 * @parseXML，将字符串转换为xml对象
	 */
	hc['b'] = hub.getBrowser();
	if (hc.b['name'] === 'MSIE') {
		hub.checkFP = function() {
			//WIN 11,2,202,235
			var fp = null,
				v = null;
			try {
				fp = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
			} catch (e) {}
			if (fp) v = parseFloat(fp.GetVariable("$version").split(' ')[1].replace(',', '.'));
			return v;
		}
		hub.getSWFObject = function(name) {
			return document[name];
		}
		hub.parseXML = function(s) {
			var xml = new ActiveXObject("Microsoft.XMLDOM");
			xml.async = "false";
			xml.loadXML(s);
			return xml;
		}
	}

	/**
	 * 针对IE（6-9）的公共方法的单独实现，目前只有这三个，目的是当没有jquery的情况下common也可以正常工作。
	 * 这种方法很少，主要是维持一个低标准的工作环境。
	 * 以补丁的方式实现的好处是，这些兼容性模块只有在common初始化的时候判断一次，不在调用的时候判断，节省频繁调用产生的消耗。
	 *
	 * @addEvent，removeEvent 添加和移除事件
	 * 三个参数依次是：添加事件的目标对象（Object）、回调函数（Function）、事件类型（String）
	 *
	 * @addSWF 动态在页面中插入一个flash文件（swf文件）
	 * 参数说明： box：flash加载的目标容器（element object）
	 * swf：引入的swf文件在页面ID（String）
	 * url：swf文件的绝对路径（String）
	 * flashvars：swf文件初始化的变量，如果不和页面交互，可以忽略，如（"a=5&b=6"）
	 * width和height：swf文件的显示出尺寸，如果有一项为零，swf则不显示
	 */
	if (/6.0|7.0|8.0|9.0|10.0/.test(hc.b['MSIE'])) {
		hub.addEvent = function(obj, fn, type) {
			obj.attachEvent('on' + type, fn);
		}
		hub.removeEvent = function(obj, fn, type) {
			obj.detachEvent('on' + type, fn);
		}

		hub.addSWF = function(box, swfId, url, flashvars, width, height) {
			var alow = '<param name="allowScriptAccess" value="always" />';
			var fvar = '<param name="flashvars" value="' + flashvars + '" />';
			var ob = '<object id="' + swfId + '" name="' + swfId + '" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="' + width + '" height="' + height + '">' + alow + fvar + '</object>';
			var div = d.createElement('div');
			div.innerHTML = ob;
			box.appendChild(div);
			d[swfId].movie = url;
			if (!width || !height) div.style.display = 'none';
		}
	}

	//ie页面标题bug补丁
	/*
	 * 在IE下（6-8）当url中带有“#”号标识锚点的时候，如果页面中有使用flash会对浏览器窗口title的显示造成不同程度的影响。
	 * 这段代码不用可以直接去掉，不会影响其他代码。
	 */
	if (/6.0|7.0|8.0/.test(hc.b['MSIE'])) {

		var pageTitle = '';

		document.attachEvent('onpropertychange', function(evt) {
			if (evt.propertyName === 'title' && document.title !== pageTitle) {
				if (!pageTitle) pageTitle = d.title.split('#')[0];
				setTimeout(function() {
					document.title = pageTitle;
				}, 1);
			}
		});

	}

	hc['W'] = widgets; //组件命名空间，组件类名放到这下面，一些慧聪自己开发的组件的类名在此下管理,详见common.js说明文档。
	hc['HUB'] = hub; //工具集合
	w[ns] = hc;
    window.HC = hc;
	function log(s) {
		try {
			console.log(s)
		} catch (e) {}
	}

	/*
	 flash本地通信模块的加载和初始化
	 fllm：flash local message ，加载的swf对象
	 http：访问swf文件http功能api集合
	 lm：local message
	 ls: local storage
	*/

	//Flash XMLHttpRequest
	/*
	 * js模拟了一个XMLHttpRequest对象，通过它调用localmsg.swf文件里的HTTP类，这样就实现了跨域post请求。
	 */
	var FLXHR = function(dataType) {
		var _xhr = this;
		var xhrName = 'FLXHR';
		var obj = hub.getSWFObject(outfile.localmsg.id);
		this.readyState = 0;
		this.status = 0;
		this.responseText = null;
		this.responseXML = null;
		this.responseJSON = null;
		this.questNum = -1;
		this.rNum = parseInt(Math.random() * 1E5, 10);

		this.open = function(type, url, async) {
			var questNum = this.questNum = obj.open(url, dataType);
			//delete HC.HTTP[xhrName +'CB' + (questNum-1)];
			HC.HTTP[xhrName + 'CB' + questNum] = _xhr;
		}
		this.send = function(xml) {
			obj.send(this.questNum, xml);
		}
		this.abort = function() {
				try {
					obj.abort();
				} catch (e) {}
				this.readyState = 0;
				this.status = 0;
				this.responseText = null;
				this.responseXML = null;
				this.responseJSON = null;
			}
			//this.onreadystatechange = function(){}
		this.loaded = function(e) {
			var ready = e['readyState'];
			this.readyState = ready;
			if (ready == 4) {
				this.status = e['status'];
				if (e['responseText']) {
					this.responseText = e['responseText'];
					if (dataType === 'XML') this.responseXML = hub.parseXML(e['responseText']);
					if (dataType === 'JSON') this.responseJSON = obj.getJSONByStr(e['responseText']);
				}
			}
			this.onreadystatechange();
		}
	}

	var fllmswf = null;
	var HTTP = {};
	var LM = {};
	var lmEvents = {
		'connected': [],
		'message': [],
		'receiveListener': [],
		'changedSpeaker': [],
		'changedListener': [],
		'pingSpeakerSucceed': [],
		'pingSpeakerError': [],
		'broadcastComplete': [],
		'ldsLoaded': []
	};
	var LS = {};

	/*
	 * 这部分是用来提前注册本地通信（fllm）初始化后的模块的回调的。
	 * 当flash初始化成功后，调用回调后最好执行runFLCBEvents，会将用户添加的方法执行一遍。
	 */

	//注册的回调方法和模块有关，会被添加到不同的数组里去lmEvents对象下保存了这些数组。
	function addFLCBEvent(type, fn, mod) {
		if (mod[type] !== undefined) mod[type].push(fn);
	}

	function removeFLCBEvent(type, fn, mod) {
		var arr = mod[type];
		var len = arr.length;
		if (len == 0) return;
		for (var i = len - 1; i >= 0; i--) {
			if (arr[i] === fn) {
				arr.splice(i, 1);
				break;
			} else continue;
		}
	}

	function runFLCBEvents(type, e, mod) {
		var arr = mod[type];
		var len = arr.length;
		for (var i = 0; i < len; i++) {
			try {
				arr[i](e);
			} catch (error) {}
		}
	}

	//本地数据工具集名称 lds: local data service
	//对本地数据同步和存储的统称，主要用来环境加载成功后的回调。
	var LDS = {
		inited: false,
		loadedCB: function(fn) {
			if (!this.inited) addFLCBEvent('ldsLoaded', fn, lmEvents);
			else fn();
		}
	};
	hc['LDS'] = LDS;

	/*
	 * flash local massage loaded。
	 * flash本地通信模块载入后的回调，localmsg.swf文件载入后会调用HC.FLLMLoaded这个全局方法完成API的注册。
	 *
	 *
	 */
	/*var fllmloaded = function() {
		//d.body.style.backgroundColor = '#CCC';
		delete hc['FLLMLoaded'];
		var fllm = hub.getSWFObject(outfile.localmsg.id);
		fllmswf = fllm;
		try {
			fllm.init({
				'HTTP': 'HC.HTTP.FLXHRCB',
				'LM': 'HC.LM',
				'LS': 'HC.LS'
			});
		} catch (err) { /!*console.log(err.toString())*!/ }

		LM = {
			init: function() {
				fllm.LMinit();
			},
			speaker: function() {
				fllm.LMspeaker();
			},
			changetoSpeaker: function() {
				fllm.LMchangetoSpeaker();
			},
			changetoListener: function() {
				fllm.LMchangetoListener();
			},
			receiveListener: function() {
				fllm.LMreceiveListener();
			},
			broadcast: function(obj) {
				fllm.LMbroadcast(obj);
			},
			pingSpeaker: function() {
				fllm.LMpingSpeaker();
			},
			addEvent: function(type, fn) {
				addFLCBEvent(type, fn, lmEvents);
			},
			removeEvent: function(type, fn) {
				removeFLCBEvent(type, fn, lmEvents);
			},
			runEvents: function(type, e) {
				runFLCBEvents(type, e, lmEvents);
			}
		}
		LS = {
			set: function(name, value) {
				fllm.LSset(name, value);
			},
			get: function(name) {
				return fllm.LSget(name);
			},
			getAll: function() {
				return fllm.LSgetAll();
			},
			remove: function(name) {
				fllm.LSremove(name);
			},
			clear: function() {
				fllm.LSclear();
			},
			size: function(name) {
				return fllm.LSsize();
			},
			allowDomain: function(domain) {
				fllm.LSdomain(domain);
			}
		}
		HTTP.crossDomainPost = function() {

		}

		hc['FLLMSet'] = function() {
			fllm.showSeting()
		}
		hc['FLXHR'] = FLXHR;
		hc['HTTP'] = HTTP;
		hc['LM'] = LM;
		hc['LS'] = LS;
		//window.ee = lmEvents;
		//if(hc.onLMLoaded) hc.onLMLoaded();

		/!** [不在页面加载右下角发发工具条] *!/
		// hub.addScript(outfile.bar.url, null);

		//运行本地数据服务模块载入成功后的回调
		LDS.inited = true;
		runFLCBEvents('ldsLoaded', null, lmEvents);

	}*/

	/*
	 * 这个方法是验证客户个性域名的（商铺），如果是本站域会直接回调。
	 * 如果是第三方域名会先验证，然后根据结果给予flash local message访问授权
	 */
	function checkDomain(callback) {
		//2013-04-19，验证当前域名是否是用户个性域名
		/*
		            参数：
		       domainurl 个性域名，
		       callbackparam  jsonp回调参数
		            返回结果：{ success:true,isDomain:1}
		        success  布尔类型 操作结果   true-操作成功  false-操作失败
		        isDomain int 类型   0-是个性域名 1-非个域名
		*/

		var currHost = location.host;
		var domainURL = "//detail.b2b.hc360.com/detail/turbine/template/webim,domain.html";
		var jsonpOPT = {
			data: {
				'domainurl': currHost
			},
			callback: 'callbackparam'
		};

		if (!/.?hc360\.com$/.test(currHost)) {
			hub.jsonp(domainURL, jsonpOPT, function(d) {
				if (!d) return;
				if (d.success && d.isDomain === 0) {
					//LS.allowDomain(currHost);
					callback(true);
				}
				callback(false);
			});
		} else callback(true);

	}

	/*
	 * 向页面添加localmsg.swf文件，并传递初始化参数（flashvars）。
	 * SWFLoaded:flash就绪后的回调方法，它必须是全局函数。
	 * MLCHPrefix：本地通信频道的前缀名，用浏览器名称添加的。
	 * isAllowDomain：是否允许访问flash模块，该值是checkDomain方法传递过来的。
	 */
	/*function setupFLLM(isAllowDomain) {
		//alert('isAllowDomain--' + isAllowDomain)
		//swf 加载完成回调
		hc['FLLMLoaded'] = fllmloaded;
		//box,swfId,url,flashvars,width,height
		var lmConfig = outfile.localmsg;
		var b = hc.b;
		var bname = b.name.substr(0, 1);
		var bcover = (b.cover) ? b.cover.substr(0, 1) : '';
		hub.addSWF(d.body, lmConfig.id, lmConfig.url, 'SWFLoaded=HC.FLLMLoaded&MLCHPrefix=' + bname + bcover + '&isAllowDomain=' + isAllowDomain, 0, 0);
		/!*hub.debugFLLM = function ()
		{
		    fllmswf.style.visibility = '';
		    fllmswf.width = 550;
		    fllmswf.height =  400;
		}*!/
	}*/

	//------------------------------------------iframe local message start

	/*
	 * 这块是基于html5特性的本地通信模块，用来替代flash local message 模块，在非IE6-7下为了得到更好的体验而设计。
	 * 这部分未最后实现只是做了一个架构设计所有API都是和flash模块一样的，这样可以无缝调用。
	 * 使用技术点有localstorage和postmessage，同时需要一个域下的代理页面。
	 */

	/*
	var Command =
	{
	    auth:'auth',

	    message:'message',
	    remessage:'remessage',
	    ping:'ping',
	    reping:'reping',
	    listener:'listener',
	    reListener:'relistener',

	    storageSet:'storageSet',
	    storageRemove:'storageRemove',
	    storageClear:'storageClear',

	    httpNew:'httpNew',
	    httpOpen:'httpOpen',
	    httpSend:'httpSend',
	    httpAbort:'httpAbort',
	    httpReset:'httpReset',
	    httpStatus:'httpStatus'
	}

	//iframe 页面的localStorage镜像，用于本地存储函数的返回值
	var IFStorage = {};
	*/
	//iframe xmlhttprequest
	/*
	var ifxhrNum = 0;
	var IFXHR = function ()
	{
	    var _this = this;
	    var name = 'XHR';
	    this.num = ifxhrNum;
	    HC.HTTP[ifxhrNum] = _this;
	    IFpostMsg({command:Command.httpNew, data:{'num':ifxhrNum++}});
	    this.open = function (type,url,async)
	    {
	        IFpostMsg({command:Command.httpOpen, data:{'type':type, 'url':url, 'async':async, 'num':this.num}});
	    }
	    this.send = function (data)
	    {
	        IFpostMsg({command:Command.httpSend, data:{'data':data, 'num':this.num}});
	    }
	    this.abort = function ()
	    {
	        IFpostMsg({command:Command.httpAbort, data:{'num':this.num}});
	    }
	    this.reset = function ()
	    {
	        IFpostMsg({command:Command.httpReset, data:{'num':this.num}});
	    }
	    this.onreadystatechange = function(){}
	}
	*/
	//处理来自frame的消息
	/*
	var FrameCommand =
	{
	    auth : function (data)
	    {
	        IFStorage = data;
	        //runFLCBEvents('ldsLoaded', null, lmEvents);
	    },
	    message : function (data)
	    {
	        runFLCBEvents('message',data,lmEvents);
	    },
	    ping : function ()
	    {

	    },
	    reping : function ()
	    {

	    },
	    listener : function ()
	    {

	    },
	    reListener : function ()
	    {

	    },
	    httpNew : function (data)
	    {
	        console.log(data)
	    },
	    httpStatus : function (data)
	    {
	        var xhr = HC.HTTP[data.num];
	        xhr.readyState = data.readyState;
	        xhr.status = data.status;
	        xhr.responseText = data.responseText;
	        xhr.responseXML = data.responseXML;
	        xhr.onreadystatechange();
	    }

	};
	var fromFrame = function (e)
	{
	    var data = e.data;
	    var command = data.command;
	    FrameCommand[command](data.data);
	};
	*/
	//
	/*
	var iflmloaded = function ()
	{
	    d.body.style.backgroundColor = '#CCC';
	    var from = w.location.origin;
	    w.addEventListener('message', fromFrame,false);

	    //发送认证通信许可
	    IFpostMsg({'command':Command.auth ,'from':from , 'data':null});

	    LM =
	    {
	        changetoSpeaker : function(){ IFpostMsg({command:Command.listener,data:{}}); },
	        changetoListener : function(){  },
	        receiveListener : function(){ IFpostMsg({command:Command.reListener,data:{}}); },
	        broadcast : function(obj)
	        {
	            runFLCBEvents('broadcastComplete', null, lmEvents);
	            IFpostMsg({command:Command.message,data:obj});
	        },
	        pingSpeaker : function(){ IFpostMsg({command:Command.ping,data:{}}) },

	        addEvent : function(type,fn){ addFLCBEvent(type,fn,lmEvents); },
	        removeEvent: function(type,fn){ removeFLCBEvent(type,fn,lmEvents); },
	        runEvents : function(type,e){ runFLCBEvents(type,e,lmEvents); }
	    }
	    LS =
	    {
	        set:function(name,value)
	        {
	            IFStorage[name] = value;
	            IFpostMsg({command:Command.storageSet,data:{'name':name,'value':value}})
	        },
	        get:function(name){ return IFStorage[name]; },
	        getAll:function(){ return IFStorage; },
	        remove:function(name)
	        {
	            delete IFStorage[name];
	            IFpostMsg({command:Command.storageRemove,data:{'name':name}})
	        },
	        clear:function()
	        {
	            IFStorage = {};
	            IFpostMsg({command:Command.storageClear,data:null})
	        }
	    }
	    HTTP.crossDomainPost = function()
	    {

	    }

	    hc['IFXHR'] = IFXHR;
	    hc['HTTP'] = HTTP;
	    hc['LM'] = LM;
	    hc['LS'] = LS;


	    hub.addScript(outfile.bar.url,null);
	}
	function IFpostMsg(obj)
	{
	    var cf = outfile.iflm;
	    var win = d.querySelector('#'+cf.id).contentWindow;
	    obj.time = new Date().getTime();
	    win.postMessage(obj,cf.htmlurl);
	}
	function setupIFLM()
	{
	    var cf = outfile.iflm;
	    hub.addIframe(d.body, cf.htmlurl, cf.id, iflmloaded, 550, 400);
	}
	*/
	//---------------------------iframe local message end


	/*function init() {
		var hc = window[ns];

		if (hc.barInitialized) {
			return;
		}

		hc.barInitialized = true;
		if (hc) hc.loadedTime = new Date().getTime();

		//安装本地通信模块
		if (hub.checkFP()) checkDomain(function(isAllowDomain) {
			setupFLLM(isAllowDomain);
		});

		//setupIFLM();
	}*/

	//页面加载成功后运行初始化
	//hub.addEvent(w,init,'load');
	//dom ready init
	//hub.contentLoaded(init);


})(window, document, 'HC');


/*load jquery*/
if (!window['jQuery']) document.write("<script src='//style.org.hc360.cn/js/build/source/core/jquery.min.js'><\/script>");
/**
 * create by: xcx
 * rework 2013-02-22 by zj
 */
(function(win, doc) {
	var loadDict = {}; //所有加载文件的详细信息字典，键为url标识，值为加载状态（1-正在加载中，2-加载完成）
	var taskQueue = {};
	var linkDict = {};

	var LOADER_URL = '//style.org.hc360.cn/js/build/source/widgets/loader/';

	/**
	 * 组件统一加载对象构造方法
	 * @param moduleName String  组件模块名称
	 * @param fn Function 组件依赖文件加载完成后的回调函数
	 */
	var Loader = function(moduleName, fn) {
		this.init.call(this, moduleName, fn);
	};
	Loader.prototype = {
		/**
		 * 组件统一初始化判断
		 * @param moduleName String  组件模块名称
		 * @param fn Function 组件依赖文件加载完成后的回调函数
		 */
		init: function(moduleName, fn) {
			var _this = this;
			var link = document.getElementsByTagName('link');
			for (var i = 0, len = link.length; i < len; i++) {
				linkDict[link[i].href] = 1;
			}
			if (HC.W[moduleName + 'Urls']) {
				_this.loadUrls(0, HC.W[moduleName + 'Urls'], fn);
			} else {
				if (loadDict[moduleName]) {
					_this.addTaskQueue(moduleName, function() {
						_this.loadUrls(0, HC.W[moduleName + 'Urls'], fn);
					});
				} else {
					loadDict[moduleName] = 1;
					HC.HUB.addScript(LOADER_URL + 'hc.' + moduleName + '.urls.js', function() {
						loadDict[moduleName] = 0;
						_this.loadUrls(0, HC.W[moduleName + 'Urls'], fn);
						_this.callTaskQueue(moduleName);
					});
				}
			}
		},
		addTaskQueue: function(moduleName, fn) {
			if (!taskQueue[moduleName]) {
				taskQueue[moduleName] = [];
			}
			taskQueue[moduleName].push(fn);
		},
		callTaskQueue: function(moduleName) {
			if (taskQueue[moduleName]) {
				for (var i = 0, len = taskQueue[moduleName].length; i < len; i++) {
					taskQueue[moduleName][i]();
				}
				taskQueue[moduleName].length = 0;
			}
		},
		/**
		 * 批量添加资源文件
		 * @param index  Number  当前加载的数组序号
		 * @param moduleUrls Array  组件模块url数组
		 * @param moduleFn Function  组件模块文件加载完成以后的回调函数
		 */
		loadUrls: function(index, moduleUrls, moduleFn) {
			var _this = this;
			var i = index;
			if (i === moduleUrls.length) { //该组件的url尚未被完全加载
				moduleFn && moduleFn();
				moduleFn = null; //清除回调函数，避免重复执行
			} else { //url已全部加载完
				var urlObj = moduleUrls[i];

				function loadUrl(url, type) {
					if (loadDict[url]) {
						_this.addTaskQueue(url, function() {
							_this.loadUrls(++i, moduleUrls, moduleFn);
						});
					} else {
						loadDict[url] = 1;
						HC.HUB[type](url, function() {
							loadDict[url] = 0;
							_this.loadUrls(++i, moduleUrls, moduleFn);
							if (type === 'css') {
								linkDict[url] = 1;
							}
							_this.callTaskQueue(url);
						});
					}
				}
				if (urlObj.css) {
					if (linkDict[urlObj.css]) {
						_this.loadUrls(++i, moduleUrls, moduleFn);
					} else {
						loadUrl(urlObj.css, 'addCss');
					}
				} else {
					try {
						if (eval(urlObj.isExisted)) {
							_this.loadUrls(++i, moduleUrls, moduleFn);
						} else {
							loadUrl(urlObj.js, 'addScript');
						}
					} catch (ex) {
						loadUrl(urlObj.js, 'addScript');
					}
				}
			}
		}
	};
	HC.W.Loader = Loader;

	/*
	2013-02-22 added by zj
	修改调用方式，这里采用增加一个方法对Loader进行调用使用户易于理解和简单使用，用户依然可以使用Loader获得高级功能。
	*/
	HC.W.load = function(moduleName, fn) {
		new Loader(moduleName, fn);
	}

})(window, document);
/*
 * version:1.0
 * create:2013-03-22
 * author:front-end web develop team(FEDT)
 * explain: common.js submode
 */


(function () {

    if (HC.UUID) return;

    function UUID() {
        this.id = this.createUUID();
    }

    UUID.prototype.valueOf = function () {
        return this.id;
    }
    UUID.prototype.toString = function () {
        return this.id;
    }
    UUID.prototype.createUUID = function () {
        var dg = new Date(1582, 10, 15, 0, 0, 0, 0);
        var dc = new Date();
        var t = dc.getTime() - dg.getTime();
        var h = '';
        var tl = UUID.getIntegerBits(t, 0, 31);
        var tm = UUID.getIntegerBits(t, 32, 47);
        var thv = UUID.getIntegerBits(t, 48, 59) + '1'; // version 1, security version is 2
        var csar = UUID.getIntegerBits(UUID.rand(4095), 0, 7);
        var csl = UUID.getIntegerBits(UUID.rand(4095), 0, 7);
        var n = UUID.getIntegerBits(UUID.rand(8191), 0, 7) +
            UUID.getIntegerBits(UUID.rand(8191), 8, 15) +
            UUID.getIntegerBits(UUID.rand(8191), 0, 7) +
            UUID.getIntegerBits(UUID.rand(8191), 8, 15) +
            UUID.getIntegerBits(UUID.rand(8191), 0, 15); // this last number is two octets long
        return tl + h + tm + h + thv + h + csar + csl + h + n;
    }
    UUID.getIntegerBits = function (val, start, end) {
        var base16 = UUID.returnBase(val, 16);
        var quadArray = new Array();
        var quadString = '';
        var i = 0;
        for (i = 0; i < base16.length; i++) {
            quadArray.push(base16.substring(i, i + 1));
        }
        for (i = Math.floor(start / 4); i <= Math.floor(end / 4); i++) {
            if (!quadArray[i] || quadArray[i] == '')
                quadString += '0';
            else
                quadString += quadArray[i];
        }
        return quadString;
    }
    UUID.returnBase = function (number, base) {

        var convert = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        if (number < base)
            var output = convert[number];
        else {
            var MSD = '' + Math.floor(number / base);
            var LSD = number - MSD * base;
            if (MSD >= base)
                var output = this.returnBase(MSD, base) + convert[LSD];
            else
                var output = convert[MSD] + convert[LSD];
        }
        return output;
    }
    UUID.rand = function (max) {
        return Math.floor(Math.random() * max);
    }

    HC.UUID = UUID;

    /**
     * 设置cookie
     * @setCookie
     * @base
     * @extends
     * @param {objName}         cookie键名
     * @param {objValue}        cookie键值
     * @param [objHours]        有效期
     * @param [objPath]         路径
     * @param [objDoman]        作用域
     */
    function setCookie(name, value, expires, path, domain, secure) {
        var ex = "";

        if (expires == 0) {
        } else {
            ex = ((expires) ? "; expires=" + expires.toGMTString() : "");
        }
        ;
        var curCookie = name + "=" + escape(value) +
            ex +
            ((path) ? "; path=" + path : "") +
            ((domain) ? "; domain=" + domain : "") +
            ((secure) ? "; secure" : "");

            document.cookie = curCookie;


    }

    /**
     * 读取cookie
     * @getCookieByName
     * @base
     * @extends
     * @param {Name}            cookie键名
     */
    function getCookie(Name) {
        var m = "";
        if (window.RegExp) {
            var re = new RegExp(";\\s*" + Name + "=([^;]*)", "i");
            m = re.exec(';' + document.cookie);
        }
        return (m ? unescape(m[1]) : "");
    }

    window.setCookie = setCookie;
    window.getCookie = getCookie;
    HC.setCookie = setCookie;
    HC.getCookie = getCookie;

    /**
     * 读取hc360visitid
     */
    var hc360visitid = getCookie("hc360visitid");

    /**
     * 设置cookie日期
     * @param {date}            IE浏览器日期修复
     */
    function fixDate(date) {
        var base = new Date(0);
        var skew = base.getTime();
        if (skew > 0)
            date.setTime(date.getTime() - skew);
    }

    var now = new Date();
    fixDate(now);
    // 「 90天 7776000000 」
    now.setTime(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    /**
     * hc360visitid业务处理
     * @判断hc360visitid
     * 若不存在，生成UUID并设置为hc360visitid的值，写入cookie
     * 若存在，暂不作动作
     * 2013-03-01 16:15 因为用户行为分析二期项目，修改了本cookie的存放逻辑。
     */
    if (hc360visitid && hc360visitid != "") {
    } else {
        var uuid = new UUID().createUUID();
        var t = new Date();
        var timestr = t.getFullYear() + "-" + (t.getMonth() + 1) + "-" + t.getDate();
        visitid_time = timestr + " " + t.getHours() + ":" + t.getMinutes() + ":" + t.getSeconds();
        setCookie("visitid_time", visitid_time, now, "/", ".hc360.com") // 写入hc360visitid 到cookie

        //非hc360.com的页面将Cookie写入其自己的域
        var d = '.hc360.com';
        if (document.domain.indexOf(d) == -1) {
            d = document.domain;
        }
        setCookie("hc360visitid", uuid, now, "/", d) // 写入hc360visitid 到cookie
        hc360visitid = uuid;
    }

    /**
     * hc360first_time用于判断新老访客，存在该Cookie为老访客，否则为新访客。
     */
    if (!getCookie('hc360first_time')) {

        Package_setCookie_action()

    } else if (getCookie('hc360first_time')) {
        // 「 如果用户初次登录超过90天 重置cookie 」
        compare_cookie_Timeout()
    }

    function Package_setCookie_action() {
        var t = new Date();
        var d = '.hc360.com';
        if (document.domain.indexOf(d) == -1) {
            d = document.domain;
        }
        var timestr = t.getFullYear() + "-" + ('0' + (t.getMonth() + 1)).slice(-2) + "-" + ('0' + (t.getDate())).slice(-2);
        setCookie("hc360first_time", timestr, now, "/", d); //写入第一次访问时间
    }

    // 「 判断cookie是不是超时了 90天 」
    function compare_cookie_Timeout() {
        // 「 @example : "2017-03-06" 」
        var Time_before = getCookie('hc360first_time');
        // 「 transform as "2017/03/06" 」
        Time_before = Time_before.replace(new RegExp("-", "gm"), "/");
        // 「 这是之前种的日期毫秒数了 」
        var millisecond = ((new Date(Time_before))).getTime();

        var now = new Date()
        var now_millisecond = ((new Date(now))).getTime()
        // 「 如果第一次设置的cookie距离现在超过90天 」
        if ((now_millisecond - millisecond) > 90*24*60*60*1000) {
            Package_setCookie_action()
        }
    }

    /**
     * hcbrowserid
     * @hcbrowserid
     * 若不存在，生成UUID并设置为hcbrowserid的值，写入cookie
     * 若存在，暂不作动作
     * 2013-09-16  用于区分每个浏览标识
     */
    var hcbrowserid = getCookie("hcbrowserid");
    if (!hcbrowserid) {
        var uuid = new UUID().id;
        setCookie("hcbrowserid", uuid, now, "/", ".hc360.com") // 写入hcbrowserid到cookie
    }


    //用户行为分析
    /*
     var pageId = new UUID().createUUID();
     HC.PAGE_ID = pageId;
     var UBA_URL = '//log.org.hc360.com/logrecordservice/logrecordtotal';
     new Image().src = UBA_URL + '?' + '&p=' + pageId + '&v=' + hc360visitid + 'u=' + encodeURIComponent(document.referrer) + '&r=' + new Date().getTime();
     */

    //本地存储模块加载成功后，回调执行uuid复制功能。
    HC.LDS.loadedCB(function () {

        var hcVisit = HC.HUB.LocalCookie.get('hc360visitid'); //alert(1+hcVisit);
        var uuid = new UUID().createUUID();
        if (hcVisit) {

            //如果存在有效值，则复制一份到本地存储里
            HC.LS.set('hc360visitid', hcVisit);

        } else {

            var ls_hcVisit = HC.LS.get('hc360visitid'); //从本地存储中取值
            if (ls_hcVisit) {

                //如果本地存储中有值，则赋值给uuid
                uuid = ls_hcVisit;
            } else {

                //如果本地存储没有相应值，将生成的两处保存

                HC.LS.set('hc360visitid', uuid);
            }

            var d = '.hc360.com';
            if (document.domain.indexOf(d) == -1) {
                d = document.domain;
            }
            HC.HUB.LocalCookie.set({
                key: 'hc360visitid',
                value: uuid,
                day: 365 * 10,
                path: '/',
                domain: d
            });
        }
        //console(2+HC.HUB.LocalCookie.get('hc360visitid'));
    });

    /**
     *   根据参数名字获取url参数
     var Request = new Object();
     Request = GetRequest();
     var  sourcetypeid = Request['sourcetypeid'];
     var  sourcetypeid = Request['sourcetypeid'];
     如果没有找到，返回undefined
     add by: zhaowei
     */
    /*
     function GetRequest() {
     var url = location.search; //获取url中"?"符后的字串
     var theRequest = new Object();
     if (url.indexOf("?") != -1) {
     var str = url.substr(1);
     strs = str.split("&");
     for(var i = 0; i < strs.length; i ++) {
     theRequest[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]);
     }
     }
     return theRequest;
     }
     */

    /**
     @大型cookie处理方案 @20121012
     @Author:front-end web developer(FED) kongzengqiang@hc360.com
     @updata:20120926 kongzengqiang
     */

    HC.hck = {
        _curCookieList: ['viewwords1', 'viewwords2', 'viewwords5', 'viewwords', 'regkeyword'], //需处理的cookie列表

        /*
         @HCK的回调函数：设置回调、读取回调、删除回调，此处在实际函数中覆盖
         */
        callback: {
            set: null,
            get: null,
            del: null,
            rec: null
        },

        /*
         @hckGetJSON:jsonp，HC对象下
         @创建script并得到json进行回调
         */
        hckGetJSON: function (url, callback, fn, extpra, error) {
            var that = HC.hck,
                randN = (Math.random() + '').substring(2),
                cbu = callback + randN,
                _url_ = url + '&callback=' + 'HC.hck.callback.' + cbu,
                head = document.getElementsByTagName('head');

            //that['callback'][cbu]=that['callback'][callback];
            that['callback'][cbu] = function (data) {
                var _data_ = data;
                if (!data) {
                    if (error && typeof error == "function") {
                        error();
                    }
                    return;
                }

                switch (callback) {
                    case 'get':
                        if (_data_.value == 'null') {
                            that.hckRecord('get_backError', extpra.key, 'null');
                        } else {
                            that.hckRecord('get_backSuccess', extpra.key, _data_.value);
                        }
                        ;

                        fn && fn((_data_.value == 'null' || _data_.value == 'undefined') ? '' : _data_.value.replace(/&quot;/g, '"'));
                        break;
                    case 'set':
                        (function () {
                            var _data_ = data,
                                sp1 = extpra.sp1,
                                sp2 = extpra.sp2,
                                _domain_ = extpra._domain_,
                                _hckExistTime_ = extpra._hckExistTime_,
                                _exp_ = extpra._exp_,
                                lastValue = extpra.lastValue,
                                isIndex = extpra.isIndex;
                            key = extpra.key;

                            if (_data_.value == 'true') {
                                that.hckRecord('set_backSuccess', key, 'true');
                                for (var i = 1, l = lastValue.length; i < l; i += 1) {
                                    var _tempKV_ = lastValue[i].split(sp2);
                                    if (_tempKV_[0] == _domain_ && _tempKV_[1] == key) {
                                        isIndex = i;
                                        break;
                                    }
                                    ;
                                }
                                ;

                                if (isIndex != -1) {
                                    var _tempArray_ = lastValue[isIndex].split(sp2); //like:[hc360.com#2#key#2#exp]

                                    _tempArray_[2] = _exp_;
                                    _tempArray_ = _tempArray_.join(sp2);

                                    lastValue.splice(isIndex, 1, _tempArray_);

                                    lastValue = lastValue.join(sp1);

                                    setCookie('hckIndex', lastValue, _hckExistTime_, '/', _domain_);

                                    fn && fn();
                                    lastValue = '';
                                    return;
                                } else {
                                    var _tempHck_ = _domain_ + sp2 + key + sp2 + _exp_;

                                    lastValue.push(_tempHck_);
                                    lastValue = lastValue.join(sp1);

                                    fn && fn();
                                    lastValue = '';

                                    return;
                                }
                                ;

                                //setCookie('hcktemp','',_hckExistTime_,'/',_domain_);  //服务端删除，此处即无用
                            } else {
                                that.hckRecord('set_backError', key, 'null');
                            }
                            ;
                        })();
                        break;
                    case 'del':
                        (function () {
                            return;
                        })();
                        break;
                    default:
                        return;
                }
                ;
            };

            script = document.createElement('script');
            script.setAttribute('src', _url_);
            head[0].appendChild(script);


            script.onload = script.onreadystatechange = function () {
                if (!script.readyState || /loaded|complete/.test(script.readyState)) {

                    // Handle memory leak in IE
                    script.onload = script.onreadystatechange = null;
                    script.id = "loaded";
                }

            }
            //支持onerror
            script.onerror = function () {
                if (error && typeof error == "function") {
                    error();
                }
            }

            var timer = function (times, // number of times to try
                                  delay, // delay per try
                                  delayMore, // extra delay per try (additional to delay)
                                  test, // called each try, timer stops if this returns true
                                  failure, // called on failure
                                  result // used internally, shouldn't be passed
            ) {
                if (times == -1 || times > 0) {
                    setTimeout(function () {
                        result = (test()) ? 1 : 0;
                        timer((result) ? 0 : (times > 0) ? --times : times, delay + ((delayMore) ? delayMore : 0), delayMore, test, failure, result);
                    }, (result || delay < 0) ? 0.1 : delay);
                } else if (typeof failure == 'function') {
                    setTimeout(failure, 1);
                }
            }

            timer(15, 2000, 0, function () {
                return (script.id == 'loaded');
            }, function () {
                if (script.id != 'loaded') {
                    if (error && typeof error == "function") {
                        error();
                    }
                }
            });

        },

        /*
         @记录日志发送，目前用于测试阶段
         */
        hckRecord: function (type, key, value) {
            var that = HC.hck;

            that.callback.rec = function (data) {
            }; //日志返回函数，暂不进行处理

            var tag = 'hck';

            value = value || ''; //测试用，日志记录

            var _tempV = 'type:' + type + '<br>key:' + key + '<br>' + value + '<br>url:' + location.href + '<br>time:' + new Date();

            //window.jQuery&&jQuery.post('//192.168.34.16/log/leavord/leavord.php',{word:_tempV,from:'hckrec.html',back:'../index.html',leave:'leave'});
        },

        /*
         @hckCreateExp：生成到期时间，10年之后
         */
        hckCreateExp: function () {
            var nd = new Date(),
                _curYear_ = nd.getFullYear() + 10;
            _curMonth_ = nd.getMonth() + 1;
            _curDate_ = nd.getDate();
            _hckExistTime_ = new Date(_curYear_ + '/' + _curMonth_ + '/' + _curDate_);

            return _hckExistTime_;
        },

        /*
         @hckSet函数接口
         */
        hckSet: function (key, value, exp, domain, fn, asyn) {

            var that = HC.hck,
                _uuid_,
                sp1 = '#1#',
                sp2 = '#2#',
                _domain_ = (arguments[3] || 'hc360.com').replace(/^\./, ''),
                _callback_ = arguments[4] || null,
                _asyn_ = true, //异步，留此接口无用
                _hckExistTime_ = that.hckCreateExp(),
                exp = exp || _hckExistTime_;

            _exp_ = Math.abs(exp - new Date().getTime()),
                lastValue = '',
                isIndex = -1; //to store the last value of the hckIndex

            if (!getCookie('hckIndex')) {
                _uuid_ = new UUID().id;
                setCookie('hckIndex', _uuid_, _hckExistTime_, '/', _domain_);
            }
            ;

            var testIndex = getCookie('hckIndex');
            var testTemp = getCookie('hcktemp');
            var recV = 'url:' + location.href + '<br>hckIndex:' + testIndex + '<br>hcktemp:' + testTemp;


            if (!key || !value || key.replace(/[\s\xA0\u1680\u180E\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/gm, '') == '' || value.replace(/[\s\xA0\u1680\u180E\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/gm, '') == '') {
                that.hckRecord('set_whenCall', key, recV);
                fn && fn(false);
                return null;
            }
            ;

            //setCookie('hcktemp',encodeURIComponent(value),_hckExistTime_,'/',_domain_);

            var _url_ = '//sessiondata.org.hc360.com/SessionData/cookieServlet?action=set&domain=' + _domain_ + '&key=' + encodeURIComponent(key) + '&expiry=' + _exp_ + '&value=' + encodeURIComponent(value);


            var testIndex = getCookie('hckIndex');
            var testTemp = getCookie('hcktemp');
            var recV = 'url:' + _url_ + '<br>hckIndex:' + testIndex + '<br>hcktemp:' + testTemp;
            that.hckRecord('set_whenSend', key, recV);


            lastValue = ((getCookie('hckIndex')).replace(/^"|"$/g, '')).split(sp1);

            if (lastValue.length < 2 && arguments.length == 0) {
                return;
            }
            ;

            that.hckGetJSON(_url_, 'set', fn, {
                'key': key,
                'sp1': sp1,
                'sp2': sp2,
                '_domain_': _domain_,
                '_hckExistTime_': _hckExistTime_,
                '_exp_': _exp_,
                'lastValue': lastValue,
                'isIndex': isIndex
            });
        },

        /*
         @hckGet函数接口
         */
        hckGet: function (key, domain, fn, error) { //fn is an optional parameters
            var that = HC.hck,
                sp1 = '#1#',
                sp2 = '#2#',
                _hckIndex_ = getCookie('hckIndex'),
                hckValue,
                domain = (domain || 'hc360.com').replace(/^\./, '');

            if (!_hckIndex_ || !_hckIndex_.length || !key || key.replace(/[\s\xA0\u1680\u180E\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/gm, '') == '' || _hckIndex_.indexOf(sp2 + key + sp2) < 0) {
                var testIndex = getCookie('hckIndex');
                var testTemp = getCookie('hcktemp');
                var recV = 'url:' + location.href + '<br>hckIndex:' + testIndex + '<br>hcktemp:' + testTemp;
                that.hckRecord('get_whenCall', key, recV);

                fn && fn('');

                return null;
            }
            ;

            domain = domain.replace(/^\./, '');

            var _url_ = '//sessiondata.org.hc360.com/SessionData/cookieServlet?action=get&domain=' + domain + '&key=' + encodeURIComponent(key);


            var testIndex = getCookie('hckIndex');
            var testTemp = getCookie('hcktemp');
            var recV = 'url:' + location.href + '<br>hckIndex:' + testIndex + '<br>hcktemp:' + testTemp;
            that.hckRecord('get_whenSend', key, recV);


            that.hckGetJSON(_url_, 'get', fn, {
                'key': key
            }, error);
        },
        /*
         @hckDel函数接口
         */
        hckDel: function (key, domain, fn) {
            var that = HC.hck,
                sp1 = '#1#',
                sp2 = '#2#',
                _hckIndex_ = getCookie('hckIndex'),
                hckValue,
                _hckExistTime_ = that.hckCreateExp(),
                domain = (domain || 'hc360.com').replace(/^\./, '');

            if (!_hckIndex_ || !_hckIndex_.length || !key || key.replace(/[\s\xA0\u1680\u180E\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/gm, '') == '' || _hckIndex_.indexOf(sp2 + key + sp2) < 0) {
                fn && fn('');
                return null;
            }
            ;

            hckValue = _hckIndex_.split(',');

            var _url_ = '//sessiondata.org.hc360.com/SessionData/cookieServlet?action=del&domain=' + domain + '&key=' + encodeURIComponent(key);


            var testIndex = getCookie('hckIndex');
            var recV = 'url:' + _url_ + ',hckIndex:' + testIndex;
            //that.hckRecord('del_whenSend',key,recV);


            that.hckGetJSON(_url_, 'del', fn);
        },

        /*
         @备份cookie函数
         */
        hckBakeCookie: function (aCkList) {
            var that = HC.hck,
                aCkList = aCkList || that._curCookieList;

            for (var ci = 0, cl = aCkList.length; ci < cl; ci += 1) {
                var _tempCk = getCookie(aCkList[ci]),

                    _hckExistTime_ = new Date(new Date().getTime() + 10 * 24 * 3600 * 1000), //10 day
                    _pastTime = new Date('1900/01/01');

                if (!_tempCk || _tempCk.replace(/[\s\xA0\u1680\u180E\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/gm, '') == '') {
                    continue;
                }
                ;

                setCookie(aCkList[ci] + '_bak', _tempCk, _hckExistTime_, '/', 'hc360.com'); //备份当前cookie，后缀：_bak
                //setCookie(aCkList[ci]+'_bak',_tempCk,Date()+864000,'/','hc360.com');  //备份当前cookie，后缀：_bak
                that.hckSet(aCkList[ci], _tempCk, _pastTime, 'hc360.com'); //同名cookie备份到服务端

                setCookie(aCkList[ci], null, _pastTime, '/', 'hc360.com'); //删除当前cookie
            }
            ;
        },

        /*
         @回滚函数、清理函数
         */
        hckRevert: function (bclear) {
            var that = HC.hck,
                aCkList = that._curCookieList;

            !bclear && (function () {
                that.hckInit = function () {
                    return null
                }
            })(); //回滚操作时终止初始化进行；

            for (var ci = 0, cl = aCkList.length; ci < cl; ci += 1) {
                var _tempCk = getCookie(aCkList[ci] + '_bak'), //得到备份的cookie

                    _hckExistTime_ = that.hckCreateExp(),
                    _pastTime = new Date('1900/01/01');

                if (!_tempCk || _tempCk.replace(/[\s\xA0\u1680\u180E\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/gm, '') == '') {
                    continue;
                }
                ;

                !bclear && setCookie(aCkList[ci], _tempCk, _hckExistTime_, '/', 'hc360.com'); //还原

                setCookie('hckIndex', null, _pastTime, '/', 'hc360.com'); //删除hckIndex

                setCookie(aCkList[ci] + '_bak', null, _pastTime, '/', 'hc360.com'); //删除备份
            }
            ;
        },

        /*
         @hck追加, 因不需要callback采用img get 推送方式
         */

        hckAdd: function (key, value, domain, exp) {
            //两次编码不许动，后台也两次解码
            value = encodeURIComponent(value);
            //setCookie(name, value, expires, path, domain, secure);
            //setCookie('hcktemp', value, this.hckCreateExp(), '/', 'hc360.com');
            var r = new Date().getTime();
            var img = new Image();
            exp = '&expiry=' + (exp || this.hckCreateExp()); //.toGMTString();
            var url = '//sessiondata.org.hc360.com/SessionData/cookieServlet?action=append';
            url = url + '&domain=' + domain + exp + '&key=' + key + '&r=' + r;
            img.src = url;
        },

        /*
         @初始化hckIndex及备份
         */
        hckInit: function () {
            var that = HC.hck;

            if (getCookie('viewwords') || getCookie('viewwords1') || getCookie('viewwords2') || getCookie('viewwords5') || getCookie('regkeyword') || !getCookie('hckIndex')) {
                that.hckBakeCookie();
                that.hckSet();
            }
            ;
            //清除hcktemp by zhuyangyang add 20150428
            if (getCookie('hcktemp')) {
                setCookie('hcktemp', '', this.hckCreateExp(), '/', 'hc360.com');
            }
        }
    };

    /*
     @对外接口
     */
    HC.hckSet = HC.hck.hckSet;
    HC.hckGet = HC.hck.hckGet;
    HC.hckDel = HC.hck.hckDel;
    HC.hckBakeCookie = HC.hck.hckBakeCookie;
    HC.hckRevert = HC.hck.hckRevert;
    HC.hckInit = HC.hck.hckInit;

    //初始化hckIndex及备份
    /*HC.hckInit=function(){
     if(getCookie('viewwords')||getCookie('viewwords1')||getCookie('viewwords2')||getCookie('viewwords5')||getCookie('regkeyword')){
     HC.hckBakeCookie();
     HC.hckSet();
     };
     };*/

    /*if(new Date().getTime()>=1349798400000){  //2012年10月10日0时自动执行清理工作
     HC.hckInit=function(){
     if(!getCookie('hckIndex')){
     HC.hckSet();
     };
     };
     HC.hckRevert(1);
     };*/

    HC.hckInit();

})();

/**
 * [移动端访问行业资讯终极页时适配M站规则]
 */
(function (global) {
    var apple_phone = /iPhone/i,
        apple_ipod = /iPod/i,
        apple_tablet = /iPad/i,
        android_phone = /(?=.*\bAndroid\b)(?=.*\bMobile\b)/i, // Match 'Android' AND 'Mobile'
        android_tablet = /Android/i,
        amazon_phone = /(?=.*\bAndroid\b)(?=.*\bSD4930UR\b)/i,
        amazon_tablet = /(?=.*\bAndroid\b)(?=.*\b(?:KFOT|KFTT|KFJWI|KFJWA|KFSOWI|KFTHWI|KFTHWA|KFAPWI|KFAPWA|KFARWI|KFASWI|KFSAWI|KFSAWA)\b)/i,
        windows_phone = /IEMobile/i,
        windows_tablet = /(?=.*\bWindows\b)(?=.*\bARM\b)/i, // Match 'Windows' AND 'ARM'
        other_blackberry = /BlackBerry/i,
        other_blackberry_10 = /BB10/i,
        other_opera = /Opera Mini/i,
        other_chrome = /(CriOS|Chrome)(?=.*\bMobile\b)/i,
        other_firefox = /(?=.*\bFirefox\b)(?=.*\bMobile\b)/i, // Match 'Firefox' AND 'Mobile'
        seven_inch = new RegExp(
            '(?:' + // Non-capturing group

            'Nexus 7' + // Nexus 7

            '|' + // OR

            'BNTV250' + // B&N Nook Tablet 7 inch

            '|' + // OR

            'Kindle Fire' + // Kindle Fire

            '|' + // OR

            'Silk' + // Kindle Fire, Silk Accelerated

            '|' + // OR

            'GT-P1000' + // Galaxy Tab 7 inch

            ')', // End non-capturing group

            'i'); // Case-insensitive matching

    var match = function (regex, userAgent) {
        return regex.test(userAgent);
    };

    var IsMobileClass = function (userAgent) {
        var ua = userAgent || navigator.userAgent;

        // Facebook mobile app's integrated browser adds a bunch of strings that
        // match everything. Strip it out if it exists.
        var tmp = ua.split('[FBAN');
        if (typeof tmp[1] !== 'undefined') {
            ua = tmp[0];
        }

        this.apple = {
            phone: match(apple_phone, ua),
            ipod: match(apple_ipod, ua),
            tablet: !match(apple_phone, ua) && match(apple_tablet, ua),
            device: match(apple_phone, ua) || match(apple_ipod, ua) || match(apple_tablet, ua)
        };
        this.amazon = {
            phone: match(amazon_phone, ua),
            tablet: !match(amazon_phone, ua) && match(amazon_tablet, ua),
            device: match(amazon_phone, ua) || match(amazon_tablet, ua)
        };
        this.android = {
            phone: match(amazon_phone, ua) || match(android_phone, ua),
            tablet: !match(amazon_phone, ua) && !match(android_phone, ua) && (match(amazon_tablet, ua) || match(android_tablet, ua)),
            device: match(amazon_phone, ua) || match(amazon_tablet, ua) || match(android_phone, ua) || match(android_tablet, ua)
        };
        this.windows = {
            phone: match(windows_phone, ua),
            tablet: match(windows_tablet, ua),
            device: match(windows_phone, ua) || match(windows_tablet, ua)
        };
        this.other = {
            blackberry: match(other_blackberry, ua),
            blackberry10: match(other_blackberry_10, ua),
            opera: match(other_opera, ua),
            firefox: match(other_firefox, ua),
            chrome: match(other_chrome, ua),
            device: match(other_blackberry, ua) || match(other_blackberry_10, ua) || match(other_opera, ua) || match(other_firefox, ua) || match(other_chrome, ua)
        };
        this.seven_inch = match(seven_inch, ua);
        this.any = this.apple.device || this.android.device || this.windows.device || this.other.device || this.seven_inch;

        // excludes 'other' devices and ipods, targeting touchscreen phones
        this.phone = this.apple.phone || this.android.phone || this.windows.phone;

        // excludes 7 inch devices, classifying as phone or tablet is left to the user
        this.tablet = this.apple.tablet || this.android.tablet || this.windows.tablet;

        if (typeof window === 'undefined') {
            return this;
        }
    };

    var instantiate = function () {
        var IM = new IsMobileClass();
        IM.Class = IsMobileClass;
        return IM;
    };

    if (typeof module !== 'undefined' && module.exports && typeof window === 'undefined') {
        //node
        module.exports = IsMobileClass;
    } else if (typeof module !== 'undefined' && module.exports && typeof window !== 'undefined') {
        //browserify
        module.exports = instantiate();
    } else if (typeof define === 'function' && define.amd) {
        //AMD
        define('isMobile', [], global.isMobile = instantiate());
    } else {
        global.isMobile = instantiate();
    }

    /**
     * [移动端设备访问且非框架页]
     */
    var domainIdentifier, pathname, url = '//m.hc360.com/info-#domainIdentifier#/#year#/#month#/#random#.html',
        indexOf = function (list, item) {
            for (var i = 0; i < list.length; i++) {
                if (item === list[i]) {
                    return i;
                }
                ;
            }
            return -1;
        };
    if (this.isMobile.any && (domainIdentifier = (new RegExp('info.([\\w-]+).hc360.com', 'i')).exec(this.location.host)) && (pathname = (new RegExp('/(\\d{4})/(\\d{2})/([\\w-]+?).shtml', 'i')).exec(this.location.pathname))) {
        var domainIdentifierList = ['edu', 'bpq', 'b2b', 'huafei', 'power', 'bjp', 'jiaju', 'nc', 'flower', 'top10', 'ganxi', 'fs', 'tea', 'engine', 'll', 'baozhuang', 'agri', 'momo', 'sdgj', 'clean', 'hunjia', 'pcrm', 'hw', 'xt', 'led', 'printer', 'syc', 'zl', 'ehome', 'glass', 'shicai', 'jgj', 'jdpj', 'jcdd', 'zs', 'ledp', 'leather', 'traffic', 'gift', 'service', 'bag', 'med', 'shipin', 'gcgj', 'sf', 'fruit', 'nh', 'shipol', 'solar', 'jeans', 'chinabreed', 'biz', 'finance', 'house', 'hotel', 'd', 'sport', 'textile', 'dn', 'cyd', 'nongji', 'weldcut', 'chat', 'machine', 'jj', 'bm', 'energy', 'motor', 'metal', 'office', 'cloth', 'av', 'xjd', 'ceramic', 'pharm', 'jieju', 'news', 'shoes', 'fushi', 'piju', 'lamp', 'wujin', 'steel', 'beauty', 'jewelry', 'screen', 'ad', 'paper', 'printing', 'electric', 'secu', 'it', 'toys', 'ec', 'test', 'laser', 'pv', 'mt', 'ceo', 'unite', 'cs', 'floor', 'suoju', 'daoju', 'mc', 'nvz', 'instrument', 'nongyao', 'feed', 'chilun', 'jxjg', 'neiyi', 'fl', 'csyp', 'zcdy', 'fojiao', 'qdgj', 'jiashi', 'ttm', 'wl', 'wash', 'sjd', 'robot', 'kitchen', 'seller', 'jiadianexpo', 'yx', 'shuma', 'zc', 'zyc', 'tianjiaji', 'jg', 'jdmuseum', '2s', 'jdcgt', '56', 'siji', 'shaxian', 'canyin', 'dd', 'shui', 'jjf', 'cars', 'pt', 'jsj', 'nanz', 'muju', 'jinshu', 'ml', 'schl', 'monitor', 'y', 'yw', 'sp', 'tz', 'lj', 'chugui', 'bgl', 'jdmall', 'dscppt', 'tqmall', 'nk', 'bgjj', 'liantiao', 'kf', 'gnsc', 'cc', 'th', 'jjcl', 'bossmba', 'hbjx', 'dzqjd', 'air', 'fxb', 'siwang', 'zyz', 'artware', 'motors', 'fj', 'ddgj', 'sn', 'cool', 'hm', 'jiadiancity', 'jcz'];
        if (domainIdentifier[1] && indexOf(domainIdentifierList, domainIdentifier[1]) != -1) {
            var shieldlinkArr = ['//info.b2b.hc360.com/zt/hjc/index.shtml'],
                shieldReg = new RegExp(shieldlinkArr.join('|'), 'ig');
            if (!shieldReg.test(this.location.href)) {
                this.location.href = url.replace(/#domainIdentifier#/, domainIdentifier[1]).replace(/#year#/, pathname[1]).replace(/#month#/, pathname[2]).replace(/#random#/, pathname[3]);
            };
        }
    }
    ;
})(this);


// /*ie浏览器下显示浏览器升级提示*/
// (function (win, doc, hc) {
//     if (!hc) {
//         return;
//     }
//     var ie6Version = /(6.0)/;
//     var ie6CookieKey = 'ie6UpgradeVersionPrompt';
//     var ie6TopFlag = false;
//     try {
//         ie6TopFlag = (win.self == win.top);
//     } catch (e) {
//     }
//     if (ie6Version.test(hc.b.MSIE) && (hc.getCookie(ie6CookieKey) != 'ignore') && ie6TopFlag) {
//         win.attachEvent('onload', function () {
//             hc.HUB.addCss('//style.org.hc360.cn/css/IE6/style.css', function () {
//                 var htmlArray = new Array();
//                 htmlArray.push('<div class="ie6UpgradeVersionPrompt">');
//                 htmlArray.push('<div class="ie6Box">');
//                 htmlArray.push('<div class="ie6alertCon">');
//                 htmlArray.push('<div class="ie6alertBorder"></div>');
//                 htmlArray.push('<div class="ie6proTop">');
//                 htmlArray.push('<h2>');
//                 htmlArray.push('提示');
//                 htmlArray.push('</h2>');
//                 htmlArray.push('<a class="ie6close" href="javascript:void(0);" onclick="return false;"></a>');
//                 htmlArray.push('</div>');
//                 htmlArray.push('<div class="ie6proBox">');
//                 htmlArray.push('<h3>');
//                 htmlArray.push('你知道你的Internet Explorer过时了吗?');
//                 htmlArray.push('</h3>');
//                 htmlArray.push('<p>');
//                 htmlArray.push('为了让您得到最好的体验效果,我们建议您升级到最新版本的IE浏览器或选择其他浏览器.推荐给大家几款牛逼的浏览器吧！');
//                 htmlArray.push('</p>');
//                 htmlArray.push('</div>');
//                 htmlArray.push('<div class="ie6BoxIco">');
//                 htmlArray.push('<a href="//www.google.cn/chrome/browser/desktop/index.html" class="chrome" target="_blank">chrome</a> <a href="//windows.microsoft.com/zh-cn/internet-explorer/download-ie" class="IE" target="_blank">IE</a> <a href="//se.360.cn/" class="l360" target="_blank">360安全</a> <a href="//www.firefox.com.cn/" class="huohu" target="_blank">火狐</a> <a href="//ie.sogou.com/" class="sougou" target="_blank">搜狗</a> <a href="//browser.qq.com/" class="LQQ" target="_blank">QQ</a>');
//                 htmlArray.push('</div>');
//                 htmlArray.push('</div>');
//                 htmlArray.push('</div>');
//                 htmlArray.push('<div class="ie6Bg"><iframe frameborder="0" scrolling="no" class="ie6BgFrame"></iframe></div>');
//                 htmlArray.push('</div>');
//                 jQuery('.ie6UpgradeVersionPrompt', jQuery(doc)).remove(); //防止多次加载当前脚本文件
//                 var htmlEntity = jQuery(htmlArray.join('')).appendTo(jQuery('body', jQuery(doc)));
//                 setTimeout(function () {
//                     jQuery('a.ie6close', htmlEntity).focus();
//                 }, 0);
//                 doc.getElementsByTagName("html")[0].style.overflow = "hidden";
//                 doc.body.onmousewheel = function (event) {
//                     return false;
//                 }
//                 jQuery('div.ie6Bg', htmlEntity).css({
//                     'height': jQuery(doc).height() + 'px'
//                 });
//                 jQuery('a.ie6close', htmlEntity).click(function (event) {
//                     htmlEntity.remove();
//                     var cookie_expires = new Date();
//                     var base = new Date(0);
//                     var skew = base.getTime();
//                     if (skew > 0) {
//                         cookie_expires.setTime(cookie_expires.getTime() - skew);
//                     }
//                     cookie_expires.setTime(cookie_expires.getTime() + 24 * 60 * 60 * 1000);
//                     hc.setCookie(ie6CookieKey, 'ignore', cookie_expires, "/", ".hc360.com");
//                     doc.getElementsByTagName("html")[0].style.overflowX = "auto";
//                     doc.getElementsByTagName("html")[0].style.overflowY = "scroll";
//                     doc.body.onmousewheel = function (event) {
//                         return true;
//                     }
//                 });
//
//                 //绑定窗口大小调整事件
//                 jQuery(win).resize(function () {
//                     var h = jQuery(win).height();
//                     var w = jQuery(win).width();
//                     var st = jQuery(win).scrollTop();
//                     var bh = jQuery('body').height();
//                     if (bh < h) {
//                         bh = h;
//                     }
//                     var eleWidth = jQuery('div.ie6Box', htmlEntity).outerWidth();
//                     var eleHeight = jQuery('div.ie6Box', htmlEntity).height();
//                     var left = w / 2 - eleWidth / 2;
//                     var top = st + (h - eleHeight) / 2;
//                     jQuery('div.ie6Box', htmlEntity).css({
//                         'left': left + 'px',
//                         'top': top + 'px',
//                         'position': 'absolute',
//                         'margin': '0px'
//                     });
//                     jQuery('div.ie6Bg', htmlEntity).css({
//                         'height': bh + 'px'
//                     });
//                 });
//
//                 //重设一次窗口位置
//                 jQuery(win).resize();
//
//             });
//         });
//     }
//     ;
//     /**
//      * [seo 专员让加的不知道啥东西的  2018-10-31]
//      * @return {[type]} [description]
//      */
//     (function(){
//         var bp = document.createElement('script');
//         var curProtocol = window.location.protocol.split(':')[0];
//         if (curProtocol === 'https') {
//             bp.src = 'https://zz.bdstatic.com/linksubmit/push.js';
//         }
//         else {
//             bp.src = 'http://push.zhanzhang.baidu.com/push.js';
//         }
//         var s = document.getElementsByTagName("script")[0];
//         s.parentNode.insertBefore(bp, s);
//     })();
//
//
//
// })(window, document, HC);
