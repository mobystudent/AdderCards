'use strict';

import $ from 'jquery';
import convert from './convert.js';
import service from './service.js';
import renderheader from './parts/renderheader.js';

const timeCollection = new Map(); // БД в которую будут добавляться карты при вводе и из неё будут выводиться данные в таблицу.
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
	const options = {
		page: 'time',
		header: {}
	};

	renderheader.renderHeaderPage(options);
	submitIDinBD();
	addTimeCard();
	showDataFromStorage();
});

function templateTimeTable(data) {
	const { id = '', cardid = '', cardname = '' } = data;
	const typeIDField = cardid ? `
		<span class="table__text table__text--body">${cardid}</span>
	` : `
		<input class="table__input" />
	`;

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

function templateTimeCount(data) {
	const { title, count } = data;

	return `
		<p class="main__count-wrap">
			<span class="main__count-text">${title}</span>
			<span class="main__count">${count}</span>
		</p>
	`;
}

function renderTable(nameTable = '#tableTime') {
	$(`${nameTable} .table__content`).html('');

	timeCollection.forEach((item) => {
		$(`${nameTable} .table__content`).append(templateTimeTable(item));
	});
}

function renderCount(page = 'time') {
	$(`.main__wrap-info--${page} .main__cards`).html('');
	for (let key in timeCount) {
		$(`.main__wrap-info--${page} .main__cards`).append(templateTimeCount(timeCount[key]));
	}
}

function itemUserInTable(id) {
	const idUser = id ? id : 0;

	timeCollection.set(idUser, {
		id: idUser,
		cardid: '',
		cardname: ''
	});

	dataAdd();

	counter++;
}

function addTimeCard() {
	$('#addTimeCard').click(() => {
		itemUserInTable(counter);
	});
}

function dataAdd() {
	renderCount();
	renderTable();
	deleteTimeCard();
	convertCardIDInCardName();
	clearNumberCard();
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
		itemUserInTable();
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
			itemUserInTable();

			localStorage.removeItem(page);
			counter = 0;
		} else {
			$('.info__item--warn.info__item--fields').show();
		}
	});
}

function clearNumberCard(nameTable = '#tableTime') {
	$(`${nameTable} .table__content`).click(({ target }) => {
		if ($(target).parents('.table__btn--clear').length || $(target).hasClass('table__btn--clear')) {
			const userID = $(target).parents('.table__row').data('id');
			let collectionID;

			[...timeCollection].forEach(([ key, { id } ]) => {
				if (userID === +id) {
					collectionID = key;
				}
			});

			setDataInTable(collectionID);
		}
	});
}

function deleteTimeCard(nameTable = '#tableTime', page = 'time') {
	$(`${nameTable} .table__content`).click(({ target }) => {
		if ($(target).parents('.table__btn--delete').length || $(target).hasClass('table__btn--delete')) {
			const userID = $(target).closest('.table__row').data('id');
			let collectionID;

			[...timeCollection].forEach(([ key, { id } ]) => {
				if (userID === +id) {
					collectionID = key;
				}
			});

			blockLastCard(collectionID);

			if (timeCollection.size === 1) {
				localStorage.removeItem(page);
			}
		}
	});
}

function blockLastCard(idRemove, page = 'time') {
	if (timeCollection.size === 1) {
		$(`.main[data-name="${page}"]`).find('.info__item--last').show();

		setTimeout(() => {
			$(`.main[data-name="${page}"]`).find('.info__item--last').hide();
		}, 5000);

		return;
	} else {
		timeCollection.delete(idRemove);

		renderTable();
		renderCount();
		setDataInStorage();
	}
}

function convertCardIDInCardName(nameTable = '#tableTime') {
	$(`${nameTable} .table__content`).click(({ target }) => {
		if (!$(target).hasClass('table__input')) return;

		$('.table__input').on('input', ({ target }) => {
			const cardIdVal = $(target).val().trim();
			const convertNumCard = convert.convertCardId(cardIdVal);
			const userID = $(target).parents('.table__row').data('id');
			const cardObj = {
				cardid: cardIdVal,
				cardname: convertNumCard
			};
			let collectionID;

			if (!convertNumCard) {
				$(target).parents('.main').find('.info__item--error').show();

				return;
			}

			[...timeCollection].forEach(([ key, { id } ]) => {
				if (userID === +id) {
					collectionID = key;
				}
			});

			setDataInTable(collectionID, cardObj);
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

	renderTable();
}

function checkInvalidValueCardID(page = 'time') {
	const checkValueCard = [...timeCollection.values()].every(({ cardid }) => {
		if(cardid) convert.convertCardId(cardid);
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
