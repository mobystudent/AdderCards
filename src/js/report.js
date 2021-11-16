'use strict';

import $ from 'jquery';
import service from './service.js';
import settingsObject from './settings.js';
import renderheader from './parts/renderheader.js';

const reportCollection = new Map(); // БД отчета
const reportSwitch = {
	refresh: {
		type: 'refresh',
		status: false
	}
};

$(window).on('load', () => {
	const options = {
		page: 'report',
		header: {
			longname: settingsObject.longname,
			nameid: settingsObject.nameid
		}
	};

	renderheader.renderHeaderPage(options);
	getDataFromDB('report');
	renderSwitch();
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

function templateReportSwitch(data, page = 'report') {
	const { type, status } = data;
	const assingBtnCheck = status ? 'checked="checked"' : '';
	const assingBtnClass = type === 'refresh' && !status ? 'switch__name--disabled' : '';
	let switchText;
	let tooltipInfo;

	if (type === 'refresh') {
		switchText = 'Автообновление';
		tooltipInfo = 'Если данная опция включена, тогда при поступлении новых данных, они автоматически отобразятся в таблице. Перезагружать страницу не нужно.<br/> Рекомендуется отключить данную функцию при работе с данными в таблице!';
	}

	return `
		<div class="main__switch">
			<div class="tooltip">
				<span class="tooltip__item">!</span>
				<div class="tooltip__info tooltip__info--${type}">${tooltipInfo}</div>
			</div>
			<div class="switch switch--${type}-${page}">
				<label class="switch__wrap switch__wrap--head">
					<input class="switch__input" type="checkbox" ${assingBtnCheck}/>
					<small class="switch__btn"></small>
				</label>
				<span class="switch__name ${assingBtnClass}">${switchText}</span>
			</div>
		</div>
	`;
}

function renderTable(nameTable = '#tableReport') {
	$(`${nameTable} .table__content`).html('');

	reportCollection.forEach((item) => {
		$(`${nameTable} .table__content`).append(templateReportTable(item));
	});
}

function renderSwitch(page = 'report') {
	$(`.main__wrap-info--${page} .main__switchies`).html('');
	for (let key in reportSwitch) {
		$(`.main__wrap-info--${page} .main__switchies`).append(templateReportSwitch(reportSwitch[key]));
	}

	autoRefresh();
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

	$(`.switch--refresh-${page}`).click(({ target }) => {
		if (!$(target).hasClass('switch__input')) return;

		const statusSwitch = $(target).prop('checked');
		reportSwitch.refresh.status = statusSwitch;

		if (statusSwitch && !markInterval) {
			localStorage.removeItem(page);

			getDataFromDB('report');

			markInterval = setInterval(() => {
				getDataFromDB('report');
			}, timeReload);
		} else if (!statusSwitch && markInterval) {
			clearInterval(markInterval);

			markInterval = false;
		}

		renderSwitch();
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
