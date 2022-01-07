'use strict';

import $ from 'jquery';

import Main from './main.ctrl.js';

class Personnel extends Main {
	constructor(props) {
		super(props);

		({
			page: this.page = ''
		} = props);

		this.object = {};
		this.collection = new Map(); // БД пользователей при старте
	}

	showDataFromStorage() {
		const storageCollection = JSON.parse(localStorage.getItem(this.page));

		if (storageCollection && storageCollection.collection.length && !this.collection.size) {
			const lengthStorage = storageCollection.collection.length;
			this.counter = storageCollection.collection[lengthStorage - 1].id + 1; // id последнего элемента в localStorage

			storageCollection.collection.forEach((item, i) => {
				const itemID = storageCollection.collection[i].id;

				this.collection.set(itemID, item);
			});
		}

		super.dataAdd();
	}

	toggleSelect() {
		$(`.main[data-name=${this.page}] .select__header`).click(({ currentTarget }) => {
			$(currentTarget).next().slideToggle().toggleClass('select__header--active');
		});

		this.clickSelectItem();
	}

	clickSelectItem() {
		$(`.main[data-name=${this.page}] .select__item`).click(({ currentTarget }) => {
			const title = $(currentTarget).find('.select__name').data('title');
			const select = $(currentTarget).parents('.select').data('select');
			const statusid = $(currentTarget).find('.select__name').data(select);

			if (select === 'fio') {
				const id = $(currentTarget).find('.select__name').data('id');

				this.getAddUsersInDB(id); // вывести должность в скрытое поле
			}

			this.setDataAttrSelectedItem(title, select, statusid);
		});
	}

	deleteUser() {
		$(`.main[data-name=${this.page}] .table__body`).click(({ target }) => {
			if ($(target).parents('.table__btn--delete').length || $(target).hasClass('table__btn--delete')) {
				const userID = $(target).closest('.table__row').data('id');

				[...this.collection].forEach(([key, { id }]) => {
					if (userID === +id) {
						this.collection.delete(key);
					}
				});

				this.setDataInStorage();
				super.dataAdd();

				if (!this.collection.size) {
					localStorage.removeItem(this.page);
				}
			}
		});
	}

	editUser() {
		$(`.main[data-name=${this.page}] .table__body`).click(({ target }) => {
			if ($(target).parents('.table__btn--edit').length || $(target).hasClass('table__btn--edit')) {
				const userID = $(target).closest('.table__row').data('id');

				[...this.collection].forEach(([keyCollection, item]) => {
					if (userID === +item.id) {
						for (const key in item) {
							this.object[key] = item[key];
						}

						this.collection.delete(keyCollection);
					}
				});

				super.dataAdd();
			}
		});
	}
}

export default Personnel;
