'use strict';

import $ from 'jquery';
import convert from '../js/convert.js';
import service from '../js/service.js';
import messageMail from '../js/mail.js';
import { settingsObject, sendUsers } from './settings.ctrl.js';

import { table } from '../components/const/table.tpl.js';
import { headerTable } from '../components/const/header-table.tpl.js';
import { tabs } from '../components/tabs.tpl.js';
import { switchElem } from '../components/switch.tpl.js';
import { count } from '../components/count.tpl.js';
import { pageTitle } from '../components/page-title.tpl.js';

const constCollection = new Map(); // БД пользователей которым разрешили выдачу карт
const departmentCollection = new Map();  // Коллекция подразделений
const dbConstCardsCollection = new Map();  // Коллекция всех добавленных карт
const constObject = {
	page: 'Добавление карт пользователям',
	nameid: '',
	longname: '',
	shortname: '',
	info: []
};
const constSwitch = {
	refresh: {
		type: 'refresh',
		status: false,
		marker: 0
	}
};
const constCount = {
	item: {
		title: 'Количество пользователей:&nbsp',
		get count() {
			return [...constCollection.values()].filter(({ nameid }) => nameid === constObject.nameid).length;
		}
	},
	all: {
		title: 'Общее количество пользователей:&nbsp',
		get count() {
			return constCollection.size;
		}
	}
};

$(window).on('load', () => {
	showDataFromStorage();
});

