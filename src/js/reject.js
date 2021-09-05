'use strict';

import $ from 'jquery';

const rejectCollection = new Map(); // БД отклоненных пользователей

$(window).on('load', () => {
	getDatainDB('reject');
});

function templateRejectTable(data) {
	const { id = '', fio = '', post = '', department = '', statustitle = '', date = '' } = data;

	return `
		<div class="table__row table__row--permis" data-id="${id}">
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

function renderTable(nameTable) {
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

function dataAdd(nameTable) {
	if (rejectCollection.size) {
		$('.table__nothing').hide();
		$(nameTable)
			.html('')
			.removeClass('table__body--empty')
			.append(`
				<div class="table__content table__content--active">
				</div>
			`);
	} else {
		$(nameTable).addClass('table__body--empty').html('');
		$(nameTable).append(`
			<p class="table__nothing">Новых данных нет</p>
		`);

		return;
	}

	renderTable(nameTable);
	$('.main__count--reject').text(rejectCollection.size);
}

function getDatainDB(nameTable) {
	// const idDepart = $(`.main__depart--${page}`).attr('data-id');
	const idDepart = 'chemdep';

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
			userdFromDB(JSON.parse(data));
		},
		error: function(data) {
			console.log(data);
		}
	});
}

export default {

};
