'use strict';

import $ from 'jquery';
import QRCode from 'qrcode';
import service from '../../js/service.js';
import Settings from './settings.ctrl.js';

import { qrItems } from '../../components/qr/qr-items.tpl.js';

import ControlDepartment from '../controlDepartment.ctrl.js';
import QRModel from '../../models/pages/qr.model.js';

class QR extends ControlDepartment {
	constructor(props) {
		super({ ...props, mark: 'qr' });

		({
			page: this.page = ''
		} = props);

		this.generateCollection = new Map(); // Коллекция сформированных qr-кодов
		this.object = {
			title: 'Добавление QR-кодов пользователям',
			nameid: '',
			longname: '',
			shortname: '',
			statusmanual: '',
			statusassign: '',
			errors: []
		};
		this.switch = {
			refresh: {
				type: 'refresh',
				status: false,
				marker: 0
			},
			assign: {
				type: 'assign',
				status: false
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
			generate: {
				title: 'Осталось сгенерированных QR:&nbsp',
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
				message: 'Предупреждение! Не всем пользователям присвоен идентификатор.'
			},
			{
				type: 'warn',
				title: 'deficit',
				message: 'Предупреждение! Недостаточно qr-кодов для присвоения пользователям.'
			}
		];
		this.untouchable = ['title', 'errors'];
		this.mail = {
			sender: new Settings().sendUsers.operator,
			recipient: new Settings().sendUsers.manager,
			subject: 'Пользователи успешно добавлены в БД',
			objectData: {}
		};

		this.count.item.count = {
			collection: this.collection,
			object: this.object
		};
		this.count.all.count = {
			collection: this.collection
		};
		this.count.generate.count = {
			collection: this.generateCollection
		};

		this.showDataFromStorage();
	}

	render() {
		const qrModel = new QRModel({
			page: this.page,
			object: this.object,
			checkNameId: 'double-check',
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
		$(`.main[data-name=${this.page}]`).append(qrModel.render());

		this.autoRefresh();
		this.typeAssignCode();
		this.assignAllQR();
		this.submitIDinBD();

		if (this.filterDepart().length > 1) this.changeTabs();
	}

	renderQRItems(array) {
		$('.document').html('');
		$('.document').append(qrItems(array, this.object));
	}

	userFromDB(array) {
		const objToCollection = {
			id: '',
			fio: '',
			post: '',
			nameid: '',
			photofile: '',
			statusid: '', // посмотреть используется ли в отчете
			statustitle: '', // посмотреть используется ли в отчете
			department: '', // посмотреть используется ли в отчете
			сardvalidto: '',
			codeid: '',
			codepicture: '',
			cardid: '',
			cardname: '',
			pictureurl: ''
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

	typeAssignCode() {
		$(`.main[data-name=${this.page}] .switch--assign`).click(({ target }) => {
			if (!$(target).hasClass('switch__input')) return;

			this.object.statusmanual = $(target).prop('checked');
			this.switch.assign.status = this.object.statusmanual;

			if (this.switch.refresh.status || this.switch.assign.status) {
				this.setDataInStorage();
			} else {
				localStorage.removeItem(this.page);
			}

			this.resetControlSwitch();
			this.assignCodes();
			this.render();
		});
	}

	assignCodes() {
		if (this.collection.size > this.generateCollection.size && !this.object.statusmanual) {
			this.object.errors = ['deficit'];

			return;
		} else {
			this.object.errors = [];
		}

		if (!this.object.statusmanual) {
			this.collection.forEach((user, i) => {
				this.generateCollection.forEach((code, j) => {
					if (i === j) {
						const { id, codepicture, cardid, cardname } = code;

						user.codeid = id;
						user.codepicture = codepicture;
						user.cardid = cardid;
						user.cardname = cardname;
					}
				});
			});
		} else {
			this.assignAllQR();
		}
	}

	dataAdd() {
		super.dataAdd();
		this.getGeneratedQRFromDB()
			.then(() => {
				this.assignCodes();
			});
	}

	submitIDinBD() {
		$('.btn--submit').click(() => {
			const filterDepartCollection = [...this.collection.values()].filter(({ nameid }) => nameid == this.object.nameid);
			const checkedItems = filterDepartCollection.every(({ cardid }) => cardid);

			if (checkedItems) {
				this.object.errors = [];

				this.collection.forEach((item) => {
					if (item.nameid === this.object.nameid) {
						item.date = service.getCurrentDate();
					}
				});

				this.setAddUsersInDB(filterDepartCollection, 'const', 'report', 'qr')
					.then(() => {
						filterDepartCollection.forEach(({ id: userID, codeid }) => {
							[...this.collection].forEach(([key, { id }]) => {
								if (userID === id) {
									this.collection.delete(key);
								}
							});
							[...this.generateCollection].forEach(([key, { id }]) => {
								if (codeid === id) {
									this.generateCollection.delete(key);
								}
							});
						});

						filterDepartCollection.splice(0);
						super.clearObject(); // сначала сбрасываем объект потом проверка

						if (!this.object.statusmanual) {
							this.resetControlSwitch();
						} else {
							this.object.statusmanual = true;
						}

						this.dataAdd();
						this.typeAssignCode();
						localStorage.removeItem(this.page);
					});
			} else {
				this.object.errors = ['fields'];

				this.render();
			}
		});
	}

	assignAllQR() {
		$(`.main[data-name=${this.page}] #assignAll`).click(({ target }) => {
			if (!$(target).hasClass('switch__input')) return;

			const filterDepartCollection = [...this.collection.values()].filter(({ nameid }) => nameid === this.object.nameid);
			this.object.statusassign = $(target).prop('checked');

			if (filterDepartCollection.length > this.generateCollection.size) {
				this.object.statusassign = false;

				this.object.errors = ['deficit'];

				return;
			} else {
				this.object.errors = [];
			}

			if (this.object.statusassign) {
				let counter = 0;

				this.collection.forEach((user) => {
					if (user.nameid === this.object.nameid && !user.codeid) {
						const { id, codepicture, cardid, cardname } = this.generateCollection.get(counter);

						user.codeid = id;
						user.codepicture = codepicture;
						user.cardid = cardid;
						user.cardname = cardname;

						counter++;
					}
				});
			} else {
				this.resetControlSwitch();
			}

			this.render();
			this.setDataInStorage();
		});
	}

	resetControlSwitch() {
		this.object.statusassign = '';

		this.collection.forEach((user) => {
			user.codeid = '';
			user.codepicture = '';
			user.cardid = '';
			user.cardname = '';
		});
	}

	async setAddUsersInDB(array, nameTable, action, typeTable) {
		await new Promise((resolve) => {
			const filterUsers = [];

			this.collection.forEach((user) => {
				if (user.codeid) {
					QRCode.toDataURL(user.codepicture)
						.then((url) => {
							user.pictureurl = url;

							filterUsers.push(user);
						})
						.catch((error) => {
							service.modal('qr');
							console.log(error);
						});
				}
			});

			resolve(filterUsers);
		}).then((array) => {
			this.renderQRItems(array);
		}).then(() => {
			$.ajax({
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
					// window.print();
					service.modal('success');

					this.mail.objectData = {
						department: this.object.longname,
						count: array.length,
						title: 'Добавлено',
						users: array
					};

					this.sendMail();
				},
				error: () => {
					service.modal('error');
				}
			});
		});
	}

	async getGeneratedQRFromDB() {
		await $.ajax({
			url: "./php/output-request.php",
			method: "post",
			dataType: "html",
			data: {
				nameTable: 'download'
			},
			success: (data) => {
				const dataFromDB = JSON.parse(data);

				this.generateCollection.clear();

				dataFromDB.forEach((item, i) => {
					this.generateCollection.set(i, item);
				});
			},
			error: () => {
				service.modal('download');
			}
		});
	}
}

export default QR;
