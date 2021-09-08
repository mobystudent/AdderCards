'use strict';

import $ from 'jquery';
import datepickerFactory from 'jquery-datepicker';
import datepickerRUFactory from 'jquery-datepicker/i18n/jquery.ui.datepicker-ru';

datepickerFactory($);
datepickerRUFactory($);

const addCollection = new Map();
const addObject = {
	fio: '',
	post: '',
	statusid: '',
	statustitle: '',
	statusсardvalidto: '',
	сardvalidto: ''
};

$(window).on('load', () => {
	addUser();
	toggleSelect();
	downloadFoto();
	submitIDinBD();
});

function templateAddTable(data) {
	const { id = '', fio = '', post = '', photofile = '', statustitle = '', statusСardvalidto = '', cardvalidto = '' } = data;
	const cardvalidtoView = statusСardvalidto ? `
		<div class="table__cell table__cell--body table__cell--cardvalidto">
			<span class="table__text table__text--body">${cardvalidto}</span>
		</div>
	` : '';

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
			${cardvalidtoView}
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
	const { fio = '', photofile = '', photourl = '', post = '', statusid = '', statustitle = '', statusсardvalidto = '', cardvalidtotitle = '', сardvalidto = '' } = data;
	const typeValue = statustitle ? statustitle : 'Выберите тип идентификатора';
	const typeClassView = statustitle ? 'select__value--selected' : '';
	const сardvalidtoValue = cardvalidtotitle ? cardvalidtotitle : 'Выберите окончание действия пропуска';
	const сardvalidtoClassView = cardvalidtotitle ? 'select__value--selected' : '';
	const photoValue = photourl ? photourl : './images/avatar.svg';
	const сardvalidtoView = statusсardvalidto === 'date' ? `
		<div class="form__field form__field--cardvalidto">
			<label class="form__label"><span class="form__name">Дата окончания</span>
				<input class="form__input form__item form__item--сardvalidto" id="addDatepicker" data-field="date" name="date" type="text" value="${сardvalidto}" placeholder="Введите дату" required="required"/>
			</label>
		</div>
	` : '';

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
						<span class="select__value ${typeClassView}" data-title="${typeValue}" data-type="${statusid}" data-placeholder="Выберите тип идентификатора">${typeValue}</span>
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
				<div class="form__select form__item select" data-field="cardvalidtotitle" data-type="statusсardvalidto" data-select="сardvalidto">
					<header class="select__header">
						<span class="select__value ${сardvalidtoClassView}" data-title="${сardvalidtoValue}" data-сardvalidto="${statusсardvalidto}" data-placeholder="Выберите окончание действия пропуска">${сardvalidtoValue}</span>
					</header>
					<ul class="select__list">
						<li class="select__item">
							<span class="select__name" data-title="Ввести дату" data-сardvalidto="date">Ввести дату</span>
						</li>
						<li class="select__item">
							<span class="select__name" data-title="Безвременно" data-сardvalidto="infinite">Безвременно</span>
						</li>
					</ul>
				</div>
			</div>
			${сardvalidtoView}
		</div>
		<div class="form__aside">
			<div class="form__img">
				<img class="img img--form" src=${photoValue} alt="user avatar"/>
			</div>
			<div class="form__field">
				<input class="form__input form__input--file form__item" id="addFile" data-field="photofile" data-url="${photoValue}" data-value="${photofile}" name="photofile" type="file" required="required"/>
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

function templateAddHeaderTable(data) {
	const { statusСardvalidto = '' } = data;
	const сardvalidtoView = statusСardvalidto ? `
		<div class="table__cell table__cell--header table__cell--сardvalidto">
			<span class="table__text table__text--header">Дата</span>
		</div>
	` : '';

	return `
		<div class="table__cell table__cell--header table__cell--fio">
			<span class="table__text table__text--header">Фамилия Имя Отчество</span>
			<button class="btn btn--sort" type="button" data-direction="true"></button>
		</div>
		<div class="table__cell table__cell--header table__cell--post">
			<span class="table__text table__text--header">Должность</span>
		</div>
		<div class="table__cell table__cell--header table__cell--photofile">
			<span class="table__text table__text--header">Фотография</span>
		</div>
		<div class="table__cell table__cell--header table__cell--statustitle">
			<span class="table__text table__text--header">Идентификатор</span>
		</div>
		${сardvalidtoView}
		<div class="table__cell table__cell--header table__cell--edit">
			<svg class="icon icon--edit icon--edit-white">
				<use class="icon__item" xlink:href="./images/sprite.svg#edit"></use>
			</svg>
		</div>
		<div class="table__cell table__cell--header table__cell--delete">
			<svg class="icon icon--delete icon--delete-white">
				<use class="icon__item" xlink:href="./images/sprite.svg#delete"></use>
			</svg>
		</div>
	`;
}

function renderTable(nameTable = '#tableAdd') {
	$(`${nameTable} .table__content`).html('');

	addCollection.forEach((item) => {
		$(`${nameTable} .table__content`).append(templateAddTable(item));
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
				const nameId = $(item).find('.select__value--selected').attr(`data-${typeSelect}`);
				const fieldType = $(item).data('type');
				const valueItem = $(item).find('.select__value--selected').attr('data-title');

				if (typeSelect == 'сardvalidto') {
					if (nameId == 'date') {
						const inputValue = $(e.target).parents('.form').find('.form__item--сardvalidto').val();

						object.сardvalidto = inputValue;
					}

					object.statusсardvalidto = nameId;
					object.cardvalidtotitle = valueItem;
				} else {
					object[fieldType] = nameId;
					object[fieldName] = valueItem;
				}
			} else if ($(item).attr('data-field') == 'photofile') {
				const fieldUrl = $(item).attr('data-url');
				const inputValue = $(item).attr('data-value');

				object.photourl = fieldUrl;
				object[fieldName] = inputValue;
			} else {
				if ($(item).attr('data-field') != 'date' && $(item).attr('data-field') != 'photofile') {
					const inputValue = $(item).val();

					object[fieldName] = inputValue;
				}
			}

			return object;
		}, {});

		console.log(userData);

		if (validationEmptyFields(userData)) {
			userFromForm(userData);
			clearFieldsForm();
			showFieldsInHeaderTable();
		}
	});
}

