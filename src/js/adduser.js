'use strict';

import $ from 'jquery';
import datepickerFactory from 'jquery-datepicker';
import datepickerRUFactory from 'jquery-datepicker/i18n/jquery.ui.datepicker-ru';
import service from './service.js';
import messageMail from './mail.js';
import settingsObject from './settings.js';

datepickerFactory($);
datepickerRUFactory($);

const addCollection = new Map();
const addObject = {
	fio: '',
	post: '',
	photofile: {},
	photourl: '',
	photoname: '',
	statusid: '',
	statustitle: '',
	cardvalidto: '',
	cardvalidtoid: '',
	cardvalidtotitle: '',
	statuscardvalidto: ''
};
let counter = 0;

$(window).on('load', () => {
	submitIDinBD(); // 1
	renderHeaderPage(); // 1
	toggleSelect(); // 1
	downloadFoto(); // 1
	memberInputField(); // 1
	addUser(); // 2 без загрузки фото и загрузки селектов не пройдет валидация в addUser
	showDataFromStorage(); // 1
});

function templateAddTable(data) {
	const { id = '', fio = '', post = '', photoname = '', statustitle = '', cardvalidto = '' } = data;
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
			<div class="table__cell table__cell--body table__cell--photoname">
				<span class="table__text table__text--body">${photoname}</span>
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

function templateAddForm() {
	const { fio = '', photourl = '', post = '', statusid = '', statustitle = '', cardvalidtotitle = '', cardvalidtoid = '', cardvalidto = '' } = addObject;
	const typeValue = statustitle ? statustitle : 'Выберите тип идентификатора';
	const typeClassView = statustitle ? 'select__value--selected-form' : '';
	const cardvalidtoValue = cardvalidtotitle ? cardvalidtotitle : 'Выберите окончание действия пропуска';
	const cardvalidtoClassView = cardvalidtotitle ? 'select__value--selected-form' : '';
	const photoValue = photourl ? photourl : './images/avatar.svg';
	const cardvalidtoView = cardvalidtoid === 'date' ? `
		<div class="form__field">
			<label class="form__label"><span class="form__name form__name--form">Дата окончания</span>
				<input class="form__input form__input--form form__item" id="addDatepicker" data-field="date" name="date" type="text" value="${cardvalidto}" placeholder="Введите дату" required="required"/>
			</label>
		</div>
	` : '';

	return `
		<div class="form__fields">
			<div class="form__field">
				<label class="form__label">
				<span class="form__name form__name--form">Фамилия Имя Отчество</span>
					<input class="form__input form__input--form form__item form__item--fio" data-field="fio" name="name" type="text" value="${fio}" placeholder="Введите ФИО" required="required"/>
				</label>
			</div>
			<div class="form__field">
				<label class="form__label">
				<span class="form__name form__name--form">Должность</span>
					<input class="form__input form__input--form form__item form__item--post" data-field="post" name="post" type="text" value="${post}" placeholder="Введите должность" required="required"/>
				</label>
			</div>
			<div class="form__field">
				<span class="form__name form__name--form">Тип идентификатора</span>
				<div class="form__select form__item select select--form" data-field="statustitle" data-type="statusid" data-select="type">
					<header class="select__header select__header--form">
						<span class="select__value select__value--form ${typeClassView}" data-title="${typeValue}" data-type="${statusid}">${typeValue}</span>
					</header>
					<ul class="select__list select__list--form">
						<li class="select__item">
							<span class="select__name select__name--form" data-title="Новая карта" data-type="newCard">Новая карта</span>
						</li>
						<li class="select__item">
							<span class="select__name select__name--form" data-title="Новый QR-код" data-type="newQR">Новый QR-код</span>
						</li>
					</ul>
				</div>
			</div>
			<div class="form__field">
				<span class="form__name form__name--form">Окончание действия пропуска</span>
				<div class="form__select form__item select select--form" data-field="cardvalidtotitle" data-type="statuscardvalidto" data-select="cardvalidto">
					<header class="select__header select__header--form">
						<span class="select__value select__value--form ${cardvalidtoClassView}" data-title="${cardvalidtoValue}" data-cardvalidto="${cardvalidtoid}">${cardvalidtoValue}</span>
					</header>
					<ul class="select__list select__list--form">
						<li class="select__item">
							<span class="select__name select__name--form" data-title="Ввести дату" data-cardvalidto="date">Ввести дату</span>
						</li>
						<li class="select__item">
							<span class="select__name select__name--form" data-title="Безвременно" data-cardvalidto="infinite">Безвременно</span>
						</li>
					</ul>
				</div>
			</div>
			${cardvalidtoView}
		</div>
		<div class="form__aside">
			<div class="form__img">
				<img class="img img--form" src="${photoValue}" alt="user avatar"/>
			</div>
			<div class="form__field">
				<input class="form__input form__input--file form__item" id="addFile" name="photofile" type="file" required="required"/>
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
		<div class="table__cell table__cell--header table__cell--photoname">
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

function templateHeaderPage(page = 'add') {
	const { nameid = '', longname = '' } = settingsObject;

	return `
		<h1 class="main__title">Добавить нового пользователя</h1>
		<span class="main__depart main__depart--${page}" data-depart="${longname}" data-id="${nameid}">${longname}</span>
	`;
}

function renderTable(nameTable = '#tableAdd') {
	$(`${nameTable} .table__content`).html('');

	addCollection.forEach((item) => {
		$(`${nameTable} .table__content`).append(templateAddTable(item));
	});
}

function renderForm(nameForm = '#addForm') {
	$(`${nameForm} .form__wrap`).html('');
	$(`${nameForm} .form__wrap`).append(templateAddForm());

	toggleSelect();
	datepicker();
	downloadFoto();
	memberInputField();
}

function renderHeaderTable(page = 'add') {
	$(`.table--${page} .table__header`).html('');
	$(`.table--${page} .table__header`).append(templateAddHeaderTable());
}

function renderHeaderPage(page = 'add') {
	$(`.main[data-name=${page}] .main__title-wrap`).html('');
	$(`.main[data-name=${page}] .main__title-wrap`).append(templateHeaderPage());
}

function addUser(page = 'add') {
	$('#addUser').click(() => {
		if (addObject.cardvalidtoid !== 'date') {
			delete addObject.cardvalidto;
		}

		delete addObject.statuscardvalidto;

		const validFields = Object.values(addObject).every((item) => item);
		const statusMess = !validFields ? 'show' : 'hide';
		let correctName = 'hide';
		let countNameWords = 'hide';

		for (let key in addObject) {
			if (key === 'fio' && addObject[key]) {
				const countWords = addObject[key].trim().split(' ');

				correctName = addObject[key].match(/[^а-яА-ЯiIъїЁё.'-\s]/g) ? 'show' : 'hide';
				countNameWords = (countWords.length < 2) ? 'show' : 'hide';
			}
		}

		const valid = [statusMess, correctName, countNameWords].every((mess) => mess === 'hide');

		$(`.main[data-name=${page}]`).find('.info__item--warn.info__item--fields')[statusMess]();
		$(`.main[data-name=${page}]`).find('.info__item--error.info__item--name')[correctName]();
		$(`.main[data-name=${page}]`).find('.info__item--error.info__item--short')[countNameWords]();


		if (valid) {
			userFromForm();
			clearFieldsForm();
		}
	});
}

function userFromForm() {
	const objToCollection = {
		id: '',
		fio: '',
		post: '',
		photofile: {},
		photourl: '',
		photoname: '',
		statusid: '',
		statustitle: '',
		cardvalidto: '',
		cardvalidtoid: '',
		cardvalidtotitle: ''
	};
	const itemObject = {...objToCollection};

	for (const itemField in itemObject) {
		for (const key in addObject) {
			if (itemField === key) {
				itemObject[itemField] = addObject[key];
			} else if (itemField === 'id') {
				itemObject[itemField] = counter;
			}
		}
	}

	addCollection.set(counter, itemObject);
	counter++;

	setDataInStorage();
	dataAdd();
}

function dataAdd() {
	if (addCollection.size) {
		emptySign('full');
	} else {
		emptySign('empty');

		return;
	}

	viewAllCount();
	showFieldsInHeaderTable();
	renderTable();
	deleteUser();
	editUser();
}

function showDataFromStorage(page = 'add') {
	const storageCollection = JSON.parse(localStorage.getItem(page));

	if (storageCollection && storageCollection.collection.length && !addCollection.size) {
		const lengthStorage = storageCollection.collection.length;
		counter = storageCollection.collection[lengthStorage - 1].id + 1; // id последнего элемента в localStorage

		storageCollection.collection.forEach((item, i) => {
			const itemID = storageCollection.collection[i].id;

			addCollection.set(itemID, item);
		});

		dataAdd();
	}
}

function setDataInStorage(page = 'add') {
	new Promise((resolve) => {
		const encodeArrayPhotoFile = [];
		const reader = new FileReader();

		addCollection.forEach((user) => {
			if (typeof user.photofile === 'object') {
				reader.onload = () => {
					user.photofile = reader.result;

					encodeArrayPhotoFile.push(user);
				};
				reader.readAsDataURL(user.photofile);
			} else {
				setTimeout(() => {
					encodeArrayPhotoFile.push(user);
				}, 0);
			}
		});
		setTimeout(() => {
			resolve(encodeArrayPhotoFile);
		}, 0);
	}).then((array) => {
		setTimeout(() => {
			localStorage.setItem(page, JSON.stringify({
				collection: array
			}));
		}, 0);
	});
}

function showFieldsInHeaderTable(page = 'add') {
	addObject.statuscardvalidto = [...addCollection.values()].some(({ cardvalidtoid }) => cardvalidtoid === 'date');
	const cardvalidtoMod = addObject.statuscardvalidto ? '-cardvalidto' : '';
	const className = `wrap wrap--content wrap--content-${page}${cardvalidtoMod}`;

	$(`.main[data-name="${page}"]`).find('.wrap--content').attr('class', className);

	renderHeaderTable();
}

function toggleSelect(nameForm = '#addForm') {
	$(`${nameForm} .select__header`).click(({ currentTarget }) => {
		$(currentTarget).next().slideToggle().toggleClass('select__header--active');
	});

	clickSelectItem();
}

function clickSelectItem(nameForm = '#addForm') {
	$(`${nameForm} .select__item`).click(({ currentTarget }) => {
		const title = $(currentTarget).find('.select__name').data('title');
		const select = $(currentTarget).parents('.select').data('select');

		setDataAttrSelectedItem(title, select, currentTarget);
	});
}

function setDataAttrSelectedItem(title, select, elem, nameForm = '#addForm') {
	const statusid = $(elem).find('.select__name').data(select);
	const fio = $(`${nameForm} .form__item--fio`).val();
	const post = $(`${nameForm} .form__item--post`).val();

	addObject.fio = fio ? fio : addObject.fio;
	addObject.post = post ? post : addObject.post;

	if (select === 'type') {
		addObject.statusid = statusid;
		addObject.statustitle = title;
	} else {
		addObject.cardvalidtoid = statusid;
		addObject.cardvalidtotitle = title;
		addObject.cardvalidto = statusid === 'date' ? addObject.cardvalidto : '';
		addObject.statuscardvalidto = statusid === 'date' ? true : false;
	}

	renderForm();
}

function clearFieldsForm() {
	for (const key in addObject) {
		addObject[key] = '';
	}

	renderForm();
}

function memberInputField() {
	$('.form__input').keyup(({ currentTarget }) => {
		const nameField = $(currentTarget).data('field');
		const fieldValue = $(currentTarget).val();

		addObject[nameField] = fieldValue ? fieldValue : addObject[nameField];
	});
}

function emptySign(status, nameTable = '#tableAdd') {
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

	$('#addDatepicker').change(({ currentTarget }) => {
		const cardvalidtoValue = $(currentTarget).val();

		addObject.cardvalidto = cardvalidtoValue;
	});
}

function downloadFoto(nameForm = '#addForm', page = 'add') {
	$(`${nameForm} .form__input--file`).change(({ target }) => {
		const fileNameUrl = $(target).val();
		const indexLastSlash = fileNameUrl.lastIndexOf('\\');
		const photoName = fileNameUrl.slice(indexLastSlash + 1);
		const file = target.files[0];
		const url = URL.createObjectURL(file);
		const validPhotoName = validPhotoExtention(photoName);

		if (!validPhotoName) {
			$(`.main[data-name=${page}]`).find('.info__item--error.info__item--image').show();

			return;
		}

		$(`${nameForm} .img--form`).attr('src', url);

		addObject.photourl = url;
		addObject.photofile = file;
		addObject.photoname = photoName;

		renderForm();
	});
}

function validPhotoExtention(photoName) {
	const extenName = photoName.lastIndexOf('.');
	const extenImg = photoName.slice(extenName + 1);
	const extentionArray = ['gif', 'png', 'jpg', 'jpeg'];
	const validPhotoName = extentionArray.some((item) => item == extenImg) ? photoName : false;

	return validPhotoName;
}

function deleteUser(nameTable = '#tableAdd', page = 'add') {
	$(`${nameTable} .table__content`).click(({ target }) => {
		if ($(target).parents('.table__btn--delete').length || $(target).hasClass('table__btn--delete')) {
			const userID = $(target).closest('.table__row').data('id');

			addCollection.forEach(({ id }) => {
				if (userID === id) {
					addCollection.delete(userID);
				}
			});

			setDataInStorage();
			showFieldsInHeaderTable();
			renderTable();
			viewAllCount();

			if (!addCollection.size) {
				emptySign('empty');
				localStorage.removeItem(page);
			}
		}
	});
}

function editUser(nameTable = '#tableAdd') {
	$(`${nameTable} .table__content`).click(({ target }) => {
		if ($(target).parents('.table__btn--edit').length || $(target).hasClass('table__btn--edit')) {
			const userID = $(target).closest('.table__row').data('id');

			addCollection.forEach((item) => {
				if (userID === item.id) {
					for (let key in item) {
						if (key !== 'id') {
							addObject[key] = item[key];
						}
					}

					addCollection.delete(userID);
				}
			});

			renderForm(); // 1
			showFieldsInHeaderTable(); // 2
			renderTable();
			viewAllCount();

			if (!addCollection.size) {
				emptySign('empty');
			}
		}
	});
}

function submitIDinBD(page = 'add') {
	$('#submitAddUser').click(() => {
		if (!addCollection.size) return;

		addCollection.forEach((user) => {
			user.nameid = settingsObject.nameid;
			user.date = service.getCurrentDate();
		});

		console.log(addCollection);

		setAddUsersInDB([...addCollection.values()], 'add' , 'add');

		addCollection.clear();
		emptySign('empty');
		renderTable();
		viewAllCount();

		localStorage.removeItem(page);
		counter = 0;
	});
}

function setAddUsersInDB(array, nameTable, action) {
	new Promise((resolve) => {
		const encodeArrayPhotoFile = [];
		const reader = new FileReader();

		array.forEach((user) => {
			if (typeof user.photofile === 'object') {
				reader.onload = () => {
					user.photofile = reader.result;

					encodeArrayPhotoFile.push(user);
				};
				reader.readAsDataURL(user.photofile);
			} else {
				setTimeout(() => {
					encodeArrayPhotoFile.push(user);
				}, 0);
			}
		});

		setTimeout(() => {
			resolve(encodeArrayPhotoFile);
		}, 0);
	}).then((array) => {
		$.ajax({
			url: "./php/change-user-request.php",
			method: "post",
			dataType: "html",
			data: {
				action,
				nameTable,
				array
			},
			success: () => {
				service.modal('success');

				sendMail({
					department: settingsObject.longname,
					count: addCollection.size,
					title: 'Добавлено',
					users: [...addCollection.values()]
				});
			},
			error: () => {
				service.modal('error');
			}
		});
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
			sender,
			recipient,
			subject,
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

// Общие функции с картами и кодами
function viewAllCount(page = 'add') {
	$(`.main__count--all-${page}`).text(addCollection.size);
}

export default {
};
