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
			resource: null,
			form: null,
			parent: null,
			fields: null,
			records: null,
			editClass: 'edit_record',
			deleteClass: 'delete_record',
			addClass: 'add_record',
			container: 'selector',
			buttonContainer: null
		}
	});

	const Methods = {

	};

	if (settings.resource !== null && settings.fields !== null && settings.records !== null && settings.config !== null) {
		let fields = fetch(settings.fields).then(response => response.json());
		let form = fetch(settings.form).then(response => response.json());
		let container = (settings.container === 'selector') ? selector : selector.closest(settings.container);

		Promise.all([fields,form]).then((response) => {
			let fields = response[0];
			let form = response[1];

			const editor = new $.fn.dataTable.Editor( {
				ajax:  {
					create: function(method, url, data, success, error) {
						posdk[settings.resource].item.save({
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
						posdk[settings.resource].item.save({
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
						posdk[settings.resource].item.delete({
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

			let columns = [{
				title: '&nbsp;&nbsp;&nbsp;',
                data: null,
                defaultContent: '',
                className: 'select-box',
                orderable: false,
                searchable: false
            }];
			for (let field in form.configuration.properties) columns.push({title:field, name:field, data:field, defaultContent:''});

			const table = selector.DataTable({
				ajax: settings.records,
				columns: columns,
				autoWidth: true,
				stateSave: true,
				rowId: 'id',
				pagingType: 'full_numbers',
				lengthMenu: [
					[10, 25, 50, -1],
					[10, 25, 50, 'All']
				],
				select: {
					blurable: true,
					selector: 'td:first-child',
					style: 'os'
				},
				colReorder: {
					fixedColumnsLeft: 1
				},
				scrollX: true,
				fixedColumns: {
					leftColumns: 1
				},
				language: {
					search: '_INPUT_',
					searchPlaceholder: 'Search records',
				},
				buttons: {
					dom: {
						button: {
							tag: 'button',
							className: 'btn btn-sm'
						},
						container: {
							className: 'record-editing-buttons'
						}
					},
					buttons: [
						{ extend: 'create', editor: editor, className: 'btn-default', text:'<i class="fal fa-plus"></i> Add'},
						{ extend: 'edit',   editor: editor, className: 'btn-default', text:'<i class="fal fa-pencil"></i> Edit'},
						{ extend: 'remove', editor: editor, className: 'btn-danger', text:'<i class="fal fa-times"></i> Delete'}
					]
				},
				initComplete: function(tSettings, json) {
					table.buttons().container().appendTo(container.find(settings.buttonContainer),table.table().container());
				}
			});

			// container[0].addEventListener('click', function(event) {
			// 	let target = event.target;

			// 	if (target) {
			// 		if (target.classList.contains(settings.editClass)) {
			// 			event.preventDefault();

			// 			let row = (target.closest('tr').id === '') ? target.closest('tr').previousElementSibling : target.closest('tr');
			// 			editor.edit(row, {
			// 				title: 'Edit record',
			// 				buttons: 'Update'
			// 			});
			// 		}else if (target.classList.contains(settings.deleteClass)) {
			// 			event.preventDefault();

			// 			let row = (target.closest('tr').id === '') ? target.closest('tr').previousElementSibling : target.closest('tr');
			// 			editor.remove(row, {
			// 				title: 'Delete record',
			// 				message: 'Are you sure you wish to remove this record?',
			// 				buttons: 'Delete'
			// 			});
			// 		}else if (target.classList.contains(settings.addClass)) {
			// 			event.preventDefault();

			// 			editor.create( {
			// 				title: 'Create new record',
			// 				buttons: 'Add'
			// 			});
			// 		}
			// 	}
			// });
		});
	}
};
