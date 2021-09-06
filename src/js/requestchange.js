'use strict';

import $ from 'jquery';

const requestCollection = new Map(); // БД отчета

$(window).on('load', () => {
	getDatainDB('request');
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

function userdFromDB(array, nameTable = '#tableRequest') {
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

function dataAdd(nameTable) {
	if (requestCollection.size) {
		$(`${nameTable} .table__nothing`).hide();
		$(nameTable).append(`
			<div class="table__content table__content--active">
			</div>
		`);

		renderTable();
	} else {
		$(nameTable).addClass('table__body--empty').html('');
		$(nameTable).append(`
			<p class="table__nothing">Новых данных нет</p>
		`);

		return;
	}
}

function getDatainDB(nameTable) {
	// const idDepart = $(`.main__depart--${page}`).attr('data-id');
	const idDepart = 'chemdep';

	$.ajax({
		url: "./php/output-request.php",
		method: "post",
		data: {
			nameTable: nameTable,
			idDepart: idDepart
		},
		async: false,
		success: function(data) {
			const dataFromDB = JSON.parse(data);

			// dataFromDB.forEach((item, i) => {
			// 	requestCollection.set(i, item);
			// });

			// dataAdd('#tableRequest');
			userdFromDB(dataFromDB);
		},
		error: function(data) {
			console.log(data);
		}
	});
}

export default {

};
