'use strict';

import $ from 'jquery';
import service from '../js/service.js';

import Main from './main.ctrl.js';

class Access extends Main {
	constructor(props) {
		super({ ...props, mark: 'access' });

		({
			page: this.page = ''
		} = props);

		this.departmentCollection = new Map(); // Коллекция подразделений
	}

	dataAdd() {
		this.object.nameid = this.filterDepart()[0];

		this.getDepartmentFromDB();
		this.showActiveDataOnPage();
		super.dataAdd();
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
		const untouchable = ['page', 'errors'];

		for (const key in this.object) {
			if (!untouchable.includes(key)) {
				this.object[key] = '';
			}
		}

		this.render();
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
