'use strict';

import $ from 'jquery';
import service from '../service.js';
import messageMail from '../mail.js';
import { settingsObject, sendUsers } from './settings.ctrl.js';

import { table } from '../components/permis/table.tpl.js';
import { tabs } from '../components/tabs.tpl.js';
import { headerTable } from '../components/permis/header-table.tpl.js';
import { switchElem } from '../components/switch.tpl.js';
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
});

function renderHeaderPage(page = 'permis') {
	$(`.main[data-name=${page}] .main__title-wrap`).html('');
	$(`.main[data-name=${page}] .container`).prepend(pageTitle(permisObject));
}

function renderTable() {
	if (!permissionCollection.size) {
		return `<p class="table__nothing">Новых данных нет</p>`;
	} else {
		return [...permissionCollection.values()].reduce((content, item) => {
			if (item.nameid === permisObject.nameid) {
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
						status: permisObject.nameid === nameid
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
	return Object.values(permisSwitch).reduce((content, item) => {
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
	return Object.values(permisCount).reduce((content, item) => {
		content += count(item);

		return content;
	}, '');
}

function render(page = 'permis') {
	$(`.container--${page} .wrap--content`).html('');
	$(`.container--${page} .wrap--content`).append(`
		<div class="main__wrap-info">
			<div class="main__cards">${renderCount()}</div>
			<div class="main__switchies">${renderSwitch()}</div>
		</div>
		<div class="wrap wrap--table">
			<header class="tab">${renderTabs()}</header>
			<div class="table">
				<header class="table__header">${headerTable(permisObject)}</header>
				<div class="table__body">${renderTable()}</div>
			</div>
		</div>
	`);

	autoRefresh();
	clickAllowDisallowPermis();
	confirmAllAllowDisallow();
	if (filterDepart().length > 1) changeTabs();
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
		const itemObject = { ...objToCollection };

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

function dataAdd() {
	permisObject.nameid = filterDepart()[0];

	getDepartmentFromDB();
	showActiveDataOnPage();
	render();
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
				[...permissionCollection].forEach(([key, { id }]) => {
					if (userID === id) {
						permissionCollection.delete(key);
					}
				});
			});
			filterDepartCollection.splice(0);

			clearObject();
			resetControlBtns();
			dataAdd();

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

function clickAllowDisallowPermis(page = 'permis') {
	$(`.container--${page} .table__body`).click(({ target }) => {
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

		render();
	});
}

function confirmAllAllowDisallow(page = 'permis') {
	$(`.container--${page} #allowAll, .container--${page} #disallowAll`).click(({ target }) => {
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

		render();
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

	$(`.container--${page} .switch--refresh`).click(({ target }) => {
		if (!$(target).hasClass('switch__input')) return;

		const statusSwitch = $(target).prop('checked');
		permisSwitch.refresh.status = statusSwitch;

		if (statusSwitch && !permisSwitch.refresh.marker) {
			localStorage.removeItem(page);
			permissionCollection.clear();

			resetControlBtns(); // 1
			getDataFromDB('permis'); // 2
			setDataInStorage();

			permisSwitch.refresh.marker = setInterval(() => {
				getDataFromDB('permis');
			}, timeReload);
		} else if (!statusSwitch && permisSwitch.refresh.marker) {
			clearInterval(permisSwitch.refresh.marker);

			permisSwitch.refresh.marker = false;
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
function changeTabs(page = 'permis') {
	$(`.container--${page} .tab`).click(({ target }) => {
		if (!$(target).parents('.tab__item').length && !$(target).hasClass('tab__item')) return;

		permisObject.nameid = $(target).closest('.tab__item').data('depart');

		resetControlBtns();
		showActiveDataOnPage();
		render();

		localStorage.removeItem(page); // в самом конце, т.к. функции выше записывают в localStorage
	});
}

function filterDepart() {
	const arrayDepart = [...permissionCollection.values()].map(({ nameid }) => nameid);

	return [...new Set(arrayDepart)];
}

export default {
};
