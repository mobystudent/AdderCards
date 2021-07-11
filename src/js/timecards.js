'use strict';

import $ from 'jquery';
import convert from './convert.js';

const timeFillOutCardCollection = new Set(); // БД временных карт с присвоеными id
const timeReportCollection = new Set(); // БД временных карт с присвоеными id для отчета

function templateTimeTable() {
	return `
		<div class="table__row table__row--time">
			<div class="table__cell table__cell--body table__cell--fio" data-name="fio" data-info="true" data-value="Временная карта">
				<span class="table__text table__text--body">Временная карта</span>
			</div>
			<div class="table__cell table__cell--body table__cell--cardid" data-name="cardid" data-info="true" data-value="">
				<input class="table__input" />
			</div>
			<div class="table__cell table__cell--body table__cell--cardname" data-name="cardname" data-info="true" data-value="">
				<span class="table__text table__text--body"></span>
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

function addTimeCard() {
	$('#addTimeCard').click(() => {
		$('#tableTime .table__content').append(templateTimeTable());

		countItems('#tableTime .table__content', 'time');
	});
}

function deleteTimeCard() {
	$('.table__content').click((e) => {
		if ($(e.target).parents('.table__btn--delete').length || $(e.target).hasClass('table__btn--delete')) {

			const countItems = $(e.currentTarget).find('.table__row').length;

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
		$(item).closest('.table__row').remove();
	}
}

function clearNumberCard() {
	$('.table__content').click((e) => {
		if ($(e.target).parents('.table__btn--clear').length || $(e.target).hasClass('table__btn--clear')) {
			const cardsUser = $(e.target).parents('.table__row');

			cardsUser.find('.table__cell--cardid input').val('').removeAttr('readonly');
			cardsUser.find('.table__cell--cardid').attr('data-cardid', '');
			cardsUser.find('.table__cell--cardname span').text('');
			cardsUser.find('.table__cell--cardname').attr('data-cardname', '');
		}
	});
}

function submitIDinBD() {
	$('#submitTimeCard').click(() => {
		const itemUsers = $('#tableTime .table__content--active').find('.table__row');
		const valueFields = [...itemUsers].map((row) => {
			const cells = $(row).find('.table__cell');
			const cellInfo = [...cells].filter((cell) => $(cell).attr('data-info'));
			const valueField = cellInfo.reduce((acc, cell) => {
				const name = $(cell).attr('data-name');
				const value = $(cell).attr('data-value');

				acc[name] = value;

				return acc;
			}, {});

			timeFillOutCardCollection.add(valueField);

			return valueField;
		});

		valueFields.forEach((elem) => {
			const objectWithDate = {};

			for (let key in elem) {
				objectWithDate[key] = elem[key];
			}
			objectWithDate.date = getCurrentDate();

			timeReportCollection.add(objectWithDate);
		});

		console.warn(timeFillOutCardCollection);
		console.warn(timeReportCollection);
		createObjectForBD();
		timeFillOutCardCollection.clear();
	});


	// const fillOutArr = [];

	// $('#submitTimeCard').click(() => {
	// 	const itemUsers = $('#tableTime .table__content--active').find('.table__row');
	// 	const object = {
	// 		FIO: '',
	// 		Department: '',
	// 		FieldGroup: '',
	// 		Badge: '',
	// 		CardName: '',
	// 		CardID: '',
	// 		CardValidTo: '',
	// 		PIN: '',
	// 		CardStatus: 1,
	// 		Security: 0,
	// 		Disalarm: 0,
	// 		VIP: 0,
	// 		DayNightCLM: 0,
	// 		AntipassbackDisabled: 0,
	// 		PhotoFile: '',
	// 		EmployeeNumber: '',
	// 		Post: '',
	// 		NameID: '',
	// 		StatusID: '',
	// 		IDUser: '',
	// 		TitleID: '',
	// 		NewFIO: '',
	// 		NewPost: '',
	// 		NewDepart: '',
	// 		Data: '',
	// 		CodePicture: ''
	// 	};
	// 	const valueFields = [...itemUsers].map((row) => {
	// 		const cells = $(row).find('.table__cell');
	// 		const cellInfo = [...cells].filter((cell) => $(cell).attr('data-info'));
	// 		const valueField = cellInfo.map((cell) => {
	// 			const name = $(cell).attr('data-name');
	// 			const value = $(cell).attr('data-value');
	//
	// 			return {[name]: value};
	// 		});
	//
	// 		return valueField;
	// 	});
	// 	valueFields.forEach((elem) => {
	// 		const itemObject = Object.assign({}, object);
	//
	// 		for (const itemField in itemObject) {
	// 			for (const item of elem) {
	// 				for (const key in item) {
	// 					if (itemField.toLocaleLowerCase() == key) {
	// 						itemObject[itemField] = item[key];
	// 					} else if (itemField.toLocaleLowerCase() == 'data') {
	// 						itemObject[itemField] = getCurrentDate();
	// 					}
	// 				}
	// 			}
	// 		}
	//
	// 		fillOutArr.push(itemObject);
	// 	});
	//
	// 	console.log(fillOutArr);
	// });
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
	const fillOutObjectInBD = [...timeFillOutCardCollection].map((elem) => {
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

function getCurrentDate() {
	const date = new Date();
	const currentDay = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
	const currentMonth = date.getMonth() < 10 ? `0${date.getMonth()}` : date.getMonth();
	const currentYear = date.getFullYear() < 10 ? `0${date.getFullYear()}` : date.getFullYear();

	return `${currentDay}-${currentMonth}-${currentYear}`;
}

function countItems(tableContent, modDepart) {
	const countItemfromDep = $(tableContent).eq(0).find('.table__row').length;

	$(`.main__count--${modDepart}`).text(countItemfromDep);
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

			$(e.target).attr('readonly', 'readonly');
			$(e.target).parent().attr('data-value', cardIdVal);
			$(e.target).parents('.table__row').attr('data-card', true);
			$(e.target).parents('.table__row').find('.table__cell--cardname .table__text').text(convertNumCard);
			$(e.target).parents('.table__row').find('.table__cell--cardname').attr('data-value', convertNumCard);

			checkInvalidValueCardID(e.target);
			focusNext(e.target);
		});
	});
}

function checkInvalidValueCardID(item) {
	const allItems = $('#tableTime .table__content--active .table__row');
	const allValueItems = [...allItems].map((item) => {
		const itemValue = $(item).find('.table__cell--cardid .table__input').val().trim();

		return itemValue ? convert.convertCardId(itemValue) : '';
	});
	const checkValueCard = [...allValueItems].every((item) => item !== false);

	if (checkValueCard) $(item).parents('.main').find('.info__item--error').hide();
}

function focusNext(item) {
	const nextRow = $(item).parents('.table__row').next();

	if (nextRow) {
		$(nextRow).find('.table__input').focus();
	}
}

export default {
	addTimeCard,
	deleteTimeCard,
	clearNumberCard,
	templateTimeTable,
	convertCardIDInCardName,
	submitIDinBD
};
