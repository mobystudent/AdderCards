'use strict';

import $ from 'jquery';

class Personnel {
	constructor(props) {
		({
			page: this.page = ''
		} = props);

		this.collection = new Map(); // БД пользователей при старте
	}

	dataAdd() {
		this.render();
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

		this.dataAdd();
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

			this.setDataAttrSelectedItem(title, select, statusid);
		});
	}
}

export default Personnel;
