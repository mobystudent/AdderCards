'use strict';

import $ from 'jquery';
import datepickerFactory from 'jquery-datepicker';
import datepickerRUFactory from 'jquery-datepicker/i18n/jquery.ui.datepicker-ru';
import service from '../service.js';
import messageMail from '../mail.js';
import { settingsObject, sendUsers } from './settings.ctrl.js';
import renderheader from '../parts/renderheader.js';

import { table } from '../components/add/table.tpl.js';
import { form } from '../components/add/form.tpl.js';
import { count } from '../components/add/count.tpl.js';
import { headerTable } from '../components/add/header-table.tpl.js';
import { modalUser } from '../components/add/modal-user.tpl.js';

datepickerFactory($);
datepickerRUFactory($);

const addCollection = new Map();
const dbUserNamesCollection = new Map();
const addObject = {
	fio: '',
	post: '',
	photofile: '',
	photourl: '',
	photoname: '',
	statusid: '',
	statustitle: '',
	cardvalidto: '',
	cardvalidtoid: '',
	cardvalidtotitle: '',
	statuscardvalidto: ''
};
const addCount = {
	item: {
		title: 'Количество добавляемых пользователей:&nbsp',
		get count() {
			return addCollection.size;
		}
	}
};
let counter = 0;

$(window).on('load', () => {
	const options = {
		page: 'add',
		header: {
			longname: settingsObject.longname,
			nameid: settingsObject.nameid
		}
	};

	renderheader.renderHeaderPage(options); // 1
	submitIDinBD(); // 1
	toggleSelect(); // 1
	downloadFoto(); // 1
	memberInputField(); // 1
	addUser(); // 2 без загрузки фото и загрузки селектов не пройдет валидация в addUser
	showDataFromStorage(); // 1
	getUserNamesFromDB();
});

function renderTable(nameTable = '#tableAdd') {
	$(`${nameTable} .table__content`).html('');

	addCollection.forEach((item) => {
		$(`${nameTable} .table__content`).append(table(item, addObject));
	});

	renderCount();
}

function renderForm(nameForm = '#addForm') {
	$(`${nameForm} .form__wrap`).html('');
	$(`${nameForm} .form__wrap`).append(form(addObject));

	toggleSelect();
	datepicker();
	downloadFoto();
	memberInputField();
}

function renderHeaderTable(page = 'add') {
	$(`.table--${page} .table__header`).html('');
	$(`.table--${page} .table__header`).append(headerTable(addObject));
}

function renderModalContainsUser() {
	$('.modal').addClass('modal--active');
	$('.modal__item--user')
		.html('')
		.addClass('modal__item--active');

	dbUserNamesCollection.forEach((item) => {
		if (addObject.fio === item.fio) {
			$('.modal__item--user').append(modalUser(item));
		}
	});

	modalActions();
}

function renderCount(page = 'add') {
	$(`.main__wrap-info--${page} .main__cards`).html('');
	for (let key in addCount) {
		$(`.main__wrap-info--${page} .main__cards`).append(count(addCount[key]));
	}
}

function modalActions(){
	$('.modal__btn').click(({ currentTarget }) => {
		const btnName = $(currentTarget).data('name');

		$('.modal').removeClass('modal--active');
		$('.modal__item').removeClass('modal__item--active');

		if (btnName === 'add') {
			userFromForm();
		}

		clearFieldsForm();
	});
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
				countNameWords = countWords.length < 2 ? 'show' : 'hide';
			}
		}

		const valid = [statusMess, correctName, countNameWords].every((mess) => mess === 'hide');

		$(`.main[data-name=${page}]`).find('.info__item--warn.info__item--fields')[statusMess]();
		$(`.main[data-name=${page}]`).find('.info__item--error.info__item--name')[correctName]();
		$(`.main[data-name=${page}]`).find('.info__item--error.info__item--short')[countNameWords]();

		if (valid) {
			checkContainsUser();
		}
	});
}

function checkContainsUser(page = 'add') {
	const uniqueName = [...addCollection.values()].every(({ fio }) => fio !== addObject.fio);
	const containsName = [...dbUserNamesCollection.values()].every(({ fio }) => fio !== addObject.fio);

	if (uniqueName) {
		$(`.main[data-name=${page}]`).find('.info__item--warn.info__item--have').hide();
	} else {
		$(`.main[data-name=${page}]`).find('.info__item--warn.info__item--have').show();

		return;
	}

	if (!containsName) {
		renderModalContainsUser();
	}

	if (uniqueName && containsName) {
		userFromForm();
		clearFieldsForm();
	}
}

function userFromForm() {
	const objToCollection = {
		id: '',
		fio: '',
		post: '',
		photofile: '',
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
				reader.onload = ({ currentTarget }) => {
					user.photofile = currentTarget.result;

					encodeArrayPhotoFile.push(user);
				};
				reader.readAsDataURL(user.photofile);
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
		const statusid = $(currentTarget).find('.select__name').data(select);

		setDataAttrSelectedItem(title, select, statusid);
	});
}

function setDataAttrSelectedItem(title, select, statusid) {
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
	$('.form__item').keyup(({ currentTarget }) => {
		const nameField = $(currentTarget).data('field');
		const fieldValue = $(currentTarget).val().trim();

		addObject[nameField] = fieldValue ? fieldValue : '';
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
	$(`${nameForm} .form__item--file`).change(({ target }) => {
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

		setAddUsersInDB([...addCollection.values()], 'add', page);

		addCollection.clear();
		emptySign('empty');
		renderTable();

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
				reader.onload = ({ currentTarget }) => {
					user.photofile = currentTarget.result;

					encodeArrayPhotoFile.push(user);
				};
				reader.readAsDataURL(user.photofile);
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

function getUserNamesFromDB() {
	$.ajax({
		url: "./php/output-request.php",
		method: "post",
		dataType: "html",
		async: false,
		data: {
			nameTable: 'names',
			nameDepart: settingsObject.nameid
		},
		success: (data) => {
			const dataFromDB = JSON.parse(data);

			dataFromDB.forEach((item, i) => {
				dbUserNamesCollection.set(i + 1, item);
			});
		},
		error: () => {
			service.modal('download');
		}
	});
}

function sendMail(obj) {
	const sender =  sendUsers.manager;
	const recipient = sendUsers.secretary;
	const subject = 'Запрос на добавление пользователей в БД';

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
