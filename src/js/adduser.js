'use strict';

import $ from 'jquery';
import datepickerFactory from 'jquery-datepicker';
import datepickerRUFactory from 'jquery-datepicker/i18n/jquery.ui.datepicker-ru';

datepickerFactory($);
datepickerRUFactory($);

const addCollection = new Map();

$(window).on('load', () => {
	addUser();
	datepicker();
	downloadFoto();
});

function templateAddTable(data) {
	const { id = '', fio = '', post = '', photofile = '', statustitle = '', date  = '' } = data;

	return `
		<div class="table__row" data-id="${id}">
			<div class="table__cell table__cell--body table__cell--fio">
				<span class="table__text table__text--body">${fio}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--post">
				<span class="table__text table__text--body">${post}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--photofile">
				<span class="table__text table__text--body">${photofile}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--statustitle">
				<span class="table__text table__text--body">${statustitle}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--date">
				<span class="table__text table__text--body">${date}</span>
			</div>
		</div>
	`;
}

function renderTable() {
	$('#tableAdd .table__content').html('');

	addCollection.forEach((item) => {
		$('#tableAdd .table__content').append(templateAddTable(item));
	});
}

function addUser() {
	$('#addUser').click((e) => {
		const form = $(e.target).parents('.form');
		const fields = $(form).find('.form__item');
		const addFields = [...fields].reduce((object, item) => {
			const fieldName = $(item).data('field');

			if ($(item).hasClass('select')) {
				const typeSelect = $(item).data('select');
				const fieldType = $(item).data('type');
				const nameId = $(item).find('.select__value--selected').attr(`data-${typeSelect}`);

				if ($(item).data('select') != 'date') {
					const valueItem = $(item).find('.select__value--selected').attr('data-title');

					object[fieldName] = valueItem;
				} else {
					if (nameId == 'date') {
						const inputValue = $('.form__item[data-field="date"]').val();

						object.date = inputValue;
					}
				}

				object[fieldType] = nameId;
			} else {
				if ($(item).attr('data-field') != 'date') {
					const inputValue = $(item).val();

					object[fieldName] = inputValue;
				}
			}

			return object;
		}, {});

		console.log(addFields);
		console.log(validationEmptyFields(addFields));
		// validationEmptyFields(addFields);

		// if (validationEmptyFields(addFields)) {
		// 	clearFieldsForm(fields);
		// 	userdFromForm([addFields]);
		// }
	});
}

function userdFromForm(array) {
	const objToCollection = {
		id: '',
		fio: '',
		date: '',
		post: '',
		nameid: '',
		photofile: '',
		statusid: '',
		statustitle: '',
		datestatus: '',
		department: ''
	};
	const indexCollection = addCollection.size;

	array.forEach((elem, i) => {
		const itemObject = Object.assign({}, objToCollection);
		const departName = $('.main__depart--add').attr('data-depart');
		const departID = $('.main__depart--add').attr('data-id');

		for (const itemField in itemObject) {
			for (const key in elem) {
				if (itemField === key) {
					itemObject[itemField] = elem[key];
				} else if (itemField === 'id') {
					itemObject[itemField] = i;
				} else if (itemField === 'department') {
					itemObject[itemField] = departName;
				} else if (itemField === 'nameid') {
					itemObject[itemField] = departID;
				}
			}
		}

		addCollection.set(indexCollection, itemObject);
	});

	dataAdd('#tableAdd');
}

function dataAdd(nameTable) {
	if (addCollection.size) {
		$('.table__nothing').hide();
		$(nameTable)
			.html('')
			.removeClass('table__body--empty')
			.append(`
				<div class="table__content table__content--active">
				</div>
			`);
	} else {
		$(nameTable).addClass('table__body--empty').html('');
		$(nameTable).append(`
			<p class="table__nothing">Новых данных нет</p>
		`);

		countItems('#tableAdd .table__content', 'add');

		return;
	}

	console.log(addCollection);

	renderTable();
	countItems('#tableAdd .table__content', 'add');
}

function countItems(tableContent, modDepart) {
	const countItemfromDep = $(tableContent).eq(0).find('.table__row').length;

	$(`.main__count--${modDepart}`).text(countItemfromDep);
}

function clearFieldsForm(array) {
	[...array].forEach((item) => {
		if ($(item).hasClass('select')) {
			const typeSelect = $(item).data('select');
			const placeholder = $(item).find('.select__value').data('placeholder');
			const attr = {'data-title': 'title', [`data-${typeSelect}`]: typeSelect};

			$(item).find('.select__value--selected')
				.removeClass('select__value--selected')
				.attr(attr)
				.text(placeholder);
			$('.form__field--date').hide();
			$('.img--form').attr('src', './images/avatar.svg');
		} else {
			$(item).val('');
		}
	});

	$('.form__field--new-post, .form__field--new-fio, .form__field--depart').hide();
}

function datepicker() {
	$("#dateField").datepicker({
		changeMonth: true,
		changeYear: true,
		showOtherMonths: true,
		selectOtherMonths: true,
		minDate: "+1D",
		maxViewMode: 10
	});
	// $('.ui-datepicker').appendTo('.section__form-wrap');
}

function downloadFoto() {
	$('.form__input--file').change((e) => {
		const fileReader = new FileReader();

		fileReader.onload = (e) => {
			$('.img--form').attr('src', e.target.result);
		};

		fileReader.readAsDataURL($(e.target)[0].files[0]);
	});
}

function validationEmptyFields(fields) {
	const validFields = Object.values(fields).every((item) => item);
	const statusMess = !validFields ? 'show' : 'hide';

	$('.main[data-name="add"]').find('.info__item--warn.info__item--fields')[statusMess]();

	console.log(validFields);
}

export default {
};
