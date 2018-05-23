window.posdk = {
	active: {
		sdk: '0.0.1',
		tricks: {} // populated automatically
	},
	utils: {
		locationPathArray: function () {return location.pathname.toLowerCase().split(/(?=\/#?[a-zA-Z0-9])/g);},
		locationParamArray: function () {return location.search.split(/(?=&#?[a-zA-Z0-9])/g);},
		escape: function (str) {
			const entityMap = {
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				'"': '&quot;',
				"'": '&#39;',
				'/': '&#x2F;',
				'`': '&#x60;',
				'=': '&#x3D;'
			};
			return (typeof str === 'undefined') ? '' : String(str).replace(/[&<>"'`=\/]/g, function (s) {return entityMap[s];});
		},
		removeParams: function (obj, paramArray) {
			for (let key in obj) if (paramArray.indexOf(obj[key]) > -1) delete obj[key];
			return obj;
		},
		unescape: function (str) {return (typeof str === 'undefined') ? '' : $('<div/>').html(str).text();},
		jsonify: function (str) {
			posdk.utils.jsonify.brace = /^[{\[]/;
			posdk.utils.jsonify.token = /[^,(:){}\[\]]+/g;
			posdk.utils.jsonify.quote = /^['"](.*)['"]$/;
			posdk.utils.jsonify.escap = /(["])/g;
			posdk.utils.jsonify.comma = {};
			posdk.utils.jsonify.comma.curly = /,(\s*)}/g;
			posdk.utils.jsonify.comma.square = /,(\s*)]/g;

			// Wrap with '{}' if not JavaScript object literal
			str = $.trim(str);
			if (posdk.utils.jsonify.brace.test(str) === false) str = '{' + str + '}';

			// Fix trailing commas
			str = str.replace(posdk.utils.jsonify.comma.curly, '}').replace(posdk.utils.jsonify.comma.square, ']');

			// Retrieve token and convert to JSON
			return str.replace(posdk.utils.jsonify.token, function (a) {
				a = $.trim(a);
				// Keep some special strings as they are
				if ('' === a || 'true' === a || 'false' === a || 'null' === a || (!isNaN(parseFloat(a)) && isFinite(a))) return a;
				// For string literal: 1. remove quotes at the top end; 2. escape double quotes in the middle; 3. wrap token with double quotes
				else return '"' + a.replace(posdk.utils.jsonify.quote, '$1').replace(posdk.utils.jsonify.escap, '\\$1') + '"';
			});
		},
		encode: function (str) {
			return encodeURIComponent(str).replace(/'/g, "%27").replace(/"/g, "%22");
		},
		decode: function (str) {
			return decodeURIComponent(str.replace(/\+/g, " "));
		},
		guid: function () {
			function s4() {
				return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
			}

			return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
		},
		isElement: function (object) {
			return (
				typeof HTMLElement === 'object' ? object instanceof HTMLElement : //DOM2
					object && typeof object === 'object' && object !== null && object.nodeType === 1 && typeof object.nodeName === 'string'
			);
		},
		serializeObject: function (object) {
			let o = '', boolFalse, a, i;
			if (object instanceof jQuery) {
				if (object.is('form')) a = object.serializeArray();
				else if (object.is('select,textarea,input')) a = object.serializeArray(); // [{name:object.attr('name'),value:object.val()}];
				else a = object.find('input,select,textarea').serializeArray();
				boolFalse = object.find('[type=checkbox]').filter(function () {return $(this).prop('checked') === false;});
				for (i = 0; i < boolFalse.length; i++) {
					a.push({name: $(boolFalse[i]).attr('name'), value: null});
				}
			} else if ($.isArray(object) && typeof object[0].name !== 'undefined' && typeof object[0].value !== 'undefined') {
				a = object;
			} else if ($.isPlainObject(object) && typeof object.name !== 'undefined' && typeof object.value !== 'undefined') {
				a = [object];
			} else if ($.isPlainObject(object)) {
				o = object;
			} else {
				console.log('Malformed object passed to posdk.utils.serializeObject method.');
				a = [];
			}
			if (o === '') {
				o = {};
				for (i = 0; i < a.length; i++) {
					if (o[a[i].name] !== undefined) {
						if (!o[a[i].name].push) o[a[i].name] = [o[a[i].name]];
						o[a[i].name].push(a[i].value || '');
					}
					else o[a[i].name] = a[i].value || '';
				}
			}
			return o;
		},
		closestChildren: function (data, depricatedMatch, depricatedFindAll) {
			let depricatedSelector;
			if (data instanceof jQuery) depricatedSelector = data; // for backwards compatibility

			data = {
				selector: data.selector || depricatedSelector || null,
				match: data.match || depricatedMatch || null,
				findAll: data.findAll || depricatedFindAll || false,
				results: data.results || null // the results property is used internally by the method
			};

			let children = (data.selector instanceof jQuery) ? data.selector.children() : $(data.selector).children();
			if (children.length === 0) {
				if (data.results !== null) return data.results;
				else return $();
			}
			if (data.results !== null) data.results = data.results.add(children.filter(data.match));
			else data.results = children.filter(data.match);

			if (data.findAll !== true) return (data.results.length > 0) ? data.results : posdk.utils.closestChildren({
				selector: children,
				match: data.match
			});
			else return posdk.utils.closestChildren({
				selector: children.not(data.results),
				match: data.match,
				findAll: data.findAll,
				results: data.results
			});
		},
		searchArray: function (array, value) {
			// Best for large arrays. For tiny arrays, use indexOf.
			for (let i = 0; i < array.length; i++) if (array[i] === value) return i;
			return -1;
		},
		xml2json: function (xml) {
			let obj = {};

			if (xml.nodeType == 1) { // element
				// do attributes
				if (xml.attributes.length > 0) {
					obj['@attributes'] = {};
					for (let j = 0; j < xml.attributes.length; j++) {
						let attribute = xml.attributes.item(j);
						obj['@attributes'][attribute.nodeName] = attribute.nodeValue;
					}
				}
			} else if (xml.nodeType == 3) { // text
				obj = xml.nodeValue;
			}

			// do children
			if (xml.hasChildNodes()) {
				for (let i = 0; i < xml.childNodes.length; i++) {
					let item = xml.childNodes.item(i);
					let nodeName = item.nodeName;
					if (typeof(obj[nodeName]) === 'undefined') {
						obj[nodeName] = posdk.utils.xml2json(item);
					} else {
						if (typeof(obj[nodeName].push) === 'undefined') {
							let old = obj[nodeName];
							obj[nodeName] = [];
							obj[nodeName].push(old);
						}
						obj[nodeName].push(posdk.utils.xml2json(item));
					}
				}
			}
			return obj;
		},
		isJson: function (str) {
			try {
				JSON.parse(str);
			} catch (e) {
				return false;
			}
			return true;
		},
		makeSlug: function (string) {
			let output = '',
				valid = '-0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

			string = string.replace(/\s/g, '-').replace().replace(/-{2,}/g, "-");

			for (let i = 0; i < string.length; i++) {
				if (valid.indexOf(string.charAt(i)) != -1) output += string.charAt(i);
			}
			return output.toLowerCase();
		},
		camelCase: function (string) {
			// remove all characters that should not be in a variable name
			// as well underscores an numbers from the beginning of the string
			string = string.replace(/([^a-zA-Z0-9_\-\s])|^[_0-9]+/g, "").trim().substr(0, 1).toLowerCase() + string.substr(1);
			// uppercase letters preceeded by a hyphen or a space
			string = string.replace(/([ -]+)([a-zA-Z0-9])/g, function (a, b, c) {
				return c.toUpperCase();
			});
			// uppercase letters following numbers
			string = string.replace(/([0-9]+)([a-zA-Z])/g, function (a, b, c) {
				return b + c.toUpperCase();
			});
			return string;
		},
		date: function (params) {
			if (typeof params === 'undefined') params = {};
			if (typeof params.offset === 'undefined') params.offset = {};
			params = {
				offset: {
					year: params.offset.year || 0,
					month: params.offset.month || 0,
					hour: params.offset.hour || 0,
					minute: params.offset.minute || 0,
					second: params.offset.second || 0,
				}

			};
			let myDate = new Date();
			myDate.setYear(params.offset.year);
			myDate.setMonth(params.offset.month);
			myDate.setHours(params.offset.hour);
			myDate.setMinutes(params.offset.minutes);
			myDate.setSeconds(params.offset.second);
			return myDate.toLocaleString('en-us', {
				year: 'numeric',
				month: 'numeric',
				day: 'numeric'
			}).replace(/\//g, '-');
		},
		executeCallback: function (data, depricatedCallback, depricatedData, depricatedStatus, depricatedXhr) {
			function parameter(selector, settings, callback, data, status, xhr) {
				let deferred = $.Deferred();
				deferred.resolve(callback({
					selector: selector || null,
					settings: settings || null,
					content: data || null,
					status: status || null,
					xhr: xhr || null
				}));
				return deferred.promise();
			}

			let depricatedSelector;
			if (data instanceof jQuery) depricatedSelector = data;
			data = {
				selector: data.selector || depricatedSelector || null,
				settings: data.settings || null,
				callback: data.callback || depricatedCallback || null,
				content: data.content || depricatedData || null,
				status: data.status || depricatedStatus || null,
				xhr: data.xhr || depricatedXhr || null
			};
			if ([undefined, null, ''].indexOf(data.callback) === -1 && typeof data.callback === 'string' && typeof window[data.callback] === 'function') {
				return $.when(parameter(data.selector, data.settings, window[data.callback], data.content, data.status, data.xhr));
			}
		},
		ajax: function (options) {
			let settings = options || {};
			settings.url = options.url || '';

			settings.method = options.type || options.method || 'POST';
			settings.method = settings.method.toUpperCase();
			if (settings.method === 'GET') settings.cache = false;

			settings.contentType = (options.contentType !== false) ? options.contentType || 'application/json' : false;


			if (typeof settings.data !== 'undefined' && typeof settings.dataType === 'undefined' && posdk.utils.isJson(settings.data)) settings.dataType = 'application/json';
			else if (typeof settings.data === 'undefined' && typeof settings.dataType !== 'undefined' && ['binary', 'arraybuffer', 'blob'].indexOf(settings.dataType.toLowerCase()) === -1) delete settings.dataType;
			if (typeof settings.dataType !== 'undefined' && ['binary', 'arraybuffer', 'blob'].indexOf(settings.dataType.toLowerCase()) > -1) {
				settings.processData = false;
				if (['arraybuffer', 'blob'].indexOf(settings.dataType.toLowerCase()) > -1) {
					settings.responseType = settings.dataType;
					settings.dataType = 'binary';
				}
			}

			return fetch(settings);
		},
		validation: {
			number: function (fieldName, value) {
				if (value === '') {
					return null;
				} else if (isNaN(Number(value))) {
					console.log('The value of "' + fieldName + '" is not a number.');
					return NaN;
				} else return Number(value);
			},
			boolean: function (fieldName, value) {
				if (value === null || value.trim() === '' || value.toLowerCase() === 'false' || value == '0' || value === 'off') return false;
				else if (value.toLowerCase() === 'true' || value === '1' || value === 'on') return true;

				else return null;
			},
			dateTime: function (fieldName, value) {
				if (value.trim() === '') return null;
				else if (value.match(/([0-9]{4})-((0[1-9])|(1[0-2]))-((0[1-9])|([1-2][0-9])|(3[0-1]))T(([0-1][0-9])|(2[0-4])):([0-5][0-9]):([0-5][0-9])/)) return value;
				else {
					console.log('The value of "' + fieldName + '" is an invalid dateTime format.');
					return 'Invalid Date';
				}
			}
		}
	},
	extensions: {
		parseOptions: function(str) {
			cleanValue = function(value) {
				if (value.toLowerCase() === 'false') value = false;
				else if (value.toLowerCase() === 'true') value = true;
				else if (value.toLowerCase() === 'null' || value.toLowerCase() === 'nil') value = null;
				else if (!isNaN(value)) value = Number(value);
				return value;
			};

			let options = {};

			if (typeof str === 'string' && str.indexOf(':') > -1) {
				if (str.indexOf(';') > -1) {
					str = str.split(';');
					for (let e = 0; e < str.length; e++) {
						let arr = str[e].split(':');
						options[$.trim(arr[0])] = cleanValue($.trim(arr.slice(1).join(':')));
					}
				}else {
					let arr = str.split(':');
					options[$.trim(arr[0])] = cleanValue($.trim(arr.slice(1).join(':')));
				}
			}
			return options;
		},
		settings: function (selector, options, settings) {
			if (typeof settings.name === 'string' && settings.name.toLowerCase() !== 'engine' && settings.name.toLowerCase() !== 'settings') {
				if (typeof settings.defaults === 'undefined') settings.defaults = {};
				selector.data('posdk-' + settings.name.toLowerCase() + '-settings', $.extend({}, settings.defaults, options));
				posdk.active.tricks[settings.name] = settings.version;
				return selector.data('posdk-' + settings.name.toLowerCase() + '-settings');
			}
		},
		engine: function (scope) {
			if (typeof scope === 'undefined') scope = $(document);
			for (let trick in posdk.extensions.tricks) {
				let instances = scope.find('[data-posdk-' + trick.toLowerCase() + ']');
				for (let instance of instances) {
					let str = $(instance).data('posdk-' + trick.toLowerCase());
					let options = posdk.extensions.parseOptions(str);
					posdk.extensions.tricks[trick]($(instance), options);
				}
			}
		},
		tricks: {} // populated automatically
	}
};

// Initialize tricks
$(function() {
	posdk.extensions.engine();
});
