'use strict';

import $ from 'jquery';

$(window).on('load', () => {
	addNewUserInTable();
});

function addNewUserInTable() {
	const userAdd = [];
	const userRemove = [];
	const userEdit = [];
	let countId = 1; //delete

	$('#addUser, #removeUser, #editUser').click((e) => {
		const form = $(e.target).parents('.form');
		const fields = $(form).find('.form__item');
		const typeBtn = $(e.target).data('type');
		const object = {
			FIO: '',
			Department: '',
			FieldGroup: '',
			Badge: '',
			CardName: '',
			CardID: '',
			CardValidTo: '',
			PIN: '',
			CardStatus: 1,
			Security: 0,
			Disalarm: 0,
			VIP: 0,
			DayNightCLM: 0,
			AntipassbackDisabled: 0,
			PhotoFile: '',
			EmployeeNumber: '',
			Post: '',
			NameID: '',
			StatusID: '',
			IDUser: '',
			TitleID: '',
			NewFIO: '',
			NewPost: '',
			NewDepart: '',
			Data: '',
			CodePicture: ''
		};
		const addFields = [...fields].reduce((array, item) => {
			const fieldName = $(item).data('field');

			if ($(item).hasClass('select')) {
				const fieldType = $(item).data('type');
				const typeSelect = $(item).data('select');
				const valueItem = $(item).find('.select__value--selected').data('title');

				if (typeSelect != 'fio') {
					const nameId = $(item).find('.select__value--selected').data(typeSelect);

					array.push({[fieldName]: valueItem}, {[fieldType]: nameId});
				} else {
					array.push({[fieldName]: valueItem});
				}
			} else {
				const inputValue = $(item).val();

				array.push({[fieldName]: inputValue});
			}

			return array;
		}, []);

		addFields.forEach((elem) => {
			for (const itemField in object) {
				for (const key in elem) {
					if (itemField == key) {
						object[itemField] = elem[key];
					}
				}
			}
		});

		object.IDUser = countId;//delete
		countId++;//delete

		switch(typeBtn) {
			case 'add-user':
				userAdd.push(object);
				addUsersInTable('#tableAdd', 'add', userAdd);

				break;
			case 'remove-user':
				userRemove.push(object);
				addUsersInTable('#tableRemove', 'remove', userRemove);

				break;
			case 'edit-user':
				userEdit.push(object);
				addUsersInTable('#tableEdit', 'edit', userEdit);

				break;
		}

		clearFieldsForm(fields);
	});
}

function addUsersInTable(tableID, nameTable, user) {
	createTable(user, tableID, nameTable);
	addCountCards(user, tableID, nameTable);

	$(`.table--${nameTable} .table__body`).removeClass('table__body--empty');
	$(`.table--${nameTable} .table__nothing`).hide();
}

function clearFieldsForm(array) {
	[...array].forEach((item) => {
		if ($(item).hasClass('select')) {
			const typeSelect = $(item).data('select');
			const placeholder = $(item).find('.select__value').data('placeholder');
			let attr = '';

			if (typeSelect != 'fio') {
				attr = {'title': 'title', [`${typeSelect}`]: typeSelect};
			} else {
				attr = {'title': 'title'};
			}

			$(item).find('.select__value--selected')
				.removeClass('select__value--selected')
				.data(attr)
				.text(placeholder);
		} else {
			$(item).val('');
		}
	});

	$('.form__field--new-post, .form__field--new-fio, .form__field--depart').hide();
}

export default {

};
