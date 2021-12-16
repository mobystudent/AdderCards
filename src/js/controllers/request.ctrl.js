'use strict';

import $ from 'jquery';
import service from '../service.js';
import messageMail from '../mail.js';
import { settingsObject, sendUsers } from './settings.ctrl.js';

import { table } from '../components/request/table.tpl.js';
import { tabs } from '../components/tabs.tpl.js';
import { headerTable } from '../components/request/header-table.tpl.js';
import { switchElem } from '../components/request/switch.tpl.js';
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
	shortname: ''
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
	submitIDinBD();
	showDataFromStorage();
	renderSwitch();
});

function renderHeaderPage(page = 'request') {
	$(`.main[data-name=${page}] .main__title-wrap`).html('');
	$(`.main[data-name=${page}] .container`).prepend(pageTitle(requestObject));
}

function renderTable(status, page = 'request') {
	let stateTable;

	if (status == 'empty') {
		stateTable = `<p class="table__nothing">Новых данных нет</p>`;
	} else {
		stateTable = [...requestCollection.values()].reduce((content, item) => {
			if (item.nameid === requestObject.nameid) {
				content += table(item);
			}

			return content;
		}, '');
	}

	$(`.table--${page}`).html('');
	$(`.table--${page}`).append(`
		<header class="table__header">${headerTable(requestObject)}</header>
		<div class="table__body">${stateTable}</div>
		`);

	clickAllowDisallowRequest();
	confirmAllAllowDisallow();
	renderCount();
}

function renderSwitch(page = 'request') {
	$(`.main__wrap-info--${page} .main__switchies`).html('');
	for (let key in requestSwitch) {
		$(`.main__wrap-info--${page} .main__switchies`).append(switchElem(requestSwitch[key]));
	}

	autoRefresh();
}

function renderCount(page = 'request') {
	$(`.main__wrap-info--${page} .main__cards`).html('');
	for (let key in requestCount) {
		$(`.main__wrap-info--${page} .main__cards`).append(count(requestCount[key]));
	}
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

function dataAdd(page = 'request') {
	const filterNameDepart = filterDepart();
	requestObject.nameid = filterNameDepart[0];

	getDepartmentFromDB();

	if (requestCollection.size) {
		renderTable('full');
	} else {
		renderTable('empty');

		return;
	}

	if (filterNameDepart.length > 1) {
		addTabs();
		changeTabs();
	} else {
		$(`.tab--${page}`).html('');
	}

	showActiveDataOnPage();
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

	renderHeaderPage();
}

function submitIDinBD(page = 'request') {
	$('#submitRequest').click(() => {
		const filterDepartCollection = [...requestCollection.values()].filter(({ nameid }) => nameid === requestObject.nameid);
		const checkedItems = filterDepartCollection.every(({ statusrequest }) => statusrequest);

		if (checkedItems) {
			const allowItems = filterDepartCollection.filter(({ statusrequest }) => statusrequest === 'allow');
			const disallowItems = filterDepartCollection.filter(({ statusrequest }) => statusrequest === 'disallow');

			$('.info__item--warn').hide();

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

			if (!requestCollection.size) {
				renderHeaderPage();
			}

			localStorage.removeItem(page);
		} else {
			$('.info__item--warn').show();
		}
	});
}

function clearObject() {
	requestObject.nameid = '';
	requestObject.longname = '';
	requestObject.shortname = '';
}

function clickAllowDisallowRequest(page = 'request') {
	$(`.table--${page} .table__body`).click(({ target }) => {
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

		renderTable('full');
	});
}

function confirmAllAllowDisallow(page = 'request') {
	$(`.table--${page} #allowAll, .table--${page} #disallowAll`).click(({ target }) => {
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

		renderTable('full');
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

	$(`.switch--refresh-${page}`).click(({ target }) => {
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

		renderSwitch();
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
function addTabs(page = 'request') {
	const filterNameDepart = filterDepart();

	$(`.tab--${page}`).html('');

	if (filterNameDepart.length > 1) {
		filterNameDepart.forEach((item) => {
			departmentCollection.forEach(({ nameid = '', shortname = '' }) => {
				if (item === nameid) {
					const tabItem = {
						nameid,
						shortname,
						status: requestObject.nameid === nameid
					};

					$(`.tab--${page}`).append(tabs(tabItem));
				}
			});
		});
	}
}

function changeTabs(page = 'request') {
	$(`.tab--${page}`).click(({ target }) => {
		if (!$(target).parents('.tab__item').length && !$(target).hasClass('tab__item')) return;

		requestObject.nameid = $(target).closest('.tab__item').data('depart');

		resetControlBtns();
		addTabs();
		renderTable('full');
		showActiveDataOnPage();

		localStorage.removeItem(page); // в самом конце, т.к. функции выше записывают в localStorage
	});
}

function filterDepart() {
	const arrayDepart = [...requestCollection.values()].map(({ nameid }) => nameid);

	return [...new Set(arrayDepart)];
}

export default {

};
