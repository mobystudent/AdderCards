'use strict';

import $ from 'jquery';
import datepickerFactory from 'jquery-datepicker';
import datepickerRUFactory from 'jquery-datepicker/i18n/jquery.ui.datepicker-ru';
import service from '../../js/service.js';
import messageMail from '../../js/mail.js';
import { settingsObject, sendUsers } from '../settings.ctrl.js';
import { select } from '../../components/select.tpl.js';

import Personnel from '../personnel.ctrl.js';
import RemoveModel from '../../models/pages/remove.model.js';

datepickerFactory($);
datepickerRUFactory($);

class Remove extends Personnel {
	constructor(props) {
		super(props);

		this.departmentCollection = new Map();  // Коллекция подразделений
		this.object = {
			page: 'Удаление пользователей',
			id: '',
			fio: '',
			post: '',
			photofile: '',
			statusid: '',
			statustitle: '',
			cardvalidto: '',
			statuscardvalidto: '',
			newdepart: '',
			newnameid: '',
			statusnewdepart: '',
			errors: [],
			get nameid() {
				return settingsObject.nameid;
			},
			get longname() {
				return settingsObject.longname;
			}
		};
		this.count = {
			item: {
				title: 'Количество удаляемых пользователей:&nbsp',
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
				message: 'Предупреждение! Не все поля заполнены.'
			}
		];
		this.counter = 0;

		this.count.item.count = {
			collection: this.collection
		};

		this.getDepartmentFromDB();
		this.showDataFromStorage();
	}

	render(page = 'remove') {
		const removeModel = new RemoveModel({
			pageName: 'remove',
			object: this.object,
			checkNameId: 'double',
			collection: this.collection,
			count: this.count,
			info: this.info,
			errors: this.object.errors,
			emptyMess: 'Не добавленно ни одного пользователя'
		});

		$(`.main[data-name=${page}]`).html('');
		$(`.main[data-name=${page}]`).append(removeModel.render());

		this.deleteUser();
		this.editUser();
		this.toggleSelect(); // 3
		this.getAddUsersInDB(); // вывести всех пользователей в селект 1
		this.datepicker();
		this.setDepartInSelect(); // 2
		this.addUser();
		this.submitIDinBD();
	}

	addUser() {
		$('#removeUser').click(() => {
			if (this.object.cardvalidto) {
				delete this.object.newnameid;
				delete this.object.newdepart;
			} else {
				delete this.object.cardvalidto;
			}

			delete this.object.statusnewdepart;
			delete this.object.statuscardvalidto;

			const validFields = Object.values(this.object).every((item) => item);
			const errorsArr = [];

			if (!validFields) errorsArr.push('fields');

			if (!errorsArr.length) {
				this.userFromForm();
				this.clearFieldsForm();
			} else {
				this.object.errors = errorsArr;
			}

			this.render();
		});
	}

	userFromForm() {
		const objToCollection = {
			id: '',
			fio: '',
			post: '',
			photofile: '',
			statusid: '',
			statustitle: '',
			newnameid: '',
			newdepart: '',
			cardvalidto: ''
		};
		const itemObject = { ...objToCollection };

		for (const itemField in itemObject) {
			for (const key in this.object) {
				if (itemField === key) {
					itemObject[itemField] = this.object[key];
				}
			}
		}

		this.collection.set(this.counter, itemObject);
		this.counter++;

		this.setDataInStorage();
		super.dataAdd();
	}

	setDataInStorage(page = 'remove') {
		localStorage.setItem(page, JSON.stringify({
			collection: [...this.collection.values()]
		}));
	}

	setDepartInSelect() {
		this.departmentCollection.forEach(({ nameid = '', longname = '' }) => {
			const quoteName = longname.replace(/["']/g, '&quot;');

			if (nameid !== settingsObject.nameid) {
				const item = {
					value: quoteName,
					id: nameid,
					type: 'form',
					dataid: 'newnameid'
				};

				$('.select[data-select="newnameid"] .select__list').append(select(item));
			}
		});
	}

	setUsersInSelect(users, page = 'remove') {
		$(`.main[data-name=${page}] .select[data-select="fio"] .select__list`).html('');

		if (this.collection.size) {
			this.collection.forEach((elem) => {
				users = users.filter(({ id }) => elem.id !== id);
			});
		}

		users.forEach(({ id = '', fio = '' }) => {
			const item = {
				value: fio,
				id,
				type: 'form',
				dataid: 'id'
			};

			$(`.main[data-name=${page}] .select[data-select="fio"] .select__list`).append(select(item));
		});

		this.clickSelectItem();
	}

	setDataAttrSelectedItem(title, select, statusid) {
		if (select === 'fio') {
			this.object.fio = title;
			this.object.statustitle = '';
			this.object.statusid = '';
			this.object.newdepart = '';
			this.object.newnameid = '';
			this.object.cardvalidto = '';
		} else if (select === 'reason') {
			this.object.statustitle = title;
			this.object.statusid = statusid;

			if (statusid === 'remove') {
				this.object.newdepart = '';
				this.object.newnameid = '';
			} else if (statusid === "changeDepart") {
				this.object.cardvalidto = '';
			}
		} else if (select === 'newnameid') {
			this.object.newnameid = statusid;
			this.object.newdepart = title.replace(/["']/g, '&quot;');
		}

		this.render();
	}

	datepicker() {
		$("#removeDatepicker").datepicker({
			changeMonth: true,
			changeYear: true,
			showOtherMonths: true,
			selectOtherMonths: true,
			minDate: "+1D",
			maxViewMode: 10
		});

		$('#removeDatepicker').change(({ currentTarget }) => {
			const cardvalidtoValue = $(currentTarget).val();

			this.object.cardvalidto = cardvalidtoValue;
		});
	}

	editUser(page = 'remove') {
		$(`.main[data-name=${page}] .table__body`).click(({ target }) => {
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

	submitIDinBD(page = 'remove') {
		$('.btn--submit').click(() => {
			if (!this.collection.size) return;

			this.collection.forEach((user) => {
				user.nameid = settingsObject.nameid;
				user.date = service.getCurrentDate();
			});

			const removeArray = [...this.collection.values()].filter(({ statusid }) => statusid === 'remove');
			const changeDepartArray = [...this.collection.values()].filter(({ statusid }) => statusid === 'changeDepart');

			if (removeArray.length) {
				this.setAddUsersInDB(removeArray, 'add', 'remove');
			}
			if (changeDepartArray.length) {
				this.setAddUsersInDB(changeDepartArray, 'add', 'transfer');
			}

			this.collection.clear();
			this.render();

			localStorage.removeItem(page);
			this.counter = 0;
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

				this.sendMail({
					department: settingsObject.longname,
					count: this.collection.size,
					title: 'Удалить',
					users: [...this.collection.values()]
				});
			},
			error: () => {
				service.modal('error');
			}
		});
	}

	getAddUsersInDB(id = '') {
		$.ajax({
			url: "./php/output-request.php",
			method: "post",
			dataType: "html",
			data: {
				id,
				idDepart: settingsObject.nameid,
				nameTable: 'remove'
			},
			success: (data) => {
				if (id) {
					const { id = '', post = '', photofile = '' } = JSON.parse(data);

					this.object.post = post;
					this.object.id = id;
					this.object.photofile = photofile;

					this.render();
				} else {
					this.setUsersInSelect(JSON.parse(data));
				}
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
		const sender = sendUsers.manager;
		const recipient = sendUsers.operator;
		const subject = 'Запрос на удаление пользователей из БД';

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

export default Remove;
