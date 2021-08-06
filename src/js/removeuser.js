'use strict';

import $ from 'jquery';
import datepickerFactory from 'jquery-datepicker';
import datepickerRUFactory from 'jquery-datepicker/i18n/jquery.ui.datepicker-ru';
import { nameDeparts } from './nameDepart.js';
import service from './service.js';

datepickerFactory($);
datepickerRUFactory($);

const removeCollection = new Map();

$(window).on('load', () => {
	addUser();
	datepicker();
	setDepartInSelect();
	getAddUsersInDB();
});

function templateRemoveTable(data) {
	const { id = '', fio = '', post = '', statustitle = '', date  = '' } = data;

	return `
		<div class="table__row" data-id="${id}">
			<div class="table__cell table__cell--body table__cell--fio">
				<span class="table__text table__text--body">${fio}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--post">
				<span class="table__text table__text--body">${post}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--statustitle">
				<span class="table__text table__text--body">${statustitle}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--date">
				<span class="table__text table__text--body">${date}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--edit">
				<button class="table__btn table__btn--edit" type="button">
					<svg class="icon icon--edit">
						<use class="icon__item" xlink:href="./images/sprite.svg#edit"></use>
					</svg>
				</button>
			</div>
			<div class="table__cell table__cell--body table__cell--delete">
				<button class="table__btn table__btn--delete" type="button">
					<svg class="icon icon--delete">
						<use class="icon__item" xlink:href="./images/sprite.svg#delete"></use>
					</svg>
				</button>
			</div>
		</div>
	`;
}

function templateRemoveForm(data) {
	const { id = '', fio = '', photofile = '', photourl = '', post = '', statusid = '', statustitle = '', datestatus = '', datetitle = '', date  = '' } = data;

	return `
		<div class="form__fields">
			<div class="form__field"><span class="form__name">Пользователь</span>
				<div class="form__select form__item select" data-field="fio" data-select="fio">
					<header class="select__header">
						<span class="select__value" data-title="title" data-placeholder="Выберите пользователя">Выберите пользователя</span>
					</header>
					<ul class="select__list"></ul>
				</div>
			</div>
			<div class="form__field"><span class="form__name">Причина удаления</span>
				<div class="form__select form__item select" data-field="titleid" data-type="statusid" data-select="reason">
					<header class="select__header">
						<span class="select__value" data-title="title" data-reason="type" data-placeholder="Выберите причину удаления">Выберите причину удаления</span>
					</header>
					ul class="select__list">
						<li class="select__item">
							<span class="select__name" data-title="Перевод в другое подразделение" data-reason="changeDepart">Перевод в другое подразделение</span>
						</li>
						<li class="select__item">
							<span class="select__name" data-title="Увольнение" data-reason="remove">Увольнение</span>
						</li>
					</ul>
				</div>
			</div>
			<div class="form__field form__field--hide" data-name="depart"><span class="form__name">Новое подразделение</span>
				<div class="form__select form__item select" data-field="newdepart" data-type="newnameid" data-select="new-name-id">
					<header class="select__header">
						<span class="select__value" data-title="title" data-new-name-id="new-name-id" data-placeholder="Выберите подразделение">Выберите подразделение</span>
					</header>
					<ul class="select__list"></ul>
				</div>
			</div>
			<div class="form__field form__field--hide" data-name="date">
				<label class="form__label"><span class="form__name">Дата завершения действия пропуска</span>
					<input class="form__input form__item" id="removeDateField" data-field="date" name="date" type="text" value="${date}" placeholder="Введите дату завершения действия пропуска" required="required"/>
				</label>
			</div>
		</div>
		<div class="form__aside">
			<div class="form__img">
				<img class="img img--form img--form-remove" src=${photourl} alt="user avatar"/>
			</div>
		</div>
	`;
}

function renderTable() {
	$('#tableRemove .table__content').html('');

	removeCollection.forEach((item) => {
		$('#tableRemove .table__content').append(templateremoveTable(item));
	});
}

function addUser() {
	$('#removeUser').click((e) => {
		const form = $(e.target).parents('.form');
		const fields = $(form).find('.form__item');
		const userData = [...fields].reduce((object, item) => {
			const fieldName = $(item).data('field');

			if ($(item).hasClass('select')) {
				const typeSelect = $(item).data('select');
				const nameId = $(item).find('.select__value--selected').attr(`data-${typeSelect}`);
				const fieldType = $(item).data('type');
				const valueItem = $(item).find('.select__value--selected').attr('data-title');

				if (typeSelect == 'reason') {
					if (nameId == 'remove') {
						const inputValue = $(e.target).parents('.form').find('.form__item[data-field="date"]').val();

						object.date = inputValue;
					}

					object[fieldType] = nameId;
					object[fieldName] = valueItem;
				} else if (typeSelect == 'new-name-id' && nameId) {
					object[fieldType] = nameId;
					object[fieldName] = valueItem;
				} else if (typeSelect == 'fio') {
					object[fieldName] = valueItem;
				}
			}

			return object;
		}, {});

		console.log(userData);

		if (validationEmptyFields(userData)) {
			clearFieldsForm(fields);
			userdFromForm(userData);
		}
	});
}

