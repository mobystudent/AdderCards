'use strict';

import $ from 'jquery';
import service from '../service.js';
import messageMail from '../mail.js';
import { settingsObject, sendUsers } from './settings.ctrl.js';

import { table } from '../components/request/table.tpl.js';
import { tabs } from '../components/tabs.tpl.js';
import { headerTable } from '../components/request/header-table.tpl.js';
import { switchElem } from '../components/switch.tpl.js';
import { count } from '../components/count.tpl.js';
import { pageTitle } from '../components/page-title.tpl.js';

const requestCollection = new Map(); // БД отчета
const departmentCollection = new Map();  // Коллекци подразделений
const requestObject = {
	page: 'Запрос на изменение данных',
	statusallow: '',
	statusdisallow: '',
	nameid: '',
	longname: '',
	shortname: '',
	info: []
};
const requestSwitch = {
	refresh: {
		type: 'refresh',
		status: false,
		marker: 0
	}
};
const requestCount = {
	item: {
		title: 'Количество пользователей:&nbsp',
		get count() {
			return [...requestCollection.values()].filter(({ nameid }) => nameid === requestObject.nameid).length;
		}
	},
	all: {
		title: 'Общее количество пользователей:&nbsp',
		get count() {
			return requestCollection.size;
		}
	},
};

$(window).on('load', () => {
	showDataFromStorage();
});

function renderTable() {
	if (!requestCollection.size) {
		return `<p class="table__nothing">Новых данных нет</p>`;
	} else {
		return [...requestCollection.values()].reduce((content, item) => {
			if (item.nameid === requestObject.nameid) {
				content += table(item);
			}

			return content;
		}, '');
	}
}

function renderTabs() {
	if (filterDepart().length > 1) {
		return filterDepart().reduce((content, item) => {
			let tabItem;

			departmentCollection.forEach(({ nameid = '', shortname = '' }) => {
				if (item === nameid) {
					tabItem = {
						nameid,
						shortname,
						status: requestObject.nameid === nameid
					};
				}
			});

			content += tabs(tabItem);

			return content;
		}, '');
	} else {
		return '';
	}
}

