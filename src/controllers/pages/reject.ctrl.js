'use strict';

import $ from 'jquery';
import service from '../../js/service.js';
import Scrollbar from 'smooth-scrollbar';
import { settingsObject, sendUsers } from '../settings.ctrl.js';

import Main from '../main.ctrl.js';
import RejectModel from '../../models/pages/reject.model.js';

class Reject extends Main {
	constructor(props) {
		super({ ...props, mark: 'reject' });

		({
			page: this.page = ''
		} = props);

		this.object = {
			title: 'Отклоненные пользователи',
			id: '',
			statusresend: '',
			errors: [],
			get nameid() {
				return settingsObject.nameid;
			},
			get longname() {
				return settingsObject.longname;
			}
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
				title: 'Количество отклоненных пользователей:&nbsp',
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
				message: 'Предупреждение! Ни один пользователь не выбран.'
			}
		];
		this.untouchable = ['nameid', 'longname', 'title', 'errors'];
		this.mail = {
			sender: sendUsers.manager,
			recipient: sendUsers.secretary,
			subject: 'Запрос на повторное добавление пользователей в БД',
			objectData: {}
		};

		this.count.item.count = {
			collection: this.collection
		};

		this.showDataFromStorage();
	}

	render() {
		const rejectModel = new RejectModel({
			object: this.object,
			checkNameId: 'single',
			collection: this.collection,
			count: this.count,
			switchItem: this.switch,
			info: this.info,
			errors: this.object.errors,
			emptyMess: 'Новых пользователей нет'
		});

		$(`.main[data-name=${this.page}]`).html('');
		$(`.main[data-name=${this.page}]`).append(rejectModel.render());

		this.autoRefresh();
		this.resendAllUsers();
		this.viewDataUser();
		this.resendUsers();
		this.submitIDinBD();
		this.closeRejectForm();

		if ($('.form__item--message').length) {
			Scrollbar.init($('.form__item--message').get(0));
		}
	}

	userFromDB(array) {
		const objToCollection = {
			id: '',
			fio: '',
			post: '',
			photofile: '',
			photourl: '',
			statusid: '',
			statustitle: '',
			statususer: '',
			сardvalidto: '',
			resend: ''
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
			const checkedItems = [...this.collection.values()].some(({ statususer }) => statususer);

			if (checkedItems) {
				const resendItems = [...this.collection.values()].filter(({ statususer }) => statususer);

				this.object.errors = [];

				resendItems.forEach((elem) => {
					elem.nameid = settingsObject.nameid;
					elem.department = settingsObject.longname;
				});

				this.setAddUsersInDB(resendItems, 'permis', 'add');

				resendItems.forEach(({ id: userID }) => {
					[...this.collection].forEach(([key, { id }]) => {
						if (userID === id) {
							this.collection.delete(key);
						}
					});
				});
				resendItems.splice(0);

				this.clearObject();
				super.dataAdd();
				localStorage.removeItem(this.page);
			} else {
				this.object.errors = ['fields'];
				this.render();
			}
		});
	}

	viewDataUser() {
		$(`.main[data-name=${this.page}] .table__body`).click(({ target }) => {
			if ($(target).parents('.table__btn--view').length || $(target).hasClass('table__btn--view')) {
				this.object.id = $(target).parents('.table__row').data('id');

				this.render();
			}
		});
	}

	resendUsers() {
		$(`.main[data-name=${this.page}] .table__body`).click(({ target }) => {
			if (!$(target).hasClass('btn--resend')) return;

			const userID = $(target).parents('.table__row').data('id');
			let collectionID;

			[...this.collection].forEach(([key, { id }]) => {
				if (userID === +id) {
					collectionID = key;
				}
			});

			const user = this.collection.get(collectionID);
			user.resend = !user.resend;
			user.statususer = user.resend;
			const allStatusUsers = [...this.collection.values()].some(({ resend }) => resend);

			console.log(user.resend);
			if (!allStatusUsers) {
				localStorage.removeItem(this.page);
			} else {
				this.setDataInStorage();
			}

			this.render();
		});
	}

	resendAllUsers() {
		$(`.main[data-name=${this.page}] #resendAll`).click(() => {
			this.object.statusresend = !this.object.statusresend;

			this.collection.forEach((item) => {
				item.resend = '';
				item.statususer = this.object.statusresend;
				item.resendblock = this.object.statusresend;
			});

			if (!this.object.statusresend) {
				localStorage.removeItem(this.page);
			} else {
				this.setDataInStorage();
			}

			this.render();
		});
	}

	closeRejectForm() {
		$('#closeRejectForm').click(() => {
			this.object.id = '';

			this.render();
		});
	}

	// Общие функции с картами и кодами
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

				this.mail.objectData = {
					department: settingsObject.longname,
					count: this.collection.size,
					title: 'Повторно добавить',
					users: [...this.collection.values()]
				};

				this.sendMail();
			},
			error: () => {
				service.modal('error');
			}
		});
	}
}

export default Reject;
