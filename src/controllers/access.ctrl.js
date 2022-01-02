'use strict';

import $ from 'jquery';
import service from '../js/service.js';
import { settingsObject } from './settings.ctrl.js';

class Access {
	constructor(props) {
		({
			page: this.page = '',
		} = props);

		this.collection = new Map(); // БД пользователей при старте
		this.departmentCollection = new Map(); // Коллекция подразделений
	}

	dataAdd() {
		this.object.nameid = this.filterDepart()[0];

		this.getDepartmentFromDB();
		this.showActiveDataOnPage();
		this.render();
	}

	showDataFromStorage() {
		const storageCollection = JSON.parse(localStorage.getItem(this.page));

		if (storageCollection && storageCollection.collection.length && !this.collection.size) {
			const { statusallow, statusdisallow } = storageCollection.controls;
			const { refresh } = storageCollection.settings;

			storageCollection.collection.forEach((item, i) => {
				const itemID = storageCollection.collection[i].id;

				this.collection.set(itemID, item);
			});

			this.object.statusallow = statusallow;
			this.object.statusdisallow = statusdisallow;
			this.switch.refresh = refresh;

			this.dataAdd();
		} else {
			this.getDataFromDB();
		}
	}

	setDataInStorage() {
		localStorage.setItem(this.page, JSON.stringify({
			settings: this.switch,
			controls: this.object,
			collection: [...this.collection.values()]
		}));
	}

	showActiveDataOnPage() {
		this.departmentCollection.forEach((depart) => {
			const { nameid, shortname, longname } = depart;

			if (nameid === this.object.nameid) {
				this.object.shortname = shortname;
				this.object.longname = longname;
			}
		});
	}

	clearObject() {
		this.object.nameid = '';
		this.object.longname = '';
		this.object.shortname = '';
	}

	clickAllowDisallowItem() {
		$(`.main[data-name=${this.page}] .table__body`).click(({ target }) => {
			if (!$(target).hasClass('btn--allow') && !$(target).hasClass('btn--disallow')) return;

			const userID = $(target).parents('.table__row').data('id');
			const typeBtn = $(target).data('type');

			this.collection.forEach((item) => {
				if (+item.id === userID) {
					const status = !item[typeBtn];

					item.statususer = status;
					item.statusaccess = typeBtn;
					item[typeBtn] = status;
					item.allowblock = typeBtn === 'disallow' && status;
					item.disallowblock = typeBtn === 'allow' && status;
				}
			});

			const allStatusUsers = [...this.collection.values()].some(({ statususer }) => statususer);

			if (!allStatusUsers) {
				localStorage.removeItem(this.page);
			} else {
				this.setDataInStorage();
			}

			this.render();
		});
	}

	confirmAllAllowDisallow() {
		$(`.main[data-name=${this.page}] #allowAll, .main[data-name=${this.page}] #disallowAll`).click(({ target }) => {
			const typeBtn = $(target).data('type');
			const statusTypeBtn = typeBtn === 'allow' ? 'statusallow' : 'statusdisallow';
			this.object[statusTypeBtn] = !this.object[statusTypeBtn];

			this.collection.forEach((item) => {
				if (item.nameid === this.object.nameid) {
					item.statususer = this.object[statusTypeBtn];
					item.statusaccess = typeBtn;
					item.allow = '';
					item.disallow = '';
					item.allowblock = this.object[statusTypeBtn];
					item.disallowblock = this.object[statusTypeBtn];
				}
			});

			if (!this.object.statusallow && !this.object.statusdisallow) {
				localStorage.removeItem(this.page);
			} else {
				this.setDataInStorage();
			}

			this.render();
		});
	}

	resetControlBtns() {
		this.object.statusallow = '';
		this.object.statusdisallow = '';

		this.collection.forEach((item) => {
			if (item.nameid === this.object.nameid) {
				item.statususer = '';
				item.statusaccess = '';
				item.allow = '';
				item.disallow = '';
				item.allowblock = '';
				item.disallowblock = '';
			}
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

				this.resetControlBtns(); // 1
				this.getDataFromDB(); // 2
				this.setDataInStorage();

				this.switch.refresh.marker = setInterval(() => {
					this.getDataFromDB();
				}, timeReload);
			} else if (!statusSwitch && this.switch.refresh.marker) {
				clearInterval(this.switch.refresh.marker);

				this.switch.refresh.marker = false;
				localStorage.removeItem(this.page);
			}

			this.render();
		});
	}

	getDataFromDB() {
		$.ajax({
			url: "./php/output-request.php",
			method: "post",
			dataType: "html",
			data: {
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

	getDepartmentFromDB() {
		$.ajax({
			url: "./php/output-request.php",
			method: "post",
			dataType: "html",
			async: false,
			data: {
				nameTable: 'department'
			},
			success: (data) => {
				const dataFromDB = JSON.parse(data);

				dataFromDB.forEach((item, i) => {
					this.departmentCollection.set(i + 1, item);
				});
			},
			error: () => {
				service.modal('download');
			}
		});
	}

	changeTabs() {
		$(`.main[data-name=${this.page}] .tab`).click(({ target }) => {
			if (!$(target).parents('.tab__item').length && !$(target).hasClass('tab__item')) return;

			this.object.nameid = $(target).closest('.tab__item').data('depart');

			this.resetControlBtns();
			this.showActiveDataOnPage();
			this.render();

			localStorage.removeItem(this.page); // в самом конце, т.к. функции выше записывают в localStorage
		});
	}

	filterDepart() {
		const arrayDepart = [...this.collection.values()].map(({ nameid }) => nameid);

		return [...new Set(arrayDepart)];
	}
}

export default Access;
