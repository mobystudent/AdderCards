'use strict';

import $ from 'jquery';
import service from './service.js';
import messageMail from './mail.js';
import settingsObject from './settings.js';
import renderheader from './parts/renderheader.js';

const editCollection = new Map();
const editObject = {
	id: '',
	fio: '',
	post: '',
	photofile: '',
	statusid: '',
	statustitle: '',
	newfio: '',
	newpost: '',
	newphotofile: '',
	newphotourl: '',
	newphotoname: '',
	statusnewfio: '',
	statusnewpost: '',
	statusnewphotofile: ''
};
let counter = 0;

$(window).on('load', () => {
	const options = {
		page: 'edit',
		header: {
			longname: settingsObject.longname,
			nameid: settingsObject.nameid
		}
	};

	renderheader.renderHeaderPage(options);
	submitIDinBD();
	toggleSelect();
	getAddUsersInDB();
	addUser();
	showDataFromStorage();
});

function templateEditTable(data) {
	const { id = '', fio = '', post = '', statustitle = '', newfio = '', newpost = '', newphotoname = '' } = data;
	const newfioView = editObject.statusnewfio ? `
		<div class="table__cell table__cell--body table__cell--fio">
			<span class="table__text table__text--body">${newfio}</span>
		</div>
	` : '';
	const newpostView = editObject.statusnewpost ? `
		<div class="table__cell table__cell--body table__cell--post">
			<span class="table__text table__text--body">${newpost}</span>
		</div>
	` : '';
	const newphotofileView = editObject.statusnewphotofile ? `
		<div class="table__cell table__cell--body table__cell--photoname">
			<span class="table__text table__text--body">${newphotoname}</span>
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
			<div class="table__cell table__cell--body table__cell--statustitle">
				<span class="table__text table__text--body">${statustitle}</span>
			</div>
			${newfioView}
			${newpostView}
			${newphotofileView}
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

function templateEditForm() {
	const { fio = '', statusid = '', newpost = '', newfio = '', statustitle = '', photofile = '', newphotourl = '' } = editObject;
	const fioValue = fio ? fio : 'Выберите пользователя';
	const fioClassView = fio ? 'select__value--selected-form' : '';
	const changeValue = statustitle ? statustitle : 'Выберите тип изменения';
	const changeClassView = statustitle ? 'select__value--selected-form' : '';
	const fioView = statusid === 'changeFIO' ? `
		<div class="form__field" data-name="newfio">
			<label class="form__label">
				<span class="form__name form__name--form">Новое ФИО</span>
				<input class="form__input form__input--form form__item" name="newfio" type="text" value="${newfio}" placeholder="Введите новое ФИО" required="required"/>
			</label>
		</div>
	` : '';
	const postView = statusid === 'changePost' ? `
		<div class="form__field" data-name="newpost">
			<label class="form__label">
				<span class="form__name form__name--form">Новая должность</span>
				<input class="form__input form__input--form form__item" name="newpost" type="text" value="${newpost}" placeholder="Введите новую должность" required/>
			</label>
		</div>
	` : '';
	const imageView = statusid === 'changeImage' ? `
		<div class="form__field" data-name="newimage">
			<input class="form__input form__input--file form__item" id="editFile" name="photofile" type="file" required="required"/>
			<label class="form__download" for="editFile">
				<svg class="icon icon--download">
					<use xlink:href="./images/sprite.svg#download"></use>
				</svg>
				<span class="form__title form__title--page">Загрузить фото</span>
			</label>
		</div>
	` : '';
	let photoUrl;

	if (photofile && !newphotourl) {
		photoUrl = photofile;
	} else if (newphotourl) {
		photoUrl = newphotourl;
	} else {
		photoUrl = './images/avatar.svg';
	}

	return `
		<div class="form__fields">
			<div class="form__field">
				<span class="form__name form__name--form">Пользователь</span>
				<div class="form__select form__item select select--form" data-select="fio">
					<header class="select__header select__header--form">
						<span class="select__value select__value--form ${fioClassView}" data-title="${fioValue}" data-fio="fio">${fioValue}</span>
					</header>
					<ul class="select__list select__list--form"></ul>
				</div>
			</div>
			<div class="form__field">
				<span class="form__name form__name--form">Тип изменения</span>
				<div class="form__select form__item select select--form" data-type="statusid" data-select="change">
					<header class="select__header select__header--form">
						<span class="select__value select__value--form ${changeClassView}" data-title="${changeValue}" data-change="${statusid}">${changeValue}</span>
					</header>
					<ul class="select__list select__list--form">
						<li class="select__item">
							<span class="select__name select__name--form" data-title="Утеря пластиковой карты" data-change="changeCard">Утеря пластиковой карты</span>
						</li>
						<li class="select__item">
							<span class="select__name select__name--form" data-title="Утеря QR-кода" data-change="changeQR">Утеря QR-кода</span>
						</li>
						<li class="select__item">
							<span class="select__name select__name--form" data-title="Изменение ФИО" data-change="changeFIO">Изменение ФИО</span>
						</li>
						<li class="select__item">
							<span class="select__name select__name--form" data-title="Изменение должности" data-change="changePost">Изменение должности</span>
						</li>
						<li class="select__item">
							<span class="select__name select__name--form" data-title="Изменение фото" data-change="changeImage">Изменение фото</span>
						</li>
					</ul>
				</div>
			</div>
			${postView}
			${fioView}
		</div>
		<div class="form__aside">
			<div class="form__img">
				<img class="img img--form img--form-edit" src="${photoUrl}" alt="user avatar"/>
			</div>
			${imageView}
		</div>
	`;
}

function templateEditHeaderTable() {
	const newfioView = editObject.statusnewfio ? `
		<div class="table__cell table__cell--header table__cell--fio">
			<span class="table__text table__text--header">Новое Фамилия Имя Отчество</span>
			<button class="btn btn--sort" type="button" data-direction="true"></button>
		</div>
	` : '';
	const newpostView = editObject.statusnewpost ? `
		<div class="table__cell table__cell--header table__cell--post">
			<span class="table__text table__text--header">Новая должность</span>
		</div>
	` : '';
	const newphotofileView = editObject.statusnewphotofile ? `
		<div class="table__cell table__cell--header table__cell--photoname">
			<span class="table__text table__text--header">Новая фотография</span>
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
		<div class="table__cell table__cell--header table__cell--statustitle">
			<span class="table__text table__text--header">Тип изменения</span>
		</div>
		${newfioView}
		${newpostView}
		${newphotofileView}
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

function renderTable(nameTable = '#tableEdit') {
	$(`${nameTable} .table__content`).html('');

	editCollection.forEach((item) => {
		$(`${nameTable} .table__content`).append(templateEditTable(item));
	});
}

function renderForm(nameForm = '#editForm') {
	$(`${nameForm} .form__wrap`).html('');
	$(`${nameForm} .form__wrap`).append(templateEditForm());

	toggleSelect();
	getAddUsersInDB();
	downloadFoto();
	memberInputField();
}

function renderHeaderTable(page = 'edit') {
	$(`.table--${page} .table__header`).html('');
	$(`.table--${page} .table__header`).append(templateEditHeaderTable());
}

function addUser(page = 'edit') {
	$('#editUser').click(() => {
		if (editObject.statusid !== 'changeFIO') {
			delete editObject.newfio;
		}
		if (editObject.statusid !== 'changePost') {
			delete editObject.newpost;
		}
		if (editObject.statusid !== 'changeImage') {
			delete editObject.newphotoname;
			delete editObject.newphotourl;
			delete editObject.newphotofile;
		}

		delete editObject.statusnewfio;
		delete editObject.statusnewpost;
		delete editObject.statusnewphotofile;

		const validFields = Object.values(editObject).every((item) => item);
		const statusMess = !validFields ? 'show' : 'hide';
		let correctName = 'hide';
		let correctPost = 'hide';
		let countNameWords = 'hide';

		for (let key in editObject) {
			if (key === 'newfio' && editObject[key]) {
				const countWords = editObject[key].trim().split(' ');

				correctName = editObject[key].match(/[^а-яА-ЯiIъїЁё.'-\s]/g) ? 'show' : 'hide';
				countNameWords = countWords.length < 2 ? 'show' : 'hide';
			} else if (key === 'newpost' && editObject[key]) {
				correctPost = editObject[key].match(/[^а-яА-ЯiIъїЁё0-9.'-\s]/g) ? 'show' : 'hide';
			}
		}

		const valid = [statusMess, correctName, countNameWords, correctPost].every((mess) => mess === 'hide');

		$(`.main[data-name=${page}]`).find('.info__item--warn.info__item--fields')[statusMess]();
		$(`.main[data-name=${page}]`).find('.info__item--error.info__item--name')[correctName]();
		$(`.main[data-name=${page}]`).find('.info__item--error.info__item--post')[correctPost]();
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
		photofile: '',
		statustitle: '',
		statusid: '',
		newpost: '',
		newfio: '',
		newphotofile: '',
		newphotourl: '',
		newphotoname: ''
	};
	const itemObject = {...objToCollection};

	for (const itemField in itemObject) {
		for (const key in editObject) {
			if (itemField === key) {
				itemObject[itemField] = editObject[key];
			}
		}
	}

	editCollection.set(counter, itemObject);
	counter++;

	setDataInStorage();
	dataAdd();
}

function dataAdd() {
	if (editCollection.size) {
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

function showDataFromStorage(page = 'edit') {
	const storageCollection = JSON.parse(localStorage.getItem(page));

	if (storageCollection && storageCollection.collection.length && !editCollection.size) {
		const lengthStorage = storageCollection.collection.length;
		counter = storageCollection.collection[lengthStorage - 1].id + 1; // id последнего элемента в localStorage

		storageCollection.collection.forEach((item, i) => {
			const itemID = storageCollection.collection[i].id;

			editCollection.set(itemID, item);
		});

		dataAdd();
	}
}

function setDataInStorage(page = 'edit') {
	new Promise((resolve) => {
		const encodeArrayPhotoFile = [];
		const reader = new FileReader();

		editCollection.forEach((user) => {
			if (typeof user.newphotofile === 'object' && user.statusid === 'changeImage') {
				reader.onload = ({ currentTarget }) => {
					user.newphotofile = currentTarget.result;

					encodeArrayPhotoFile.push(user);
				};
				reader.readAsDataURL(user.newphotofile);
			} else {
				encodeArrayPhotoFile.push(user);
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

function showFieldsInHeaderTable(page = 'edit') {
	editObject.statusnewfio = [...editCollection.values()].some(({ newfio }) => newfio);
	editObject.statusnewpost = [...editCollection.values()].some(({ newpost }) => newpost);
	editObject.statusnewphotofile = [...editCollection.values()].some(({ newphotofile }) => newphotofile);
	const newfioMod = editObject.statusnewfio ? '-newfio' : '';
	const newpostMod = editObject.statusnewpost ? '-newpost' : '';
	const photofileMod = editObject.statusnewphotofile ? '-photofile' : '';
	const className = `wrap wrap--content wrap--content-${page}${newfioMod}${newpostMod}${photofileMod}`;

	$(`.main[data-name="${page}"]`).find('.wrap--content').attr('class', className);

	renderHeaderTable();
}

function setUsersInSelect(users, nameForm = '#editForm') {
	$(`${nameForm} .select[data-select="fio"]`).find('.select__list').html('');

	if (editCollection.size) {
		editCollection.forEach((elem) => {
			users = users.filter(({ id }) => elem.id !== id);
		});
	}

	users.forEach(({ id = '', fio = '' }) => {
		$(`${nameForm} .select[data-select="fio"]`).find('.select__list').append(`
			<li class="select__item">
				<span class="select__name" data-title="${fio}" data-id="${id}">
					${fio}
				</span>
			</li>
		`);
	});

	clickSelectItem();
}

function toggleSelect(nameForm = '#editForm') {
	$(`${nameForm} .select__header`).click(({ currentTarget }) => {
		$(currentTarget).next().slideToggle().toggleClass('select__header--active');
	});
}

function clickSelectItem(nameForm = '#editForm') {
	$(`${nameForm} .select__item`).click(({ currentTarget }) => {
		const title = $(currentTarget).find('.select__name').data('title');
		const id = $(currentTarget).find('.select__name').data('id');
		const select = $(currentTarget).parents('.select').data('select');
		const statusid = $(currentTarget).find('.select__name').data(select);

		if (select === 'fio') {
			getAddUsersInDB(id); // вывести должность в скрытое поле
		}

		setDataAttrSelectedItem(title, select, statusid);
	});
}

function setDataAttrSelectedItem(title, select, statusid) {
	if (select === 'fio') {
		editObject.fio = title;
		editObject.statustitle = '';
		editObject.statusid = '';
		editObject.newfio = '';
		editObject.newpost = '';
		editObject.newphotofile = '';
		editObject.newphotourl = '';
		editObject.newphotoname = '';
	} else if (select === 'change') {
		editObject.statustitle = title;
		editObject.statusid = statusid;

		if (statusid !== 'changeFIO') {
			editObject.newfio = '';
		}
		if (statusid !== "changePost") {
			editObject.newpost = '';
		}
		if (statusid !== "changeImage") {
			editObject.newphotofile = '';
			editObject.newphotourl = '';
			editObject.newphotoname = '';
		}
	}

	renderForm();
}

function clearFieldsForm() {
	for (const key in editObject) {
		editObject[key] = '';
	}

	renderForm();
}

function memberInputField() {
	$('.form__input').keyup(({ currentTarget }) => {
		const nameField = $(currentTarget).attr('name');
		const fieldValue = $(currentTarget).val();

		editObject[nameField] = fieldValue ? fieldValue : '';
	});
}

function emptySign(status, nameTable = '#tableEdit') {
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

function downloadFoto(nameForm = '#editForm', page = 'edit') {
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

		editObject.newphotourl = url;
		editObject.newphotofile = file;
		editObject.newphotoname = photoName;

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

function deleteUser(nameTable = '#tableEdit', page = 'edit') {
	$(`${nameTable} .table__content`).click(({ target }) => {
		if ($(target).parents('.table__btn--delete').length || $(target).hasClass('table__btn--delete')) {
			const userID = $(target).closest('.table__row').data('id');

			[...editCollection].forEach(([ key, { id } ]) => {
				if (userID === +id) {
					editCollection.delete(key);
				}
			});

			setDataInStorage();
			showFieldsInHeaderTable();
			renderTable();
			viewAllCount();

			if (!editCollection.size) {
				emptySign('empty');
				localStorage.removeItem(page);
			}
		}
	});
}

function editUser(nameTable = '#tableEdit') {
	$(`${nameTable} .table__content`).click(({ target }) => {
		if ($(target).parents('.table__btn--edit').length || $(target).hasClass('table__btn--edit')) {
			const userID = $(target).closest('.table__row').data('id');

			[...editCollection].forEach(([ keyCollection, item ]) => {
				if (userID === +item.id) {
					for (let key in item) {
						editObject[key] = item[key];
					}

					editCollection.delete(keyCollection);
				}
			});

			renderForm();
			showFieldsInHeaderTable();
			renderTable();
			viewAllCount();
		}
	});
}

function submitIDinBD(page = 'edit') {
	$('#submitEditUser').click(() => {
		if (!editCollection.size) return;

		editCollection.forEach((elem) => {
			elem.nameid = settingsObject.nameid;
			elem.date = service.getCurrentDate();
		});

		const changeCardArray = [...editCollection.values()].filter(({ statusid }) => statusid === 'changeCard');
		const changeQRArray = [...editCollection.values()].filter(({ statusid }) => statusid === 'changeQR');
		const changeFIOArray = [...editCollection.values()].filter(({ statusid }) => statusid === 'changeFIO');
		const changePostArray = [...editCollection.values()].filter(({ statusid }) => statusid === 'changePost');
		const changeImageArray = [...editCollection.values()].filter(({ statusid }) => statusid === 'changeImage');

		if (changeCardArray.length) {
			setAddUsersInDB(changeCardArray, 'permission', page);
		}
		if (changeQRArray.length) {
			setAddUsersInDB(changeQRArray, 'permission', page);
		}
		if (changeFIOArray.length) {
			setAddUsersInDB(changeFIOArray, 'add', page);
		}
		if (changePostArray.length) {
			setAddUsersInDB(changePostArray, 'add', page);
		}
		if (changeImageArray.length) {
			setAddUsersInDB(changeImageArray, 'add', page);
		}

		editCollection.clear();
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
			if (typeof user.newphotofile === 'object' && user.statusid === 'changeImage') {
				reader.onload = ({ currentTarget }) => {
					user.newphotofile = currentTarget.result;

					encodeArrayPhotoFile.push(user);
					console.log(encodeArrayPhotoFile);
				};
				reader.readAsDataURL(user.newphotofile);
			} else {
				encodeArrayPhotoFile.push(user);
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
					count: editCollection.size,
					title: 'Редактировать',
					users: [...editCollection.values()]
				});
			},
			error: () => {
				service.modal('error');
			}
		});
	});
}

function getAddUsersInDB(id = '') {
	$.ajax({
		url: "./php/output-request.php",
		method: "post",
		dataType: "html",
		data: {
			id,
			idDepart: settingsObject.nameid,
			nameTable: 'edit'
		},
		success: (data) => {
			if (id) {
				const { id = '', post  = '', photofile  = '' } = JSON.parse(data);

				editObject.post = post;
				editObject.id = id;
				editObject.photofile = photofile;

				renderForm();
			} else {
				setUsersInSelect(JSON.parse(data));
			}
		},
		error: () => {
			service.modal('download');
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
function viewAllCount(page = 'edit') {
	$(`.main__count--all-${page}`).text(editCollection.size);
}

export default {
};
