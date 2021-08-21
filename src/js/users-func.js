'use strict';

import $ from 'jquery';

$(window).on('load', () => {
});

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
