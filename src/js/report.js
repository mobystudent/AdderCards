'use strict';

import $ from 'jquery';
import datepickerFactory from 'jquery-datepicker';
import datepickerRUFactory from 'jquery-datepicker/i18n/jquery.ui.datepicker-ru';
import service from './service.js';
import { settingsObject } from './settings.js';
import renderheader from './parts/renderheader.js';

datepickerFactory($);
datepickerRUFactory($);

const reportCollection = new Map(); // БД отчета
const filterCollection = new Map(); // БД для вывода значений в фильтры
const reportObject = {
	posttitle: '',
	datetitle: '',
	statusid: '',
	statustitle: '',
	filters: {}
};
const reportSwitch = {
	refresh: {
		type: 'refresh',
		status: false,
		marker: 0
	}
};
const reportCount = {
	item: {
		title: 'Количество пользователей:&nbsp',
		get count() {
			return reportCollection.size;
		}
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
	toggleSelect();
	getDataFromDB('report'); // 1
	renderFilter(); // 2
	datepicker();
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

function templateReportForm() {
	const { posttitle = '', datetitle = '', statusid = '', statustitle = '' } = reportObject;
	const postValue = posttitle ? posttitle : 'Выберите должность';
	const postClassView = posttitle ? 'select__value--selected-form' : '';
	const statusValue = statustitle ? statustitle : 'Выберите статус';
	const statusClassView = statustitle ? 'select__value--selected-form' : '';
	const filterDiffClassView = datetitle || posttitle || statusid ? '' : 'btn--cancel-disabled';
	const filterBtnBlock = datetitle || posttitle || statusid ? '' : 'disabled="disabled"';

	return `
		<div class="form__fields form__fields--filter">
			<div class="form__field form__field--filter">
				<span class="form__name form__name--form">Фильтровать по должности</span>
				<div class="select" data-select="post">
					<header class="select__header select__header--form">
						<span class="select__value select__value--form ${postClassView}" data-title="${postValue}" data-type="${posttitle}">${postValue}</span>
					</header>
					<ul class="select__list select__list--form"></ul>
				</div>
			</div>
			<div class="form__field form__field--filter">
				<span class="form__name form__name--form">Фильтровать по статусу</span>
				<div class="select" data-select="statusid">
					<header class="select__header select__header--form">
						<span class="select__value select__value--form ${statusClassView}" data-title="${statusValue}" data-type="${statusid}">${statusValue}</span>
					</header>
					<ul class="select__list select__list--form"></ul>
				</div>
			</div>
			<div class="form__field form__field--filter">
				<label class="form__label">
					<span class="form__name form__name--form">Фильтровать по дате</span>
					<input class="form__item form__item--form" id="reportDatepicker" name="date" type="text" value="${datetitle}" placeholder="Выберите дату" readonly="readonly"/>
				</label>
			</div>
		</div>
		<button class="btn btn--cancel ${filterDiffClassView}" type="reset" ${filterBtnBlock}>Сбросить фильтры</button>
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

function templateReportCount(data) {
	const { title, count } = data;

	return `
		<p class="main__count-wrap">
			<span class="main__count-text">${title}</span>
			<span class="main__count">${count}</span>
		</p>
	`;
}

function templateFilter(data) {
	const { select, item: { title, statusid } } = data;
	const nameidType = statusid ? statusid : title;

	return `
		<li class="select__item">
			<span class="select__name select__name--form" data-title="${title}" data-${select}="${nameidType}">
				${title}
			</span>
		</li>
	`;
}

function renderTable(nameTable = '#tableReport') {
	$(`${nameTable} .table__content`).html('');

	reportCollection.forEach((item) => {
		$(`${nameTable} .table__content`).append(templateReportTable(item));
	});

	renderCount();
}

function renderForm(nameForm = '#reportForm') {
	$(`${nameForm} .form__wrap`).html('');
	$(`${nameForm} .form__wrap`).append(templateReportForm());

	filterUsersFromDB();
	renderFilter();
	resetFilters();
	toggleSelect();
	datepicker();
}

function renderSwitch(page = 'report') {
	$(`.main__wrap-info--${page} .main__switchies`).html('');
	for (let key in reportSwitch) {
		$(`.main__wrap-info--${page} .main__switchies`).append(templateReportSwitch(reportSwitch[key]));
	}

	autoRefresh();
}

function renderCount(page = 'report') {
	$(`.main__wrap-info--${page} .main__cards`).html('');
	for (let key in reportCount) {
		$(`.main__wrap-info--${page} .main__cards`).append(templateReportCount(reportCount[key]));
	}
}

function renderFilter(nameForm = '#reportForm') {
	const filters = [
		{
			select: 'post',
			array: filterPosts()
		},
		{
			select: 'statusid',
			array: filterStatus()
		}
	];

	$(`${nameForm} .select__list`).html('');
	filters.forEach(({ select, array }) => {
		array.forEach((item) => {
			$(`${nameForm} .select[data-select=${select}] .select__list`).append(templateFilter({ select, item }));
		});
	});

	clickSelectItem();
}

function userFromDB(array, filter = '') {
	if (filter) {
		array.forEach((item, i) => {
			reportCollection.set(i, item);
		});
	} else {
		array.forEach((item, i) => {
			reportCollection.set(i, item);
			filterCollection.set(i, item);
		});
	}

	dataAdd();
}

function dataAdd() {
	if (reportCollection.size) {
		emptySign('full');
	} else {
		emptySign('empty');

		return;
	}

	renderTable();
}

function toggleSelect(nameForm = '#reportForm') {
	$(`${nameForm} .select__header`).click(({ currentTarget }) => {
		$(currentTarget).next().slideToggle().toggleClass('select__header--active');
	});

	clickSelectItem();
}

function clickSelectItem(nameForm = '#reportForm') {
	$(`${nameForm} .select__item`).click(({ currentTarget }) => {
		const title = $(currentTarget).find('.select__name').data('title');
		const select = $(currentTarget).parents('.select').data('select');
		const statusid = $(currentTarget).find('.select__name').data(select);

		setDataAttrSelectedItem(title, select, statusid);
	});
}

function setDataAttrSelectedItem(title, select, statusid) {
	if (select === 'post') {
		reportObject.posttitle = title;
		reportObject.filters.post = statusid;
	} else {
		reportObject.statusid = statusid;
		reportObject.statustitle = title;
		reportObject.filters.statusid = statusid;
	}

	renderForm();
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

function datepicker() {
	$("#reportDatepicker").datepicker({
		changeMonth: true,
		changeYear: true,
		showOtherMonths: true,
		selectOtherMonths: true,
		maxDate: "0",
		maxViewMode: 10,
		dateFormat: 'dd-mm-yy'
	});

	$('#reportDatepicker').change(({ currentTarget }) => {
		const dateValue = $(currentTarget).val();
		reportObject.datetitle = dateValue;
		reportObject.filters.date = dateValue;

		renderForm();
	});
}

function autoRefresh(page = 'report') {
	const timeReload = 60000 * settingsObject.autoupdatevalue;

	$(`.switch--refresh-${page}`).click(({ target }) => {
		if (!$(target).hasClass('switch__input')) return;

		const statusSwitch = $(target).prop('checked');
		reportSwitch.refresh.status = statusSwitch;

		if (statusSwitch && !reportSwitch.refresh.marker) {
			localStorage.removeItem(page);
			reportCollection.clear();

			getDataFromDB('report');

			reportSwitch.refresh.marker = setInterval(() => {
				getDataFromDB('report');
			}, timeReload);
		} else if (!statusSwitch && reportSwitch.refresh.marker) {
			clearInterval(reportSwitch.refresh.marker);

			reportSwitch.refresh.marker = false;
		}

		renderSwitch();
		clearFieldsForm();
	});
}

function resetFilters(nameForm = '#reportForm') {
	$(`${nameForm} .btn--cancel`).click(() => {
		clearFieldsForm();
	});
}

function clearFieldsForm() {
	for (const key in reportObject) {
		if (key === 'filters') {
			reportObject[key] = {};
		} else {
			reportObject[key] = '';
		}
	}

	renderForm();
}

function filterUsersFromDB() {
	$.ajax({
		url: "./php/output-request.php",
		method: "post",
		dataType: "html",
		data: {
			nameDepart: settingsObject.nameid,
			nameTable: 'filter',
			options: reportObject.filters
		},
		async: false,
		success: (data) => {
			const dataFromDB = JSON.parse(data);

			reportCollection.clear();
			userFromDB(dataFromDB, 'filter');
		},
		error: () => {
			service.modal('download');
		}
	});
}

// Общие функции с картами и кодами
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
		error: () => {
			service.modal('download');
		}
	});
}

function filterPosts() {
	const postUsers = [...filterCollection.values()].map(({ post }) => post);
	const filterStatus = [];

	postUsers.forEach((post) => {
		if (!filterStatus.map(({ title }) => title).includes(post)) {
			filterStatus.push({ title: post });
		}
	});

	return filterStatus;
}

function filterStatus() {
	const statusUsers = [...filterCollection.values()].map(({ statusid, statustitle }) => [ statusid, statustitle ]);
	const filterStatus = [];

	statusUsers.forEach(([ statusid, statustitle ]) => {
		if (!filterStatus.map(({ statusid }) => statusid).includes(statusid)) {
			filterStatus.push({ title: statustitle, statusid: statusid });
		}
	});

	return filterStatus;
}

export default {

};
