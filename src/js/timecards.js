'use strict';

import $ from 'jquery';
import convert from './convert.js';

const timeCollection = new Map(); // БД в которую будут добавляться карты при вводе и из неё будут выводиться данные в таблицу.
let timeFillOutCollection; // БД временных карт с присвоеными id, которая пойдет в БД
let timeReportCollection; // БД временных карт с присвоеными id для отчета

$(window).on('load', () => {
	countItems('#tableTime .table__content', 'time');

	addTimeCard();
	deleteTimeCard();
	clearNumberCard();
	submitIDinBD();
	convertCardIDInCardName();

	timeCollection.set(1, {
		id: 1,
		fio: 'Временная карта',
		cardid: '',
		cardname: ''
	});

	timeCollection.forEach((elem) => {
		$('#tableTime .table__content').append(templateTimeTable(elem));
	});
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
					<svg class="icon icon--clear">
						<use class="icon__item" xlink:href="#clear"></use>
					</svg>
				</button>
			</div>
			<div class="table__cell table__cell--body table__cell--delete">
				<button class="table__btn table__btn--delete" type="button">
					<svg class="icon icon--delete">
						<use class="icon__item" xlink:href="#delete"></use>
					</svg>
				</button>
			</div>
		</div>
	`;
}

function renderTable() {
	$('#tableTime .table__content').html('');

	timeCollection.forEach((item) => {
		$('#tableTime .table__content').append(templateTimeTable(item));
	});
}

function addTimeCard() {
	$('#addTimeCard').click(() => {
		const countIdInCollection = timeCollection.size + 1;

		timeCollection.set(countIdInCollection, {
			id: countIdInCollection,
			fio: 'Временная карта',
			cardid: '',
			cardname: ''
		});

		renderTable();

		countItems('#tableTime .table__content', 'time');
	});
}

function deleteTimeCard() {
	$('.table__content').click((e) => {
		if ($(e.target).parents('.table__btn--delete').length || $(e.target).hasClass('table__btn--delete')) {
			const countItems = timeCollection.size;

			blockLastCard(countItems, e.target);
		}

		countItems('#tableTime .table__content', 'time');
	});
}

function blockLastCard(countItems, item) {
	if (countItems === 1) {
		$('.main[data-name="time"]').find('.info__item--last').show();

		setTimeout(() => {
			$('.main[data-name="time"]').find('.info__item--last').hide();
		}, 5000);

		return false;
	} else {
		const idRemove = $(item).closest('.table__row').data('id');

		timeCollection.delete(idRemove);

		renderTable();
	}
}

function clearNumberCard() {
	$('.table__content').click((e) => {
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

function convertCardIDInCardName() {
	$('.table__content').click((e) => {
		if (!$(e.target).hasClass('table__input')) return;

		$('.table__input').on('input', (e) => {
			const cardIdVal = $(e.target).val().trim();
			const convertNumCard = convert.convertCardId(cardIdVal);

			if (!convertNumCard) {
				$(e.target).parents('.main').find('.info__item--error').show();

				return;
			}

			const idAdd = $(e.target).closest('.table__row').data('id');

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

			$('.main[data-name="time"]').find('.info__item--warn.info__item--fields')[statusMess]();
		}
	});

	return statusFields;
}

function checkInvalidValueCardID(idItem) {
	const valuesCardid = timeCollection.get(idItem).cardid;
	const convertNumCard = convert.convertCardId(valuesCardid);

	if (convertNumCard) $('.main[data-name="time"]').find('.info__item--error').hide();
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

		timeReportCollection.forEach((item) => {
			item.date = getCurrentDate();
		});

		setDatainDB([...timeReportCollection.values()]);
		createObjectForBD();
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
		EmployeeNumber: 1,
		Post: ''
	};
	const fillOutObjectInBD = [...timeFillOutCollection].map((elem) => {
		const itemObject = Object.assign({}, object);

		for (const itemField in itemObject) {
			for (const item of elem) {
				for (const key in item) {
					if (itemField.toLocaleLowerCase() == key) {
						itemObject[itemField] = item[key];
					}
				}
			}
		}

		return itemObject;
	});

	console.log(fillOutObjectInBD);
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

function countItems(tableContent, modDepart) {
	const countItemfromDep = $(tableContent).eq(0).find('.table__row').length;

	$(`.main__count--${modDepart}`).text(countItemfromDep);
}

function setDatainDB(array) {
	$.ajax({
		url: "./php/report-add.php",
		method: "post",
		dataType: "html",
		data: {
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

export default {
	addTimeCard,
	deleteTimeCard,
	clearNumberCard,
	templateTimeTable,
	submitIDinBD
};
