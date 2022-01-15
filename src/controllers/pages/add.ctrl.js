'use strict';

import $ from 'jquery';
import datepickerFactory from 'jquery-datepicker';
import datepickerRUFactory from 'jquery-datepicker/i18n/jquery.ui.datepicker-ru';
import service from '../../js/service.js';
import Settings from './settings.ctrl.js';
import { modalUser } from '../../components/add/modal-user.tpl.js';

import Personnel from '../personnel.ctrl.js';
import AddModel from '../../models/pages/add.model.js';

datepickerFactory($);
datepickerRUFactory($);

class Add extends Personnel {
	constructor(props) {
		super(props);

		({
			page: this.page = ''
		} = props);

		this.dbUserNamesCollection = new Map();
		this.object = {
			title: 'Добавить новых пользователей',
			id: '',
			fio: '',
			post: '',
			photofile: '',
			photourl: '',
			photoname: '',
			statusid: '',
			statustitle: '',
			cardvalidto: '',
			cardvalidtoid: '',
			cardvalidtotitle: '',
			statuscardvalidto: '',
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
				title: 'Количество добавляемых пользователей:&nbsp',
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
			},
			{
				type: 'warn',
				title: 'have',
				message: 'Предупреждение! Пользователь с таким именем уже добавлен!'
			},
			{
				type: 'error',
				title: 'name',
				message: 'Ошибка! Имя содержит недопустимые символы. Разрешены: кириллические буквы, дефис, точка, апостроф.'
			},
			{
				type: 'error',
				title: 'image',
				message: 'Ошибка! Не правильный формат изображение. Допустимы: giff, png, jpg, jpeg.'
			},
			{
				type: 'error',
				title: 'short',
				message: 'Ошибка! ФИО должно состоять хотя бы из двух слов.'
			}
		];
		this.untouchable = ['nameid', 'longname', 'title', 'errors'];
		this.mail = {
			sender: new Settings().sendUsers.manager,
			recipient: new Settings().sendUsers.secretary,
			subject: 'Запрос на добавление пользователей в БД',
			objectData: {}
		};
		this.counter = 0;

		this.count.item.count = {
			collection: this.collection
		};

