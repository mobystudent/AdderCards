'use strict';

import $ from 'jquery';
import service from '../js/service.js';
import messageMail from './../js/mail.js';
import Settings from './pages/settings.ctrl.js';

class Main {
	constructor(props) {
		({
			page: this.page = '',
			mark: this.mark = ''
		} = props);

		this.mail = {};
		this.collection = new Map(); // БД пользователей при старте
	}

	dataAdd() {
		this.render();
	}

	showDataFromStorage() {
		const storageCollection = JSON.parse(localStorage.getItem(this.page));

		if (storageCollection && storageCollection.collection.length && !this.collection.size) {
			const { refresh } = storageCollection.settings;

			storageCollection.collection.forEach((item, i) => {
				const itemID = storageCollection.collection[i].id;

				this.collection.set(itemID, item);
			});

			switch (this.mark) {
				case 'reject': {
					const { statusresend } = storageCollection.controls;
					this.object.statusresend = statusresend;
					break;
				}
				case 'access': {
					const { statusallow, statusdisallow } = storageCollection.controls;
					this.object.statusallow = statusallow;
					this.object.statusdisallow = statusdisallow;
					break;
				}
				case 'qr': {
					const { statusmanual, statusassign } = storageCollection.controls;
					const { assign } = storageCollection.settings;
					this.object.statusassign = statusassign;
					this.object.statusmanual = statusmanual;
					this.switch.assign = assign;
					break;
				}
			}

			this.switch.refresh = refresh;

			this.dataAdd();
		} else {
			this.getDataFromDB();
		}
	}

	setDataInStorage() {
		localStorage.setItem(this.page, JSON.stringify({
			settings: this.switch,
			controls: this.object,
			collection: [...this.collection.values()]
		}));
	}

	autoRefresh() {
		const timeReload = 60000 * new Settings().object.autoupdatevalue;

		$(`.main[data-name=${this.page}] .switch--refresh`).click(({ target }) => {
			if (!$(target).hasClass('switch__input')) return;

			const statusSwitch = $(target).prop('checked');
			this.switch.refresh.status = statusSwitch;

			if (statusSwitch && !this.switch.refresh.marker) {
				localStorage.removeItem(this.page);
				this.collection.clear();

				if (this.mark === 'access') {
					this.resetControlBtns(); // 1
				}
				if (this.mark === 'qr') {
					this.object.statusassign = '';

					this.assignCodes();
				} else if (this.mark !== 'report') {
					this.setDataInStorage();
				}
				this.getDataFromDB(); // 2

				this.switch.refresh.marker = setInterval(() => {
					this.getDataFromDB();
				}, timeReload);
			} else if (!statusSwitch && this.switch.refresh.marker) {
				clearInterval(this.switch.refresh.marker);

				this.switch.refresh.marker = false;

				if (this.mark === 'qr') {
					if (this.switch.refresh.status || this.switch.assign.status) {
						this.setDataInStorage();
					} else {
						localStorage.removeItem(this.page);
					}
				} else if (this.mark === 'report') {
					this.clearObject();
				} else {
					localStorage.removeItem(this.page);
				}
			}

			this.render();
		});
	}

	clearObject() {
		for (const key in this.object) {
			if (key === 'filters') {
				this.object[key] = {};
			} else if (!this.untouchable.includes(key)) {
				this.object[key] = '';
			}
		}

		this.render();
	}

	getDataFromDB() {
		const data = {
			nameTable: this.page
		};
		if (this.mark === 'reject' || this.mark === 'report') data.idDepart = new Settings().object.nameid;

		$.ajax({
			url: "./php/output-request.php",
			method: "post",
			dataType: "html",
			data: data,
			success: (data) => {
				const dataFromDB = JSON.parse(data);

				this.userFromDB(dataFromDB);
			},
			error: () => {
				service.modal('download');
			}
		});
	}

	sendMail() {
		const {
			sender,
			recipient,
			subject,
			objectData
		} = this.mail;

		$.ajax({
			url: "./php/mail.php",
			method: "post",
			dataType: "html",
			data: {
				sender,
				recipient,
				subject,
				message: messageMail(objectData)
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

export default Main;
