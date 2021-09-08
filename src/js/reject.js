'use strict';

import $ from 'jquery';
import service from './service.js';

const rejectCollection = new Map(); // БД отклоненных пользователей

$(window).on('load', () => {
	getDatainDB('reject');

	service.scrollbar();
});

function templateRejectTable(data) {
	const { id = '', fio = '', post = '', statustitle = '', date = '' } = data;

	return `
		<div class="table__row table__row--permis" data-id="${id}">
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
			<div class="table__cell table__cell--body table__cell--btn-choice">
				<button class="btn btn--choice" id="choice" type="button">Выбрать</button>
			</div>
		</div>
	`;
}

function renderTable(nameTable = '#tableReject') {
	$(`${nameTable} .table__content`).html('');

	rejectCollection.forEach((item) => {
		$(`${nameTable} .table__content`).append(templateRejectTable(item));
	});
}

function userdFromDB(array, nameTable = '#tableReject') {
	const objToCollection = {
		id: '',
		fio: '',
		post: '',
		statusid: '',
		statustitle: '',
		department: '',
		date: ''
	};

	array.forEach((elem, i) => {
		const itemObject = Object.assign({}, objToCollection);

		for (const itemField in itemObject) {
			for (const key in elem) {
				if (itemField === key) {
					itemObject[itemField] = elem[key];
				} else if (itemField === 'id') {
					itemObject[itemField] = i;
				}
			}
		}

		rejectCollection.set(i, itemObject);
	});

	dataAdd(nameTable);
}

function dataAdd(nameTable, page = 'reject') {
	if (rejectCollection.size) {
		emptySign(nameTable, 'full');
	} else {
		emptySign(nameTable, 'empty');

		return;
	}

	renderTable();
	$(`.main__count--${page}`).text(rejectCollection.size);
}

function emptySign(nameTable, status) {
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

function getDatainDB(nameTable, page = 'reject') {
	const idDepart = $(`.main__depart--${page}`).attr('data-id');

	$.ajax({
		url: "./php/output-request.php",
		method: "post",
		dataType: "html",
		data: {
			idDepart: idDepart,
			nameTable: nameTable
		},
		async: false,
		success: function(data) {
			const dataFromDB = JSON.parse(data);

			userdFromDB(dataFromDB);
		},
		error: function() {
			service.modal('download');
		}
	});
}

export default {

};
