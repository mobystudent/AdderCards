'use strict';

import $ from 'jquery';
import datepickerFactory from 'jquery-datepicker';
import datepickerRUFactory from 'jquery-datepicker/i18n/jquery.ui.datepicker-ru';
import service from './service.js';

datepickerFactory($);
datepickerRUFactory($);

const addCollection = new Map();

$(window).on('load', () => {
	addUser();
	datepicker();
	toggleSelect();
	downloadFoto();
	submitIDinBD();
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
			<div class="table__cell table__cell--body table__cell--photofile" title=${photofile}>
				<span class="table__text table__text--body">${photofile}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--statustitle">
				<span class="table__text table__text--body">${statustitle}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--date">
				<span class="table__text table__text--body">${date}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--edit">
				<button class="table__btn table__btn--edit" type="button">
					<svg class="icon icon--edit icon--edit-black">
						<use class="icon__item" xlink:href="./images/sprite.svg#edit"></use>
					</svg>
				</button>
			</div>
			<div class="table__cell table__cell--body table__cell--delete">
				<button class="table__btn table__btn--delete" type="button">
					<svg class="icon icon--delete icon--delete-black">
						<use class="icon__item" xlink:href="./images/sprite.svg#delete"></use>
					</svg>
				</button>
			</div>
		</div>
	`;
}

function templateAddForm(data) {
	const { fio = '', photofile = '', photourl = '', post = '', statusid = '', statustitle = '', datestatus = '', datetitle = '', date  = '' } = data;
	const dateClassView = datestatus == 'date' ? '' : 'form__field--hide';

	return `
		<div class="form__fields">
			<div class="form__field">
				<label class="form__label">
				<span class="form__name">ФИО</span>
					<input class="form__input form__item" data-field="fio" name="name" type="text" value="${fio}" placeholder="Введите ФИО" required="required"/>
				</label>
			</div>
			<div class="form__field">
				<label class="form__label">
				<span class="form__name">Должность</span>
					<input class="form__input form__item" data-field="post" name="post" type="text" value="${post}" placeholder="Введите должность" required="required"/>
				</label>
			</div>
			<div class="form__field">
				<span class="form__name">Тип идентификатора</span>
				<div class="form__select form__item select" data-field="statustitle" data-type="statusid" data-select="type">
					<header class="select__header">
						<span class="select__value select__value--selected" data-title="${statustitle}" data-type="${statusid}" data-placeholder="Выберите тип идентификатора">${statustitle}</span>
					</header>
					<ul class="select__list">
						<li class="select__item">
							<span class="select__name" data-title="Пластиковая карта" data-type="newCard">Пластиковая карта</span>
						</li>
						<li class="select__item">
							<span class="select__name" data-title="QR-код" data-type="newQR">QR-код</span>
						</li>
					</ul>
				</div>
			</div>
			<div class="form__field">
				<span class="form__name">Окончание действия пропуска</span>
				<div class="form__select form__item select" data-field="datetitle" data-type="datestatus" data-select="date">
					<header class="select__header">
						<span class="select__value select__value--selected" data-title="${datetitle}" data-date="${datestatus}" data-placeholder="Выберите окончание действия пропуска">${datetitle}</span>
					</header>
					<ul class="select__list">
						<li class="select__item">
							<span class="select__name" data-title="Ввести дату" data-date="date">Ввести дату</span>
						</li>
						<li class="select__item">
							<span class="select__name" data-title="Безвременно" data-date="infinite">Безвременно</span>
						</li>
					</ul>
				</div>
			</div>
			<div class="form__field ${dateClassView}" data-name="date">
				<label class="form__label"><span class="form__name">Дата окончания</span>
					<input class="form__input form__item" id="addDateField" data-field="date" name="date" type="text" value="${date}" placeholder="Введите дату" required="required"/>
				</label>
			</div>
		</div>
		<div class="form__aside">
			<div class="form__img">
				<img class="img img--form" src=${photourl} alt="user avatar"/>
			</div>
			<div class="form__field">
				<input class="form__input form__input--file form__item" id="addFile" data-field="photofile" data-value="${photofile}" name="photofile" type="file" required="required"/>
				<label class="form__download" for="addFile">
					<svg class="icon icon--download">
						<use xlink:href=./images/sprite.svg#download></use>
					</svg>
					<span class="form__title">Загрузить фото</span>
				</label>
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
		const userData = [...fields].reduce((object, item) => {
			const fieldName = $(item).data('field');

			if ($(item).hasClass('select')) {
				const typeSelect = $(item).data('select');
				const fieldType = $(item).data('type');
				const nameId = $(item).find('.select__value--selected').attr(`data-${typeSelect}`);
				const valueItem = $(item).find('.select__value--selected').attr('data-title');

				if (typeSelect == 'date' && nameId == 'date') {
					const inputValue = $(e.target).parents('.form').find('.form__item[data-field="date"]').val();

					object.date = inputValue;
				}

				object[fieldType] = nameId;
				object[fieldName] = valueItem;
			} else {
				if ($(item).attr('data-field') != 'date' && $(item).attr('data-field') != 'photofile') {
					const inputValue = $(item).val();

					object[fieldName] = inputValue;
				} else if ($(item).attr('data-field') == 'photofile') {
					const fieldUrl = $(item).data('url');
					const inputValue = $(item).data('value');

					console.log(fieldUrl);

					object.photourl = fieldUrl;
					object[fieldName] = inputValue;
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

		return;
	}

	renderTable();
	$('.main__count--add').text(addCollection.size);
	deleteUser();
	editUser();
}

function toggleSelect() {
	$('#addForm .select__header').click((e) => {
		$(e.currentTarget).next().slideToggle();
		$(e.currentTarget).toggleClass('select__header--active');
	});

	clickSelectItem();
}

function clickSelectItem() {
	$('#addForm .select__item').click((e) => {
		const title = $(e.currentTarget).find('.select__name').data('title');
		const select = $(e.currentTarget).parents('.select').data('select');

		$(e.currentTarget).parents('.select').find('.select__value').addClass('select__value--selected').text(title);
		$(e.currentTarget).parent().slideUp();
		$(e.currentTarget).parents('.select').find('.select__header').removeClass('select__header--active');

		setDataAttrSelectedItem(title, select, e.currentTarget);
	});
}

function setDataAttrSelectedItem(title, select, elem) {
	const dataType = $(elem).find('.select__name').data(select);
	let attr = '';

	if (select == 'date') {
		if (dataType == 'date') {
			$('.main[data-name="add"] .form__field[data-name="date"]').removeClass('form__field--hide');
		} else {
			$('.main[data-name="add"] .form__field[data-name="date"]').addClass('form__field--hide');
			$('.main[data-name="add"] .form__field[data-name="date"]').find('.form__input').val('');
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
	$("#addDatepicker").datepicker({
		changeMonth: true,
		changeYear: true,
		showOtherMonths: true,
		selectOtherMonths: true,
		minDate: "+1D",
		maxViewMode: 10
	});
}

function downloadFoto() {
	$('.form__input--file').change((e) => {
		const file = e.target.files[0];
		const url = URL.createObjectURL(file);
		const fileName = $(e.target).val();

		$('.img--form').attr('src', url);
		addCollection.photourl = url;
		$(e.target).attr({ 'data-value': fileName, 'data-url': url });
	});
}

function validationEmptyFields(fields) {
	const validFields = Object.values(fields).every((item) => item);
	const statusMess = !validFields ? 'show' : 'hide';
	const extentionArray = ['giff', 'png', 'jpg', 'jpeg'];
	let correctName = 'hide';
	let countNameWords = 'hide';
	let extensionImg = 'hide';

	for (let key in fields) {
		if (key == 'fio' && fields[key]) {
			const countWords = fields[key].trim().split(' ');

			correctName = fields[key].match(/[^а-яА-ЯiIъїё.'-\s]/g) ? 'show' : 'hide';
			countNameWords = (countWords.length < 2) ? 'show' : 'hide';
		} else if (key == 'photofile' && fields[key]) {
			const extenName = fields[key].lastIndexOf('.');
			const extenImg = fields[key].slice(extenName + 1);

			extensionImg = extentionArray.some((item) => item == extenImg) ? 'hide' : 'show';
		}
	}

	const valid = [statusMess, correctName, countNameWords, extensionImg].every((mess) => mess === 'hide');

	$('.main[data-name="add"]').find('.info__item--warn.info__item--fields')[statusMess]();
	$('.main[data-name="add"]').find('.info__item--error.info__item--name')[correctName]();
	$('.main[data-name="add"]').find('.info__item--error.info__item--short')[countNameWords]();
	$('.main[data-name="add"]').find('.info__item--error.info__item--image')[extensionImg]();

	return valid;
}

function deleteUser() {
	$('.table__content').click((e) => {
		if ($(e.target).parents('.table__btn--delete').length || $(e.target).hasClass('table__btn--delete')) {
			const idRemove = $(e.target).closest('.table__row').data('id');

			addCollection.delete(idRemove);
			renderTable();
		}

		$('.main__count--add').text(addCollection.size);
	});
}

function editUser() {
	$('.table__content').click((e) => {
		if ($(e.target).parents('.table__btn--edit').length || $(e.target).hasClass('table__btn--edit')) {
			const idEdit = $(e.target).closest('.table__row').data('id');

			renderForm(idEdit);
			addCollection.delete(idEdit);
			renderTable();
			service.toggleSelect();
			datepicker();
			downloadFoto();
		}

		$('.main__count--add').text(addCollection.size);
	});
}

function renderForm(id) {
	$('#addForm .form__wrap').html('');

	addCollection.forEach((user) => {
		if (user.id == id) {
			$('#addForm .form__wrap').append(templateAddForm(user));
		}
	});
}

function submitIDinBD() {
	$('#submitAddUser').click(() => {
		if (!addCollection.size) return;

		const idDepart = $('.main__depart--add').attr('data-id');
		const nameDepart = $('.main__depart--add').attr('data-depart');

		console.log(addCollection);

		addCollection.forEach((elem) => {
			elem.nameid = idDepart;
			elem.department = nameDepart;
		});

		setAddUsersInDB([...addCollection.values()], idDepart);

		addCollection.clear();
		$('#tableAdd')
			.html('')
			.addClass('table__body--empty').html('')
			.append(`
				<p class="table__nothing">Новых данных нет</p>
			`);

		renderTable();
		$('.main__count--add').text(addCollection.size);
	});
}

function setAddUsersInDB(array, nameid) {
	console.log(array);

	$.ajax({
		url: "./php/add-user-add.php",
		method: "post",
		dataType: "html",
		data: {
			nameid: nameid,
			array: array
		},
		success: function(data) {
			console.log('succsess '+data);
		},
		error: function(data) {
			console.log(data);
		}
	});
}

export default {
};
