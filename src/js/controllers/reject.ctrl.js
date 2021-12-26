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
	id: '',
	statusresend: '',
	info: [],
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
	showDataFromStorage();
});

function renderTable() {
	if (!rejectCollection.size) {
		return `<p class="table__nothing">Новых данных нет</p>`;
	} else {
		return [...rejectCollection.values()].reduce((content, item) => {
			content += table(item);

			return content;
		}, '');
	}
}

function renderForm() {
	const { id } = rejectObject;

	if (id) {
		for (const item of rejectCollection.values()) {
			if (+item.id === id) {
				return form(item);
			}
		}
	} else {
		return '';
	}
}

function renderSwitch() {
	return Object.values(rejectSwitch).reduce((content, item) => {
		let switchText;
		let tooltip;

		if (item.type === 'refresh') {
			switchText = 'Автообновление';
			tooltip = 'Если данная опция включена, тогда при поступлении новых данных, они автоматически отобразятся в таблице. Перезагружать страницу не нужно.<br/> Рекомендуется отключить данную функцию при работе с данными в таблице!';
		}

		const switchItem = {
			switchText,
			tooltip,
			key: item
		};

		content += switchElem(switchItem);

		return content;
	}, '');
}

function renderCount() {
	return Object.values(rejectCount).reduce((content, item) => {
		content += count(item);

		return content;
	}, '');
}

function renderInfo(errors) {
	const info = [
		{
			type: 'warn',
			title: 'fields',
			message: 'Предупреждение! Ни один пользователь не выбран.'
		}
	];

	return info.reduce((content, item) => {
		const { type, title, message } = item;

		for (const error of errors) {
			if (error === title) {
				content += `<p class="info__item info__item--${type}">${message}</p>`;
			}
		}

		return content;
	}, '');
}

function render(page = 'reject') {
	$(`.main[data-name=${page}]`).html('');
	$(`.main[data-name=${page}]`).append(`
		${pageTitle(rejectObject)}
		<form class="form form--page" action="#" method="GET">
			<div class="form__wrap form__wrap--user">${renderForm()}</div>
		</form>
		<div class="wrap wrap--content wrap--content-reject">
			<div class="main__wrap-info">
				<div class="main__cards">${renderCount()}</div>
				<div class="main__switchies">${renderSwitch()}</div>
			</div>
			<div class="wrap wrap--table">
				<div class="table">
					<header class="table__header">${headerTable(rejectObject)}</header>
					<div class="table__body">${renderTable()}</div>
				</div>
			</div>
		</div>
		<div class="info info--page">${renderInfo(rejectObject.info)}</div>
		<div class="main__btns">
			<button class="btn btn--submit" type="button">Отправить</button>
		</div>
	`);

	autoRefresh();
	resendAllUsers();
	viewDataUser();
	resendUsers();
	submitIDinBD();
	closeRejectForm();

	if ($('.form__item--message').length) {
		Scrollbar.init($('.form__item--message').get(0));
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
	render();
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
	$('.btn--submit').click(() => {
		const checkedItems = [...rejectCollection.values()].some(({ statususer }) => statususer);

		if (checkedItems) {
			const resendItems = [...rejectCollection.values()].filter(({ statususer }) => statususer);

			rejectObject.info = [];

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
			rejectObject.info = ['fields'];
			render();
		}
	});
}

function clearObject() {
	rejectObject.statusresend = '';
}

function viewDataUser(page = 'reject') {
	$(`.main[data-name=${page}] .table__body`).click(({ target }) => {
		if ($(target).parents('.table__btn--view').length || $(target).hasClass('table__btn--view')) {
			rejectObject.id = $(target).parents('.table__row').data('id');

			render();
		}
	});
}

function resendUsers(page = 'reject') {
	$(`.main[data-name=${page}] .table__body`).click(({ target }) => {
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

		render();
	});
}

function resendAllUsers(page = 'reject') {
	$(`.main[data-name=${page}] #resendAll`).click(() => {
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

		render();
	});
}

function closeRejectForm() {
	$('#closeRejectForm').click(() => {
		rejectObject.id = '';

		render();
	});
}

function autoRefresh(page = 'reject') {
	const timeReload = 60000 * settingsObject.autoupdatevalue;

	$(`.main[data-name=${page}] .switch--refresh`).click(({ target }) => {
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

		render();
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
