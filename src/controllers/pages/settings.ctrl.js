'use strict';

import $ from 'jquery';
import Scrollbar from 'smooth-scrollbar';
import service from '../../js/service.js';

import { select } from '../../components/select.tpl.js';

import SettingsModel from '../../models/pages/settings.model.js';

class Settings {
	constructor(props = {}) {
		({
			page: this.page = 'settings'
		} = props);

		this.departmentCollection = new Map();	// Коллекци подразделений
		this.object = {
			title: 'Настройки',
			nameid: '',
			shortname: '',
			longname: '',
			email: '',
			action: '',
			changelongname: '',
			changeshortname: '',
			addlongname: '',
			addshortname: '',
			addnameid: '',
			removelongname: '',
			removenameid: '',
			autoupdatetitle: '',
			autoupdatevalue: '',
			changeemail: '',
			statuschangename: '',
			statusadddepart: '',
			statusremovedepart: '',
			statustimeautoupdate: '',
			statuschangeemail: '',
			errors: {
				changename: [],
				adddepart: [],
				removedepart: [],
				changeemail: []
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
				title: 'depart',
				message: 'Предупреждение! Не выбрано подразделение.'
			},
			{
				type: 'error',
				title: 'name',
				message: 'Ошибка! Имя содержит недопустимые символы. Разрешены: кириллические буквы, дефис, апостроф.'
			},
			{
				type: 'error',
				title: 'long',
				message: 'Ошибка! ID подразделения должно быть не более 9 символов.'
			},
			{
				type: 'error',
				title: 'email',
				message: 'Ошибка! Некорректный email.'
			}
		];
		this.untouchable = ['nameid', 'longname', 'title', 'errors'];
		this.sendUsers = {
			manager: 'sxuapokvrnjwaxagmm@kvhrs.com',
			secretary: 'sxuapokvrnjwaxagmm@kvhrs.com',
			operator: 'karazin.security@ukr.net'
		};

		this.getNameDepartmentFromDB();
	}

render() {
	const settingsModel = new SettingsModel({
		object: this.object,
		info: this.info,
		errors: this.object.errors
	});

	$(`.main[data-name=${this.page}]`).html('');
	$(`.main[data-name=${this.page}]`).append(settingsModel.render());

	this.contentScrollbar();
	this.memberInputField();
	this.getDepartmentFromDB(); // 1
	this.setDepartInSelect(); // 2
	this.toggleSelect(); // 3
	this.showChangesFields();
	this.applyFieldsChanges();
}

showChangesFields() {
	$('.btn--settings').click(({ currentTarget }) => {
		const typeBtn = $(currentTarget).data('name');

		this.object[`status${typeBtn}`] = !$(`.btn--settings[data-name=${typeBtn}]`).hasClass('btn--settings-disabled');

		this.render();
	});
}

applyFieldsChanges() {
	$('.btn--changes').click(() => {
		const settingsFields = {
			timeautoupdate: ['autoupdatetitle', 'autoupdatevalue', 'statustimeautoupdate'],
			adddepart: ['addlongname', 'addnameid', 'addshortname', 'statusadddepart'],
			changename: ['changelongname', 'changeshortname', 'statuschangename'],
			removedepart: ['removelongname', 'removenameid', 'statusremovedepart'],
			changeemail: ['changeemail', 'statuschangeemail']
		};

		if (this.object.statuschangename) {
			this.object.errors.changename = [];
			this.object.action = 'change';

			for (const i in settingsFields.changename) {
				const field = settingsFields.changename[i];

				if (!this.object[field]) {
					this.object.errors.changename.push('fields');
					break;
				}
			}

			for (let key in this.object) {
				if ((key === 'changelongname' || key === 'changeshortname') && this.object[key]) {
					if (this.object[key].match(/[^а-яА-ЯiIъїЁё.'-\s]/g)) this.object.errors.changename.push('name');
				}
			}
		}

		if (this.object.statusadddepart) {
			this.object.errors.adddepart = [];
			this.object.action = 'add';

			for (const i in settingsFields.adddepart) {
				const field = settingsFields.adddepart[i];

				if (!this.object[field]) {
					this.object.errors.adddepart.push('fields');
					break;
				}
			}

			for (let key in this.object) {
				if ((key === 'addlongname' || key === 'addshortname') && this.object[key]) {
					if (this.object[key].match(/[^а-яА-ЯiIъїЁё.'-\s]/g)) this.object.errors.adddepart.push('name');
				} else if (key === 'addnameid' && this.object[key]) {
					const countLetters = this.object[key].trim();

					if (countLetters.length > 9) this.object.errors.adddepart.push('long');
				}
			}
		}

		if (this.object.statusremovedepart) {
			this.object.errors.removedepart = [];
			this.object.action = 'remove';

			for (const i in settingsFields.removedepart) {
				const field = settingsFields.removedepart[i];

				if (!this.object[field]) {
					this.object.errors.removedepart.push('depart');
					break;
				}
			}
		}

		if (this.object.statustimeautoupdate) {
			this.object.action = 'autoupdate';
		}

		if (this.object.statuschangeemail) {
			this.object.errors.changeemail = [];
			this.object.action = 'email';

			for (const i in settingsFields.changeemail) {
				const field = settingsFields.changeemail[i];

				if (!this.object[field]) {
					this.object.errors.changeemail.push('fields');
					break;
				}
			}

			for (let key in this.object) {
				if (key === 'changeemail' && this.object[key]) {
					if (!this.object[key].match(/^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/g)) this.object.errors.changeemail.push('email');
				}
			}
		}

		const statusErrors = Object.values(this.object.errors).every((item) => !item.length);

		if (statusErrors) {
			this.setNameDepartmentInDB([this.object], 'settings', this.object.action);
			this.clearObject();
			this.getNameDepartmentFromDB();
		} else {
			this.render();
		}
	});
}

contentScrollbar() {
	Scrollbar.init($('.settings__content-wrap').get(0), {
		alwaysShowTracks: true
	});
}

// listScrollbar(nameSection = '#settingsSection') {
// 	Scrollbar.init($(`${nameSection} .select__list`).get(0), {
// 		alwaysShowTracks: true
// 	});
// }

setDepartInSelect() {
	this.departmentCollection.forEach(({ nameid = '', longname = '' }) => {
		const quoteName = longname.replace(/["']/g, '&quot;');
		const item = {
			value: quoteName,
			id: nameid,
			type: 'settings',
			dataid: 'removenameid'
		};

		$('.select[data-select="removenameid"] .select__list').append(select(item));
	});

	this.clickSelectItem();
}

toggleSelect(nameSection = '#settingsSection') {
	$(`${nameSection} .select__header`).click(({ currentTarget }) => {
		$(currentTarget).next().slideToggle().toggleClass('select__header--active');
	});

	this.clickSelectItem();
}

clickSelectItem(nameSection = '#settingsSection') {
	$(`${nameSection} .select__item`).click(({ currentTarget }) => {
		const title = $(currentTarget).find('.select__name').data('title');
		const select = $(currentTarget).parents('.select').data('select');
		const statusid = $(currentTarget).find('.select__name').data(select);

		this.setDataAttrSelectedItem(title, select, statusid);
	});
}

setDataAttrSelectedItem(title, select, statusid) {
	if (select === 'removenameid') {
		this.object.removelongname = title.replace(/["']/g, '&quot;');
		this.object.removenameid = statusid;
	} else if (select === 'autoupdate') {
		this.object.autoupdatetitle = title;
		this.object.autoupdatevalue = statusid;
	}

	this.render();
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

memberInputField() {
	$('.form__item').keyup(({ currentTarget }) => {
		const nameField = $(currentTarget).attr('name');
		const fieldValue = $(currentTarget).val();

		this.object[nameField] = fieldValue ? fieldValue : '';
	});
}

setNameDepartOnPage(settings) {
	const { nameid = '', shortname = '', longname = '', autoupdatetitle = '', autoupdatevalue = '', email = '' } = settings;
	this.object.nameid = nameid;
	this.object.shortname = shortname;
	this.object.longname = longname;
	this.object.email = email;
	this.object.autoupdatetitle = autoupdatetitle;
	this.object.autoupdatevalue = autoupdatevalue;

	this.render();
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

setNameDepartmentInDB(array, nameTable, action) {
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
			service.modal('update');
		},
		error: () => {
			service.modal('download');
		}
	});
}

getNameDepartmentFromDB() {
	$.ajax({
		url: "./php/output-request.php",
		method: "post",
		dataType: "html",
		async: false,
		data: {
			idDepart: 'ChemDep', // пока нет авторизации
			nameTable: 'settings'
		},
		success: (data) => {
			const dataFromDB = JSON.parse(data);

			this.setNameDepartOnPage(...dataFromDB);
		},
		error: () => {
			service.modal('download');
		}
	});
}
}

export default Settings;
