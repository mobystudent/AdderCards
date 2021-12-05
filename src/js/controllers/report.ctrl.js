'use strict';

import $ from 'jquery';
import datepickerFactory from 'jquery-datepicker';
import datepickerRUFactory from 'jquery-datepicker/i18n/jquery.ui.datepicker-ru';
import service from '../service.js';
import { settingsObject } from './settings.ctrl.js';

import { table } from '../components/report/table.tpl.js';
import { form } from '../components/report/form.tpl.js';
import { switchElem } from '../components/report/switch.tpl.js';
import { count } from '../components/report/count.tpl.js';
import { filter } from '../components/report/filter.tpl.js';
import { pageTitle } from '../components/page-title.tpl.js';

datepickerFactory($);
datepickerRUFactory($);

const reportCollection = new Map(); // БД отчета
const filterCollection = new Map(); // БД для вывода значений в фильтры
const reportObject = {
	page: 'Отчёт по изменениям',
	posttitle: '',
	datetitle: '',
	statusid: '',
	statustitle: '',
	filters: {},
	get nameid() {
		return settingsObject.nameid;
	},
	get longname() {
		return settingsObject.longname;
	}
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
	renderHeaderPage();
	toggleSelect();
	getDataFromDB('report'); // 1
	renderFilter(); // 2
	datepicker();
	renderSwitch();
});

function renderHeaderPage(page = 'report') {
	$(`.main[data-name=${page}] .main__title-wrap`).html('');
	$(`.main[data-name=${page}] .container`).prepend(pageTitle(reportObject));
}

function renderTable(nameTable = '#tableReport') {
	$(`${nameTable} .table__content`).html('');

	reportCollection.forEach((item) => {
		$(`${nameTable} .table__content`).append(table(item));
	});

	renderCount();
}

function renderForm(nameForm = '#reportForm') {
	$(`${nameForm} .form__wrap`).html('');
	$(`${nameForm} .form__wrap`).append(form(reportObject));

	filterUsersFromDB();
	renderFilter();
	resetFilters();
	toggleSelect();
	datepicker();
}

function renderSwitch(page = 'report') {
	$(`.main__wrap-info--${page} .main__switchies`).html('');
	for (let key in reportSwitch) {
		$(`.main__wrap-info--${page} .main__switchies`).append(switchElem(reportSwitch[key]));
	}

	autoRefresh();
}

function renderCount(page = 'report') {
	$(`.main__wrap-info--${page} .main__cards`).html('');
	for (let key in reportCount) {
		$(`.main__wrap-info--${page} .main__cards`).append(count(reportCount[key]));
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
			$(`${nameForm} .select[data-select=${select}] .select__list`).append(filter({ select, item }));
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
