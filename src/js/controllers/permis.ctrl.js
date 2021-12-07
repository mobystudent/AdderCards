'use strict';

import $ from 'jquery';
import service from '../service.js';
import messageMail from '../mail.js';
import { settingsObject, sendUsers } from './settings.ctrl.js';

import { table } from '../components/permis/table.tpl.js';
import { tabs } from '../components/tabs.tpl.js';
import { headerTable } from '../components/permis/header-table.tpl.js';
import { switchElem } from '../components/permis/switch.tpl.js';
import { count } from '../components/count.tpl.js';
import { pageTitle } from '../components/page-title.tpl.js';

const permissionCollection = new Map(); // БД пользователей при старте
const departmentCollection = new Map();  // Коллекци подразделений
const permisObject = {
	page: 'Разрешение на добавление <br> идентификаторов пользователям',
	statusallow: '',
	statusdisallow: '',
	nameid: '',
	longname: '',
	shortname: ''
};
const permisSwitch = {
	refresh: {
		type: 'refresh',
		status: false,
		marker: 0
	}
};
const permisCount = {
	item: {
		title: 'Количество пользователей:&nbsp',
		get count() {
			return [...permissionCollection.values()].filter(({ nameid }) => nameid === permisObject.nameid).length;
		}
	},
	all: {
		title: 'Общее количество пользователей:&nbsp',
		get count() {
			return permissionCollection.size;
		}
	}
};

$(window).on('load', () => {
	submitIDinBD();
	showDataFromStorage();
	renderSwitch();
});

function renderHeaderPage(page = 'permis') {
	$(`.main[data-name=${page}] .main__title-wrap`).html('');
	$(`.main[data-name=${page}] .container`).prepend(pageTitle(permisObject));
}

function renderTable(nameTable = '#tablePermis') {
	$(`${nameTable} .table__content`).html('');

	permissionCollection.forEach((item) => {
		if (item.nameid === permisObject.nameid) {
			$(`${nameTable} .table__content`).append(table(item));
		}
	});
}

function renderHeaderTable(page = 'permis') {
	$(`.table--${page} .table__header`).html('');
	$(`.table--${page} .table__header`).append(headerTable(permisObject));
}

function renderSwitch(page = 'permis') {
	$(`.main__wrap-info--${page} .main__switchies`).html('');
	for (let key in permisSwitch) {
		$(`.main__wrap-info--${page} .main__switchies`).append(switchElem(permisSwitch[key]));
	}

	autoRefresh();
}

function renderCount(page = 'permis') {
	$(`.main__wrap-info--${page} .main__cards`).html('');
	for (let key in permisCount) {
		$(`.main__wrap-info--${page} .main__cards`).append(count(permisCount[key]));
	}
}

function userFromDB(array) {
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
		statususer: '',
		сardvalidto: '',
		statuspermis: ''
	};

	array.forEach((elem, i) => {
		const itemObject = {...objToCollection};

		for (const itemField in itemObject) {
			for (const key in elem) {
				if (itemField === key) {
					itemObject[itemField] = elem[key];
				}
			}
		}

		permissionCollection.set(i, itemObject);
	});

	dataAdd();
}

function dataAdd(page = 'permis') {
	const filterNameDepart = filterDepart();
	permisObject.nameid = filterNameDepart[0];

	getDepartmentFromDB();

	if (permissionCollection.size) {
		emptySign('full');
	} else {
		emptySign('empty');

		return;
	}

	if (filterNameDepart.length > 1) {
		addTabs();
		changeTabs();
	} else {
		$(`.tab--${page}`).html('');
	}

	clickAllowDisallowPermis();
	confirmAllAllowDisallow();
	showActiveDataOnPage();
}

