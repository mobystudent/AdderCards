'use strict';

import $ from 'jquery';
import datepickerFactory from 'jquery-datepicker';
import datepickerRUFactory from 'jquery-datepicker/i18n/jquery.ui.datepicker-ru';
import service from './service.js';
import messageMail from './mail.js';

datepickerFactory($);
datepickerRUFactory($);

const addCollection = new Map();
const addObject = {
	fio: '',
	post: '',
	statusid: '',
	statustitle: '',
	statuscardvalidto: '',
	cardvalidto: '',
	photourl: ''
};
let counter = 0;

$(window).on('load', () => {
	addUser();
	toggleSelect();
	downloadFoto();
	submitIDinBD();
	showDataFromStorage();
});

function templateAddTable(data) {
	const { id = '', fio = '', post = '', photofile = '', statustitle = '', cardvalidto = '' } = data;
	const cardvalidtoView = addObject.statuscardvalidto ? `
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
	const { fio = '', photofile = '', photourl = '', post = '', statusid = '', statustitle = '', cardvalidtotitle = '', cardvalidtoid = '', cardvalidto = '' } = data;
	const typeValue = statustitle ? statustitle : 'Выберите тип идентификатора';
	const typeClassView = statustitle ? 'select__value--selected' : '';
	const cardvalidtoValue = cardvalidtotitle ? cardvalidtotitle : 'Выберите окончание действия пропуска';
	const cardvalidtoClassView = cardvalidtotitle ? 'select__value--selected' : '';
	const photoValue = photourl ? photourl : './images/avatar.svg';
	const cardvalidtoView = addObject.statuscardvalidto ? `
		<div class="form__field form__field--cardvalidto">
			<label class="form__label"><span class="form__name">Дата окончания</span>
				<input class="form__input form__item form__item--cardvalidto" id="addDatepicker" data-field="date" name="date" type="text" value="${cardvalidto}" placeholder="Введите дату" required="required"/>
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
				<div class="form__select form__item select" data-field="cardvalidtotitle" data-type="statuscardvalidto" data-select="cardvalidto">
					<header class="select__header">
						<span class="select__value ${cardvalidtoClassView}" data-title="${cardvalidtoValue}" data-cardvalidto="${cardvalidtoid}" data-placeholder="Выберите окончание действия пропуска">${cardvalidtoValue}</span>
					</header>
					<ul class="select__list">
						<li class="select__item">
							<span class="select__name" data-title="Ввести дату" data-cardvalidto="date">Ввести дату</span>
						</li>
						<li class="select__item">
							<span class="select__name" data-title="Безвременно" data-cardvalidto="infinite">Безвременно</span>
						</li>
					</ul>
				</div>
			</div>
			${cardvalidtoView}
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
					<span class="form__title form__title--page">Загрузить фото</span>
				</label>
			</div>
		</div>
	`;
}

function templateAddHeaderTable() {
	const cardvalidtoView = addObject.statuscardvalidto ? `
		<div class="table__cell table__cell--header table__cell--cardvalidto">
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
		${cardvalidtoView}
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

function renderForm(obj, action, nameForm = '#addForm') {
	$(`${nameForm} .form__wrap`).html('');

	if (action === 'edit') {
		addCollection.forEach((user, i) => {
			if (user.id === obj) {
				$(`${nameForm} .form__wrap`).append(templateAddForm(user));
				addCollection.delete(i);
			}
		});
	} else {
		$(`${nameForm} .form__wrap`).append(templateAddForm(addObject));
	}
}

function renderHeaderTable(page = 'add') {
	$(`.table--${page} .table__header`).html('');
	$(`.table--${page} .table__header`).append(templateAddHeaderTable());
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

				if (typeSelect === 'cardvalidto') {
					if (nameId === 'date') {
						const inputValue = $(e.target).parents('.form').find('.form__item--cardvalidto').val();

						object.cardvalidto = inputValue;
					}

					object.cardvalidtoid = nameId;
					object.cardvalidtotitle = valueItem;
				} else {
					object[fieldType] = nameId;
					object[fieldName] = valueItem;
				}
			} else if ($(item).attr('data-field') === 'photofile') {
				const fieldUrl = $(item).attr('data-url');
				const inputValue = $(item).attr('data-value');

				object.photourl = fieldUrl;
				object[fieldName] = inputValue;
			} else {
				if ($(item).attr('data-field') !== 'date' && $(item).attr('data-field') !== 'photofile') {
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
		cardvalidto: '',
		cardvalidtoid: '',
		cardvalidtotitle: ''
	};
	const itemObject = Object.assign({}, objToCollection);
	const departName = $(`.main__depart--${page}`).attr('data-depart');
	const departID = $(`.main__depart--${page}`).attr('data-id');

	for (const itemField in itemObject) {
		for (const key in object) {
			if (itemField === key) {
				itemObject[itemField] = object[key];
			} else if (itemField === 'id') {
				itemObject[itemField] = counter;
			} else if (itemField === 'department') {
				itemObject[itemField] = departName;
			} else if (itemField === 'nameid') {
				itemObject[itemField] = departID;
			}
		}
	}

	addCollection.set(counter, itemObject);
	counter++;

	setDataInStorage();
	dataAdd(nameTable);
}

function dataAdd(nameTable, page = 'add') {
	if (addCollection.size) {
		emptySign(nameTable, 'full');
	} else {
		emptySign(nameTable, 'empty');

		return;
	}

	$(`.main__count--${page}`).text(addCollection.size);

	showFieldsInHeaderTable();
	renderTable();
	deleteUser();
	editUser();
}

function showDataFromStorage(nameTable = '#tableAdd', page = 'add') {
	const storageCollection = JSON.parse(localStorage.getItem(page));

	if (storageCollection && storageCollection.collection.length && !addCollection.size) {
		const lengthStorage = storageCollection.collection.length;

		counter = storageCollection.collection[lengthStorage - 1].id + 1; // id последнего элемента в localStorage
		storageCollection.collection.forEach((item, i) => {
			const itemID = storageCollection.collection[i].id;

			addCollection.set(itemID, item);
		});

		dataAdd(nameTable);
	}
}

function setDataInStorage(page = 'add') {
	localStorage.setItem(page, JSON.stringify({
		collection: [...addCollection.values()]
	}));
}

function showFieldsInHeaderTable(page = 'add') {
	addObject.statuscardvalidto = [...addCollection.values()].some((cell) => cell.cardvalidtoid === 'date') ? true : false;
	const cardvalidtoMod = addObject.statuscardvalidto ? '-cardvalidto' : '';
	const className = `wrap wrap--content wrap--content-${page}${cardvalidtoMod}`;

	$(`.main[data-name="${page}"]`).find('.wrap--content').attr('class', className);

	renderHeaderTable();
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

	addObject.fio = fio ? fio : addObject.fio;
	addObject.post = post ? post : addObject.post;
	addObject.photofile = photofile ? photofile : addObject.photofile;
	addObject.photourl = photourl ? photourl : addObject.photourl;

	if (select === 'type') {
		addObject.statusid = statusid;
		addObject.statustitle = title;
	} else {
		addObject.cardvalidtoid = statusid;
		addObject.cardvalidtotitle = title;
		addObject.cardvalidto = statusid === 'date' ? addObject.cardvalidto : '';
		addObject.statuscardvalidto = statusid === 'date' ? true : false;
	}

	renderForm(addObject, 'clear');
	toggleSelect();
	datepicker();
	downloadFoto();
	memberInputField();
}

function clearFieldsForm() {
	addObject.id = '';
	addObject.fio = '';
	addObject.statusid = '';
	addObject.statustitle = '';
	addObject.post = '';
	addObject.photourl = '';
	addObject.photofile = '';
	addObject.statuscardvalidto = '';
	addObject.cardvalidtotitle = '';
	addObject.cardvalidto = '';

	renderForm(addObject, 'clear');
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

function datepicker() {
	$("#addDatepicker").datepicker({
		changeMonth: true,
		changeYear: true,
		showOtherMonths: true,
		selectOtherMonths: true,
		minDate: "+1D",
		maxViewMode: 10
	});

	$('#addDatepicker').change((e) => {
		const cardvalidtoValue = $(e.currentTarget).val();

		addObject.cardvalidto = cardvalidtoValue;
	});
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

	$(`.main[data-name=${page}]`).find('.info__item--warn.info__item--fields')[statusMess]();
	$(`.main[data-name=${page}]`).find('.info__item--error.info__item--name')[correctName]();
	$(`.main[data-name=${page}]`).find('.info__item--error.info__item--short')[countNameWords]();
	$(`.main[data-name=${page}]`).find('.info__item--error.info__item--image')[extensionImg]();

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

			setDataInStorage();
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
			let fillFields;

			for (let key in addObject) {
				if (key !== 'statuscardvalidto') {
					fillFields = addObject[key] ? false : true;
				}
			}

			if (fillFields) {
				addCollection.forEach((item) => {
					if (item.id === idEdit) {
						for (let key in addObject) {
							addObject[key] = item[key];
						}
					}
				});

				showFieldsInHeaderTable();
				renderForm(idEdit, 'edit');
				renderTable();
				toggleSelect();
				datepicker();
				downloadFoto();

				$(`.main__count--${page}`).text(addCollection.size);
			}
		}
	});
}

