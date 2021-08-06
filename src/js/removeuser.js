'use strict';

import $ from 'jquery';
import datepickerFactory from 'jquery-datepicker';
import datepickerRUFactory from 'jquery-datepicker/i18n/jquery.ui.datepicker-ru';
import { nameDeparts } from './nameDepart.js';
import service from './service.js';

datepickerFactory($);
datepickerRUFactory($);

const removeCollection = new Map();

$(window).on('load', () => {
	datepicker();
	setDepartInSelect();
	getAddUsersInDB();
});

function templateRemoveTable(data) {
	const { id = '', fio = '', post = '', statustitle = '', date  = '' } = data;

	return `
		<div class="table__row" data-id="${id}">
			<div class="table__cell table__cell--body table__cell--fio">
				<span class="table__text table__text--body">${fio}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--post">
				<span class="table__text table__text--body">${post}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--statustitle">
				<span class="table__text table__text--body">${statustitle}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--date">
				<span class="table__text table__text--body">${date}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--edit">
				<button class="table__btn table__btn--edit" type="button">
					<svg class="icon icon--edit">
						<use class="icon__item" xlink:href="./images/sprite.svg#edit"></use>
					</svg>
				</button>
			</div>
			<div class="table__cell table__cell--body table__cell--delete">
				<button class="table__btn table__btn--delete" type="button">
					<svg class="icon icon--delete">
						<use class="icon__item" xlink:href="./images/sprite.svg#delete"></use>
					</svg>
				</button>
			</div>
		</div>
	`;
}

function setDepartInSelect() {
	nameDeparts.forEach((depart) => {
		const { idName = '', longName = '' } = depart;

		$('.select[data-field="NewDepart"] .select__list').append(`
			<li class="select__item">
				<span class="select__name" data-title="${longName}" data-new-name-id="${idName}">${longName}</span>
			</li>
		`);
	});

	service.clickSelectItem();
}

function setUsersInSelect(users) {
	users.forEach((item) => {
		const { fio = '' } = item;

		$('.select[data-select="fio"]').find('.select__list').append(`
			<li class="select__item">
				<span class="select__name" data-title="${fio}">
					${fio}
				</span>
			</li>
		`);
	});

	service.clickSelectItem();
}

function datepicker() {
	$("#removeDateField").datepicker({
		changeMonth: true,
		changeYear: true,
		showOtherMonths: true,
		selectOtherMonths: true,
		minDate: "+1D",
		maxViewMode: 10
	});
}

function getAddUsersInDB() {
	const idDepart = $('.main__depart--remove').attr('data-id');

	$.ajax({
		url: "./php/remove-user-output.php",
		method: "post",
		dataType: "html",
		data: {
			nameid: idDepart
		},
		success: function(data) {
			setUsersInSelect(JSON.parse(data));
		},
		error: function(data) {
			console.log(data);
		}
	});
}

export default {
};