function userdFromForm(object) {
	const objToCollection = {
		id: '',
		fio: '',
		date: '',
		post: '',
		nameid: '',
		photofile: '',
		photourl: '',
		statusid: '',
		statustitle: '',
		datestatus: '',
		datetitle: '',
		department: ''
	};
	const indexCollection = addCollection.size;
	const itemObject = Object.assign({}, objToCollection);
	const departName = $('.main__depart--add').attr('data-depart');
	const departID = $('.main__depart--add').attr('data-id');

	for (const itemField in itemObject) {
		for (const key in object) {
			if (itemField === key) {
				itemObject[itemField] = object[key];
			} else if (itemField === 'id') {
				itemObject[itemField] = indexCollection;
			} else if (itemField === 'department') {
				itemObject[itemField] = departName;
			} else if (itemField === 'nameid') {
				itemObject[itemField] = departID;
			}
		}
	}

	addCollection.set(indexCollection, itemObject);

	dataAdd('#tableAdd');
}

function setDepartInSelect() {
	nameDeparts.forEach((depart) => {
		const { idName = '', longName = '' } = depart;

		$('.select[data-field="newdepart"] .select__list').append(`
			<li class="select__item">
				<span class="select__name" data-title="${longName}" data-new-name-id="${idName}">${longName}</span>
			</li>
		`);
	});

	clickSelectItem();
}

function setUsersInSelect(users) {
	users.forEach((item) => {
		const { id = '', fio = '' } = item;

		$('.select[data-select="fio"]').find('.select__list').append(`
			<li class="select__item">
				<span class="select__name" data-title="${fio}" data-id="${id}">
					${fio}
				</span>
			</li>
		`);
	});

	clickSelectItem();
}

function clickSelectItem() {
	$('.select__item').click((e) => {
		const title = $(e.currentTarget).find('.select__name').data('title');
		const id = $(e.currentTarget).find('.select__name').data('id');
		const select = $(e.currentTarget).parents('.select').data('select');

		$(e.currentTarget).parents('.select').find('.select__value').addClass('select__value--selected').text(title);
		$(e.currentTarget).parent().slideUp();
		$(e.currentTarget).parents('.select').find('.select__header').removeClass('select__header--active');

		if (select === 'fio') {
			getAddUsersInDB(id);
		}

		setDataAttrSelectedItem(title, select, e.currentTarget);
	});
}

function setDataAttrSelectedItem(title, select, elem) {
	const dataType = $(elem).find('.select__name').data(select);
	let attr = '';

	if (select == 'reason') {
		if (dataType == 'changeDepart') {
			$('.main[data-name="remove"] .form__field[data-name="depart"]').removeClass('form__field--hide');
			$('.main[data-name="remove"] .form__field[data-name="date"]').addClass('form__field--hide');
			$('.main[data-name="remove"] .form__field[data-name="date"]').find('.form__input').val('');

			// $(elem).parents('.main').find('.wrap--content').addClass('wrap--content-remove-transfer').removeClass('wrap--content-remove-item');
		} else {
			const newDepartFields = $('#removeForm').find('.form__item[data-field="newdepart"]');

			$('.main[data-name="remove"] .form__field[data-name="depart"]').addClass('form__field--hide');
			$('.main[data-name="remove"] .form__field[data-name="date"]').removeClass('form__field--hide');

			const typeSelect = 'newdepart';
			const placeholder = newDepartFields.find('.select__value').data('placeholder');
			const attr = {'data-title': 'title', [`data-${typeSelect}`]: typeSelect};

			newDepartFields.find('.select__value--selected')
				.removeClass('select__value--selected')
				.attr(attr)
				.text(placeholder);

			// $(elem).parents('.main').find('.wrap--content').addClass('wrap--content-remove-item').removeClass('wrap--content-remove-transfer');
		}
	}

	if (dataType) {
		attr = {'data-title': title, [`data-${select}`]: dataType};
	} else {
		attr = {'data-title': title};
	}

	$(elem).parents('.select').find('.select__value--selected').attr(attr);
}

function clearFieldsForm(array) {
	[...array].forEach((item) => {
		if ($(item).hasClass('select')) {
			const typeSelect = $(item).data('select');
			const placeholder = $(item).find('.select__value').data('placeholder');
			const attr = {'data-title': 'title', [`data-${typeSelect}`]: typeSelect};

			if (typeSelect == 'new-name-id') {
				$(item).parents('.form__field').addClass('form__field--hide');
			}

			$(item).find('.select__value--selected')
				.removeClass('select__value--selected')
				.attr(attr)
				.text(placeholder);
		} else {
			$(item).val('');
		}
	});

	$('.form__field[data-name="date"]').addClass('form__field--hide');
	$('.img--form').attr('src', './images/avatar.svg');
	$('.form__field--new-post, .form__field--new-fio, .form__field--depart').hide();
}

function datepicker() {
	$("#removeDatepicker").datepicker({
		changeMonth: true,
		changeYear: true,
		showOtherMonths: true,
		selectOtherMonths: true,
		minDate: "+1D",
		maxViewMode: 10
	});
}

function showUserAvatar(url) {
	const { photourl  = '' } = url;

	console.log(photourl);
	// $('.img--form-remove').attr('src', photourl);
}

function validationEmptyFields(fields) {
	const validFields = Object.values(fields).every((item) => item);
	const statusMess = !validFields ? 'show' : 'hide';

	const valid = statusMess === 'hide' ? true : false;

	$('.main[data-name="remove"]').find('.info__item--warn.info__item--fields')[statusMess]();

	return valid;
}

function getAddUsersInDB(id = '') {
	const idDepart = $('.main__depart--remove').attr('data-id');

	$.ajax({
		url: "./php/remove-user-output.php",
		method: "post",
		dataType: "html",
		data: {
			id: id,
			nameid: idDepart
		},
		success: function(data) {
			if (id) {
				showUserAvatar(JSON.parse(data));
			} else {
				setUsersInSelect(JSON.parse(data));
			}
		},
		error: function(data) {
			console.log(data);
		}
	});
}

export default {
};