function showDataFromStorage(page = 'permis') {
	const storageCollection = JSON.parse(localStorage.getItem(page));

	if (storageCollection && storageCollection.collection.length && !permissionCollection.size) {
		const { statusallow, statusdisallow } = storageCollection.controls;
		const { refresh } = storageCollection.settings;

		storageCollection.collection.forEach((item, i) => {
			const itemID = storageCollection.collection[i].id;

			permissionCollection.set(itemID, item);
		});

		permisObject.statusallow = statusallow;
		permisObject.statusdisallow = statusdisallow;
		permisSwitch.refresh = refresh;

		renderHeaderTable();
		dataAdd();
	} else {
		getDataFromDB('permis');
	}
}

function setDataInStorage(page = 'permis') {
	localStorage.setItem(page, JSON.stringify({
		settings: permisSwitch,
		controls: permisObject,
		collection: [...permissionCollection.values()]
	}));
}

function showActiveDataOnPage() {
	departmentCollection.forEach((depart) => {
		const { nameid, shortname, longname } = depart;

		if (nameid === permisObject.nameid) {
			permisObject.shortname = shortname;
			permisObject.longname = longname;
		}
	});

	renderHeaderPage();
	renderTable();
	renderCount();
}

function submitIDinBD(page = 'permis') {
	$('#submitPermis').click(() => {
		const filterDepartCollection = [...permissionCollection.values()].filter(({ nameid }) => nameid === permisObject.nameid);
		const checkedItems = filterDepartCollection.every(({ statuspermis }) => statuspermis);

		if (checkedItems) {
			const allowItems = filterDepartCollection.filter(({ statuspermis }) => statuspermis === 'allow');
			const disallowItems = filterDepartCollection.filter(({ statuspermis }) => statuspermis === 'disallow');

			$('.info__item--warn').hide();

			if (allowItems.length) {
				delegationID(allowItems);
			}

			if (disallowItems.length) {
				disallowItems.forEach((item) => {
					item.date = service.getCurrentDate();
				});

				setAddUsersInDB(disallowItems, 'reject', 'add', 'permis');
			}

			filterDepartCollection.forEach(({ id: userID }) => {
				[...permissionCollection].forEach(([ key, { id } ]) => {
					if (userID === id) {
						permissionCollection.delete(key);
					}
				});
			});
			filterDepartCollection.splice(0);

			clearObject();
			resetControlBtns();
			dataAdd();
			renderHeaderTable();
			confirmAllAllowDisallow();

			if (!permissionCollection.size) {
				renderHeaderPage();
			}

			localStorage.removeItem(page);
		} else {
			$('.info__item--warn').show();
		}
	});
}

function delegationID(users) {
	const filterArrCards = users.filter(({ statusid }) => statusid === 'newCard' || statusid === 'changeCard');
	const filterArrQRs = users.filter(({ statusid }) => statusid === 'newQR' || statusid === 'changeQR');

	if (filterArrCards.length) {
		setAddUsersInDB(filterArrCards, 'const', 'add', 'card');
	}
	if (filterArrQRs.length) {
		setAddUsersInDB(filterArrQRs, 'const', 'add', 'qr');
	}
}

function clearObject() {
	permisObject.nameid = '';
	permisObject.longname = '';
	permisObject.shortname = '';
}

