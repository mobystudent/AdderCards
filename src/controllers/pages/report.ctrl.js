'use strict';

import $ from 'jquery';
import datepickerFactory from 'jquery-datepicker';
import datepickerRUFactory from 'jquery-datepicker/i18n/jquery.ui.datepicker-ru';
import service from '../../js/service.js';
import { settingsObject } from '../settings.ctrl.js';

import ReportModel from '../../models/pages/report.model.js';

datepickerFactory($);
datepickerRUFactory($);

class Report {
	constructor() {
		this.collection = new Map(); // БД отчета
		this.filterCollection = new Map(); // БД для вывода значений в фильтры
		this.object = {
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
		this.switch = {
			refresh: {
				type: 'refresh',
				status: false,
				marker: 0
			}
		};
		this.count = {
			item: {
				title: 'Количество пользователей:&nbsp',
				get count() {
					return this.collection.size;
				},
				set count({ collection }) {
					this.collection = collection;
				}
			}
		};

		this.count.item.count = {
			collection: this.collection
		};

		this.getDataFromDB('report');
	}

	render(page = 'report') {
		const reportModel = new ReportModel({
			object: this.object,
			collection: this.collection,
			switchItem: this.switch,
			count: this.count,
			filterArrs: {
				posts: this.filterPosts(),
				status: this.filterStatus()
			}
		});

		$(`.main[data-name=${page}]`).html('');
		$(`.main[data-name=${page}]`).append(reportModel.render());

		this.autoRefresh();
		this.resetFilters();
		this.toggleSelect();
		this.datepicker();
	}

	userFromDB(array, filter = '') {
		if (filter) {
			array.forEach((item, i) => {
				this.collection.set(i, item);
			});
		} else {
			array.forEach((item, i) => {
				this.collection.set(i, item);
				this.filterCollection.set(i, item);
			});
		}

		this.dataAdd();
	}

	dataAdd() {
		this.render();
	}

	toggleSelect(page = 'report') {
		$(`.main[data-name=${page}] .select__header`).click(({ currentTarget }) => {
			$(currentTarget).next().slideToggle().toggleClass('select__header--active');
		});

		this.clickSelectItem();
	}

	clickSelectItem(page = 'report') {
		$(`.main[data-name=${page}] .select__item`).click(({ currentTarget }) => {
			const title = $(currentTarget).find('.select__name').data('title');
			const select = $(currentTarget).parents('.select').data('select');
			const statusid = $(currentTarget).find('.select__name').data(select);

			this.setDataAttrSelectedItem(title, select, statusid);
		});
	}

	setDataAttrSelectedItem(title, select, statusid) {
		if (select === 'post') {
			this.object.posttitle = title;
			this.object.filters.post = statusid;
		} else {
			this.object.statusid = statusid;
			this.object.statustitle = title;
			this.object.filters.statusid = statusid;
		}

		this.filterUsersFromDB();
	}

	datepicker() {
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
			this.object.datetitle = dateValue;
			this.object.filters.date = dateValue;

			this.filterUsersFromDB();
		});
	}

	autoRefresh(page = 'report') {
		const timeReload = 60000 * settingsObject.autoupdatevalue;

		$(`.main[data-name=${page}] .switch--refresh`).click(({ target }) => {
			if (!$(target).hasClass('switch__input')) return;

			const statusSwitch = $(target).prop('checked');
			this.switch.refresh.status = statusSwitch;

			if (statusSwitch && !this.switch.refresh.marker) {
				localStorage.removeItem(page);
				this.collection.clear();

				this.getDataFromDB('report');

				this.switch.refresh.marker = setInterval(() => {
					this.getDataFromDB('report');
				}, timeReload);
			} else if (!statusSwitch && this.switch.refresh.marker) {
				clearInterval(this.switch.refresh.marker);

				this.switch.refresh.marker = false;
			}

			this.clearFieldsForm();
		});
	}

	resetFilters(page = 'report') {
		$(`.main[data-name=${page}] .btn--cancel`).click(() => {
			this.clearFieldsForm();
		});
	}

	clearFieldsForm() {
		for (const key in this.object) {
			if (key === 'filters') {
				this.object[key] = {};
			} else {
				if (key !== 'nameid' && key !== 'longname') {
					this.object[key] = '';
				}
			}
		}

		this.render();
	}

	filterUsersFromDB() {
		$.ajax({
			url: "./php/output-request.php",
			method: "post",
			dataType: "html",
			data: {
				nameDepart: settingsObject.nameid,
				nameTable: 'filter',
				options: this.object.filters
			},
			async: false,
			success: (data) => {
				const dataFromDB = JSON.parse(data);

				this.collection.clear();
				this.userFromDB(dataFromDB, 'filter');
			},
			error: () => {
				service.modal('download');
			}
		});
	}

	getDataFromDB(nameTable) {
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

				this.userFromDB(dataFromDB);
			},
			error: () => {
				service.modal('download');
			}
		});
	}

	filterPosts() {
		const postUsers = [...this.filterCollection.values()].map(({ post }) => post);
		const filterStatus = [];

		postUsers.forEach((post) => {
			if (!filterStatus.map(({ title }) => title).includes(post)) {
				filterStatus.push({ title: post });
			}
		});

		return filterStatus;
	}

	filterStatus() {
		const statusUsers = [...this.filterCollection.values()].map(({ statusid, statustitle }) => [statusid, statustitle]);
		const filterStatus = [];

		statusUsers.forEach(([statusid, statustitle]) => {
			if (!filterStatus.map(({ statusid }) => statusid).includes(statusid)) {
				filterStatus.push({ title: statustitle, statusid: statusid });
			}
		});

		return filterStatus;
	}
}

export default Report;
