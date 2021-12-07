'use strict';

import $ from 'jquery';
import convert from '../convert.js';
import service from '../service.js';
import messageMail from '../mail.js';
import { settingsObject, sendUsers } from './settings.ctrl.js';

import { table } from '../components/const/table.tpl.js';
import { tabs } from '../components/tabs.tpl.js';
import { switchElem } from '../components/const/switch.tpl.js';
import { count } from '../components/count.tpl.js';
import { pageTitle } from '../components/page-title.tpl.js';

const constCollection = new Map(); // БД пользователей которым разрешили выдачу карт
const departmentCollection = new Map();  // Коллекция подразделений
const dbConstCardsCollection = new Map();  // Коллекция всех добавленных карт
const constObject = {
	page: 'Добавление карт пользователям',
	nameid: '',
	longname: '',
	shortname: ''
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
	submitIDinBD();
	printReport();
	showDataFromStorage();
	renderSwitch();
});

function renderHeaderPage(page = 'const') {
	$(`.main[data-name=${page}] .main__title-wrap`).html('');
	$(`.main[data-name=${page}] .container`).prepend(pageTitle(constObject));
}

function renderTable(nameTable = '#tableConst') {
	$(`${nameTable} .table__content`).html('');

	constCollection.forEach((item) => {
		if (item.nameid === constObject.nameid) {
			$(`${nameTable} .table__content`).append(table(item));
		}
	});
}

function renderSwitch(page = 'const') {
	$(`.main__wrap-info--${page} .main__switchies`).html('');
	for (let key in constSwitch) {
		$(`.main__wrap-info--${page} .main__switchies`).append(switchElem(constSwitch[key]));
	}

	autoRefresh();
}

function renderCount(page = 'const') {
	$(`.main__wrap-info--${page} .main__cards`).html('');
	for (let key in constCount) {
		$(`.main__wrap-info--${page} .main__cards`).append(count(constCount[key]));
	}
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
		const itemObject = {...objToCollection};

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

function dataAdd(page = 'const') {
	const filterNameDepart = filterDepart();
	constObject.nameid = filterNameDepart[0];

	getDepartmentFromDB();
	getConstCardsFromDB();

	if (constCollection.size) {
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

	convertCardIDInCardName();
	clearNumberCard();
	showActiveDataOnPage();
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

	renderHeaderPage();
	renderTable();
	renderCount();
}

function submitIDinBD(page = 'const') {
	$('#submitConstCard').click(() => {
		const filterDepartCollection = [...constCollection.values()].filter(({ nameid }) => nameid == constObject.nameid);
		const checkedItems = filterDepartCollection.every(({ cardid }) => cardid);

		if (checkedItems) {
			$('.info__item--warn.info__item--fields').hide();

			constCollection.forEach((item) => {
				if (item.nameid === constObject.nameid) {
					item.date = service.getCurrentDate();
				}
			});

			setAddUsersInDB(filterDepartCollection, 'const', 'report', 'card');

			filterDepartCollection.forEach(({ id: userID }) => {
				[...constCollection].forEach(([ key, { id } ]) => {
					if (userID === id) {
						constCollection.delete(key);
					}
				});
			});
			filterDepartCollection.splice(0);

			clearObject();
			dataAdd();

			if (!constCollection.size) {
				renderHeaderPage();
			}

			localStorage.removeItem(page);
		} else {
			$('.info__item--warn.info__item--fields').show();
		}
	});
}

function clearObject() {
	constObject.nameid = '';
	constObject.longname = '';
	constObject.shortname = '';
}

function emptySign(status, nameTable = '#tableConst') {
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

function clearNumberCard(nameTable = '#tableConst') {
	$(`${nameTable} .table__content`).click(({ target }) => {
		if ($(target).parents('.table__btn--clear').length || $(target).hasClass('table__btn--clear')) {
			const userID = $(target).parents('.table__row').data('id');
			let collectionID;

			[...constCollection].forEach(([ key, { id } ]) => {
				if (userID === +id) {
					collectionID = key;
				}
			});

			setDataInTable(collectionID);
		}
	});
}

function convertCardIDInCardName(nameTable = '#tableConst', page = 'const') {
	$(`${nameTable} .table__content`).click(({ target }) => {
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
				$(`.main[data-name=${page}]`).find('.info__item--warn.info__item--have').show();

				renderTable();
				return;
			} else {
				$(`.main[data-name=${page}]`).find('.info__item--warn.info__item--have').hide();
			}

			if (containsCardID) {
				$(`.main[data-name=${page}]`).find('.info__item--warn.info__item--contains').show();

				renderTable();
				return;
			} else {
				$(`.main[data-name=${page}]`).find('.info__item--warn.info__item--contains').hide();
			}

			if (!convertNumCard) {
				$(`.main[data-name=${page}]`).find('.info__item--error.info__item--fields').show();

				return;
			}

			[...constCollection].forEach(([ key, { id } ]) => {
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
}

function checkInvalidValueCardID(page = 'const') {
	const filterDepartCollection = [...constCollection.values()].filter(({ nameid }) => nameid == constObject.nameid);
	const checkValueCard = filterDepartCollection.every(({ cardid }) => {
		if(cardid) convert.convertCardId(cardid);
	});

	if (checkValueCard) {
		$(`.main[data-name=${page}]`).find('.info__item--error').hide();
	}
}

function autoRefresh(page = 'const') {
	const timeReload = 60000 * settingsObject.autoupdatevalue;

	$(`.switch--refresh-${page}`).click(({ target }) => {
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

function addTabs(page = 'const') {
	const filterNameDepart = filterDepart();

	$(`.tab--${page}`).html('');

	filterNameDepart.forEach((item) => {
		departmentCollection.forEach(({ nameid = '', shortname = '' }) => {
			if (item === nameid) {
				const tabItem = {
					nameid,
					shortname,
					status: constObject.nameid === nameid
				};

				$(`.tab--${page}`).append(tabs(tabItem));
			}
		});
	});
}

function changeTabs(page = 'const') {
	$(`.tab--${page}`).click(({ target }) => {
		if (!$(target).parents('.tab__item').length && !$(target).hasClass('tab__item')) return;

		const activeDepart = $(target).closest('.tab__item').data('depart');
		constObject.nameid = activeDepart;

		addTabs();
		showActiveDataOnPage();

		localStorage.removeItem(page); // в самом конце, т.к. функции выше записывают в localStorage
	});
}

function filterDepart() {
	const arrayDepart = [...constCollection.values()].map(({ nameid }) => nameid);

	return [...new Set(arrayDepart)];
}

function createObjectForBD() {
	const object = {
		FIO: '',
		Department: '',
		FieldGroup: '',
		Badge: '',
		CardName: '',
		CardID: '',
		CardValidTo: '',
		PIN: '',
		CardStatus: 1,
		Security: 0,
		Disalarm: 0,
		VIP: 0,
		DayNightCLM: 0,
		AntipassbackDisabled: 0,
		PhotoFile: '',
		EmployeeNumber: '',
		Post: ''
	};
	const fillOutObjectInBD = [...constFillOutCardCollection].map((elem) => {
		const itemObject = Object.assign({}, object);

		for (const itemField in itemObject) {
			for (const key in elem) {
				if (itemField.toLocaleLowerCase() == key) {
					itemObject[itemField] = elem[key];
				}
			}
		}

		return itemObject;
	});

	console.log(fillOutObjectInBD);
}

export default {

};
