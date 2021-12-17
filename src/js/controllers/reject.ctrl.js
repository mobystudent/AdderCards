'use strict';

import $ from 'jquery';
import service from '../service.js';
import Scrollbar from 'smooth-scrollbar';
import messageMail from '../mail.js';
import { settingsObject, sendUsers } from './settings.ctrl.js';

import { table } from '../components/reject/table.tpl.js';
import { form } from '../components/reject/form.tpl.js';
import { headerTable } from '../components/reject/header-table.tpl.js';
import { switchElem } from '../components/switch.tpl.js';
import { count } from '../components/count.tpl.js';
import { pageTitle } from '../components/page-title.tpl.js';

const rejectCollection = new Map(); // БД отклоненных пользователей
const rejectObject = {
	page: 'Отклоненные пользователи',
	statusresend: '',
	get nameid() {
		return settingsObject.nameid;
	},
	get longname() {
		return settingsObject.longname;
	}
};
const rejectSwitch = {
	refresh: {
		type: 'refresh',
		status: false,
		marker: 0
	}
};
const rejectCount = {
	item: {
		title: 'Количество отклоненных пользователей:&nbsp',
		get count() {
			return rejectCollection.size;
		}
	}
};

$(window).on('load', () => {
	renderHeaderPage();
	submitIDinBD();
	showDataFromStorage();
	renderSwitch();
});

function renderHeaderPage(page = 'reject') {
	$(`.main[data-name=${page}] .main__title-wrap`).html('');
	$(`.main[data-name=${page}] .container`).prepend(pageTitle(rejectObject));
}

function renderTable(status, page = 'reject') {
	let stateTable;

	if (status == 'empty') {
		stateTable = `<p class="table__nothing">Новых данных нет</p>`;
	} else {
		stateTable = [...rejectCollection.values()].reduce((content, item) => {
			content += table(item);

			return content;
		}, '');
	}

	$(`.table--${page}`).html('');
	$(`.table--${page}`).append(`
		<header class="table__header">${headerTable(rejectObject)}</header>
		<div class="table__body">${stateTable}</div>
		`);

	resendAllUsers();
	viewDataUser();
	resendUsers();
	renderCount();
}

function renderForm(id, nameForm = '#rejectForm') {
	$(`${nameForm} .form__wrap`).html('');

	rejectCollection.forEach((item) => {
		if (+item.id === id) {
			$(`${nameForm} .form__wrap`).append(form(item));
		}
	});
}

function renderSwitch(page = 'reject') {
	$(`.main__wrap-info--${page} .main__switchies`).html('');

	for (let key in rejectSwitch) {
		let switchText;
		let tooltip;

		if (rejectSwitch[key].type === 'refresh') {
			switchText = 'Автообновление';
			tooltip = 'Если данная опция включена, тогда при поступлении новых данных, они автоматически отобразятся в таблице. Перезагружать страницу не нужно.<br/> Рекомендуется отключить данную функцию при работе с данными в таблице!';
		}

		const item = {
			switchText,
			tooltip,
			key: rejectSwitch[key]
		};

		$(`.main__wrap-info--${page} .main__switchies`).append(switchElem(item));
	}

	autoRefresh();
}

function renderCount(page = 'reject') {
	$(`.main__wrap-info--${page} .main__cards`).html('');
	for (let key in rejectCount) {
		$(`.main__wrap-info--${page} .main__cards`).append(count(rejectCount[key]));
	}
}

function userFromDB(array) {
	const objToCollection = {
		id: '',
		fio: '',
		post: '',
		photofile: '',
		photourl: '',
		statusid: '',
		statustitle: '',
		statususer: '',
		сardvalidto: '',
		resend: ''
	};

	array.forEach((elem, i) => {
		const itemObject = { ...objToCollection };

		for (const itemField in itemObject) {
			for (const key in elem) {
				if (itemField === key) {
					itemObject[itemField] = elem[key];
				}
			}
		}

		rejectCollection.set(i, itemObject);
	});

	dataAdd();
}

function dataAdd() {
	if (rejectCollection.size) {
		renderTable('full');
	} else {
		renderTable('empty');

		return;
	}
}

function showDataFromStorage(page = 'reject') {
	const storageCollection = JSON.parse(localStorage.getItem(page));

	if (storageCollection && storageCollection.collection.length && !rejectCollection.size) {
		const { statusresend } = storageCollection.controls;
		const { refresh } = storageCollection.settings;

		storageCollection.collection.forEach((item, i) => {
			const itemID = storageCollection.collection[i].id;

			rejectCollection.set(itemID, item);
		});

		rejectObject.statusresend = statusresend;
		rejectSwitch.refresh = refresh;

		dataAdd();
	} else {
		getDataFromDB('reject');
	}
}