function renderSwitch() {
	return Object.values(requestSwitch).reduce((content, item) => {
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
	return Object.values(requestCount).reduce((content, item) => {
		content += count(item);

		return content;
	}, '');
}

function renderInfo(errors) {
	const info = [
		{
			type: 'warn',
			title: 'fields',
			message: 'Предупреждение! Не все пользователи выбраны.'
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

function render(page = 'request') {
	$(`.main[data-name=${page}]`).html('');
	$(`.main[data-name=${page}]`).append(`
		${pageTitle(requestObject)}
		<div class="wrap wrap--content wrap--content-request">
			<div class="main__wrap-info">
				<div class="main__cards">${renderCount()}</div>
				<div class="main__switchies">${renderSwitch()}</div>
			</div>
			<div class="wrap wrap--table">
				<header class="tab">${renderTabs()}</header>
				<div class="table">
					<header class="table__header">${headerTable(requestObject)}</header>
					<div class="table__body">${renderTable()}</div>
				</div>
			</div>
		</div>
		<div class="info info--page">${renderInfo(requestObject.info)}</div>
		<div class="main__btns">
			<button class="btn btn--submit" type="button">Применить</button>
		</div>
	`);

	autoRefresh();
	clickAllowDisallowRequest();
	confirmAllAllowDisallow();
	submitIDinBD();

	if (filterDepart().length > 1) changeTabs();
}

function userFromDB(array) {
	const objToCollection = {
		id: '',
		fio: '',
		post: '',
		nameid: '',
		statusid: '',
		statustitle: '',
		department: '',
		date: ''
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

		requestCollection.set(i, itemObject);
	});

	dataAdd();
}

function dataAdd() {
	requestObject.nameid = filterDepart()[0];

	getDepartmentFromDB();
	showActiveDataOnPage();
	render();
}

function showDataFromStorage(page = 'request') {
	const storageCollection = JSON.parse(localStorage.getItem(page));

	if (storageCollection && storageCollection.collection.length && !requestCollection.size) {
		const { statusallow, statusdisallow } = storageCollection.controls;
		const { refresh } = storageCollection.settings;

		storageCollection.collection.forEach((item, i) => {
			const itemID = storageCollection.collection[i].id;

			requestCollection.set(itemID, item);
		});

		requestObject.statusallow = statusallow;
		requestObject.statusdisallow = statusdisallow;
		requestSwitch.refresh = refresh;

		dataAdd();
	} else {
		getDataFromDB('request');
	}
}

function setDataInStorage(page = 'request') {
	localStorage.setItem(page, JSON.stringify({
		settings: requestSwitch,
		controls: requestObject,
		collection: [...requestCollection.values()]
	}));
}

function showActiveDataOnPage() {
	departmentCollection.forEach((depart) => {
		const { nameid, shortname, longname } = depart;

		if (nameid === requestObject.nameid) {
			requestObject.shortname = shortname;
			requestObject.longname = longname;
		}
	});
}

function submitIDinBD(page = 'request') {
	$('btn--submit').click(() => {
		const filterDepartCollection = [...requestCollection.values()].filter(({ nameid }) => nameid === requestObject.nameid);
		const checkedItems = filterDepartCollection.every(({ statusrequest }) => statusrequest);

		if (checkedItems) {
			const allowItems = filterDepartCollection.filter(({ statusrequest }) => statusrequest === 'allow');
			const disallowItems = filterDepartCollection.filter(({ statusrequest }) => statusrequest === 'disallow');

			requestObject.info = [];

			if (allowItems.length) {
				// Запрос в Uprox
			}

			if (disallowItems.length) {
				disallowItems.forEach((item) => {
					item.date = service.getCurrentDate();
				});

				setAddUsersInDB(disallowItems, 'reject', 'add', 'reject');
			}

			console.log(filterDepartCollection);

			filterDepartCollection.forEach(({ id: userID }) => {
				[...requestCollection].forEach(([key, { id }]) => {
					if (userID === id) {
						requestCollection.delete(key);
					}
				});
			});
			filterDepartCollection.splice(0);

			clearObject();
			resetControlBtns();
			dataAdd();

			localStorage.removeItem(page);
		} else {
			requestObject.info = ['fields'];
			render();
		}
	});
}

function clearObject() {
	requestObject.nameid = '';
	requestObject.longname = '';
	requestObject.shortname = '';
}

function clickAllowDisallowRequest(page = 'request') {
	$(`.main[data-name=${page}] .table__body`).click(({ target }) => {
		if (!$(target).hasClass('btn--allow') && !$(target).hasClass('btn--disallow')) return;

		const userID = $(target).parents('.table__row').data('id');
		const typeBtn = $(target).data('type');

		requestCollection.forEach((item) => {
			if (+item.id === userID) {
				const status = item[typeBtn] ? false : true;

				item.statususer = status;
				item.statusrequest = typeBtn;
				item[typeBtn] = status;
				item.allowblock = typeBtn === 'disallow' && status;
				item.disallowblock = typeBtn === 'allow' && status;
			}
		});

		const allStatusUsers = [...requestCollection.values()].some(({ statususer }) => statususer);

		if (!allStatusUsers) {
			localStorage.removeItem(page);
		} else {
			setDataInStorage();
		}

		render();
	});
}

function confirmAllAllowDisallow(page = 'request') {
	$(`.main[data-name=${page}] #allowAll, .main[data-name=${page}] #disallowAll`).click(({ target }) => {
		const typeBtn = $(target).data('type');
		const statusTypeBtn = typeBtn === 'allow' ? 'statusallow' : 'statusdisallow';
		requestObject[statusTypeBtn] = requestObject[statusTypeBtn] ? false : true;

		requestCollection.forEach((item) => {
			if (item.nameid === requestObject.nameid) {
				item.statususer = requestObject[statusTypeBtn];
				item.statusrequest = typeBtn;
				item.allow = '';
				item.disallow = '';
				item.allowblock = requestObject[statusTypeBtn];
				item.disallowblock = requestObject[statusTypeBtn];
			}
		});

		if (!requestObject.statusallow && !requestObject.statusdisallow) {
			localStorage.removeItem(page);
		} else {
			setDataInStorage();
		}

		render();
	});
}

function resetControlBtns() {
	requestObject.statusallow = '';
	requestObject.statusdisallow = '';

	requestCollection.forEach((item) => {
		if (item.nameid === requestObject.nameid) {
			item.statususer = '';
			item.statusrequest = '';
			item.allow = '';
			item.disallow = '';
			item.allowblock = '';
			item.disallowblock = '';
		}
	});
}

function autoRefresh(page = 'request') {
	const timeReload = 60000 * settingsObject.autoupdatevalue;

	$(`.main[data-name=${page}] .switch--refresh`).click(({ target }) => {
		if (!$(target).hasClass('switch__input')) return;

		const statusSwitch = $(target).prop('checked');
		requestSwitch.refresh.status = statusSwitch;

		if (statusSwitch && !requestSwitch.refresh.marker) {
			localStorage.removeItem(page);
			requestCollection.clear();

			resetControlBtns(); // 1
			getDataFromDB('request'); // 2
			setDataInStorage();

			requestSwitch.refresh.marker = setInterval(() => {
				getDataFromDB('request');
			}, timeReload);
		} else if (!statusSwitch && requestSwitch.refresh.marker) {
			clearInterval(requestSwitch.refresh.marker);

			requestSwitch.refresh.marker = false;
			localStorage.removeItem(page);
		}

		render();
	});
}

function setAddUsersInDB(array, nameTable, action, typeTable) {
	$.ajax({
		url: "./php/change-user-request.php",
		method: "post",
		dataType: "html",
		async: false,
		data: {
			typeTable,
			action,
			nameTable,
			array
		},
		success: () => {
			const title = nameTable === 'reject' ? 'Отклонено' : 'Изменено';

			service.modal('success');

			sendMail({
				department: requestObject.longname,
				count: array.length,
				title,
				users: array
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

function getDepartmentFromDB() {
	$.ajax({
		url: "./php/output-request.php",
		method: "post",
		dataType: "html",
		async: false,
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
	const { title = '' } = obj;
	const sender = sendUsers.operator;
	const recipient = sendUsers.manager;
	let subject;

	if (title === 'Отклонено') {
		subject = 'Отклонен запрос на изменение данных в БД';
	} else {
		subject = 'Успешно изменены данные о пользователях в БД';
	}

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
function changeTabs(page = 'request') {
	$(`.main[data-name=${page}] .tab`).click(({ target }) => {
		if (!$(target).parents('.tab__item').length && !$(target).hasClass('tab__item')) return;

		requestObject.nameid = $(target).closest('.tab__item').data('depart');

		resetControlBtns();
		showActiveDataOnPage();
		render();

		localStorage.removeItem(page); // в самом конце, т.к. функции выше записывают в localStorage
	});
}

function filterDepart() {
	const arrayDepart = [...requestCollection.values()].map(({ nameid }) => nameid);

	return [...new Set(arrayDepart)];
}

export default {

};
