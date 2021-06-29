'use strict';

import $ from 'jquery';
import { json } from './data.js';
import convert from './convert.js';

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
	$('.main__btn').click(() => {
		$('#tableTime .table__content').append(templateTimeTable());

		countItems('#tableTime .table__content', 'time');
		convert.viewConvertCardId();
	});
}

function deleteTimeCard() {
	$('.table__content').click((e) => {
		if ($(e.target).parents('.table__btn--delete').length || $(e.target).hasClass('table__btn--delete')) {

			const countItems = $(e.currentTarget).find('.table__row').length;

			if (countItems === 1) return;

			$(e.target).closest('.table__row').remove();
		}

		countItems('#tableTime .table__content', 'time');
	});
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

		// convert.checkValFieldsCardId(e.target);
	});
}

function stringifyJSON() {
	const strJson = JSON.stringify(json);

	return strJson;
}

function submitIDinBD() {
	$('#submitTimeCard').click((e) => {
		const dataArr = JSON.parse(stringifyJSON());
		const depart = Object.values(dataArr).map((item) => item);

		const itemUsers = $('#tableTime .table__content--active').find('.table__row');
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
			Post: '',
			NameID: '',
			StatusID: '',
			IDUser: '',
			TitleID: '',
			NewFIO: '',
			NewPost: '',
			NewDepart: ''
		};
		const valueFields = [...itemUsers].map((row) => {
			const cells = $(row).find('.table__cell');
			const cellInfo = [...cells].filter((cell) => $(cell).attr('data-info'));
			const valueField = cellInfo.map((cell) => {
				const name = $(cell).attr('data-name');
				const value = $(cell).attr('data-value');

				return {[name]: value};
			});

			return valueField;
		});
		const fillObject = valueFields.map((elem, i) => {
			for (const itemField in object) {
				for (const key in elem[i]) {
					if (itemField.toLocaleLowerCase() == key) {
						console.log(key);
						object[itemField] = elem[i][key];
					}
				}
			}

			return object;
		});

		console.log(fillObject);
	});
}

function countItems(tableContent, modDepart) {
	const countItemfromDep = $(tableContent).eq(0).find('.table__row').length;

	$(`.main__count--${modDepart}`).text(countItemfromDep);
}

export default {
	addTimeCard,
	deleteTimeCard,
	clearNumberCard,
	templateTimeTable,
	submitIDinBD
};
