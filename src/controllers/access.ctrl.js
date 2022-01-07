'use strict';

import $ from 'jquery';

import ControlDepartment from './controlDepartment.ctrl.js';

class Access extends ControlDepartment {
	constructor(props) {
		super({ ...props, mark: 'access' });

		({
			page: this.page = ''
		} = props);
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
}

export default Access;
