'use strict';

import $ from 'jquery';
import service from './../js/service.js';

import Convert from './convert.ctrl.js';
import Main from './main.ctrl.js';

class Cards extends Main {
	constructor(props) {
		super(props);

		({
			mark: this.mark = ''
		} = props);

		this.dbCardsCollection = new Map();  // Коллекция всех добавленных карт
	}

	get departCollection() {
		if (this.mark === 'const') {
			return [...this.collection.values()].filter(({ nameid }) => nameid === this.object.nameid);
		} else {
			return [...this.collection.values()];
		}
	}

	clearNumberCard() {
		$(`.main[data-name=${this.page}] .table__body`).click(({ target }) => {
			if ($(target).parents('.table__btn--clear').length || $(target).hasClass('table__btn--clear')) {
				const userID = $(target).parents('.table__row').data('id');

				[...this.collection].forEach(([key, { id }]) => {
					if (userID === +id) {
						this.setDataInTable(key);
					}
				});
			}
		});
	}

	convertCardIDInCardName() {
		$(`.main[data-name=${this.page}] .table__body`).click(({ target }) => {
			if (!$(target).hasClass('table__input')) return;

			$(target).on('input', () => {
				const cardId = $(target).val().trim();
				const convertNumCard = Convert.convertCardId(cardId);
				const userID = $(target).parents('.table__row').data('id');
				const cardObj = {
					cardid: cardId,
					cardname: convertNumCard
				};
				const uniqueCardID = [...this.collection.values()].some(({ cardid }) => cardId === cardid);
				const containsCardID = [...this.dbCardsCollection.values()].some(({ cardid }) => cardId === cardid);

				if (uniqueCardID) {
					this.object.errors = ['have'];

					this.render();

					return;
				} else {
					this.object.errors = [];
				}

				if (containsCardID) {
					this.object.errors = ['contains'];

					this.render();

					return;
				} else {
					this.object.errors = [];
				}

				if (!convertNumCard) {
					this.object.errors = ['cardid'];

					this.render();

					return;
				} else {
					this.object.errors = [];
				}

				[...this.collection].forEach(([key, { id }]) => {
					if (userID === +id) {
						this.setDataInTable(key, cardObj);
					}
				});

				this.checkInvalidValueCardID();
			});
		});
	}

	setDataInTable(userID, cardObj) {
		const user = this.collection.get(userID);
		user.cardid = cardObj ? cardObj.cardid : '';
		user.cardname = cardObj ? cardObj.cardname : '';
		const allStatusUsers = [...this.collection.values()].some(({ cardid }) => cardid);

		if (!allStatusUsers) {
			localStorage.removeItem(this.page);
		} else {
			this.setDataInStorage();
		}

		if (this.mark === 'const') {
			this.showActiveDataOnPage();
		}
		this.render();
	}

	checkInvalidValueCardID() {
		const checkValueCard = this.departCollection.every(({ cardid }) => {
			if (cardid) Convert.convertCardId(cardid);
		});

		if (checkValueCard) {
			this.object.errors = [];
		}
	}

	getCardsFromDB() {
		$.ajax({
			url: "./php/output-request.php",
			method: "post",
			dataType: "html",
			async: false,
			data: {
				nameTable: 'contains-card'
			},
			success: (data) => {
				const dataFromDB = JSON.parse(data);

				dataFromDB.forEach((item, i) => {
					this.dbCardsCollection.set(i + 1, item);
				});
			},
			error: () => {
				service.modal('download');
			}
		});
	}
}

export default Cards;