function submitIDinBD(nameTable = '#tableAdd', page = 'add') {
	$('#submitAddUser').click(() => {
		if (!addCollection.size) return;

		const idDepart = $(`.main__depart--${page}`).attr('data-id');
		const nameDepart = $(`.main__depart--${page}`).attr('data-depart');

		addCollection.forEach((elem) => {
			elem.nameid = idDepart;
			elem.department = nameDepart;
			elem.date = service.getCurrentDate();
		});

		setAddUsersInDB([...addCollection.values()], 'add' , 'add');

		addCollection.clear();
		emptySign(nameTable, 'empty');
		renderTable();

		$(`.main__count--${page}`).text(addCollection.size);
		localStorage.removeItem(page);
		counter = 0;
	});
}

function setAddUsersInDB(array, nameTable, action, page = 'add') {
	const nameDepart = $(`.main__depart--${page}`).attr('data-depart');

	$.ajax({
		url: "./php/change-user-request.php",
		method: "post",
		dataType: "html",
		async: false,
		data: {
			action: action,
			nameTable: nameTable,
			array: array
		},
		success: () => {
			service.modal('success');

			sendMail({
				department: nameDepart,
				count: addCollection.size,
				title: 'Добавлено',
				users: [...addCollection.values()]
			});
		},
		error: () => {
			service.modal('error');
		}
	});
}

function sendMail(obj) {
	const sender = 'chepdepart@gmail.com';
	const recipient = 'xahah55057@secbuf.com';
	const subject = 'Пользователи успешно добавлены в БД';

	$.ajax({
		url: "./php/mail.php",
		method: "post",
		dataType: "html",
		async: false,
		data: {
			sender: sender,
			recipient: recipient,
			subject: subject,
			message: messageMail(obj)
		},
		success: () => {
			console.log('Email send is success');
		},
		error: () => {
			service.modal('email');
		}
	});
}

export default {
};