function emptySign(status, nameTable = '#tablePermis') {
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

function clickAllowDisallowPermis(nameTable = '#tablePermis', page = 'permis') {
	$(`${nameTable} .table__content`).click(({ target }) => {
		if (!$(target).hasClass('btn--allow') && !$(target).hasClass('btn--disallow')) return;

		const userID = $(target).parents('.table__row').data('id');
		const typeBtn = $(target).data('type');

		permissionCollection.forEach((item) => {
			if (+item.id === userID) {
				const status = item[typeBtn] ? false : true;
				item.statususer = status ? true : false;
				item.statuspermis = typeBtn;
				item[typeBtn] = status;
				item.allowblock = typeBtn === 'disallow' && status ? true : false;
				item.disallowblock = typeBtn === 'allow' && status ? true : false;
			}
		});

		const allStatusUsers = [...permissionCollection.values()].some(({ statususer }) => statususer);

		if (!allStatusUsers) {
			localStorage.removeItem(page);
		} else {
			setDataInStorage();
		}

		renderTable();
	});
}

function confirmAllAllowDisallow(page = 'permis') {
	$(`.table--${page} #allowAll, .table--${page} #disallowAll`).click(({ target }) => {
		const typeBtn = $(target).data('type');
		const statusTypeBtn = typeBtn === 'allow' ? 'statusallow' : 'statusdisallow';
		permisObject[statusTypeBtn] = permisObject[statusTypeBtn] ? false : true;

		permissionCollection.forEach((item) => {
			if (item.nameid === permisObject.nameid) {
				item.statususer = permisObject[statusTypeBtn] ? true : false;
				item.statuspermis = typeBtn;
				item.allow = '';
				item.disallow = '';
				item.allowblock = permisObject[statusTypeBtn] ? true : false;
				item.disallowblock = permisObject[statusTypeBtn] ? true : false;
			}
		});

		if (!permisObject.statusallow && !permisObject.statusdisallow) {
			localStorage.removeItem(page);
		} else {
			setDataInStorage();
		}

		renderHeaderTable();
		renderTable();
		confirmAllAllowDisallow();
	});
}

function resetControlBtns() {
	permisObject.statusallow = '';
	permisObject.statusdisallow = '';

	permissionCollection.forEach((item) => {
		item.statususer = '';
		item.statuspermis = '';
		item.allow = '';
		item.disallow = '';
		item.allowblock = '';
		item.disallowblock = '';
	});
}

function autoRefresh(page = 'permis') {
	const timeReload = 60000 * settingsObject.autoupdatevalue;

	$(`.switch--refresh-${page}`).click(({ target }) => {
		if (!$(target).hasClass('switch__input')) return;

		const statusSwitch = $(target).prop('checked');
		permisSwitch.refresh.status = statusSwitch;

		if (statusSwitch && !permisSwitch.refresh.marker) {
			localStorage.removeItem(page);
			permissionCollection.clear();

			getDataFromDB('permis');
			resetControlBtns();
			renderHeaderTable();
			confirmAllAllowDisallow();
			setDataInStorage();

			permisSwitch.refresh.marker = setInterval(() => {
				getDataFromDB('permis');
			}, timeReload);
		} else if (!statusSwitch && permisSwitch.refresh.marker) {
			clearInterval(permisSwitch.refresh.marker);

			permisSwitch.refresh.marker = false;
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
			const title = nameTable === 'reject' ? 'Отклонено' : 'Добавить';

			service.modal('success');

			sendMail({
				department: permisObject.longname,
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
	const sender = sendUsers.secretary;
	let subject;
	let recipient;

	if (title === 'Отклонено') {
		recipient = sendUsers.manager;
		subject = 'Отклонен запрос на добавление пользователей в БД';
	} else {
		recipient = sendUsers.operator;
		subject = 'Запрос на добавление пользователей в БД';
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
function addTabs(page = 'permis') {
	const filterNameDepart = filterDepart();

	$(`.tab--${page}`).html('');

	if (filterNameDepart.length > 1) {
		filterNameDepart.forEach((item) => {
			departmentCollection.forEach((depart) => {
				const { nameid = '', shortname = '' } = depart;

				if (item == nameid) {
					const tabItem = {
						nameid,
						shortname,
						status: permisObject.nameid === nameid ? true : false
					};

					$(`.tab--${page}`).append(tabs(tabItem));
				}
			});
		});
	}
}

function changeTabs(page = 'permis') {
	$(`.tab--${page}`).click(({ target }) => {
		if (!$(target).parents('.tab__item').length && !$(target).hasClass('tab__item')) return;

		const activeDepart = $(target).closest('.tab__item').data('depart');
		permisObject.nameid = activeDepart;

		resetControlBtns();
		renderHeaderTable();
		addTabs();
		showActiveDataOnPage();
		confirmAllAllowDisallow();

		localStorage.removeItem(page); // в самом конце, т.к. функции выше записывают в localStorage
	});
}

function filterDepart() {
	const arrayDepart = [...permissionCollection.values()].map(({ nameid }) => nameid);

	return [...new Set(arrayDepart)];
}

export default {
};
