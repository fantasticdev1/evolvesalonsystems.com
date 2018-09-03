// TODO: split into multiple files and manage through webpack
// TODO: replace utils with lodash if possible

window.posdk = {
	active: {
		sdk: '0.1.1',
		tricks: {} // populated automatically
	},
	token: document.querySelector('meta[name="csrf-token"]').content || null,
	model: {
		record: {
			save: function(params) {
				if (typeof params === 'undefined') params = {};
				params = {
					id: params.id || null,
					form: params.form || null,
					parent: params.parent || null,
					fields: params.fields || {}
				};

				return posdk.utils.fetch({
					method: (params.id === null) ? 'POST' : 'PUT',
					url: (params.id === null) ? '/api/user/customizations' : '/api/user/customizations/'+params.id,
					form: params.form,
					parent: params.parent,
					fields: {properties:params.fields}
				});
			},
			delete: function(params) {
				if (typeof params === 'undefined') params = {};
				params = {
					id: params.id || null,
					form: params.form
				};

				return posdk.utils.fetch({
					method: 'DELETE',
					url: '/api/user/customizations/'+params.id,
					form: {properties:params.form}
				});
			}
		},
		schema: {
			save: function(params) {
				if (typeof params === 'undefined') params = {};
				params = {

				};
			},
			delete: function(params) {
				if (typeof params === 'undefined') params = {};
				params = {

				};
			}
		}
	},
	user: {
		record: {
			save: function(params) {
				if (typeof params === 'undefined') params = {};
				params = {
					id: params.id || null,
					form: params.form || null,
					fields: params.fields || null
				};

				if (params.fields === null || typeof params.fields !== 'object' || [undefined,null,''].indexOf(params.fields) > -1) throw new Error('User "email" field is missing from request.');

				return posdk.utils.fetch({
					method: (params.id === null) ? 'POST' : 'PUT',
					url: (params.id === null) ? '/api/users' : '/api/users/'+params.id,
					form: params.form,
					fields: params.fields
				});
			},
			delete: function(params) {
				if (typeof params === 'undefined') params = {};
				params = {
					id: params.id || null,
					form: params.form || null
				};

				if (params.id === null) throw new Error('An "id" is required to delete a user.');

				return posdk.utils.fetch({
					method: 'DELETE',
					url: '/api/users/'+params.id,
					form: params.form
				});
			}
		}
	},
	session: {
		save: function(params) {
			if (typeof params === 'undefined') params = {};
			params = {
				form: params.form || null,
				fields: params.fields || null
			};

			if (params.fields === null || typeof params.fields !== 'object' || [undefined,null,''].indexOf(params.fields) > -1) throw new Error('User "email and password" fields are missing from request.');
			if ([undefined,null,''].indexOf(params.fields.email) > -1) throw new Error('User "email" field is missing from request.');
			if ([undefined,null,''].indexOf(params.fields.password) > -1) throw new Error('User "password" field is missing from request.');

			return posdk.utils.fetch({
				method: 'POST',
				url: '/api/sessions',
				form: params.form,
				fields: params.fields
			});
		},
		delete: function(params) {
			if (typeof params === 'undefined') params = {};
			params = {
				form: params.form || null
			};

			return posdk.utils.fetch({
				method: 'DELETE',
				url: '/api/sessions',
				form: params.form
			});
		}
	},
	utils: {
		fetch: function(params) {
			if (typeof params === 'undefined') params = {};
			params = {
				method: params.method || 'POST',
				url: params.url || null,
				form: params.form || null,
				parent: params.parent || null,
				fields: params.fields || null
			};

			if ([params.url,params.form].indexOf(null) > -1) throw new Error('Missing essential parameters for fetch in poSDK.');

			let body = {
				form_configuration_name: params.form,
				authenticity_token: posdk.token
			};
			if (params.parent !== null) body.parent_resource_id = params.parent;
			if (params.fields !== null) body.form = params.fields;

			return fetch(params.url,{
				method: params.method,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'X-Requested-With': 'XMLHttpRequest'
				},
				credentials: 'same-origin',
				body: JSON.stringify(body)
			});
		},
		locationPathArray: function () {return location.pathname.toLowerCase().split(/(?=\/#?[a-zA-Z0-9])/g);},
		locationParamArray: function () {return location.search.split(/(?=&#?[a-zA-Z0-9])/g);},
		removeParams: function (obj, paramArray) {
			for (let key in obj) if (paramArray.indexOf(obj[key]) > -1) delete obj[key];
			return obj;
		},
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
		unescape: function (str) {
			if (typeof str === 'undefined') return '';
			else {
				let temp = document.createElement('div');
				temp.innerHTML = str;
				return temp.childNodes[0].nodeValue;
			}
		},
		encode: function (str) {
			return encodeURIComponent(str).replace(/'/g, "%27").replace(/"/g, "%22");
		},
		decode: function (str) {
			return decodeURIComponent(str.replace(/\+/g, " "));
		},
		makeSlug: function (string) {
			let output = '',
				valid = '-0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

			string = string.replace(/\s/g, '-').replace().replace(/-{2,}/g, '-');

			for (let i = 0; i < string.length; i++) {
				if (valid.indexOf(string.charAt(i)) != -1) output += string.charAt(i);
			}
			return output.toLowerCase();
		},
		camelCase: function (string) {
			// remove all characters that should not be in a variable name
			// as well underscores an numbers from the beginning of the string
			string = string.replace(/([^a-zA-Z0-9_\-\s])|^[_0-9]+/g, '').trim().substr(0, 1).toLowerCase() + string.substr(1);
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
		jsonify: function (str) {
			posdk.utils.jsonify.brace = /^[{\[]/;
			posdk.utils.jsonify.token = /[^,(:){}\[\]]+/g;
			posdk.utils.jsonify.quote = /^['"](.*)['"]$/;
			posdk.utils.jsonify.escap = /(["])/g;
			posdk.utils.jsonify.comma = {};
			posdk.utils.jsonify.comma.curly = /,(\s*)}/g;
			posdk.utils.jsonify.comma.square = /,(\s*)]/g;

			// Wrap with '{}' if not JavaScript object literal
			str = str.trim();
			if (posdk.utils.jsonify.brace.test(str) === false) str = '{' + str + '}';

			// Fix trailing commas
			str = str.replace(posdk.utils.jsonify.comma.curly, '}').replace(posdk.utils.jsonify.comma.square, ']');

			// Retrieve token and convert to JSON
			return str.replace(posdk.utils.jsonify.token, function (a) {
				a =a.trim();
				// Keep some special strings as they are
				if ('' === a || 'true' === a || 'false' === a || 'null' === a || (!isNaN(parseFloat(a)) && isFinite(a))) return a;
				// For string literal: 1. remove quotes at the top end; 2. escape double quotes in the middle; 3. wrap token with double quotes
				else return '"' + a.replace(posdk.utils.jsonify.quote, '$1').replace(posdk.utils.jsonify.escap, '\\$1') + '"';
			});
		},
		serializeObject: function (object) {
			let o = '', boolFalse, a, i;
			if (typeof object === 'undefined') return object;
			if (object instanceof jQuery) {
				if (object.is('form')) a = object.serializeArray();
				else if (object.is('select,textarea,input')) a = object.serializeArray(); // [{name:object.attr('name'),value:object.val()}];
				else a = object.find('input,select,textarea').serializeArray();
				boolFalse = object.find('[type=checkbox]').filter(function () {return $(this).prop('checked') === false;});
				for (i = 0; i < boolFalse.length; i++) {
					a.push({name: boolFalse[i].getAttribute('name'), value: null});
				}
			}else if (Array.isArray(object) && typeof object[0].name !== 'undefined' && typeof object[0].value !== 'undefined') {
				a = object;
			}else if (object != null && Object.prototype.toString.call(object) === '[object Object]' && typeof object.name !== 'undefined' && typeof object.value !== 'undefined') {
				a = [object];
			}else if (object != null && Object.prototype.toString.call(object) === '[object Object]') {
				o = object;
			}else {
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
		isJson: function (str) {
			try {
				JSON.parse(str);
			}catch (e) {
				return false;
			}
			return true;
		},
		isElement: function (object) {
			return (
				typeof HTMLElement === 'object' ? object instanceof HTMLElement : //DOM2
					object && typeof object === 'object' && object !== null && object.nodeType === 1 && typeof object.nodeName === 'string'
			);
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
			return myDate.toLocaleString('en-US', {
				year: 'numeric',
				month: 'numeric',
				day: 'numeric'
			}).replace(/\//g, '-');
		},
		extend: function(params) {
			params = params || {};

			for (let i = 1; i < arguments.length; i++) {
			  let obj = arguments[i];

			  if (!obj) continue;

			  for (let key in obj) {
				if (obj.hasOwnProperty(key)) {
				  if (arguments[0] == true && typeof obj[key] === 'object')
					params[key] = posdk.utils.extend(params[key], obj[key]);
				  else
					params[key] = obj[key];
				}
			  }
			}

			return params;
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
						options[arr[0].trim()] = cleanValue(arr.slice(1).join(':').trim());
					}
				}else {
					let arr = str.split(':');
					options[arr[0].trim()] = cleanValue(arr.slice(1).join(':').trim());
				}
			}
			return options;
		},
		settings: function (selector, options, settings) {
			if (typeof settings.name === 'string' && settings.name.toLowerCase() !== 'engine' && settings.name.toLowerCase() !== 'settings') {
				if (selector instanceof jQuery) selector = selector[0];
				let dataString = posdk.utils.camelCase('posdk ' + settings.name.toLowerCase()) + 'Settings';
				if (typeof settings.defaults === 'undefined') settings.defaults = {};
				let newSettings = posdk.utils.extend({}, settings.defaults, options);
				selector.dataset[dataString] = JSON.stringify(newSettings);
				posdk.active.tricks[settings.name] = settings.version;
				return newSettings;
			}
		},
		engine: function (scope) {
			if (typeof scope === 'undefined' || typeof scope.currentTarget !== 'undefined') scope = scope.currentTarget;
			if (scope instanceof jQuery) scope = scope[0];
			for (let trick in posdk.extensions.tricks) {
				scope.querySelectorAll('[data-posdk-' + trick.toLowerCase() + ']').forEach(instance => {
					let str = instance.dataset[posdk.utils.camelCase('posdk ' + trick.toLowerCase())];
					let options = posdk.extensions.parseOptions(str);
					posdk.extensions.tricks[trick](instance, options);
				});
			}
		},
		tricks: {} // populated automatically
	}
};

// Initialize tricks
if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') posdk.extensions.engine();
else document.addEventListener('DOMContentLoaded', posdk.extensions.engine);
