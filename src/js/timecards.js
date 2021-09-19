'use strict';

import $ from 'jquery';
import convert from './convert.js';
import service from './service.js';

const timeCollection = new Map(); // БД в которую будут добавляться карты при вводе и из неё будут выводиться данные в таблицу.
let counter = 0;

$(window).on('load', () => {
	addTimeCard();
	deleteTimeCard();
	clearNumberCard();
	submitIDinBD();
	convertCardIDInCardName();
	showDataFromStorage();
});

function templateTimeTable(data) {
	const { id = '', cardid = '', cardname = '' } = data;
	let typeIDField = '';

	if (cardid) {
		typeIDField = `<span class="table__text table__text--body">${cardid}</span>`;
	} else {
		typeIDField = `<input class="table__input" />`;
	}

	return `
		<div class="table__row" data-id="${id}">
			<div class="table__cell table__cell--body table__cell--fio">
				<span class="table__text table__text--body">Временная карта</span>
			</div>
			<div class="table__cell table__cell--body table__cell--cardid">
				${typeIDField}
			</div>
			<div class="table__cell table__cell--body table__cell--cardname">
				<span class="table__text table__text--body">${cardname}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--clear">
				<button class="table__btn table__btn--clear" type="button">
					<svg class="icon icon--clear icon--clear-black">
						<use class="icon__item" xlink:href="./images/sprite.svg#clear"></use>
					</svg>
				</button>
			</div>
			<div class="table__cell table__cell--body table__cell--delete">
				<button class="table__btn table__btn--delete" type="button">
					<svg class="icon icon--delete icon--delete-black">
						<use class="icon__item" xlink:href="./images/sprite.svg#delete"></use>
					</svg>
				</button>
			</div>
		</div>
	`;
}

function renderTable(nameTable = '#tableTime') {
	$(`${nameTable} .table__content`).html('');

	timeCollection.forEach((item) => {
		$(`${nameTable} .table__content`).append(templateTimeTable(item));
	});
}

function itemUserInTable(id) {
	const idUser = id ? id : 0;

	timeCollection.set(idUser, {
		id: idUser,
		cardid: '',
		cardname: ''
	});

	renderTable();

	counter++;
}

function addTimeCard(page = 'time') {
	$('#addTimeCard').click(() => {
		itemUserInTable(counter);

		$(`.main__count--${page}`).text(timeCollection.size);
	});
}

function showDataFromStorage(page = 'time') {
	const storageCollection = JSON.parse(localStorage.getItem(page));

	if (storageCollection) {
		const lengthStorage = storageCollection.collection.length;
		counter = storageCollection.collection[lengthStorage - 1].id + 1; // id последнего элемента в localStorage

		timeCollection.clear();
		storageCollection.collection.forEach((item, i) => {
			const itemID = storageCollection.collection[i].id;

			timeCollection.set(itemID, item);
		});

		renderTable();
		deleteTimeCard();
		clearNumberCard();
		convertCardIDInCardName();
	} else {
		itemUserInTable();
	}
}

function setDataInStorage(page = 'time') {
	localStorage.setItem(page, JSON.stringify({
		collection: [...timeCollection.values()]
	}));
}

function deleteTimeCard(page = 'time') {
	$('.table__content').click((e) => {
		if ($(e.target).parents('.table__btn--delete').length || $(e.target).hasClass('table__btn--delete')) {
			const idRemove = $(e.target).closest('.table__row').data('id');

			blockLastCard(idRemove);
		}

		$(`.main__count--${page}`).text(timeCollection.size);
	});
}

function blockLastCard(idRemove, page = 'time') {
	const countItems = timeCollection.size;

	if (countItems === 1) {
		$(`.main[data-name="${page}"]`).find('.info__item--last').show();

		setTimeout(() => {
			$(`.main[data-name="${page}"]`).find('.info__item--last').hide();
		}, 5000);

		return;
	} else {
		timeCollection.delete(idRemove);

		renderTable();
		setDataInStorage();
	}
}

function submitIDinBD(page = 'time') {
	$('#submitTimeCard').click(() => {
		const checkedItems = [...timeCollection.values()].every((user) => user.cardid);

		console.log('checkedItems 2');
		if (checkedItems) {
			// timeReportCollection = deepClone(timeCollection);
			// timeFillOutCollection = deepClone(timeCollection);

			// createObjectForBD([...timeReportCollection.values()]);
			// createObjectForBD();
			// getData();

			timeCollection.forEach((item) => {
				item.date = service.getCurrentDate();
			});

			setAddUsersInDB([...timeCollection.values()], 'time', 'report');

			timeCollection.clear();
			itemUserInTable();

			localStorage.removeItem(page);
			counter = 0;

			$('.info__item--warn.info__item--fields').hide();
		} else {
			$('.info__item--warn.info__item--fields').show();
		}
	});
}

