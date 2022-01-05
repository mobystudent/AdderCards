'use strict';

import $ from 'jquery';
import datepickerFactory from 'jquery-datepicker';
import datepickerRUFactory from 'jquery-datepicker/i18n/jquery.ui.datepicker-ru';
import service from '../../js/service.js';
import { settingsObject } from '../settings.ctrl.js';

import Personnel from '../personnel.ctrl.js';
import ReportModel from '../../models/pages/report.model.js';

datepickerFactory($);
datepickerRUFactory($);

class Report extends Personnel {
	constructor(props) {
		super(props);

		({
			page: this.page = ''
		} = props);

		this.filterCollection = new Map(); // БД для вывода значений в фильтры
		this.object = {
			title: 'Отчёт по изменениям',
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
		this.untouchable = ['nameid', 'longname', 'title'];

		this.count.item.count = {
			collection: this.collection
		};

		this.getDataFromDB();
	}

	render() {
		const reportModel = new ReportModel({
			object: this.object,
			collection: this.collection,
			switchItem: this.switch,
			count: this.count,
			checkNameId: 'single',
			emptyMess: 'Новых данных нет',
			filterArrs: {
				posts: this.filterPosts(),
				status: this.filterStatus()
			}
		});

		$(`.main[data-name=${this.page}]`).html('');
		$(`.main[data-name=${this.page}]`).append(reportModel.render());

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

		super.dataAdd();
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

	autoRefresh() {
		const timeReload = 60000 * settingsObject.autoupdatevalue;

		$(`.main[data-name=${this.page}] .switch--refresh`).click(({ target }) => {
			if (!$(target).hasClass('switch__input')) return;

			const statusSwitch = $(target).prop('checked');
			this.switch.refresh.status = statusSwitch;

			if (statusSwitch && !this.switch.refresh.marker) {
				localStorage.removeItem(this.page);
				this.collection.clear();

				this.getDataFromDB();

				this.switch.refresh.marker = setInterval(() => {
					this.getDataFromDB();
				}, timeReload);
			} else if (!statusSwitch && this.switch.refresh.marker) {
				clearInterval(this.switch.refresh.marker);

				this.switch.refresh.marker = false;
			}

			this.clearObject();
		});
	}

	resetFilters() {
		$(`.main[data-name=${this.page}] .btn--cancel`).click(() => {
			this.clearObject();
		});
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

	getDataFromDB() {
		$.ajax({
			url: "./php/output-request.php",
			method: "post",
			dataType: "html",
			data: {
				idDepart: settingsObject.nameid,
				nameTable: this.page
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
