'use strict';

import $ from 'jquery';
import convert from '../convert.js';
import service from '../service.js';

import { table } from '../components/time/table.tpl.js';
import { headerTable } from '../components/time/header-table.tpl.js';
import { count } from '../components/count.tpl.js';
import { pageTitle } from '../components/page-title.tpl.js';

const timeCollection = new Map(); // БД в которую будут добавляться карты при вводе и из неё будут выводиться данные в таблицу.
const dbTimeCardsCollection = new Map();  // Коллекция всех добавленных карт
const timeObject = {
	page: 'Добавление временных карт'
};
const timeCount = {
	item: {
		title: 'Количество карт:&nbsp',
		get count() {
			return timeCollection.size;
		}
	}
};
let counter = 0;

$(window).on('load', () => {
	renderHeaderPage();
	submitIDinBD();
	addTimeCard();
	showDataFromStorage();
});

function renderHeaderPage(page = 'time') {
	$(`.main[data-name=${page}] .main__title-wrap`).html('');
	$(`.main[data-name=${page}] .container`).prepend(pageTitle(timeObject));
}

function renderTable(status, page = 'time') {
	let stateTable;

	if (status == 'empty') {
		stateTable = `<p class="table__nothing">Новых данных нет</p>`;
	} else {
		stateTable = [...timeCollection.values()].reduce((content, item) => {
			content += table(item);

			return content;
		}, '');
	}

	$(`.table--${page}`).html('');
	$(`.table--${page}`).append(`
		<header class="table__header">${headerTable()}</header>
		<div class="table__body">${stateTable}</div>
		`);

	convertCardIDInCardName();
	deleteTimeCard();
	clearNumberCard();
	renderCount();
}

function renderCount(page = 'time') {
	$(`.main__wrap-info--${page} .main__cards`).html('');
	for (let key in timeCount) {
		$(`.main__wrap-info--${page} .main__cards`).append(count(timeCount[key]));
	}
}

function itemUserInTable() {
	timeCollection.set(counter, {
		id: counter,
		fio: 'Временная карта',
		statusid: 'timeCard',
		statustitle: 'Временная карта',
		cardid: '',
		cardname: ''
	});

	counter++;

	dataAdd();
}

function addTimeCard() {
	$('#addTimeCard').click(() => {
		itemUserInTable();
	});
}

function dataAdd() {
	getTimeCardsFromDB();
	renderTable('full');
}

function showDataFromStorage(page = 'time') {
	const storageCollection = JSON.parse(localStorage.getItem(page));

	if (storageCollection && storageCollection.collection.length) {
		const lengthStorage = storageCollection.collection.length;
		counter = storageCollection.collection[lengthStorage - 1].id + 1; // id последнего элемента в localStorage

		storageCollection.collection.forEach((item, i) => {
			const itemID = storageCollection.collection[i].id;

			timeCollection.set(itemID, item);
		});

		dataAdd();
	} else {
		renderTable('empty');
	}
}

function setDataInStorage(page = 'time') {
	localStorage.setItem(page, JSON.stringify({
		collection: [...timeCollection.values()]
	}));
}

function submitIDinBD(page = 'time') {
	$('#submitTimeCard').click(() => {
		const checkedItems = [...timeCollection.values()].every(({ cardid }) => cardid);

		if (checkedItems) {
			$('.info__item--warn.info__item--fields').hide();

			timeCollection.forEach((item) => {
				item.date = service.getCurrentDate();
			});

			setAddUsersInDB([...timeCollection.values()], 'time', 'report');

			timeCollection.clear();
			localStorage.removeItem(page);
			counter = 0;
		} else {
			$('.info__item--warn.info__item--fields').show();
		}
	});
}

function clearNumberCard(page = 'time') {
	$(`.table--${page} .table__body`).click(({ target }) => {
		if ($(target).parents('.table__btn--clear').length || $(target).hasClass('table__btn--clear')) {
			const userID = $(target).parents('.table__row').data('id');
			let collectionID;

			[...timeCollection].forEach(([key, { id }]) => {
				if (userID === +id) {
					collectionID = key;
				}
			});

			setDataInTable(collectionID);
		}
	});
}

function deleteTimeCard(page = 'time') {
	$(`.table--${page} .table__body`).click(({ target }) => {
		if ($(target).parents('.table__btn--delete').length || $(target).hasClass('table__btn--delete')) {
			const userID = $(target).closest('.table__row').data('id');

			[...timeCollection].forEach(([key, { id }]) => {
				if (userID === +id) {
					timeCollection.delete(key);
				}
			});

			setDataInStorage();
			renderTable('full');

			if (!timeCollection.size) {
				localStorage.removeItem(page);
			}
		}
	});
}

