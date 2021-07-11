'use strict';

import $ from 'jquery';
import convert from './convert.js';

const constFillOutCardCollection = new Set(); // БД постоянных карт с присвоеными id
const constReportCollection = new Set(); // БД постоянных карт с присвоеными id для отчета

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
	$('#submitConstCard').click(() => {
		const itemUsers = $('#tableConst .table__content--active').find('.table__row');
		const valueFields = [...itemUsers].map((row) => {
			const cells = $(row).find('.table__cell');
			const cellInfo = [...cells].filter((cell) => $(cell).attr('data-info'));
			const valueField = cellInfo.reduce((acc, cell) => {
				const name = $(cell).attr('data-name');
				const value = $(cell).attr('data-value');

				acc[name] = value;

				return acc;
			}, {});
			valueField.department = $('.main__depart--const').data('depart');

			constFillOutCardCollection.add(valueField);

			return valueField;
		});

		valueFields.forEach((elem) => {
			const objectWithDate = {};

			for (let key in elem) {
				objectWithDate[key] = elem[key];
			}
			objectWithDate.date = getCurrentDate();
			objectWithDate.department = $('.main__depart--const').data('depart');

			constReportCollection.add(objectWithDate);
		});

		console.warn(constFillOutCardCollection); // пойдет в БД
		console.warn(constReportCollection); // пойдет в отчет
		createObjectForBD();
		// constFillOutCardCollection.clear();
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

function getCurrentDate() {
	const date = new Date();
	const currentDay = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
	const currentMonth = date.getMonth() < 10 ? `0${date.getMonth()}` : date.getMonth();
	const currentYear = date.getFullYear() < 10 ? `0${date.getFullYear()}` : date.getFullYear();

	return `${currentDay}-${currentMonth}-${currentYear}`;
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
	const allItems = $('#tableConst .table__content--active .table__row');
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
	clearNumberCard,
	convertCardIDInCardName,
	submitIDinBD
};
