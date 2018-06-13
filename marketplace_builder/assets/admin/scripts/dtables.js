/*
 * "dtables". An awesome trick for pOS.
 * Copyright 2018, ONE Creative
*/

posdk.extensions.tricks.dtables = function(selector,options) {
	var settings = posdk.extensions.settings(selector,options,{
		name: 'dtables',
		version: '1.0.0',
		date: '2018.06.05',
		defaults: {
			form: null,
			parent: null,
			fields: null,
			records: null,
			editClass: 'edit_record',
			deleteClass: 'delete_record',
			addClass: 'add_record'
		}
	});

	const Methods = {

	};

	if (settings.fields !== null && settings.records !== null && settings.config !== null) {
		let fields = fetch(settings.fields).then(response => response.json());
		let form = fetch(settings.form).then(response => response.json());

		Promise.all([fields,form]).then((response) => {
			let fields = response[0];
			let form = response[1];
			let columns = [];
			for (let field in form.configuration.properties) columns.push({title:field, name:field, data:field, defaultContent:''});
			columns.push({title:'Actions', name:'Actions', data:null, defaultContent:'<a href="#" class="btn btn-warning btn-link btn-icon btn-md"><i class="fas fa-edit edit_record"></i></a><a href="#" class="btn btn-danger btn-link btn-icon btn-md"><i class="fas fa-times delete_record"></i></a>'});

			const editor = new $.fn.dataTable.Editor( {
				ajax:  {
					create: function(method, url, data, success, error) {
						posdk.model.item.save({
							form: form.name,
							parent: settings.parent,
							fields: data.data[0] || {}
						})
						.then((response)=>{
							// console.log(response);
							if (response.ok === true) {
								return response.json();
							}else throw new Error(response.text());
						})
						.then(data=> {
							let id = data.id;
							return fetch(settings.records+'&id='+id).then(response => response.json());
						})
						.then(data=>success(data))
						.catch(data=>error(data));
					},
					edit: function(method, url, data, success, error) {
						let id = Object.getOwnPropertyNames(data.data)[0];
						posdk.model.item.save({
							id: id,
							form: form.name,
							parent: settings.parent,
							fields: data.data[id] || {}
						})
						.then((response)=>{
							// console.log(response);
							if (response.ok === true) {
								return fetch(settings.records+'&id='+id).then(response => response.json());
							}else throw new Error(response.text());
						})
						.then(data=>success(data))
						.catch(data=>error(data));
					},
					remove: function(method, url, data, success, error) {
						let id = Object.getOwnPropertyNames(data.data)[0];
						posdk.model.item.delete({
							id: id,
							form: form.name
						})
						.then((response)=>{
							// console.log(response);
							if (response.ok === true) return {};
							else throw new Error(response.text());
						})
						.then(data=>success(data))
						.catch(data=>error(data));
					}
				},
				idSrc: 'id',
				table: selector,
				fields: fields
			});

			const table = selector.DataTable({
				ajax: settings.records,
				columns: columns,
				autoWidth: true,
				stateSave: true,
				rowId: 'id',
				pagingType: 'full_numbers',
				// fixedColumns: {
		  //           leftColumns: 1
		  //       },
				lengthMenu: [
					[10, 25, 50, -1],
					[10, 25, 50, 'All']
				],
				responsive: true,
				language: {
					search: '_INPUT_',
					searchPlaceholder: 'Search records',
				}

			});

			selector[0].addEventListener('click', function(event) {
				let target = event.target;

				if (target) {
					if (target.classList.contains(settings.editClass)) {
						event.preventDefault();

            let row = (target.closest('tr').id === '') ? target.closest('tr').previousElementSibling : target.closest('tr');
						editor.edit(target.closest('tr'), {
				            title: 'Edit record',
				            buttons: 'Update'
				        });
					}else if (target.classList.contains(settings.deleteClass)) {
						event.preventDefault();

						let row = (target.closest('tr').id === '') ? target.closest('tr').previousElementSibling : target.closest('tr');
						editor.remove(row, {
				            title: 'Delete record',
				            message: 'Are you sure you wish to remove this record?',
				            buttons: 'Delete'
				        });
					}else if (target.classList.contains(settings.addClass)) {
						event.preventDefault();

						editor.create( {
				            title: 'Create new record',
				            buttons: 'Add'
				        });
					}
				}
			});
		});
	}
};
