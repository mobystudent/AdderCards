'use strict';

import $ from 'jquery';
import service from './service.js';

const requestCollection = new Map(); // БД отчета

$(window).on('load', () => {
	getDatainDB('request');
	autoRefresh();
});

function templateRequestTable(data) {
	const { id = '', fio = '', post = '', department = '', statustitle = '', date = '' } = data;

	return `
		<div class="table__row" data-id="${id}">
			<div class="table__cell table__cell--body table__cell--fio">
				<span class="table__text table__text--body">${fio}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--post">
				<span class="table__text table__text--body">${post}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--department">
				<span class="table__text table__text--body">${department}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--statustitle">
				<span class="table__text table__text--body">${statustitle}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--date">
				<span class="table__text table__text--body">${date}</span>
			</div>
		</div>
	`;
}

function renderTable(nameTable = '#tableRequest') {
	$(`${nameTable} .table__content`).html('');

	requestCollection.forEach((item) => {
		$(`${nameTable} .table__content`).append(templateRequestTable(item));
	});
}

function userFromDB(array, nameTable = '#tableRequest') {
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

		requestCollection.set(i, itemObject);
	});

	dataAdd(nameTable);
}

function dataAdd(nameTable, page = 'request') {
	if (requestCollection.size) {
		emptySign(nameTable, 'full');
	} else {
		emptySign(nameTable, 'empty');

		return;
	}

	renderTable();

	$(`.main__count--${page}`).text(requestCollection.size);
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

function autoRefresh(page = 'permis') {
	const timeReload = 15000 * 15;  //  15 минут
	let markInterval;

	$(`.switch--${page}`).click(() => {
		const statusSwitch = $('.switch__input').prop('checked');

		if (statusSwitch && !markInterval) {
			getDatainDB('permission');

			markInterval = setInterval(() => {
				getDatainDB('permission');
			}, timeReload);
		} else {
			clearInterval(markInterval);

			markInterval = false;
		}
	});
}

function getDatainDB(nameTable, page = 'request') {
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
		success: (data) => {
			const dataFromDB = JSON.parse(data);

			userFromDB(dataFromDB);
		},
		error: () => {
			service.modal('download');
		}
	});
}

export default {

};