function userFromForm(object, page = 'add', nameTable = '#tableAdd') {
	const objToCollection = {
		id: '',
		fio: '',
		post: '',
		nameid: '',
		photofile: '',
		photourl: '',
		statusid: '',
		statustitle: '',
		department: '',
		сardvalidto: '',
		statusсardvalidto: '',
		cardvalidtotitle: ''
	};
	const indexCollection = addCollection.size;
	const itemObject = Object.assign({}, objToCollection);
	const departName = $(`.main__depart--${page}`).attr('data-depart');
	const departID = $(`.main__depart--${page}`).attr('data-id');

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

	dataAdd(nameTable);
}

function dataAdd(nameTable, page = 'add') {
	if (addCollection.size) {
		emptySign(nameTable, 'full');
	} else {
		emptySign(nameTable, 'empty');

		return;
	}

	renderTable();
	$(`.main__count--${page}`).text(addCollection.size);
	deleteUser();
	editUser();
}

function showFieldsInHeaderTable(page = 'add') {
	const arrayStatusCells = [
		{
			name: 'cardvalidto',
			status: 'statusСardvalidto'
		}
	];
	const statusFields = {
		statusСardvalidto: false
	};

	$(`.table--${page} .table__header`).html('');

	showTableCells();

	[...addCollection.values()].forEach((elem) => {
		for (const key in elem) {
			for (const { name, status } of arrayStatusCells) {
				if ((key == name) && elem[status]) {
					statusFields[status] = elem[status];
				}
			}
		}
	});

	console.log(addCollection.values());
	const cardvalidto = [...addCollection.values()].some((cell) => cell.statusСardvalidto) ? '-cardvalidto' : '';
	const className = `wrap wrap--content wrap--content-${page}${cardvalidto}`;

	$(`.main[data-name="${page}"]`).find('.wrap--content').attr('class', className);
	$(`.table--${page} .table__header`).append(templateAddHeaderTable(statusFields));
}

