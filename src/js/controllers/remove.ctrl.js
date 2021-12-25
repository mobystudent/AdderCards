'use strict';

import $ from 'jquery';
import datepickerFactory from 'jquery-datepicker';
import datepickerRUFactory from 'jquery-datepicker/i18n/jquery.ui.datepicker-ru';
import service from '../service.js';
import messageMail from '../mail.js';
import { settingsObject, sendUsers } from './settings.ctrl.js';

import { table } from '../components/remove/table.tpl.js';
import { form } from '../components/remove/form.tpl.js';
import { count } from '../components/count.tpl.js';
import { headerTable } from '../components/remove/header-table.tpl.js';
import { pageTitle } from '../components/page-title.tpl.js';
import { select } from '../components/select.tpl.js';

datepickerFactory($);
datepickerRUFactory($);

const removeCollection = new Map();
const departmentCollection = new Map();  // Коллекци подразделений
const removeObject = {
	page: 'Удаление пользователей',
	id: '',
	fio: '',
	post: '',
	photofile: '',
	statusid: '',
	statustitle: '',
	cardvalidto: '',
	statuscardvalidto: '',
	newdepart: '',
	newnameid: '',
	statusnewdepart: '',
	get nameid() {
		return settingsObject.nameid;
	},
	get longname() {
		return settingsObject.longname;
	}
};
const removeCount = {
	item: {
		title: 'Количество удаляемых пользователей:&nbsp',
		get count() {
			return removeCollection.size;
		}
	}
};
let counter = 0;

$(window).on('load', () => {
	renderHeaderPage();
	submitIDinBD();
	getDepartmentFromDB();
	showDataFromStorage();
});

function renderHeaderPage(page = 'remove') {
	$(`.main[data-name=${page}] .main__title-wrap`).html('');
	$(`.main[data-name=${page}] .container`).prepend(pageTitle(removeObject));
}

function renderTable() {
	if (!removeCollection.size) {
		return `<p class="table__nothing">Не добавленно ни одного пользователя</p>`;
	} else {
		return [...removeCollection.values()].reduce((content, item) => {
			content += table(item, removeObject);

			return content;
		}, '');
	}
}

