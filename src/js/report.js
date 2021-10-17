'use strict';

import $ from 'jquery';
import service from './service.js';
import settingsObject from './settings.js';

const reportCollection = new Map(); // БД отчета

$(window).on('load', () => {
	renderHeaderPage();
	autoRefresh();
	getDataFromDB('report');
});

function templateReportTable(data) {
	const { id = '', fio = '', post = '', cardname = '', statustitle = '', date = '' } = data;

	return `
		<div class="table__row" data-id="${id}">
			<div class="table__cell table__cell--body table__cell--fio">
				<span class="table__text table__text--body">${fio}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--post">
				<span class="table__text table__text--body">${post}</span>
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

function templateHeaderPage(page = 'report') {
	const { nameid = '', longname = '' } = settingsObject;

	return `
		<h1 class="main__title">Отчёт по изменениям</h1>
		<span class="main__depart main__depart--${page}" data-depart="${longname}" data-id="${nameid}">${longname}</span>
	`;
}

function renderTable(nameTable = '#tableReport') {
	$(`${nameTable} .table__content`).html('');

	reportCollection.forEach((item) => {
		$(`${nameTable} .table__content`).append(templateReportTable(item));
	});
}

function renderHeaderPage(page = 'report') {
	$(`.main[data-name=${page}] .main__title-wrap`).html('');
	$(`.main[data-name=${page}] .main__title-wrap`).append(templateHeaderPage());
}

function userFromDB(array) {
	array.forEach((item, i) => {
		reportCollection.set(i, item);
	});

	dataAdd();
}

function dataAdd() {
	if (reportCollection.size) {
		emptySign('full');
	} else {
		emptySign('empty');

		return;
	}

	viewAllCount();
	renderTable();
}

function emptySign(status, nameTable = '#tableReport') {
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

function autoRefresh(page = 'report') {
	const timeReload = 60000 * settingsObject.autoupdatevalue;
	let markInterval;

	$(`.switch--${page}`).click((e) => {
		const statusSwitch = $(e.currentTarget).find('.switch__input').prop('checked');

		if (statusSwitch && !markInterval) {
			getDataFromDB('report');

			markInterval = setInterval(() => {
				getDataFromDB('report');
			}, timeReload);
		} else if (!statusSwitch && markInterval) {
			clearInterval(markInterval);

			markInterval = false;
		}
	});
}

// Общие функции с картами и кодами
function viewAllCount(page = 'report') {
	$(`.main__count--all-${page}`).text(reportCollection.size);
}

function getDataFromDB(nameTable) {
	$.ajax({
		url: "./php/output-request.php",
		method: "post",
		dataType: "html",
		data: {
			idDepart: settingsObject.nameid,
			nameTable
		},
		async: false,
		success: (data) => {
			const dataFromDB = JSON.parse(data);

			userFromDB(dataFromDB);
		},
		error: ()  => {
			service.modal('download');
		}
	});
}

export default {

};
