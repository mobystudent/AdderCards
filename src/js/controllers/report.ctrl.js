'use strict';

import $ from 'jquery';
import datepickerFactory from 'jquery-datepicker';
import datepickerRUFactory from 'jquery-datepicker/i18n/jquery.ui.datepicker-ru';
import service from '../service.js';
import { settingsObject } from './settings.ctrl.js';

import { table } from '../components/report/table.tpl.js';
import { headerTable } from '../components/report/header-table.tpl.js';
import { form } from '../components/report/form.tpl.js';
import { switchElem } from '../components/switch.tpl.js';
import { count } from '../components/count.tpl.js';
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
	getDataFromDB('report'); // 1
});

function renderHeaderPage(page = 'report') {
	$(`.main[data-name=${page}] .main__title-wrap`).html('');
	$(`.main[data-name=${page}] .container`).prepend(pageTitle(reportObject));
}

function renderTable() {
	if (!reportCollection.size) {
		return `<p class="table__nothing">Новых данных нет</p>`;
	} else {
		return [...reportCollection.values()].reduce((content, item) => {
			content += table(item);

			return content;
		}, '');
	}
}

function renderSwitch() {
	return Object.values(reportSwitch).reduce((content, item) => {
		let switchText;
		let tooltip;

		if (item.type === 'refresh') {
			switchText = 'Автообновление';
			tooltip = 'Если данная опция включена, тогда при поступлении новых данных, они автоматически отобразятся в таблице. Перезагружать страницу не нужно.<br/> Рекомендуется отключить данную функцию при работе с данными в таблице!';
		}

		const switchItem = {
			switchText,
			tooltip,
			key: item
		};

		content += switchElem(switchItem);

		return content;
	}, '');
}

function renderCount() {
	return Object.values(reportCount).reduce((content, item) => {
		content += count(item);

		return content;
	}, '');
}

function render(page = 'report') {
	$(`.container--${page} .wrap--content`).html('');
	$(`.container--${page} .wrap--content`).append(`
		<form class="form form--filter" action="#" method="GET">${renderForm()}</form>
		<div class="main__wrap-info">
			<div class="main__cards">${renderCount()}</div>
			<div class="main__switchies">${renderSwitch()}</div>
		</div>
		<div class="wrap wrap--table">
			<div class="table">
				<header class="table__header">${headerTable()}</header>
				<div class="table__body">${renderTable()}</div>
			</div>
		</div>
	`);

	autoRefresh();
	resetFilters();
	toggleSelect();
	datepicker();
}

function renderForm() {
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

	const stateForm = filters.reduce((contentObj, { select, array }) => {
		contentObj[select] = array.reduce((content, item) => {
			content += filter({ select, item });

			return content;
		}, '');

		return contentObj;
	}, {});

	return form(reportObject, stateForm);
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
	render();
}

function toggleSelect(page = 'report') {
	$(`.container--${page} .select__header`).click(({ currentTarget }) => {
		$(currentTarget).next().slideToggle().toggleClass('select__header--active');
	});

	clickSelectItem();
}

function clickSelectItem(page = 'report') {
	$(`.container--${page} .select__item`).click(({ currentTarget }) => {
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

	filterUsersFromDB();
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

		filterUsersFromDB();
	});
}

function autoRefresh(page = 'report') {
	const timeReload = 60000 * settingsObject.autoupdatevalue;

	$(`.container--${page} .switch--refresh`).click(({ target }) => {
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

		clearFieldsForm();
	});
}

function resetFilters(page = 'report') {
	$(`.container--${page} .btn--cancel`).click(() => {
		clearFieldsForm();
	});
}

function clearFieldsForm() {
	for (const key in reportObject) {
		if (key === 'filters') {
			reportObject[key] = {};
		} else {
			if (key !== 'nameid' && key !== 'longname') {
				reportObject[key] = '';
			}
		}
	}

	render();
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
	const statusUsers = [...filterCollection.values()].map(({ statusid, statustitle }) => [statusid, statustitle]);
	const filterStatus = [];

	statusUsers.forEach(([statusid, statustitle]) => {
		if (!filterStatus.map(({ statusid }) => statusid).includes(statusid)) {
			filterStatus.push({ title: statustitle, statusid: statusid });
		}
	});

	return filterStatus;
}

export default {

};
