'use strict';

import $ from 'jquery';
import service from '../js/service.js';
import messageMail from '../js/mail.js';
import { settingsObject, sendUsers } from './settings.ctrl.js';

import PermisModel from '../models/pages/permis.model.js';

class Permis {
	constructor() {
		this.permissionCollection = new Map(); // БД пользователей при старте
		this.departmentCollection = new Map();  // Коллекци подразделений
		this.object = {
			page: 'Разрешение на добавление <br> идентификаторов пользователям',
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
			}
		};
		this.info = [
			{
				type: 'warn',
				title: 'fields',
				message: 'Предупреждение! Не все пользователи выбраны.'
			}
		];

		this.count.item.count = {
			collection: this.permissionCollection,
			object: this.object
		};
		this.count.all.count = {
			collection: this.permissionCollection,
			object: this.object
		};

		this.showDataFromStorage();
	}

	render(page = 'permis') {
		const permisModel = new PermisModel({
			object: this.object,
			collection: this.permissionCollection,
			departmentCollection: this.departmentCollection,
			switchItem: this.switch,
			count: this.count,
			checkNameId: true,
			info: this.info,
			errors: this.object.errors,
			filterArrs: {
				departs: this.filterDepart()
			}
		});

		$(`.main[data-name=${page}]`).html('');
		$(`.main[data-name=${page}]`).append(permisModel.render());

		this.autoRefresh();
		this.clickAllowDisallowPermis();
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
			сardvalidto: '',
			statuspermis: ''
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

			this.permissionCollection.set(i, itemObject);
		});

		this.dataAdd();
	}

	dataAdd() {
		this.object.nameid = this.filterDepart()[0];

		this.getDepartmentFromDB();
		this.showActiveDataOnPage();
		this.render();
	}

	showDataFromStorage(page = 'permis') {
		const storageCollection = JSON.parse(localStorage.getItem(page));

		if (storageCollection && storageCollection.collection.length && !this.permissionCollection.size) {
			const { statusallow, statusdisallow } = storageCollection.controls;
			const { refresh } = storageCollection.settings;

			storageCollection.collection.forEach((item, i) => {
				const itemID = storageCollection.collection[i].id;

				this.permissionCollection.set(itemID, item);
			});

			this.object.statusallow = statusallow;
			this.object.statusdisallow = statusdisallow;
			this.switch.refresh = refresh;

			this.dataAdd();
		} else {
			this.getDataFromDB('permis');
		}
	}

	setDataInStorage(page = 'permis') {
		localStorage.setItem(page, JSON.stringify({
			settings: this.switch,
			controls: this.object,
			collection: [...this.permissionCollection.values()]
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

	submitIDinBD(page = 'permis') {
		$('.btn--submit').click(() => {
			const filterDepartCollection = [...this.permissionCollection.values()].filter(({ nameid }) => nameid === this.object.nameid);
			const checkedItems = filterDepartCollection.every(({ statuspermis }) => statuspermis);

			if (checkedItems) {
				const allowItems = filterDepartCollection.filter(({ statuspermis }) => statuspermis === 'allow');
				const disallowItems = filterDepartCollection.filter(({ statuspermis }) => statuspermis === 'disallow');

				this.object.errors = [];

				if (allowItems.length) {
					this.delegationID(allowItems);
				}

				if (disallowItems.length) {
					disallowItems.forEach((item) => {
						item.date = service.getCurrentDate();
					});

					this.setAddUsersInDB(disallowItems, 'reject', 'add', 'permis');
				}

				filterDepartCollection.forEach(({ id: userID }) => {
					[...this.permissionCollection].forEach(([key, { id }]) => {
						if (userID === id) {
							this.permissionCollection.delete(key);
						}
					});
				});
				filterDepartCollection.splice(0);

				this.clearObject();
				this.resetControlBtns();
				this.dataAdd();

				localStorage.removeItem(page);
			} else {
				this.object.errors = ['fields'];
				this.render();
			}
		});
	}

	delegationID(users) {
		const filterArrCards = users.filter(({ statusid }) => statusid === 'newCard' || statusid === 'changeCard');
		const filterArrQRs = users.filter(({ statusid }) => statusid === 'newQR' || statusid === 'changeQR');

		if (filterArrCards.length) {
			this.setAddUsersInDB(filterArrCards, 'const', 'add', 'card');
		}
		if (filterArrQRs.length) {
			this.setAddUsersInDB(filterArrQRs, 'const', 'add', 'qr');
		}
	}

	clearObject() {
		this.object.nameid = '';
		this.object.longname = '';
		this.object.shortname = '';
	}

	clickAllowDisallowPermis(page = 'permis') {
		$(`.main[data-name=${page}] .table__body`).click(({ target }) => {
			if (!$(target).hasClass('btn--allow') && !$(target).hasClass('btn--disallow')) return;

			const userID = $(target).parents('.table__row').data('id');
			const typeBtn = $(target).data('type');

			this.permissionCollection.forEach((item) => {
				if (+item.id === userID) {
					const status = item[typeBtn] ? false : true;
					item.statususer = status ? true : false;
					item.statuspermis = typeBtn;
					item[typeBtn] = status;
					item.allowblock = typeBtn === 'disallow' && status ? true : false;
					item.disallowblock = typeBtn === 'allow' && status ? true : false;
				}
			});

			const allStatusUsers = [...this.permissionCollection.values()].some(({ statususer }) => statususer);

			if (!allStatusUsers) {
				localStorage.removeItem(page);
			} else {
				this.setDataInStorage();
			}

			this.render();
		});
	}

	confirmAllAllowDisallow(page = 'permis') {
		$(`.main[data-name=${page}] #allowAll, .main[data-name=${page}] #disallowAll`).click(({ target }) => {
			const typeBtn = $(target).data('type');
			const statusTypeBtn = typeBtn === 'allow' ? 'statusallow' : 'statusdisallow';
			this.object[statusTypeBtn] = this.object[statusTypeBtn] ? false : true;

			this.permissionCollection.forEach((item) => {
				if (item.nameid === this.object.nameid) {
					item.statususer = this.object[statusTypeBtn] ? true : false;
					item.statuspermis = typeBtn;
					item.allow = '';
					item.disallow = '';
					item.allowblock = this.object[statusTypeBtn] ? true : false;
					item.disallowblock = this.object[statusTypeBtn] ? true : false;
				}
			});

			if (!this.object.statusallow && !this.object.statusdisallow) {
				localStorage.removeItem(page);
			} else {
				this.setDataInStorage();
			}

			this.render();
		});
	}

	resetControlBtns() {
		this.object.statusallow = '';
		this.object.statusdisallow = '';

		this.permissionCollection.forEach((item) => {
			item.statususer = '';
			item.statuspermis = '';
			item.allow = '';
			item.disallow = '';
			item.allowblock = '';
			item.disallowblock = '';
		});
	}

	autoRefresh(page = 'permis') {
		const timeReload = 60000 * settingsObject.autoupdatevalue;

		$(`.main[data-name=${page}] .switch--refresh`).click(({ target }) => {
			if (!$(target).hasClass('switch__input')) return;

			const statusSwitch = $(target).prop('checked');
			this.switch.refresh.status = statusSwitch;

			if (statusSwitch && !this.switch.refresh.marker) {
				localStorage.removeItem(page);
				this.permissionCollection.clear();

				this.resetControlBtns(); // 1
				this.getDataFromDB('permis'); // 2
				this.setDataInStorage();

				this.switch.refresh.marker = setInterval(() => {
					this.getDataFromDB('permis');
				}, timeReload);
			} else if (!statusSwitch && this.switch.refresh.marker) {
				clearInterval(this.switch.refresh.marker);

				this.switch.refresh.marker = false;
				localStorage.removeItem(page);
			}

			this.render();
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
				const title = nameTable === 'reject' ? 'Отклонено' : 'Добавить';

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

	getDataFromDB(nameTable) {
		$.ajax({
			url: "./php/output-request.php",
			method: "post",
			dataType: "html",
			data: {
				nameTable
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

	sendMail(obj) {
		const { title = '' } = obj;
		const sender = sendUsers.secretary;
		let subject;
		let recipient;

		if (title === 'Отклонено') {
			recipient = sendUsers.manager;
			subject = 'Отклонен запрос на добавление пользователей в БД';
		} else {
			recipient = sendUsers.operator;
			subject = 'Запрос на добавление пользователей в БД';
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

	// Общие функции с картами и кодами
	changeTabs(page = 'permis') {
		$(`.main[data-name=${page}] .tab`).click(({ target }) => {
			if (!$(target).parents('.tab__item').length && !$(target).hasClass('tab__item')) return;

			this.object.nameid = $(target).closest('.tab__item').data('depart');

			this.resetControlBtns();
			this.showActiveDataOnPage();
			this.render();

			localStorage.removeItem(page); // в самом конце, т.к. функции выше записывают в localStorage
		});
	}

	filterDepart() {
		const arrayDepart = [...this.permissionCollection.values()].map(({ nameid }) => nameid);

		return [...new Set(arrayDepart)];
	}
}

export default Permis;