function renderCount() {
	return Object.values(removeCount).reduce((content, item) => {
		content += count(item);

		return content;
	}, '');
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

function renderForm(nameForm = '#removeForm') {
	const reasonList = [
		{
			title: 'Перевод в другое подразделение',
			type: 'reason',
			typevalue: 'changeDepart'
		},
		{
			title: 'Увольнение/отчисление',
			type: 'reason',
			typevalue: 'remove'
		}
	];
	const selectList = {
		reasonList: renderSelect(reasonList)
	};

	$(`${nameForm}`).html('');
	$(`${nameForm}`).append(`
		<div class="form__wrap form__wrap--user">${form(removeObject, selectList)}</div>
		<div class="main__btns">
			<button class="btn" id="removeUser" type="button" data-type="remove-user">Удалить</button>
		</div>
	`);

	toggleSelect(); // 3
	getAddUsersInDB(); // вывести всех пользователей в селект 1
	datepicker();
	setDepartInSelect(); // 2
	addUser();
}

function render(page = 'remove') {
	$(`.container--${page} .wrap--content`).html('');
	$(`.container--${page} .wrap--content`).append(`
		<div class="main__wrap-info">
			<div class="main__cards">${renderCount()}</div>
		</div>
		<div class="wrap wrap--table">
			<div class="table">
				<header class="table__header">${headerTable(removeObject)}</header>
				<div class="table__body">${renderTable()}</div>
			</div>
		</div>
	`);

	deleteUser();
	editUser();
}

function addUser(page = 'remove') {
	$('#removeUser').click(() => {
		if (removeObject.cardvalidto) {
			delete removeObject.newnameid;
			delete removeObject.newdepart;
		} else {
			delete removeObject.cardvalidto;
		}

		delete removeObject.statusnewdepart;
		delete removeObject.statuscardvalidto;

		const valid = Object.values(removeObject).every((item) => item);
		const statusMess = !valid ? 'show' : 'hide';

		$(`.main[data-name=${page}]`).find('.info__item--warn.info__item--fields')[statusMess]();

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
		statusid: '',
		statustitle: '',
		newnameid: '',
		newdepart: '',
		cardvalidto: ''
	};
	const itemObject = { ...objToCollection };

	for (const itemField in itemObject) {
		for (const key in removeObject) {
			if (itemField === key) {
				itemObject[itemField] = removeObject[key];
			}
		}
	}

	removeCollection.set(counter, itemObject);
	counter++;

	setDataInStorage();
	dataAdd();
}

function dataAdd() {
	showFieldsInHeaderTable();
	renderForm();
	render();
}

function showDataFromStorage(page = 'remove') {
	const storageCollection = JSON.parse(localStorage.getItem(page));

	if (storageCollection && storageCollection.collection.length && !removeCollection.size) {
		const lengthStorage = storageCollection.collection.length;
		counter = storageCollection.collection[lengthStorage - 1].id + 1; // id последнего элемента в localStorage

		storageCollection.collection.forEach((item, i) => {
			const itemID = storageCollection.collection[i].id;

			removeCollection.set(itemID, item);
		});
	}

	dataAdd();
}

function setDataInStorage(page = 'remove') {
	localStorage.setItem(page, JSON.stringify({
		collection: [...removeCollection.values()]
	}));
}

function setDepartInSelect() {
	departmentCollection.forEach(({ nameid = '', longname = '' }) => {
		const quoteName = longname.replace(/["']/g, '&quot;');

		if (nameid !== settingsObject.nameid) {
			const item = {
				value: quoteName,
				id: nameid,
				type: 'form',
				dataid: 'newnameid'
			};

			$('.select[data-select="newnameid"] .select__list').append(select(item));
		}
	});
}

function showFieldsInHeaderTable(page = 'remove') {
	removeObject.statusnewdepart = [...removeCollection.values()].some(({ newdepart }) => newdepart);
	removeObject.statuscardvalidto = [...removeCollection.values()].some(({ cardvalidto }) => cardvalidto);
	const newdepartMod = removeObject.statusnewdepart ? '-newdepart' : '';
	const cardvalidtoMod = removeObject.statuscardvalidto ? '-cardvalidto' : '';
	const className = `wrap wrap--content wrap--content-${page}${newdepartMod}${cardvalidtoMod}`;

	$(`.main[data-name="${page}"]`).find('.wrap--content').attr('class', className);
}

function setUsersInSelect(users, nameForm = '#removeForm') {
	$(`${nameForm} .select[data-select="fio"] .select__list`).html('');

	if (removeCollection.size) {
		removeCollection.forEach((elem) => {
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

function toggleSelect(nameForm = '#removeForm') {
	$(`${nameForm} .select__header`).click(({ currentTarget }) => {
		$(currentTarget).next().slideToggle().toggleClass('select__header--active');
	});
}

function clickSelectItem(nameForm = '#removeForm') {
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
		removeObject.fio = title;
		removeObject.statustitle = '';
		removeObject.statusid = '';
		removeObject.newdepart = '';
		removeObject.newnameid = '';
		removeObject.cardvalidto = '';
	} else if (select === 'reason') {
		removeObject.statustitle = title;
		removeObject.statusid = statusid;

		if (statusid === 'remove') {
			removeObject.newdepart = '';
			removeObject.newnameid = '';
		} else if (statusid === "changeDepart") {
			removeObject.cardvalidto = '';
		}
	} else if (select === 'newnameid') {
		removeObject.newnameid = statusid;
		removeObject.newdepart = title.replace(/["']/g, '&quot;');
	}

	renderForm();
}

function clearFieldsForm() {
	for (const key in removeObject) {
		if (key !== 'nameid' && key !== 'longname' && key !== 'page') {
			removeObject[key] = '';
		}
	}

	renderForm();
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

	$('#removeDatepicker').change(({ currentTarget }) => {
		const cardvalidtoValue = $(currentTarget).val();

		removeObject.cardvalidto = cardvalidtoValue;
	});
}

function deleteUser(page = 'remove') {
	$(`.container--${page} .table__body`).click(({ target }) => {
		if ($(target).parents('.table__btn--delete').length || $(target).hasClass('table__btn--delete')) {
			const userID = $(target).closest('.table__row').data('id');

			[...removeCollection].forEach(([key, { id }]) => {
				if (userID === +id) {
					removeCollection.delete(key);
				}
			});

			setDataInStorage();
			dataAdd();

			if (!removeCollection.size) {
				localStorage.removeItem(page);
			}
		}
	});
}

function editUser(page = 'remove') {
	$(`.container--${page} .table__body`).click(({ target }) => {
		if ($(target).parents('.table__btn--edit').length || $(target).hasClass('table__btn--edit')) {
			const userID = $(target).closest('.table__row').data('id');

			[...removeCollection].forEach(([keyCollection, item]) => {
				if (userID === +item.id) {
					for (let key in item) {
						removeObject[key] = item[key];
					}

					removeCollection.delete(keyCollection);
				}
			});

			renderForm();
			dataAdd();
		}
	});
}

function submitIDinBD(page = 'remove') {
	$('#submitRemoveUser').click(() => {
		if (!removeCollection.size) return;

		removeCollection.forEach((user) => {
			user.nameid = settingsObject.nameid;
			user.date = service.getCurrentDate();
		});

		const removeArray = [...removeCollection.values()].filter(({ statusid }) => statusid === 'remove');
		const changeDepartArray = [...removeCollection.values()].filter(({ statusid }) => statusid === 'changeDepart');

		if (removeArray.length) {
			setAddUsersInDB(removeArray, 'add', 'remove');
		}
		if (changeDepartArray.length) {
			setAddUsersInDB(changeDepartArray, 'add', 'transfer');
		}

		removeCollection.clear();
		render();

		localStorage.removeItem(page);
		counter = 0;
	});
}

function setAddUsersInDB(array, nameTable, action) {
	$.ajax({
		url: "./php/change-user-request.php",
		method: "post",
		dataType: "html",
		async: false,
		data: {
			action,
			nameTable,
			array
		},
		success: () => {
			service.modal('success');

			sendMail({
				department: settingsObject.longname,
				count: removeCollection.size,
				title: 'Удалить',
				users: [...removeCollection.values()]
			});
		},
		error: () => {
			service.modal('error');
		}
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
			nameTable: 'remove'
		},
		success: (data) => {
			if (id) {
				const { id = '', post = '', photofile = '' } = JSON.parse(data);

				removeObject.post = post;
				removeObject.id = id;
				removeObject.photofile = photofile;

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

function getDepartmentFromDB() {
	$.ajax({
		url: "./php/output-request.php",
		method: "post",
		dataType: "html",
		data: {
			nameTable: 'department'
		},
		success: (data) => {
			const dataFromDB = JSON.parse(data);

			dataFromDB.forEach((item, i) => {
				departmentCollection.set(i + 1, item);
			});
		},
		error: () => {
			service.modal('download');
		}
	});
}

function sendMail(obj) {
	const sender = sendUsers.manager;
	const recipient = sendUsers.operator;
	const subject = 'Запрос на удаление пользователей из БД';

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
