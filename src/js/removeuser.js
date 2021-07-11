'use strict';

import $ from 'jquery';

$(window).on('load', () => {
	transferRemoveUserToRequest();
});

function transferRemoveUserToRequest() {
	const userRemove = [];

	$('#submitRemoveUser').click(() => {
		const itemUsers = $('#tableRemove .table__content--active').find('.table__row');
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
		const valueFields = [...itemUsers].map((row) => {
			const cells = $(row).find('.table__cell');
			const valueField = [...cells].map((cell) => {
				const name = $(cell).data('name');
				const value = $(cell).data('value');

				return {[name]: value};
			});

			return valueField;
		});

		valueFields.flat(1).forEach((elem) => {
			for (const itemField in object) {
				for (const key in elem) {
					if (itemField.toLocaleLowerCase() == key) {
						object[itemField] = elem[key];
					}
				}
			}
		});

		userRemove.push(object);
		// console.warn(userRemove);
		//
		// addUsersInTable('#tableRequest', 'request', userRemove);
	});
}
