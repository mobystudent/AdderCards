'use strict';

import $ from 'jquery';
import service from '../../js/service.js';

import Cards from '../cards.ctrl.js';
import TimeModel from '../../models/pages/time.model.js';

class Time extends Cards {
	constructor(props) {
		super({ ...props, mark: 'time' });

		({
			page: this.page = ''
		} = props);

		this.object = {
			title: 'Добавление временных карт',
			errors: []
		};
		this.count = {
			item: {
				title: 'Количество карт:&nbsp',
				get count() {
					return this.collection.size;
				},
				set count({ collection }) {
					this.collection = collection;
				}
			}
		};
		this.info = [
			{
				type: 'warn',
				title: 'fields',
				message: 'Предупреждение! Не всем картам присвоен идентификатор.'
			},
			{
				type: 'warn',
				title: 'have',
				message: 'Предупреждение! Карта с данным кодом уже присвоена!'
			},
			{
				type: 'warn',
				title: 'contains',
				message: 'Предупреждение! Карта с данным кодом была присвоена ранее!'
			},
			{
				type: 'error',
				title: 'cardid',
				message: 'Ошибка! Не правильно введен тип ID. Должно быть 10 цифр, без букв и символов!'
			}
		];
		this.counter = 0;

		this.count.item.count = {
			collection: this.collection
		};

		this.showDataFromStorage();
	}

	render() {
		const timeModel = new TimeModel({
			object: this.object,
			checkNameId: 'single',
			collection: this.collection,
			count: this.count,
			info: this.info,
			errors: this.object.errors,
			emptyMess: 'Новых данных нет'
		});

		$(`.main[data-name=${this.page}]`).html('');
		$(`.main[data-name=${this.page}]`).append(timeModel.render());

		this.addTimeCard();
		super.convertCardIDInCardName();
		this.deleteTimeCard();
		super.clearNumberCard();
		this.submitIDinBD();
	}

	itemUserInTable() {
		this.collection.set(this.counter, {
			id: this.counter,
			fio: 'Временная карта',
			statusid: 'timeCard',
			statustitle: 'Временная карта',
			cardid: '',
			cardname: ''
		});

		this.counter++;

		this.dataAdd();
	}

	addTimeCard() {
		$('#addTimeCard').click(() => {
			this.itemUserInTable();
		});
	}

	dataAdd() {
		super.getCardsFromDB();
		super.dataAdd();
	}

	showDataFromStorage() {
		const storageCollection = JSON.parse(localStorage.getItem(this.page));

		if (storageCollection && storageCollection.collection.length) {
			const lengthStorage = storageCollection.collection.length;
			this.counter = storageCollection.collection[lengthStorage - 1].id + 1; // id последнего элемента в localStorage

			storageCollection.collection.forEach((item, i) => {
				const itemID = storageCollection.collection[i].id;

				this.collection.set(itemID, item);
			});
		}

		this.dataAdd();
	}

	setDataInStorage() {
		localStorage.setItem(this.page, JSON.stringify({
			collection: [...this.collection.values()]
		}));
	}

	submitIDinBD() {
		$('.btn--submit').click(() => {
			const checkedItems = [...this.collection.values()].every(({ cardid }) => cardid);

			if (checkedItems) {
				this.object.errors = [];

				this.collection.forEach((item) => {
					item.date = service.getCurrentDate();
				});

				this.setAddUsersInDB([...this.collection.values()], 'time', 'report');

				this.collection.clear();
				this.render();
				localStorage.removeItem(this.page);
				this.counter = 0;
			} else {
				this.object.errors = ['fields'];
				this.render();
			}
		});
	}

	deleteTimeCard() {
		$(`.main[data-name=${this.page}] .table__body`).click(({ target }) => {
			if ($(target).parents('.table__btn--delete').length || $(target).hasClass('table__btn--delete')) {
				const userID = $(target).closest('.table__row').data('id');

				[...this.collection].forEach(([key, { id }]) => {
					if (userID === +id) {
						this.collection.delete(key);
					}
				});

				this.setDataInStorage();
				this.render();

				if (!this.collection.size) {
					localStorage.removeItem(this.page);
				}
			}
		});
	}

	setAddUsersInDB(array, nameTable, action) {
		$.ajax({
			url: "./php/change-user-request.php",
			method: "post",
			dataType: "html",
			async: false,
			data: {
				action,
				nameTable,
				array
			},
			success: () => {
				service.modal('success');
			},
			error: () => {
				service.modal('error');
			}
		});
	}

	getData() {
		const data = {
			"PasswordHash": "88020F057FE7287D8D57494382356F97",
			"UserName": "admin"
		};
		let resultAuthent = {};

		$.ajax({
			url: "http://localhost:40001/json/Authenticate",
			method: "post",
			dataType: "json",
			contentType: 'application/json',
			data: JSON.stringify(data),
			async: false,
			success: (data) => {
				const { UserSID = '', UserToken = 0 } = data;

				console.log(data);

				resultAuthent = {
					UserSID,
					UserToken
				};
			},
			error: (data) => {
				console.log(data);
			}
		});

		return resultAuthent;
	}

	createObjectForBD() {
		const { UserSID = '', UserToken = 0 } = this.getData();

		// console.log(UserSID);
		// console.log(UserToken);
		console.log(UserSID);

		const object = {
			"Language": "ua",
			"UserSID": UserSID,
			"ResultTokenRequired": true,
			"AccessGroupInherited": true,
			"AccessGroupToken": UserToken,
			"AdditionalFields": [{
				"Name": "",
				"Value": ""
			}],
			"AdditionalFieldsChanged": true,
			"FieldGroupToken": UserToken,
			"Name": "Временная карта",
			"NewCards": [{
				"AntipassbackDisabled": true,
				"Code": "",
				"ConfirmationUrl": "",
				"Disalarm": true,
				"Email": "",
				"EmailRequestCode": "",
				"IdentifierType": 2147483647,
				"Name": "",
				"PIN": "",
				"Security": true,
				"Status": 2147483647,
				"Token": UserToken,
				"VIP": true,
				"ValidTo": "\/Date(928135200000+0300)\/",
				"ValidToUsed": true
			}],
			"OwnAccessRulesChanged": true,
			"Token": UserToken,
			"WorktimeInherited": true,
			"CardCodes": [""],
			"CardTokens": [UserToken],
			"CardsChanged": true,
			"DepartmentToken": UserToken,
			"EmployeeNumber": "",
			"NewBiometricIdentifiers": [{
				"BiometricIndex": 2147483647,
				"BiometricType": "",
				"Data": "",
				"Quality": 2147483647
			}],
			"PhotoBase64": "",
			"PhotoChanged": true,
			"PhotoFileExt": "",
			"Post": "",
			"OwnAccessRules": [{
				"DoorToken": UserToken,
				"PassCounter": 2147483647,
				"ScheduleToken": UserToken
			}]
		};
		// const fillOutObjectInBD = map.map((elem) => {
		// 	const itemObject = Object.assign({}, object);
		//
		// 	for (const itemField in itemObject) {
		// 		for (const key in elem) {
		// 			if (itemField.toLocaleLowerCase() == key) {
		// 				itemObject[itemField] = elem[key];
		// 			}
		// 		}
		// 	}
		//
		// 	return itemObject;
		// });

		// console.log(object);
		$.ajax({
			url: "http://localhost:40001/json/EmployeeSet",
			method: "post",
			dataType: "json",
			contentType: 'application/json',
			data: JSON.stringify(object),
			async: false,
			success: (data) => {
				console.log(data);
			},
			error: (data) => {
				console.log(data);
			}
		});
	}
}

export default Time;