function clearNumberCard(nameTable = '#tableTime') {
	$(`${nameTable} .table__content`).click((e) => {
		if ($(e.target).parents('.table__btn--clear').length || $(e.target).hasClass('table__btn--clear')) {
			const userID = $(e.target).closest('.table__row').data('id');
			// const itemClear = timeCollection.get(idClear);

			setDataInTable(userID);
		}
	});
}

function convertCardIDInCardName(nameTable = '#tableTime') {
	$(`${nameTable} .table__content`).click((e) => {
		if (!$(e.target).hasClass('table__input')) return;

		$('.table__input').on('input', (e) => {
			const cardIdVal = $(e.target).val().trim();
			const convertNumCard = convert.convertCardId(cardIdVal);
			const userID = $(e.target).closest('.table__row').data('id');
			const cardObj = {
				cardid: cardIdVal,
				cardname: convertNumCard
			};

			if (!convertNumCard) {
				$(e.target).parents('.main').find('.info__item--error').show();

				return;
			}

			setDataInTable(userID, cardObj);
			checkInvalidValueCardID();
		});
	});
}

function setDataInTable(userID, cardObj) {
	const user = constCollection.get(userID);

	user.cardid = cardObj ? cardObj.cardid : '';
	user.cardname = cardObj ? cardObj.cardname : '';

	renderTable();
	setDataInStorage();
}

function checkInvalidValueCardID(page = 'time') {
	// const valuesCardid = timeCollection.get(idItem).cardid;
	const checkValueCard = [...timeCollection.values()].every((user) => {
		if (user.cardid) {
			return convert.convertCardId(user.cardid);
		}
	});

	if (checkValueCard) {
		$(`.main[data-name="${page}"]`).find('.info__item--error').hide();
	}
}

// function deepClone(map) {
// 	if(!map || true == map) {//this also handles boolean as true and false
// 		return map;
// 	}
//
// 	const mapType = typeof(map);
//
// 	if ("number" == mapType || "string" == mapType) return map;
//
// 	const result = Array.isArray(map) ? [] : !map.constructor ? {} : new map.constructor();
//
// 	if(map instanceof Map) {
// 		for(const key of map.keys()) {
// 			result.set(key, deepClone(map.get(key)));
// 		}
// 	}
//
// 	for(const key in map) {
// 		if(map.hasOwnProperty(key)) {
// 			result[key] = deepClone(	map[key]);
// 		}
// 	}
//
// 	return result;
// }

function setAddUsersInDB(array, nameTable, action) {
	$.ajax({
		url: "./php/change-user-request.php",
		method: "post",
		dataType: "html",
		data: {
			action: action,
			nameTable: nameTable,
			array: array
		},
		success: () => {
			service.modal('success');
		},
		error: () => {
			service.modal('error');
		}
	});
}

function getData() {
	const data = {
		"PasswordHash":"88020F057FE7287D8D57494382356F97",
		"UserName":"admin"
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
		"Language":"ua",
		"UserSID":UserSID,
		"ResultTokenRequired":true,
		"AccessGroupInherited":true,
		"AccessGroupToken":UserToken,
		"AdditionalFields":[{
			"Name":"",
			"Value":""
		}],
		"AdditionalFieldsChanged":true,
		"FieldGroupToken":UserToken,
		"Name":"Временная карта",
		"NewCards":[{
			"AntipassbackDisabled":true,
			"Code":"",
			"ConfirmationUrl":"",
			"Disalarm":true,
			"Email":"",
			"EmailRequestCode":"",
			"IdentifierType":2147483647,
			"Name":"",
			"PIN":"",
			"Security":true,
			"Status":2147483647,
			"Token":UserToken,
			"VIP":true,
			"ValidTo":"\/Date(928135200000+0300)\/",
			"ValidToUsed":true
		}],
		"OwnAccessRulesChanged":true,
		"Token":UserToken,
		"WorktimeInherited":true,
		"CardCodes":[""],
		"CardTokens":[UserToken],
		"CardsChanged":true,
		"DepartmentToken":UserToken,
		"EmployeeNumber":"",
		"NewBiometricIdentifiers":[{
			"BiometricIndex":2147483647,
			"BiometricType":"",
			"Data":"",
			"Quality":2147483647
		}],
		"PhotoBase64":"",
		"PhotoChanged":true,
		"PhotoFileExt":"",
		"Post":"",
		"OwnAccessRules":[{
			"DoorToken":UserToken,
			"PassCounter":2147483647,
			"ScheduleToken":UserToken
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
