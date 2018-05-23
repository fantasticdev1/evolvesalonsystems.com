/*
 * "submit". An awesome trick for pOS.
 * Copyright 2018, ONE Creative
*/

posdk.extensions.tricks.submit = function(selector,options) {
	var settings = posdk.extensions.settings(selector,options,{
		name: 'submit',
		version: '1.0.0',
		date: '2018.05.02',
		defaults: {
			submitMode: 'reload', // 'reload' or 'ajax'
			validateMode: 'ajax', // 'reload' or 'ajax'
			validationGroupClass: 'validation-group',
			validationMessageClass: 'validation-message',
			validationMessageElement: 'small',
			invalidClass: 'invalid',
			validClass: 'valid'
		}
	});

	selector[0].addEventListener('click', function(event) {
		let target = event.target;

		if (target) {
			if (target.type === 'submit') {
				event.preventDefault();

				if (settings.submitMode === 'ajax') {
					fetch(selector[0].action,{
						method: selector[0].method,
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json',
							'X-Requested-With': 'XMLHttpRequest'
						},
						body: JSON.stringify(posdk.utils.serializeObject(selector)),
						credentials: 'same-origin'
					}).then(result => {
						let errors = (typeof result.json === 'function') ? result.json() : result;
						selector.find('.'+settings.validationGroupClass).removeClass(settings.invalidClass).find('.'+settings.validationMessageClass).remove();
						for (let errorObj in errors) Methods.validation.add(errorObj);
					});
				}else if (settings.submitMode === 'reload') {
					selector.submit();
				}
			}
		}
	});

	const Methods = {
		validation: {
			add: function(errorObj) {
				// selector.find('[name='+errorObj.name+']');
			}
		}
	};
};
