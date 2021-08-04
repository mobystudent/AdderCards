'use strict';

import $ from 'jquery';

const reportCollection = new Map(); // БД отчета

$(window).on('load', () => {
	getDatainDB();
});

function getDatainDB() {
	$.ajax({
		url: "./php/report-output.php",
		method: "post",
		success: function(data) {
			const dataFromDB = JSON.parse(data);

			dataFromDB.forEach((item, i) => {
				reportCollection.set(i, item);
			});

			dataAdd('#tableReport');
		},
		error: function(data) {
			console.log(data);
		}
	});
}

function templateReportTable(data) {
	const { id = '', fio = '', post = '', department = '', cardname = '', statustitle = '', date = '' } = data;

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
			<div class="table__cell table__cell--body table__cell--cardname">
				<span class="table__text table__text--body">${cardname}</span>
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

function renderTable() {
	$('#tableReport .table__content').html('');

	reportCollection.forEach((item) => {
		$('#tableReport .table__content').append(templateReportTable(item));
	});
}

function dataAdd(nameTable) {
	if (reportCollection.size) {
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

export default {

};
