'use strict';

import $ from 'jquery';
import service from '../../js/service.js';
import Settings from './settings.ctrl.js';

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
				set count({ collection }) {
					this.collection = collection;
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
		this.untouchable = ['title', 'errors'];
		this.mail = {
			sender: new Settings().sendUsers.operator,
			recipient: new Settings().sendUsers.manager,
			get subject() {
				if (this.objectData.title === 'Отклонено') {
					return 'Отклонен запрос на изменение данных в БД';
				} else {
					return 'Успешно изменены данные о пользователях в БД';
				}
			},
			objectData: {}
		};

		this.count.item.count = {
			collection: this.collection,
			object: this.object
		};
		this.count.all.count = {
			collection: this.collection
		};

		this.showDataFromStorage();
	}

	render() {
		const requestModel = new RequestModel({
			object: this.object,
			checkNameId: 'check',
			collection: this.collection,
			departmentCollection: this.departmentCollection,
			switchItem: this.switch,
			count: this.count,
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

		super.dataAdd();
	}

	submitIDinBD() {
		$('.btn--submit').click(() => {
			const filterDepartCollection = [...this.collection.values()].filter(({ nameid }) => nameid === this.object.nameid);
			const checkedItems = filterDepartCollection.every(({ statusaccess }) => statusaccess);

			if (checkedItems) {
				const allowItems = filterDepartCollection.filter(({ statusaccess }) => statusaccess === 'allow');
				const disallowItems = filterDepartCollection.filter(({ statusaccess }) => statusaccess === 'disallow');

				this.object.errors = [];

				new Promise((resolve) => {
					if (allowItems.length) {
						// Запрос в Uprox
					}

					if (disallowItems.length) {
						disallowItems.forEach((item) => {
							item.date = service.getCurrentDate();
						});

						resolve(this.setAddUsersInDB(disallowItems, 'reject', 'add', 'reject'));
					}
				})
				.then(() => {
					filterDepartCollection.forEach(({ id: userID }) => {
						[...this.collection].forEach(([key, { id }]) => {
							if (userID === id) {
								this.collection.delete(key);
							}
						});
					});

					filterDepartCollection.splice(0);
					super.clearObject();
					super.resetControlBtns();
					super.dataAdd();
					localStorage.removeItem(this.page);
				});
			} else {
				this.object.errors = ['fields'];
				this.render();
			}
		});
	}

	async setAddUsersInDB(array, nameTable, action, typeTable) {
		await $.ajax({
			url: "./php/change-user-request.php",
			method: "post",
			dataType: "html",
			data: {
				typeTable,
				action,
				nameTable,
				array
			},
			success: () => {
				const title = nameTable === 'reject' ? 'Отклонено' : 'Изменено';

				service.modal('success');

				this.mail.objectData = {
					department: this.object.longname,
					count: array.length,
					title,
					users: array
				};

				this.sendMail();
			},
			error: () => {
				service.modal('error');
			}
		});
	}
}

export default Request;
