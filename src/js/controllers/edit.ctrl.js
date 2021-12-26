'use strict';

import $ from 'jquery';
import service from '../service.js';
import messageMail from '../mail.js';
import { settingsObject, sendUsers } from './settings.ctrl.js';

import { table } from '../components/edit/table.tpl.js';
import { form } from '../components/edit/form.tpl.js';
import { count } from '../components/count.tpl.js';
import { headerTable } from '../components/edit/header-table.tpl.js';
import { pageTitle } from '../components/page-title.tpl.js';
import { select } from '../components/select.tpl.js';

const editCollection = new Map();
const editObject = {
	page: 'Редактировать пользователей',
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
	statusnewphotofile: '',
	get nameid() {
		return settingsObject.nameid;
	},
	get longname() {
		return settingsObject.longname;
	}
};
const editCount = {
	item: {
		title: 'Количество редактируемых пользователей:&nbsp',
		get count() {
			return editCollection.size;
		}
	}
};
let counter = 0;

$(window).on('load', () => {
	renderHeaderPage();
	submitIDinBD();
	showDataFromStorage();
});

function renderHeaderPage(page = 'edit') {
	$(`.main[data-name=${page}] .main__title-wrap`).html('');
	$(`.main[data-name=${page}] .container`).prepend(pageTitle(editObject));
}

function renderTable() {
	if (!editCollection.size) {
		return `<p class="table__nothing">Не добавленно ни одного пользователя</p>`;
	} else {
		return [...editCollection.values()].reduce((content, item) => {
			content += table(item, editObject);

			return content;
		}, '');
	}
}

function renderSelect(array) {
	return array.reduce((content, item) => {
		const { title, type, typevalue } = item;

		content += `
			<li class="select__item">
				<span class="select__name select__name--form" data-title="${title}" data-${type}="${typevalue}">${title}</span>
			</li>
		`;

		return content;
	}, '');
}

function renderForm(nameForm = '#editForm') {
	const changeList = [
		{
			title: 'Утеря пластиковой карты',
			type: 'change',
			typevalue: 'changeCard'
		},
		{
			title: 'Утеря QR-кода',
			type: 'change',
			typevalue: 'changeQR'
		},
		{
			title: 'Изменение ФИО',
			type: 'change',
			typevalue: 'changeFIO'
		},
		{
			title: 'Изменение должности',
			type: 'change',
			typevalue: 'changePost'
		},
		{
			title: 'Изменение фото',
			type: 'change',
			typevalue: 'changeImage'
		}
	];
	const selectList = {
		changeList: renderSelect(changeList)
	};

	$(`${nameForm}`).html('');
	$(`${nameForm}`).append(`
		<div class="form__wrap form__wrap--user">${form(editObject, selectList)}</div>
		<div class="main__btns">
			<button class="btn" id="editUser" type="button" data-type="edit-user">Редактировать</button>
		</div>
	`);

	toggleSelect();
	getAddUsersInDB();
	downloadFoto();
	memberInputField();
	addUser();
}

function renderCount() {
	return Object.values(editCount).reduce((content, item) => {
		content += count(item);

		return content;
	}, '');
}

function renderInfo(errors = [], page = 'edit') {
	const info = [
		{
			type: 'warn',
			title: 'fields',
			message: 'Предупреждение! Не все поля заполнены.'
		},
		{
			type: 'error',
			title: 'name',
			message: 'Ошибка! Имя содержит недопустимые символы. Разрешены: кириллические буквы, дефис, точка, апостроф.'
		},
		{
			type: 'error',
			title: 'post',
			message: 'Ошибка! Должность содержит недопустимые символы. Разрешены: кириллические буквы, цифры, дефис, точка, апостроф.'
		},
		{
			type: 'error',
			title: 'image',
			message: 'Ошибка! Не правильный формат изображение. Допустимы: giff, png, jpg, jpeg.'
		},
		{
			type: 'error',
			title: 'short',
			message: 'Ошибка! ФИО должно состоять хотя бы из двух слов.'
		}
	];

	$(`.container--${page} .info`).html('');
	info.forEach((item) => {
		const { type, title, message } = item;

		errors.forEach((error) => {
			if (error === title) {
				$(`.container--${page} .info`).append(`
					<p class="info__item info__item--${type}">${message}</p>
				`);
			}
		});
	});
}


