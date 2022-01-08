'use strict';

import $ from 'jquery';
import service from '../../js/service.js';
import { sendUsers } from '../settings.ctrl.js';

import ControlDepartment from '../controlDepartment.ctrl.js';
import ConstModel from '../../models/pages/const.model.js';

class Const extends ControlDepartment {
	constructor(props) {
		super({ ...props, mark: 'const' });

		({
			page: this.page = ''
		} = props);

		this.departmentCollection = new Map();  // Коллекция подразделений
		this.object = {
			title: 'Добавление карт пользователям',
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
		this.untouchable = ['title', 'errors'];
		this.mail = {
			sender: sendUsers.operator,
			recipient: sendUsers.manager,
			subject: 'Пользователи успешно добавлены в БД',
			objectData: {}
		};
		this.typeTable = 'card';

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
		const constModel = new ConstModel({
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
		$(`.main[data-name=${this.page}]`).append(constModel.render());

		this.autoRefresh();
		super.convertCardIDInCardName();
		super.clearNumberCard();
		this.submitIDinBD();
		this.printReport();

		if (this.filterDepart().length > 1) this.changeTabs();
	}

	userFromDB(array) {
		const objToCollection = {
			id: '',
			fio: '',
			post: '',
			nameid: '',
			photofile: '',
			statusid: '',
			statustitle: '',
			department: '',
			сardvalidto: '',
			cardid: '',
			cardname: ''
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

	setDataInStorage() {
		localStorage.setItem(this.page, JSON.stringify({
			settings: this.switch,
			collection: [...this.collection.values()]
		}));
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

				this.setAddUsersInDB(filterDepartCollection, 'const', 'report', 'card');

				filterDepartCollection.forEach(({ id: userID }) => {
					[...this.collection].forEach(([key, { id }]) => {
						if (userID === id) {
							this.collection.delete(key);
						}
					});
				});
				filterDepartCollection.splice(0);

				this.clearObject();
				super.dataAdd();

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
			success: (data) => {
				console.log(data);
				window.print();
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
	}

	// Общие функции с картами и кодами
	printReport() {
		$(`.main[data-name=${this.page}] .btn--print`).click(() => {
			window.print();
		});
	}
}

export default Const;