function setDataInStorage(page = 'reject') {
	localStorage.setItem(page, JSON.stringify({
		settings: rejectSwitch,
		controls: rejectObject,
		collection: [...rejectCollection.values()]
	}));
}

function submitIDinBD(page = 'reject') {
	$('#submitReject').click(() => {
		const checkedItems = [...rejectCollection.values()].some(({ statususer }) => statususer);

		if (checkedItems) {
			const resendItems = [...rejectCollection.values()].filter(({ statususer }) => statususer);

			$('.info__item--warn').hide();

			resendItems.forEach((elem) => {
				elem.nameid = settingsObject.nameid;
				elem.department = settingsObject.longname;
			});

			setAddUsersInDB(resendItems, 'permis', 'add');

			resendItems.forEach(({ id: userID }) => {
				[...rejectCollection].forEach(([key, { id }]) => {
					if (userID === id) {
						rejectCollection.delete(key);
					}
				});
			});
			resendItems.splice(0);

			clearObject();
			dataAdd();
			localStorage.removeItem(page);
		} else {
			$('.info__item--warn').show();
		}
	});
}

function clearObject() {
	rejectObject.statusresend = '';
}

function viewDataUser(page = 'reject', nameForm = '#rejectForm') {
	$(`.table--${page} .table__body`).click(({ target }) => {
		if ($(target).parents('.table__btn--view').length || $(target).hasClass('table__btn--view')) {
			const userID = $(target).parents('.table__row').data('id');

			$(`${nameForm} .form__wrap`).removeClass('form__wrap--hide');

			renderForm(userID);
			Scrollbar.init($('.form__item--message').get(0));
		}
	});
}

function resendUsers(page = 'reject') {
	$(`.table--${page} .table__body`).click(({ target }) => {
		if (!$(target).hasClass('btn--resend')) return;

		const userID = $(target).parents('.table__row').data('id');
		let collectionID;

		[...rejectCollection].forEach(([key, { id }]) => {
			if (userID === +id) {
				collectionID = key;
			}
		});

		const user = rejectCollection.get(collectionID);
		user.resend = user.resend ? false : true;
		user.statususer = user.resend;
		const allStatusUsers = [...rejectCollection.values()].some(({ resend }) => resend);

		if (!allStatusUsers) {
			localStorage.removeItem(page);
		} else {
			setDataInStorage();
		}

		renderTable('full');
	});
}

function resendAllUsers(page = 'reject') {
	$('#resendAll').click(() => {
		rejectObject.statusresend = rejectObject.statusresend ? false : true;

		rejectCollection.forEach((item) => {
			item.resend = '';
			item.statususer = rejectObject.statusresend;
			item.resendblock = rejectObject.statusresend;
		});

		if (!rejectObject.statusresend) {
			localStorage.removeItem(page);
		} else {
			setDataInStorage();
		}

		renderTable('full');
	});
}

function autoRefresh(page = 'reject') {
	const timeReload = 60000 * settingsObject.autoupdatevalue;

	$(`.main__wrap-info--${page} .switch--refresh`).click(({ target }) => {
		if (!$(target).hasClass('switch__input')) return;

		const statusSwitch = $(target).prop('checked');
		rejectSwitch.refresh.status = statusSwitch;

		if (statusSwitch && !rejectSwitch.refresh.marker) {
			localStorage.removeItem(page);
			rejectCollection.clear();

			getDataFromDB('reject');
			setDataInStorage();

			rejectSwitch.refresh.marker = setInterval(() => {
				getDataFromDB('reject');
			}, timeReload);
		} else if (!statusSwitch && rejectSwitch.refresh.marker) {
			clearInterval(rejectSwitch.refresh.marker);

			rejectSwitch.refresh.marker = false;
			localStorage.removeItem(page);
		}

		renderSwitch();
	});
}

// Общие функции с картами и кодами
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
				count: rejectCollection.size,
				title: 'Повторно добавить',
				users: [...rejectCollection.values()]
			});
		},
		error: () => {
			service.modal('error');
		}
	});
}

function getDataFromDB(nameTable) {
	$.ajax({
		url: "./php/output-request.php",
		method: "post",
		dataType: "html",
		data: {
			idDepart: settingsObject.nameid,
			nameTable
		},
		async: false,
		success: (data) => {
			const dataFromDB = JSON.parse(data);

			userFromDB(dataFromDB);
		},
		error: () => {
			service.modal('download');
		}
	});
}

function sendMail(obj) {
	const sender = sendUsers.manager;
	const recipient = sendUsers.secretary;
	const subject = 'Запрос на повторное добавление пользователей в БД';

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
