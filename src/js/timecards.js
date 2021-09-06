'use strict';

import $ from 'jquery';
import convert from './convert.js';

const timeCollection = new Map(); // БД в которую будут добавляться карты при вводе и из неё будут выводиться данные в таблицу.
let timeFillOutCollection; // БД временных карт с присвоеными id, которая пойдет в БД
let timeReportCollection; // БД временных карт с присвоеными id для отчета

$(window).on('load', () => {
	defaultValuesInTable();
	addTimeCard();
	deleteTimeCard();
	clearNumberCard();
	submitIDinBD();
	convertCardIDInCardName();
});

function templateTimeTable(data) {
	const { id = '', fio = '', cardid = '', cardname = '' } = data;
	let typeIDField = '';

	if (cardid) {
		typeIDField = `<span class="table__text table__text--body">${cardid}</span>`;
	} else {
		typeIDField = `<input class="table__input" />`;
	}

	return `
		<div class="table__row" data-id="${id}">
			<div class="table__cell table__cell--body table__cell--fio">
				<span class="table__text table__text--body">${fio}</span>
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

function defaultValuesInTable(nameTable = '#tableTime', page = 'time') {
	timeCollection.set(1, {
		id: 1,
		fio: 'Временная карта',
		cardid: '',
		cardname: ''
	});

	timeCollection.forEach((elem) => {
		$(`${nameTable} .table__content`).append(templateTimeTable(elem));
	});

	$(`.main__count--${page}`).text(timeCollection.size);
}

function addTimeCard(page = 'time') {
	$('#addTimeCard').click(() => {
		const countIdInCollection = timeCollection.size + 1;

		timeCollection.set(countIdInCollection, {
			id: countIdInCollection,
			fio: 'Временная карта',
			cardid: '',
			cardname: ''
		});

		renderTable();

		$(`.main__count--${page}`).text(timeCollection.size);
	});
}

function deleteTimeCard(page = 'time') {
	$('.table__content').click((e) => {
		if ($(e.target).parents('.table__btn--delete').length || $(e.target).hasClass('table__btn--delete')) {
			const countItems = timeCollection.size;

			blockLastCard(countItems, e.target);
		}

		$(`.main__count--${page}`).text(timeCollection.size);
	});
}

function blockLastCard(countItems, item, page = 'time') {
	if (countItems === 1) {
		$(`.main[data-name="${page}"]`).find('.info__item--last').show();

		setTimeout(() => {
			$(`.main[data-name="${page}"]`).find('.info__item--last').hide();
		}, 5000);

		return false;
	} else {
		const idRemove = $(item).closest('.table__row').data('id');

		timeCollection.delete(idRemove);

		renderTable();
	}
}

function clearNumberCard(nameTable = '#tableTime') {
	$(`${nameTable} .table__content`).click((e) => {
		if ($(e.target).parents('.table__btn--clear').length || $(e.target).hasClass('table__btn--clear')) {
			const idClear = $(e.target).closest('.table__row').data('id');
			const itemClear = timeCollection.get(idClear);

			if (itemClear) {
				itemClear.cardid = '';
				itemClear.cardname = '';
			}

			renderTable();
		}
	});
}

function convertCardIDInCardName(nameTable = '#tableTime') {
	$(`${nameTable} .table__content`).click((e) => {
		if (!$(e.target).hasClass('table__input')) return;

		$('.table__input').on('input', (e) => {
			console.log('Enter');
			const cardIdVal = $(e.target).val().trim();
			const convertNumCard = convert.convertCardId(cardIdVal);
			const idAdd = $(e.target).closest('.table__row').data('id');

			if (!convertNumCard) {
				$(e.target).parents('.main').find('.info__item--error').show();

				return;
			}

			timeCollection.set(idAdd, {
				id: idAdd,
				fio: 'Временная карта',
				cardid: cardIdVal,
				cardname: convertNumCard
			});

			renderTable();
			checkInvalidValueCardID(idAdd);
			// focusNext(idAdd);
		});
	});
}

function focusNext(idItem) {
	console.log(idItem);
	const nextRow = $('.table__row').eq(idItem).find('.table__input').focus();

	console.log(nextRow);

	// if (nextRow) {
	// 	$(nextRow).find('.table__input').focus();
	// }
}

function validationEmptyFields() {
	let statusFields = '';

	timeCollection.forEach((elem) => {
		for (const key in elem) {
			const statusMess = elem[key] == '' ? 'show' : 'hide';
			statusFields = elem[key] == '' ? false : true;

			$('.main[data-name="time"]').find('.info__item--cardid')[statusMess]();
		}
	});

	return statusFields;
}

function checkInvalidValueCardID(idItem, page = 'time') {
	const valuesCardid = timeCollection.get(idItem).cardid;
	const convertNumCard = convert.convertCardId(valuesCardid);

	if (convertNumCard) $(`.main[data-name="${page}"]`).find('.info__item--error').hide();
}

function deepClone(map) {
	if(!map || true == map) {//this also handles boolean as true and false
		return map;
	}

	const mapType = typeof(map);

	if ("number" == mapType || "string" == mapType) return map;

	const result = Array.isArray(map) ? [] : !map.constructor ? {} : new map.constructor();

	if(map instanceof Map) {
		for(const key of map.keys()) {
			result.set(key, deepClone(map.get(key)));
		}
	}

	for(const key in map) {
		if(map.hasOwnProperty(key)) {
			result[key] = deepClone(	map[key]);
		}
	}

	return result;
}

function submitIDinBD() {
	$('#submitTimeCard').click(() => {
		timeReportCollection = deepClone(timeCollection);
		timeFillOutCollection = deepClone(timeCollection);

		// createObjectForBD([...timeReportCollection.values()]);
		// createObjectForBD();
		getData();

		timeFillOutCollection.forEach((item) => {
			item.date = getCurrentDate();
		});

		setAddUsersInDB([...timeFillOutCollection.values()], 'timecard', 'report');
		const noEmpty = validationEmptyFields();

		if (!noEmpty) return;

		timeCollection.clear();
		timeCollection.set(1, {
			id: 1,
			fio: 'Временная карта',
			cardid: '',
			cardname: ''
		});

		renderTable();
	});
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

function getCurrentDate() {
	const date = new Date();
	const month = date.getMonth() + 1;
	const currentDay = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
	const currentMonth = month < 10 ? `0${month}` : month;
	const currentYear = date.getFullYear() < 10 ? `0${date.getFullYear()}` : date.getFullYear();

	const currentHour = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
	const currentMinute = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();

	return `${currentDay}-${currentMonth}-${currentYear} ${currentHour}:${currentMinute}`;
}

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
		success: function(data) {
			console.log('succsess '+data);
		},
		error: function(data) {
			console.log(data);
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

export default {

};