function showTableCells() {
	const statusСardvalidto = [...addCollection.values()].some((cell) => cell.cardvalidto);

	addCollection.forEach((elem) => {
		elem.statusСardvalidto = statusСardvalidto;
	});
}

function toggleSelect(nameForm = '#addForm') {
	$(`${nameForm} .select__header`).click((e) => {
		$(e.currentTarget).next().slideToggle();
		$(e.currentTarget).toggleClass('select__header--active');
	});

	clickSelectItem();
}

function clickSelectItem(nameForm = '#addForm') {
	$(`${nameForm} .select__item`).click((e) => {
		const title = $(e.currentTarget).find('.select__name').data('title');
		const select = $(e.currentTarget).parents('.select').data('select');

		setDataAttrSelectedItem(title, select, e.currentTarget);
	});
}

function setDataAttrSelectedItem(title, select, elem, nameForm = '#addForm') {
	const statusid = $(elem).find('.select__name').data(select);
	const fio = $(`${nameForm} .form__item--fio`).val();
	const post = $(`${nameForm} .form__item--post`).val();
	const photofile = $(`${nameForm} .form__input--file`).data('value');
	const photourl = $(`${nameForm} .form__input--file`).data('url'); // default empty

	$(`${nameForm} .form__wrap`).html('');

	addObject.fio = fio ? fio : addObject.fio;
	addObject.post = post ? post : addObject.post;
	addObject.photofile = photofile ? photofile : addObject.photofile;
	addObject.photourl = photourl ? photourl : addObject.photourl;

	if (select === 'type') {
		addObject.statusid = statusid;
		addObject.statustitle = title;
	} else {
		addObject.statusсardvalidto = statusid;
		addObject.cardvalidtotitle = title;
		addObject.сardvalidto = statusid === 'date' ? addObject.сardvalidto : '';
	}

	$(`${nameForm} .form__wrap`).append(templateAddForm(addObject));

	toggleSelect();
	datepicker();
	downloadFoto();
	memberInputField();
}

function clearFieldsForm(nameForm = '#addForm') {
	const clearObject = {
		id: '',
		fio: '',
		statustitle: '',
		statusid: '',
		post: ''
	};
	addObject = {
		fio: '',
		statusid: '',
		statustitle: '',
		post: '',
		photourl: ''
	};

	$(`${nameForm} .form__wrap`).html('').append(templateAddForm(clearObject));

	toggleSelect();
	datepicker();
	downloadFoto();
	memberInputField();
}

function memberInputField() {
	$('.form__input').keyup((e) => {
		const nameField = $(e.currentTarget).data('field');
		const fieldValue = $(e.currentTarget).val();

		addObject[nameField] = fieldValue ? fieldValue : addObject[nameField];
	});
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

	$('.form__field--сardvalidto').click(() => {
		$("#ui-datepicker-div .ui-datepicker").show();
	});

	$('#addDatepicker').change((e) => {
		const сardvalidtoValue = $(e.currentTarget).val();

		addObject.сardvalidto = сardvalidtoValue;
	});
}

function emptySign(nameTable, status) {
	if (status == 'empty') {
		$(nameTable)
			.addClass('table__body--empty')
			.html('')
			.append('<p class="table__nothing">Новых данных нет</p>');
	} else {
		$(nameTable)
			.removeClass('table__body--empty')
			.html('')
			.append('<div class="table__content"></div>');
	}
}

function downloadFoto(nameForm = '#addForm') {
	$(`${nameForm} .form__input--file`).change((e) => {
		const file = e.target.files[0];
		const url = URL.createObjectURL(file);
		const fileNameUrl = $(e.target).val();
		const indexLastSlash = fileNameUrl.lastIndexOf('\\');
		const photoName = fileNameUrl.slice(indexLastSlash + 1);

		$('.img--form').attr('src', url);

		addObject.photourl = url;
		addObject.photofile = photoName;
		$(e.target).attr({'data-value': photoName, 'data-url': url});
	});
}

