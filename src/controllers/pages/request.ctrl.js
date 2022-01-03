'use strict';

import $ from 'jquery';
import service from '../../js/service.js';
import messageMail from '../../js/mail.js';
import { sendUsers } from '../settings.ctrl.js';

import Access from '../access.ctrl.js';
import RequestModel from '../../models/pages/request.model.js';

class Request extends Access {
	constructor(props) {
		super(props);

		({
			page: this.page = ''
		} = props);

		this.object = {
			title: 'Запрос на изменение данных',
			statusallow: '',
			statusdisallow: '',
			nameid: '',
			longname: '',
			shortname: '',
			errors: []
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
					return [...this.collection.values()].filter(({ nameid }) => nameid === this.object.nameid).length;
				},
				set count({ collection, object }) {
					this.collection = collection;
					this.object = object;
				}
			},
			all: {
				title: 'Общее количество пользователей:&nbsp',
				get count() {
					return this.collection.size;
				},
				set count({ collection, object }) {
					this.collection = collection;
					this.object = object;
				}
			},
		};
		this.info = [
			{
				type: 'warn',
				title: 'fields',
				message: 'Предупреждение! Не все пользователи выбраны.'
			}
		];

		this.count.item.count = {
			collection: this.collection,
			object: this.object
		};
		this.count.all.count = {
			collection: this.collection,
			object: this.object
		};

		this.showDataFromStorage();
	}

	render() {
		const requestModel = new RequestModel({
			object: this.object,
			collection: this.collection,
			departmentCollection: this.departmentCollection,
			switchItem: this.switch,
			count: this.count,
			checkNameId: 'check',
			info: this.info,
			errors: this.object.errors,
			emptyMess: 'Новых данных нет',
			filterArrs: {
				departs: this.filterDepart()
			}
		});

		$(`.main[data-name=${this.page}]`).html('');
		$(`.main[data-name=${this.page}]`).append(requestModel.render());

		this.autoRefresh();
		this.clickAllowDisallowItem();
		this.confirmAllAllowDisallow();
		this.submitIDinBD();

		if (this.filterDepart().length > 1) this.changeTabs();
	}

	userFromDB(array) {
		const objToCollection = {
			id: '',
			fio: '',
			post: '',
			nameid: '',
			photofile: '',
			photourl: '',
			statusid: '',
			statustitle: '',
			department: '',
			statususer: '',
			statusaccess: '',
			date: ''
		};

		array.forEach((elem, i) => {
			const itemObject = { ...objToCollection };

			for (const itemField in itemObject) {
				for (const key in elem) {
					if (itemField === key) {
						itemObject[itemField] = elem[key];
					}
				}
			}

			this.collection.set(i, itemObject);
		});

		this.dataAdd();
	}

	submitIDinBD() {
		$('.btn--submit').click(() => {
			const filterDepartCollection = [...this.collection.values()].filter(({ nameid }) => nameid === this.object.nameid);
			const checkedItems = filterDepartCollection.every(({ statusaccess }) => statusaccess);

			if (checkedItems) {
				const allowItems = filterDepartCollection.filter(({ statusaccess }) => statusaccess === 'allow');
				const disallowItems = filterDepartCollection.filter(({ statusaccess }) => statusaccess === 'disallow');

				this.object.errors = [];

				if (allowItems.length) {
					// Запрос в Uprox
				}

				if (disallowItems.length) {
					disallowItems.forEach((item) => {
						item.date = service.getCurrentDate();
					});

					this.setAddUsersInDB(disallowItems, 'reject', 'add', 'reject');
				}

				filterDepartCollection.forEach(({ id: userID }) => {
					[...this.collection].forEach(([key, { id }]) => {
						if (userID === id) {
							this.collection.delete(key);
						}
					});
				});
				filterDepartCollection.splice(0);

				this.clearObject();
				this.resetControlBtns();
				this.dataAdd();

				localStorage.removeItem(this.page);
			} else {
				this.object.errors = ['fields'];
				this.render();
			}
		});
	}

	setAddUsersInDB(array, nameTable, action, typeTable) {
		$.ajax({
			url: "./php/change-user-request.php",
			method: "post",
			dataType: "html",
			async: false,
			data: {
				typeTable,
				action,
				nameTable,
				array
			},
			success: () => {
				const title = nameTable === 'reject' ? 'Отклонено' : 'Изменено';

				service.modal('success');

				this.sendMail({
					department: this.object.longname,
					count: array.length,
					title,
					users: array
				});
			},
			error: () => {
				service.modal('error');
			}
		});
	}

	sendMail(obj) {
		const { title = '' } = obj;
		const sender = sendUsers.operator;
		const recipient = sendUsers.manager;
		let subject;

		if (title === 'Отклонено') {
			subject = 'Отклонен запрос на изменение данных в БД';
		} else {
			subject = 'Успешно изменены данные о пользователях в БД';
		}

		$.ajax({
			url: "./php/mail.php",
			method: "post",
			dataType: "html",
			async: false,
			data: {
				sender,
				recipient,
				subject,
				message: messageMail(obj)
			},
			success: () => {
				console.log('Email send is success');
			},
			error: () => {
				service.modal('email');
			}
		});
	}
}

export default Request;
