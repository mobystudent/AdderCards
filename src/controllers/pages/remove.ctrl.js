'use strict';

import $ from 'jquery';
import datepickerFactory from 'jquery-datepicker';
import datepickerRUFactory from 'jquery-datepicker/i18n/jquery.ui.datepicker-ru';
import service from '../../js/service.js';
import Settings from './settings.ctrl.js';
import { select } from '../../components/select.tpl.js';

import Personnel from '../personnel.ctrl.js';
import RemoveModel from '../../models/pages/remove.model.js';

datepickerFactory($);
datepickerRUFactory($);

class Remove extends Personnel {
	constructor(props) {
		super(props);

		({
			page: this.page = ''
		} = props);

		this.departmentCollection = new Map();  // Коллекция подразделений
		this.object = {
			title: 'Удаление пользователей',
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
				return new Settings().object.nameid;
			},
			get longname() {
				return new Settings().object.longname;
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
		this.untouchable = ['nameid', 'longname', 'title', 'errors'];
		this.mail = {
			sender: new Settings().sendUsers.manager,
			recipient: new Settings().sendUsers.operator,
			subject: 'Запрос на удаление пользователей из БД',
			objectData: {}
		};
		this.counter = 0;

		this.count.item.count = {
			collection: this.collection
		};

		this.getDepartmentFromDB();
		super.showDataFromStorage();
	}

	render() {
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

		$(`.main[data-name=${this.page}]`).html('');
		$(`.main[data-name=${this.page}]`).append(removeModel.render());

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
				super.clearObject();
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

	setDataInStorage() {
		localStorage.setItem(this.page, JSON.stringify({
			collection: [...this.collection.values()]
		}));
	}

	setDepartInSelect() {
		this.departmentCollection.forEach(({ nameid = '', longname = '' }) => {
			const quoteName = longname.replace(/["']/g, '&quot;');

			if (nameid !== new Settings().object.nameid) {
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

	setUsersInSelect(users) {
		$(`.main[data-name=${this.page}] .select[data-select="fio"] .select__list`).html('');

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

			$(`.main[data-name=${this.page}] .select[data-select="fio"] .select__list`).append(select(item));
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

	submitIDinBD() {
		$('.btn--submit').click(() => {
			if (!this.collection.size) return;

			this.collection.forEach((user) => {
				user.nameid = new Settings().object.nameid;
				user.date = service.getCurrentDate();
			});

			const removeArray = [...this.collection.values()].filter(({ statusid }) => statusid === 'remove');
			const changeDepartArray = [...this.collection.values()].filter(({ statusid }) => statusid === 'changeDepart');

			new Promise((resolve) => {
				if (removeArray.length) {
					resolve(this.setAddUsersInDB(removeArray, 'add', 'remove'));
				}
				if (changeDepartArray.length) {
					resolve(this.setAddUsersInDB(changeDepartArray, 'add', 'transfer'));
				}
			})
			.then(() => {
				this.collection.clear();
				this.render();
				localStorage.removeItem(this.page);
				this.counter = 0;
			});
		});
	}

	async setAddUsersInDB(array, nameTable, action) {
		await $.ajax({
			url: "./php/change-user-request.php",
			method: "post",
			dataType: "html",
			data: {
				action,
				nameTable,
				array
			},
			success: () => {
				service.modal('success');

				if (action === 'remove') {
					this.mail.objectData = {
						department: new Settings().object.longname,
						count: array.length,
						title: 'Удалить',
						users: array
					};

					super.sendMail();
				}
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
				idDepart: new Settings().object.nameid,
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
}

export default Remove;