function validationEmptyFields(fields, page = 'add') {
	const validFields = Object.values(fields).every((item) => item);
	const statusMess = !validFields ? 'show' : 'hide';
	const extentionArray = ['gif', 'png', 'jpg', 'jpeg'];
	let correctName = 'hide';
	let countNameWords = 'hide';
	let extensionImg = 'hide';

	for (let key in fields) {
		if (key == 'fio' && fields[key]) {
			const countWords = fields[key].trim().split(' ');

			correctName = fields[key].match(/[^а-яА-ЯiIъїЁё.'-\s]/g) ? 'show' : 'hide';
			countNameWords = (countWords.length < 2) ? 'show' : 'hide';
		} else if (key == 'photofile' && fields[key]) {
			const extenName = fields[key].lastIndexOf('.');
			const extenImg = fields[key].slice(extenName + 1);

			extensionImg = extentionArray.some((item) => item == extenImg) ? 'hide' : 'show';
		}
	}

	const valid = [statusMess, correctName, countNameWords, extensionImg].every((mess) => mess === 'hide');

	$(`.main[data-name="${page}"]`).find('.info__item--warn.info__item--fields')[statusMess]();
	$(`.main[data-name="${page}"]`).find('.info__item--error.info__item--name')[correctName]();
	$(`.main[data-name="${page}"]`).find('.info__item--error.info__item--short')[countNameWords]();
	$(`.main[data-name="${page}"]`).find('.info__item--error.info__item--image')[extensionImg]();

	return valid;
}

function deleteUser(nameTable = '#tableAdd', page = 'add') {
	$('.table__content').click((e) => {
		if ($(e.target).parents('.table__btn--delete').length || $(e.target).hasClass('table__btn--delete')) {
			const idRemove = $(e.target).closest('.table__row').data('id');

			addCollection.forEach((user, i) => {
				if (user.id === idRemove) {
					addCollection.delete(i);
				}
			});

			showFieldsInHeaderTable();
			renderTable();
		}

		if (!addCollection.size) {
			emptySign(nameTable, 'empty');
		}

		$(`.main__count--${page}`).text(addCollection.size);
	});
}

function editUser(page = 'add') {
	$('.table__content').click((e) => {
		if ($(e.target).parents('.table__btn--edit').length || $(e.target).hasClass('table__btn--edit')) {
			const idEdit = $(e.target).closest('.table__row').data('id');

			showFieldsInHeaderTable();
			renderForm(idEdit);
			renderTable();
			toggleSelect();
			datepicker();
			downloadFoto();
		}

		$(`.main__count--${page}`).text(addCollection.size);
	});
}

function renderForm(id, nameForm = '#addForm') {
	$(`${nameForm} .form__wrap`).html('');

	addCollection.forEach((user, i) => {
		if (user.id == id) {
			$(`${nameForm} .form__wrap`).append(templateAddForm(user));
			addCollection.delete(i);
		}
	});

	addUser();
}

function submitIDinBD(nameTable = '#tableAdd', page = 'add') {
	$('#submitAddUser').click(() => {
		if (!addCollection.size) return;

		const idDepart = $(`.main__depart--${page}`).attr('data-id');
		const nameDepart = $(`.main__depart--${page}`).attr('data-depart');

		addCollection.forEach((elem) => {
			elem.nameid = idDepart;
			elem.department = nameDepart;
			elem.date = getCurrentDate();
		});

		setAddUsersInDB([...addCollection.values()], 'add' , 'add');

		addCollection.clear();
		emptySign(nameTable, 'empty');
		renderTable();

		$(`.main__count--${page}`).text(addCollection.size);
	});
}

function getCurrentDate() {
	const date = new Date();
	const month = date.getMonth() + 1;
	const currentDay = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
	const currentMonth = month < 10 ? `0${month}` : month;
	const currentYear = date.getFullYear() < 10 ? `0${date.getFullYear()}` : date.getFullYear();

	const currentHour = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
	const currentMinute = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();

	return `${currentDay}-${currentMonth}-${currentYear} ${currentHour}:${currentMinute}`;
}

function setAddUsersInDB(array, nameTable, action) {
	$.ajax({
		url: "./php/change-user-request.php",
		method: "post",
		dataType: "html",
		data: {
			action: action,
			nameTable: nameTable,
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