function convertCardIDInCardName(page = 'time') {
	$(`.table--${page} .table__body`).click(({ target }) => {
		if (!$(target).hasClass('table__input')) return;

		$(target).on('input', () => {
			const cardIdVal = $(target).val().trim();
			const convertNumCard = convert.convertCardId(cardIdVal);
			const userID = $(target).parents('.table__row').data('id');
			const cardObj = {
				cardid: cardIdVal,
				cardname: convertNumCard
			};
			const uniqueCardID = [...timeCollection.values()].some(({ cardid }) => cardIdVal === cardid);
			const containsCardID = [...dbTimeCardsCollection.values()].some(({ cardid }) => cardIdVal === cardid);

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

			[...timeCollection].forEach(([key, { id }]) => {
				if (userID === +id) {
					setDataInTable(key, cardObj);
				}
			});

			checkInvalidValueCardID();
		});
	});
}

function setDataInTable(userID, cardObj, page = 'time') {
	const user = timeCollection.get(userID);
	user.cardid = cardObj ? cardObj.cardid : '';
	user.cardname = cardObj ? cardObj.cardname : '';
	const allStatusUsers = [...timeCollection.values()].some(({ cardid }) => cardid);

	if (!allStatusUsers) {
		localStorage.removeItem(page);
	} else {
		setDataInStorage();
	}

	renderTable('full');
}

function checkInvalidValueCardID(page = 'time') {
	const checkValueCard = [...timeCollection.values()].every(({ cardid }) => {
		if (cardid) convert.convertCardId(cardid);
	});

	if (checkValueCard) {
		$(`.main[data-name=${page}]`).find('.info__item--error').hide();
	}
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
		},
		error: () => {
			service.modal('error');
		}
	});
}

function getTimeCardsFromDB() {
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
				dbTimeCardsCollection.set(i + 1, item);
			});
		},
		error: () => {
			service.modal('download');
		}
	});
}

function getData() {
	const data = {
		"PasswordHash": "88020F057FE7287D8D57494382356F97",
		"UserName": "admin"
	};
	let resultAuthent = {};

	$.ajax({
		url: "http://localhost:40001/json/Authenticate",
		method: "post",
		dataType: "json",
		contentType: 'application/json',
		data: JSON.stringify(data),
		async: false,
		success: (data) => {
			const { UserSID = '', UserToken = 0 } = data;

			console.log(data);

			resultAuthent = {
				UserSID,
				UserToken
			};
		},
		error: (data) => {
			console.log(data);
		}
	});

	return resultAuthent;
}

function createObjectForBD() {
	const { UserSID = '', UserToken = 0 } = getData();

	// console.log(UserSID);
	// console.log(UserToken);
	console.log(UserSID);

	const object = {
		"Language": "ua",
		"UserSID": UserSID,
		"ResultTokenRequired": true,
		"AccessGroupInherited": true,
		"AccessGroupToken": UserToken,
		"AdditionalFields": [{
			"Name": "",
			"Value": ""
		}],
		"AdditionalFieldsChanged": true,
		"FieldGroupToken": UserToken,
		"Name": "Временная карта",
		"NewCards": [{
			"AntipassbackDisabled": true,
			"Code": "",
			"ConfirmationUrl": "",
			"Disalarm": true,
			"Email": "",
			"EmailRequestCode": "",
			"IdentifierType": 2147483647,
			"Name": "",
			"PIN": "",
			"Security": true,
			"Status": 2147483647,
			"Token": UserToken,
			"VIP": true,
			"ValidTo": "\/Date(928135200000+0300)\/",
			"ValidToUsed": true
		}],
		"OwnAccessRulesChanged": true,
		"Token": UserToken,
		"WorktimeInherited": true,
		"CardCodes": [""],
		"CardTokens": [UserToken],
		"CardsChanged": true,
		"DepartmentToken": UserToken,
		"EmployeeNumber": "",
		"NewBiometricIdentifiers": [{
			"BiometricIndex": 2147483647,
			"BiometricType": "",
			"Data": "",
			"Quality": 2147483647
		}],
		"PhotoBase64": "",
		"PhotoChanged": true,
		"PhotoFileExt": "",
		"Post": "",
		"OwnAccessRules": [{
			"DoorToken": UserToken,
			"PassCounter": 2147483647,
			"ScheduleToken": UserToken
		}]
	};
	// const fillOutObjectInBD = map.map((elem) => {
	// 	const itemObject = Object.assign({}, object);
	//
	// 	for (const itemField in itemObject) {
	// 		for (const key in elem) {
	// 			if (itemField.toLocaleLowerCase() == key) {
	// 				itemObject[itemField] = elem[key];
	// 			}
	// 		}
	// 	}
	//
	// 	return itemObject;
	// });

	// console.log(object);
	$.ajax({
		url: "http://localhost:40001/json/EmployeeSet",
		method: "post",
		dataType: "json",
		contentType: 'application/json',
		data: JSON.stringify(object),
		async: false,
		success: (data) => {
			console.log(data);
		},
		error: (data) => {
			console.log(data);
		}
	});
}

export default {

};