function renderTable() {
	if (!constCollection.size) {
		return `<p class="table__nothing">Новых данных нет</p>`;
	} else {
		return [...constCollection.values()].reduce((content, item) => {
			if (item.nameid === constObject.nameid) {
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
						status: constObject.nameid === nameid
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
	return Object.values(constSwitch).reduce((content, item) => {
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
	return Object.values(constCount).reduce((content, item) => {
		content += count(item);

		return content;
	}, '');
}

function renderInfo(errors) {
	const info = [
		{
			type: 'warn',
			title: 'fields',
			message: 'Предупреждение! Не всем пользователям присвоен идентификатор.'
		},
		{
			type: 'warn',
			title: 'have',
			message: 'Предупреждение! Карта с данным кодом уже присвоена!'
		},
		{
			type: 'warn',
			title: 'contains',
			message: 'Предупреждение! Карта с данным кодом была присвоена ранее!'
		},
		{
			type: 'error',
			title: 'cardid',
			message: 'Ошибка! Не правильно введен тип ID. Должно быть 10 цифр, без букв и символов!'
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

function render(page = 'const') {
	$(`.main[data-name=${page}]`).html('');
	$(`.main[data-name=${page}]`).append(`
		${pageTitle(constObject)}
		<div class="wrap wrap--content wrap--content-const">
			<div class="main__wrap-info">
				<div class="main__cards">${renderCount()}</div>
				<div class="main__switchies">${renderSwitch()}</div>
			</div>
			<div class="wrap wrap--table">
				<header class="tab">${renderTabs()}</header>
				<div class="table">
					<header class="table__header">${headerTable()}</header>
					<div class="table__body">${renderTable()}</div>
				</div>
			</div>
		</div>
		<div class="info info--page">${renderInfo(constObject.info)}</div>
		<div class="main__btns">
			<button class="btn btn--submit" type="button">Добавить</button>
			<button class="btn btn--print" type="button">Распечатать отчет</button>
		</div>
	`);

	autoRefresh();
	convertCardIDInCardName();
	clearNumberCard();
	submitIDinBD();
	printReport();

	if (filterDepart().length > 1) changeTabs();
}

function userFromDB(array) {
	const objToCollection = {
		id: '',
		fio: '',
		post: '',
		nameid: '',
		photofile: '',
		statusid: '',
		statustitle: '',
		department: '',
		сardvalidto: '',
		cardid: '',
		cardname: ''
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

		constCollection.set(i, itemObject);
	});

	dataAdd();
}

function dataAdd() {
	constObject.nameid = filterDepart()[0];

	getDepartmentFromDB();
	getConstCardsFromDB();
	showActiveDataOnPage();
	render();
}

function showDataFromStorage(page = 'const') {
	const storageCollection = JSON.parse(localStorage.getItem(page));

	if (storageCollection && storageCollection.collection.length && !constCollection.size) {
		const { refresh } = storageCollection.settings;

		storageCollection.collection.forEach((item, i) => {
			const itemID = storageCollection.collection[i].id;

			constCollection.set(itemID, item);
		});

		constSwitch.refresh = refresh;

		dataAdd();
	} else {
		getDataFromDB('const', 'card');
	}
}

function setDataInStorage(page = 'const') {
	localStorage.setItem(page, JSON.stringify({
		settings: constSwitch,
		collection: [...constCollection.values()]
	}));
}

function showActiveDataOnPage() {
	departmentCollection.forEach((depart) => {
		const { nameid, shortname, longname } = depart;

		if (nameid === constObject.nameid) {
			constObject.shortname = shortname;
			constObject.longname = longname;
		}
	});
}

function submitIDinBD(page = 'const') {
	$('.btn--submit').click(() => {
		const filterDepartCollection = [...constCollection.values()].filter(({ nameid }) => nameid == constObject.nameid);
		const checkedItems = filterDepartCollection.every(({ cardid }) => cardid);

		if (checkedItems) {
			constObject.info = [];

			constCollection.forEach((item) => {
				if (item.nameid === constObject.nameid) {
					item.date = service.getCurrentDate();
				}
			});

			setAddUsersInDB(filterDepartCollection, 'const', 'report', 'card');

			filterDepartCollection.forEach(({ id: userID }) => {
				[...constCollection].forEach(([key, { id }]) => {
					if (userID === id) {
						constCollection.delete(key);
					}
				});
			});
			filterDepartCollection.splice(0);

			clearObject();
			dataAdd();

			localStorage.removeItem(page);
		} else {
			constObject.info = ['fields'];
			render();
		}
	});
}

function clearObject() {
	constObject.nameid = '';
	constObject.longname = '';
	constObject.shortname = '';
}

function clearNumberCard(page = 'const') {
	$(`.main[data-name=${page}] .table__body`).click(({ target }) => {
		if ($(target).parents('.table__btn--clear').length || $(target).hasClass('table__btn--clear')) {
			const userID = $(target).parents('.table__row').data('id');
			let collectionID;

			[...constCollection].forEach(([key, { id }]) => {
				if (userID === +id) {
					collectionID = key;
				}
			});

			setDataInTable(collectionID);
		}
	});
}

function convertCardIDInCardName(page = 'const') {
	$(`.main[data-name=${page}] .table__body`).click(({ target }) => {
		if (!$(target).hasClass('table__input')) return;

		$(target).on('input', () => {
			const cardIdVal = $(target).val().trim();
			const convertNumCard = convert.convertCardId(cardIdVal);
			const userID = $(target).parents('.table__row').data('id');
			const cardObj = {
				cardid: cardIdVal,
				cardname: convertNumCard
			};
			const uniqueCardID = [...constCollection.values()].some(({ cardid }) => cardIdVal === cardid);
			const containsCardID = [...dbConstCardsCollection.values()].some(({ cardid }) => cardIdVal === cardid);

			if (uniqueCardID) {
				constObject.info = ['have'];

				render();

				return;
			} else {
				constObject.info = [];
			}

			if (containsCardID) {
				constObject.info = ['contains'];

				render();

				return;
			} else {
				constObject.info = [];
			}

			if (!convertNumCard) {
				constObject.info = ['cardid'];

				render();

				return;
			} else {
				constObject.info = [];
			}

			[...constCollection].forEach(([key, { id }]) => {
				if (userID === +id) {
					setDataInTable(key, cardObj);
				}
			});

			checkInvalidValueCardID();
		});
	});
}

function setDataInTable(userID, cardObj, page = 'const') {
	const user = constCollection.get(userID);
	user.cardid = cardObj ? cardObj.cardid : '';
	user.cardname = cardObj ? cardObj.cardname : '';
	const allStatusUsers = [...constCollection.values()].some(({ cardid }) => cardid);

	if (!allStatusUsers) {
		localStorage.removeItem(page);
	} else {
		setDataInStorage();
	}

	showActiveDataOnPage();
	render();
}

function checkInvalidValueCardID() {
	const filterDepartCollection = [...constCollection.values()].filter(({ nameid }) => nameid == constObject.nameid);
	const checkValueCard = filterDepartCollection.every(({ cardid }) => {
		if (cardid) convert.convertCardId(cardid);
	});

	if (checkValueCard) {
		constObject.info = [];
	}
}

function autoRefresh(page = 'const') {
	const timeReload = 60000 * settingsObject.autoupdatevalue;

	$(`.main[data-name=${page}] .switch--refresh`).click(({ target }) => {
		if (!$(target).hasClass('switch__input')) return;

		const statusSwitch = $(target).prop('checked');
		constSwitch.refresh.status = statusSwitch;

		if (statusSwitch && !constSwitch.refresh.marker) {
			localStorage.removeItem(page);

			getDataFromDB('const', 'card');
			setDataInStorage();

			constSwitch.refresh.marker = setInterval(() => {
				getDataFromDB('const', 'card');
			}, timeReload);
		} else if (!statusSwitch && constSwitch.refresh.marker) {
			clearInterval(constSwitch.refresh.marker);

			constSwitch.refresh.marker = false;
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
		success: (data) => {
			console.log(data);
			window.print();
			service.modal('success');

			sendMail({
				department: constObject.longname,
				count: array.length,
				title: 'Добавлено',
				users: array
			});
		},
		error: () => {
			service.modal('error');
		}
	});
}

function getDataFromDB(nameTable, typeTable) {
	$.ajax({
		url: "./php/output-request.php",
		method: "post",
		dataType: "html",
		data: {
			nameTable,
			typeTable
		},
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

function getConstCardsFromDB() {
	$.ajax({
		url: "./php/output-request.php",
		method: "post",
		dataType: "html",
		async: false,
		data: {
			nameTable: 'contains-card'
		},
		success: (data) => {
			const dataFromDB = JSON.parse(data);

			dataFromDB.forEach((item, i) => {
				dbConstCardsCollection.set(i + 1, item);
			});
		},
		error: () => {
			service.modal('download');
		}
	});
}

function sendMail(obj) {
	const sender = sendUsers.operator;
	const recipient = sendUsers.manager;
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
function printReport(page = 'const') {
	$(`.main[data-name=${page}] .btn--print`).click(() => {
		window.print();
	});
}

function changeTabs(page = 'const') {
	$(`.main[data-name=${page}] .tab`).click(({ target }) => {
		if (!$(target).parents('.tab__item').length && !$(target).hasClass('tab__item')) return;

		constObject.nameid = $(target).closest('.tab__item').data('depart');

		showActiveDataOnPage();
		render();

		localStorage.removeItem(page); // в самом конце, т.к. функции выше записывают в localStorage
	});
}

function filterDepart() {
	const arrayDepart = [...constCollection.values()].map(({ nameid }) => nameid);

	return [...new Set(arrayDepart)];
}

export default {

};
