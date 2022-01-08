'use strict';

import $ from 'jquery';
import service from '../js/service.js';

import Main from './main.ctrl.js';

class ControlDepartment extends Main {
	constructor(props) {
		super(props);

		({
			mark: this.mark = ''
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

			if (this.mark === 'access') {
				this.resetControlBtns();
			} else if (this.mark === 'qr' && this.object.statusmanual) {
				this.resetControlSwitch();
			}
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

export default ControlDepartment;