function render(page = 'edit') {
	$(`.container--${page} .wrap--content`).html('');
	$(`.container--${page} .wrap--content`).append(`
		<div class="main__wrap-info">
			<div class="main__cards">${renderCount()}</div>
		</div>
		<div class="wrap wrap--table">
			<div class="table">
				<header class="table__header">${headerTable(editObject)}</header>
				<div class="table__body">${renderTable()}</div>
			</div>
		</div>
	`);

	deleteUser();
	editUser();
}

function addUser() {
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
		const errorsArr = [];

		if (!validFields) errorsArr.push('fields');

		for (let key in editObject) {
			if (key === 'newfio' && editObject[key]) {
				const countWords = editObject[key].trim().split(' ');

				if (editObject[key].match(/[^а-яА-ЯiIъїЁё.'-\s]/g)) errorsArr.push('name');
				if (countWords.length < 2) errorsArr.push('short');
			} else if (key === 'newpost' && editObject[key]) {
				if (editObject[key].match(/[^а-яА-ЯiIъїЁё0-9.'-\s]/g)) errorsArr.push('post');
			}
		}

		if (!errorsArr.length) {
			userFromForm();
			clearFieldsForm();
		} else {
			renderInfo(errorsArr);
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
	const itemObject = { ...objToCollection };

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
	showFieldsInHeaderTable();
	renderForm();
	render();
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
	}

	dataAdd();
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
}

function setUsersInSelect(users, nameForm = '#editForm') {
	$(`${nameForm} .select[data-select="fio"] .select__list`).html('');

	if (editCollection.size) {
		editCollection.forEach((elem) => {
			users = users.filter(({ id }) => elem.id !== id);
		});
	}

	users.forEach(({ id = '', fio = '' }) => {
		const item = {
			value: fio,
			id,
			type: 'form',
			dataid: 'id'
		};

		$(`${nameForm} .select[data-select="fio"] .select__list`).append(select(item));
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
		if (key !== 'nameid' && key !== 'longname' && key !== 'page') {
			editObject[key] = '';
		}
	}

	renderForm();
}

function memberInputField() {
	$('.form__item').keyup(({ currentTarget }) => {
		const nameField = $(currentTarget).attr('name');
		const fieldValue = $(currentTarget).val().trim();

		editObject[nameField] = fieldValue ? fieldValue : '';
	});
}

function downloadFoto(nameForm = '#editForm') {
	$(`${nameForm} .form__item--file`).change(({ target }) => {
		const fileNameUrl = $(target).val();
		const indexLastSlash = fileNameUrl.lastIndexOf('\\');
		const photoName = fileNameUrl.slice(indexLastSlash + 1);
		const file = target.files[0];
		const url = URL.createObjectURL(file);
		const validPhotoName = validPhotoExtention(photoName);

		if (!validPhotoName) {
			renderInfo(['image']);

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

function deleteUser(page = 'edit') {
	$(`.container--${page} .table__body`).click(({ target }) => {
		if ($(target).parents('.table__btn--delete').length || $(target).hasClass('table__btn--delete')) {
			const userID = $(target).closest('.table__row').data('id');

			[...editCollection].forEach(([key, { id }]) => {
				if (userID === +id) {
					editCollection.delete(key);
				}
			});

			setDataInStorage();
			dataAdd();

			if (!editCollection.size) {
				localStorage.removeItem(page);
			}
		}
	});
}

function editUser(page = 'edit') {
	$(`.container--${page} .table__body`).click(({ target }) => {
		if ($(target).parents('.table__btn--edit').length || $(target).hasClass('table__btn--edit')) {
			const userID = $(target).closest('.table__row').data('id');

			[...editCollection].forEach(([keyCollection, item]) => {
				if (userID === +item.id) {
					for (let key in item) {
						editObject[key] = item[key];
					}

					editCollection.delete(keyCollection);
				}
			});

			renderForm();
			dataAdd();
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
		render();

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
				const { id = '', post = '', photofile = '' } = JSON.parse(data);

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
	const sender = sendUsers.manager;
	const recipient = sendUsers.operator;
	const subject = 'Запрос на редактирование данных пользователей в БД';

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

export default {
};
