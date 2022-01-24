'use strict';

import $ from 'jquery';
import service from '../../js/service.js';
import Settings from './settings.ctrl.js';
import { select } from '../../components/select.tpl.js';

import Personnel from '../personnel.ctrl.js';
import EditModel from '../../models/pages/edit.model.js';

class Edit extends Personnel {
	constructor(props) {
		super(props);

		({
			page: this.page = ''
		} = props);

		this.object = {
			title: 'Редактировать пользователей',
			id: '',
			fio: '',
			post: '',
			photofile: '',
			statusid: '',
			statustitle: '',
			newfio: '',
			newpost: '',
			newphotofile: '',
			newphotourl: '',
			newphotoname: '',
			statusnewfio: '',
			statusnewpost: '',
			statusnewphotofile: '',
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
				title: 'Количество редактируемых пользователей:&nbsp',
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
				type: 'error',
				title: 'name',
				message: 'Ошибка! Имя содержит недопустимые символы. Разрешены: кириллические буквы, дефис, точка, апостроф.'
			},
			{
				type: 'error',
				title: 'post',
				message: 'Ошибка! Должность содержит недопустимые символы. Разрешены: кириллические буквы, цифры, дефис, точка, апостроф.'
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
			recipient: new Settings().sendUsers.operator,
			subject: 'Запрос на редактирование данных пользователей в БД',
			objectData: {}
		};
		this.counter = 0;

		this.count.item.count = {
			collection: this.collection
		};

		super.showDataFromStorage();
	}

	render() {
		const editModel = new EditModel({
			pageName: 'edit',
			object: this.object,
			checkNameId: 'double',
			collection: this.collection,
			count: this.count,
			info: this.info,
			errors: this.object.errors,
			emptyMess: 'Не добавленно ни одного пользователя'
		});

		$(`.main[data-name=${this.page}]`).html('');
		$(`.main[data-name=${this.page}]`).append(editModel.render());

		this.deleteUser();
		this.editUser();
		this.toggleSelect();
		this.getAddUsersInDB();
		this.downloadFoto();
		this.memberInputField();
		this.addUser();
		this.submitIDinBD();
	}

	addUser() {
		$('#editUser').click(() => {
			if (this.object.statusid !== 'changeFIO') {
				delete this.object.newfio;
			}
			if (this.object.statusid !== 'changePost') {
				delete this.object.newpost;
			}
			if (this.object.statusid !== 'changeImage') {
				delete this.object.newphotoname;
				delete this.object.newphotourl;
				delete this.object.newphotofile;
			}

			delete this.object.statusnewfio;
			delete this.object.statusnewpost;
			delete this.object.statusnewphotofile;

			const validFields = Object.values(this.object).every((item) => item);
			const errorsArr = [];

			if (!validFields) errorsArr.push('fields');

			for (let key in this.object) {
				if (key === 'newfio' && this.object[key]) {
					const countWords = this.object[key].trim().split(' ');

					if (this.object[key].match(/[^а-яА-ЯiIъїЁё.'-\s]/g)) errorsArr.push('name');
					if (countWords.length < 2) errorsArr.push('short');
				} else if (key === 'newpost' && this.object[key]) {
					if (this.object[key].match(/[^а-яА-ЯiIъїЁё0-9.'-\s]/g)) errorsArr.push('post');
				}
			}

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
			statustitle: '',
			statusid: '',
			newpost: '',
			newfio: '',
			newphotofile: '',
			newphotourl: '',
			newphotoname: ''
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
		new Promise((resolve) => {
			const encodeArrayPhotoFile = [];
			const reader = new FileReader();

			this.collection.forEach((user) => {
				if (typeof user.newphotofile === 'object' && user.statusid === 'changeImage') {
					reader.onload = ({ currentTarget }) => {
						user.newphotofile = currentTarget.result;

						encodeArrayPhotoFile.push(user);
					};
					reader.readAsDataURL(user.newphotofile);
				} else {
					encodeArrayPhotoFile.push(user);
				}
			});

			resolve(encodeArrayPhotoFile);
		}).then((array) => {
			localStorage.setItem(this.page, JSON.stringify({
				collection: array
			}));
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
			this.object.newfio = '';
			this.object.newpost = '';
			this.object.newphotofile = '';
			this.object.newphotourl = '';
			this.object.newphotoname = '';
		} else if (select === 'change') {
			this.object.statustitle = title;
			this.object.statusid = statusid;

			if (statusid !== 'changeFIO') {
				this.object.newfio = '';
			}
			if (statusid !== "changePost") {
				this.object.newpost = '';
			}
			if (statusid !== "changeImage") {
				this.object.newphotofile = '';
				this.object.newphotourl = '';
				this.object.newphotoname = '';
			}
		}

		this.render();
	}

	memberInputField() {
		$('.form__item').keyup(({ currentTarget }) => {
			const nameField = $(currentTarget).attr('name');
			const fieldValue = $(currentTarget).val().trim();

			this.object[nameField] = fieldValue ? fieldValue : '';
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

			this.object.newphotourl = url;
			this.object.newphotofile = file;
			this.object.newphotoname = photoName;

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

			this.collection.forEach((elem) => {
				elem.nameid = new Settings().object.nameid;
				elem.date = service.getCurrentDate();
			});

			const changeCardArray = [...this.collection.values()].filter(({ statusid }) => statusid === 'changeCard');
			const changeQRArray = [...this.collection.values()].filter(({ statusid }) => statusid === 'changeQR');
			const changeFIOArray = [...this.collection.values()].filter(({ statusid }) => statusid === 'changeFIO');
			const changePostArray = [...this.collection.values()].filter(({ statusid }) => statusid === 'changePost');
			const changeImageArray = [...this.collection.values()].filter(({ statusid }) => statusid === 'changeImage');

			new Promise((resolve) => {
				if (changeCardArray.length) {
					resolve(this.setAddUsersInDB(changeCardArray, 'permission', this.page));
				}
				if (changeQRArray.length) {
					resolve(this.setAddUsersInDB(changeQRArray, 'permission', this.page));
				}
				if (changeFIOArray.length) {
					resolve(this.setAddUsersInDB(changeFIOArray, 'add', this.page));
				}
				if (changePostArray.length) {
					resolve(this.setAddUsersInDB(changePostArray, 'add', this.page));
				}
				if (changeImageArray.length) {
					resolve(this.setAddUsersInDB(changeImageArray, 'add', this.page));
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
		await new Promise((resolve) => {
			const encodeArrayPhotoFile = [];
			const reader = new FileReader();

			array.forEach((user) => {
				if (typeof user.newphotofile === 'object' && user.statusid === 'changeImage') {
					reader.onload = ({ currentTarget }) => {
						user.newphotofile = currentTarget.result;

						encodeArrayPhotoFile.push(user);
					};
					reader.readAsDataURL(user.newphotofile);
				} else {
					encodeArrayPhotoFile.push(user);
				}
			});

			resolve(encodeArrayPhotoFile);
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

					if (nameTable === 'permission') {
						this.mail.objectData = {
							department: new Settings().object.longname,
							count: array.length,
							title: 'Редактировать',
							users: array
						};

						this.sendMail();
					}
				},
				error: () => {
					service.modal('error');
				}
			});
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
				nameTable: 'edit'
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
}

export default Edit;