		this.showDataFromStorage(); // 1
		this.getUserNamesFromDB();
	}

	render() {
		const addModel = new AddModel({
			pageName: 'add',
			object: this.object,
			checkNameId: 'double',
			collection: this.collection,
			count: this.count,
			info: this.info,
			errors: this.object.errors,
			emptyMess: 'Не добавленно ни одного пользователя'
		});

		$(`.main[data-name=${this.page}]`).html('');
		$(`.main[data-name=${this.page}]`).append(addModel.render());

		this.deleteUser();
		this.editUser();
		this.toggleSelect();
		this.datepicker();
		this.downloadFoto();
		this.memberInputField();
		this.addUser(); // 2 без загрузки фото и загрузки селектов не пройдет валидация в addUser
		this.submitIDinBD();
	}

	renderModalContainsUser() {
		$('.modal').addClass('modal--active');
		$('.modal__item--user')
			.html('')
			.addClass('modal__item--active');

		this.dbUserNamesCollection.forEach((item) => {
			if (this.object.fio === item.fio) {
				$('.modal__item--user').append(modalUser(item));
			}
		});

		this.modalActions();
	}

	modalActions() {
		$('.modal__btn').click(({ currentTarget }) => {
			const btnName = $(currentTarget).data('name');

			$('.modal').removeClass('modal--active');
			$('.modal__item').removeClass('modal__item--active');

			if (btnName === 'add') {
				this.userFromForm();
			}

			this.clearObject();
		});
	}

	addUser() {
		$('#addUser').click(() => {
			if (this.object.cardvalidtoid !== 'date') {
				delete this.object.cardvalidto;
			}

			delete this.object.statuscardvalidto;

			this.object.id = `${this.counter}`;

			const validFields = Object.values(this.object).every((item) => item);
			const errorsArr = [];

			if (!validFields) errorsArr.push('fields');

			for (let key in this.object) {
				if (key === 'fio' && this.object[key]) {
					const countWords = this.object[key].trim().split(' ');

					if (this.object[key].match(/[^а-яА-ЯiIъїЁё.'-\s]/g)) errorsArr.push('name');
					if (countWords.length < 2) errorsArr.push('short');
				}
			}

			if (!errorsArr.length) {
				this.checkContainsUser();
			} else {
				this.object.errors = errorsArr;
			}

			this.render();
		});
	}

	checkContainsUser() {
		const uniqueName = [...this.collection.values()].every(({ fio }) => fio !== this.object.fio);
		const containsName = [...this.dbUserNamesCollection.values()].every(({ fio }) => fio !== this.object.fio);

		if (uniqueName) {
			this.object.errors = [];
		} else {
			this.object.errors = ['have'];

			return;
		}

		if (!containsName) {
			this.renderModalContainsUser();
		}

		if (uniqueName && containsName) {
			this.userFromForm();
			this.clearObject();
		}
	}

	userFromForm() {
		const objToCollection = {
			id: '',
			fio: '',
			post: '',
			photofile: '',
			photourl: '',
			photoname: '',
			statusid: '',
			statustitle: '',
			cardvalidto: '',
			cardvalidtoid: '',
			cardvalidtotitle: ''
		};
		const itemObject = { ...objToCollection };

		for (const itemField in itemObject) {
			for (const key in this.object) {
				if (itemField === key) {
					itemObject[itemField] = this.object[key];
				} else if (itemField === 'id') {
					itemObject[itemField] = this.counter;
				}
			}
		}

		this.collection.set(this.counter, itemObject);
		this.counter++;

		this.setDataInStorage();
		super.dataAdd();
	}

	setDataInStorage() {
		new Promise((resolve) => {
			const encodeArrayPhotoFile = [];
			const reader = new FileReader();

			this.collection.forEach((user) => {
				if (typeof user.photofile === 'object') {
					reader.onload = ({ currentTarget }) => {
						user.photofile = currentTarget.result;

						encodeArrayPhotoFile.push(user);
					};
					reader.readAsDataURL(user.photofile);
				} else {
					encodeArrayPhotoFile.push(user);
				}
			});
			setTimeout(() => {
				resolve(encodeArrayPhotoFile);
			}, 0);
		}).then((array) => {
			setTimeout(() => {
				localStorage.setItem(this.page, JSON.stringify({
					collection: array
				}));
			}, 0);
		});
	}

	setDataAttrSelectedItem(title, select, statusid) {
		if (select === 'type') {
			this.object.statusid = statusid;
			this.object.statustitle = title;
		} else {
			this.object.cardvalidtoid = statusid;
			this.object.cardvalidtotitle = title;
			this.object.cardvalidto = statusid === 'date' ? this.object.cardvalidto : '';
			this.object.statuscardvalidto = statusid === 'date';
		}

		this.render();
	}

	memberInputField() {
		$('.form__item').keyup(({ currentTarget }) => {
			const nameField = $(currentTarget).data('field');
			const fieldValue = $(currentTarget).val().trim();

			this.object[nameField] = fieldValue ? fieldValue : '';
		});
	}

	datepicker() {
		$("#addDatepicker").datepicker({
			changeMonth: true,
			changeYear: true,
			showOtherMonths: true,
			selectOtherMonths: true,
			minDate: "+1D",
			maxViewMode: 10
		});

		$('#addDatepicker').change(({ currentTarget }) => {
			const cardvalidtoValue = $(currentTarget).val();

			this.object.cardvalidto = cardvalidtoValue;
		});
	}

	downloadFoto() {
		$(`.main[data-name=${this.page}] .form__item--file`).change(({ target }) => {
			const fileNameUrl = $(target).val();
			const indexLastSlash = fileNameUrl.lastIndexOf('\\');
			const photoName = fileNameUrl.slice(indexLastSlash + 1);
			const file = target.files[0];
			const url = URL.createObjectURL(file);
			const validPhotoName = this.validPhotoExtention(photoName);

			if (!validPhotoName) {
				this.object.errors = ['image'];

				return;
			}

			this.object.photourl = url;
			this.object.photofile = file;
			this.object.photoname = photoName;

			this.render();
		});
	}

	validPhotoExtention(photoName) {
		const extenName = photoName.lastIndexOf('.');
		const extenImg = photoName.slice(extenName + 1);
		const extentionArray = ['gif', 'png', 'jpg', 'jpeg'];
		const validPhotoName = extentionArray.some((item) => item == extenImg) ? photoName : false;

		return validPhotoName;
	}

	submitIDinBD() {
		$('.btn--submit').click(() => {
			if (!this.collection.size) return;

			this.collection.forEach((user) => {
				user.nameid = new Settings().object.nameid;
				user.date = service.getCurrentDate();
			});

			this.setAddUsersInDB([...this.collection.values()], 'add', this.page);

			this.collection.clear();
			this.render();

			localStorage.removeItem(this.page);
			this.counter = 0;
		});
	}

	setAddUsersInDB(array, nameTable, action) {
		new Promise((resolve) => {
			const encodeArrayPhotoFile = [];
			const reader = new FileReader();

			array.forEach((user) => {
				if (typeof user.photofile === 'object') {
					reader.onload = ({ currentTarget }) => {
						user.photofile = currentTarget.result;

						encodeArrayPhotoFile.push(user);
					};
					reader.readAsDataURL(user.photofile);
				} else {
					encodeArrayPhotoFile.push(user);
				}
			});

			setTimeout(() => {
				resolve(encodeArrayPhotoFile);
			}, 0);
		}).then((array) => {
			$.ajax({
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

					this.mail.objectData = {
						department: new Settings().object.longname,
						count: this.collection.size,
						title: 'Добавлено',
						users: [...this.collection.values()]
					};

					this.sendMail();
				},
				error: () => {
					service.modal('error');
				}
			});
		});
	}

	getUserNamesFromDB() {
		$.ajax({
			url: "./php/output-request.php",
			method: "post",
			dataType: "html",
			async: false,
			data: {
				nameTable: 'names',
				nameDepart: new Settings().object.nameid
			},
			success: (data) => {
				const dataFromDB = JSON.parse(data);

				dataFromDB.forEach((item, i) => {
					this.dbUserNamesCollection.set(i + 1, item);
				});
			},
			error: () => {
				service.modal('download');
			}
		});
	}
}

export default Add;
