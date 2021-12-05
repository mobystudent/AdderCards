'use strict';

import $ from 'jquery';
import Scrollbar from 'smooth-scrollbar';
import service from '../service.js';
import renderheader from '../parts/renderheader.js';

import { changeName } from '../components/settings/change-name.tpl.js';
import { addDepart } from '../components/settings/add-depart.tpl.js';
import { removeDepart } from '../components/settings/remove-depart.tpl.js';
import { autoUpload } from '../components/settings/auto-upload.tpl.js';
import { changeEmail } from '../components/settings/change-email.tpl.js';

const departmentCollection = new Map();	// Коллекци подразделений
const settingsObject = {
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
	statuschangeemail: ''
};
const sendUsers = {
	manager: 'nnyviexworgdkmgzus@kvhrw.com',
	secretary: 'dciiwjaficvlpmesij@nvhrw.com',
	operator: 'karazin.security@ukr.net'
};

$(window).on('load', () => {
	getNameDepartmentFromDB();
	renderSection();
});

function templateSettingsForm() {
	const changeNameTemplate = changeName(settingsObject);
	const addDepartTemplate = addDepart(settingsObject);
	const removeDepartTemplate = removeDepart(settingsObject);
	const timeAutoUploadTemplate = autoUpload(settingsObject);
	const changeEmailTemplate = changeEmail(settingsObject);

	return `
		${changeNameTemplate}
		${addDepartTemplate}
		${removeDepartTemplate}
		${timeAutoUploadTemplate}
		${changeEmailTemplate}
	`;
}

function renderSection(nameSection = '#settingsSection') {
	$(`${nameSection} .settings__content`).html('');
	$(`${nameSection} .settings__content`).append(templateSettingsForm());

	contentScrollbar();
	memberInputField();
	getDepartmentFromDB(); // 1
	setDepartInSelect(); // 2
	toggleSelect(); // 3
	showChangesFields();
	applyFieldsChanges();
}

function showChangesFields() {
	$('.btn--settings').click(({ currentTarget }) => {
		const typeBtn = $(currentTarget).data('name');

		settingsObject[`status${typeBtn}`] = !$(`.btn--settings[data-name=${typeBtn}]`).hasClass('btn--settings-disabled');

		renderSection();
	});
}

function applyFieldsChanges(page = 'settings') {
	$('.btn--changes').click(() => {
		if (!settingsObject.statustimeautoupdate) {
			delete settingsObject.autoupdatetitle;
			delete settingsObject.autoupdatevalue;
			delete settingsObject.statustimeautoupdate;
		}
		if (!settingsObject.statusadddepart) {
			delete settingsObject.addlongname;
			delete settingsObject.addnameid;
			delete settingsObject.addshortname;
			delete settingsObject.statusadddepart;
		}
		if (!settingsObject.statuschangename) {
			delete settingsObject.changelongname;
			delete settingsObject.changeshortname;
			delete settingsObject.statuschangename;
		}
		if (!settingsObject.statusremovedepart) {
			delete settingsObject.removelongname;
			delete settingsObject.removenameid;
			delete settingsObject.statusremovedepart;
		}
		if (!settingsObject.statuschangeemail) {
			delete settingsObject.changeemail;
			delete settingsObject.statuschangeemail;
		}

		delete settingsObject.action;

		const validFields = Object.values(settingsObject).every((item) => item);
		const statusMess = !validFields ? 'show' : 'hide';
		let correctName = 'hide';
		let countNameidLetters = 'hide';
		let nameBlock = '';
		let correctEmail = 'hide';

		if (settingsObject.statuschangename) {
			nameBlock = 'changename';
			settingsObject.action = 'change';

			for (let key in settingsObject) {
				if ((key == 'changelongname' || key == 'changeshortname') && settingsObject[key]) {
					correctName = settingsObject[key].match(/[^а-яА-ЯiIъїЁё.'-\s]/g) ? 'show' : 'hide';
				}
			}
		} else if (settingsObject.statusadddepart) {
			nameBlock = 'adddepart';
			settingsObject.action = 'add';

			for (let key in settingsObject) {
				if ((key == 'addlongname' || key == 'addshortname') && settingsObject[key]) {
					correctName = settingsObject[key].match(/[^а-яА-ЯiIъїЁё.'-\s]/g) ? 'show' : 'hide';
				} else if (key == 'addnameid' && settingsObject[key]) {
					const countLetters = settingsObject[key].trim().split(' ');

					countNameidLetters = countLetters.length > 9 ? 'show' : 'hide';
				}
			}
		} else if (settingsObject.statusremovedepart) {
			nameBlock = 'removedepart';
			settingsObject.action = 'remove';
		} else if (settingsObject.statustimeautoupdate) {
			nameBlock = 'timeautoupdate';
			settingsObject.action = 'autoupdate';
		} else if (settingsObject.statuschangeemail) {
			nameBlock = 'changeemail';
			settingsObject.action = 'email';

			for (let key in settingsObject) {
				if (key == 'changeemail' && settingsObject[key]) {
					correctEmail = !settingsObject[key].match(/^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/g) ? 'show' : 'hide';
				}
			}
		}

		const valid = [statusMess, correctName, countNameidLetters, correctEmail].every((mess) => mess === 'hide');

		$('.info')[!valid ? 'show' : 'hide']();
		$(`.main[data-name=${page}] .settings__section[data-block=${nameBlock}]`).find('.info__item--warn.info__item--fields')[statusMess]();
		$(`.main[data-name=${page}] .settings__section[data-block=${nameBlock}]`).find('.info__item--error.info__item--name')[correctName]();
		$(`.main[data-name=${page}] .settings__section[data-block=${nameBlock}]`).find('.info__item--error.info__item--long')[countNameidLetters]();
		$(`.main[data-name=${page}] .settings__section[data-block=${nameBlock}]`).find('.info__item--error.info__item--email')[correctEmail]();

		if (valid) {
			setNameDepartmentInDB([settingsObject], 'settings', settingsObject.action);
			clearFieldsForm();
			getNameDepartmentFromDB();
		}
	});
}

function contentScrollbar() {
	Scrollbar.init($('.settings__content-wrap').get(0), {
		alwaysShowTracks: true
	});
}

// function listScrollbar(nameSection = '#settingsSection') {
// 	Scrollbar.init($(`${nameSection} .select__list`).get(0), {
// 		alwaysShowTracks: true
// 	});
// }

function setDepartInSelect() {
	departmentCollection.forEach(({ nameid = '', longname = '' }) => {
		const quoteName = longname.replace(/["']/g , '&quot;');

		$('.select[data-select="removenameid"] .select__list').append(`
			<li class="select__item">
				<span class="select__name select__name--settings" data-title="${quoteName}" data-removenameid="${nameid}">${quoteName}</span>
			</li>
		`);
	});

	clickSelectItem();
}

function toggleSelect(nameSection = '#settingsSection') {
	$(`${nameSection} .select__header`).click(({ currentTarget }) => {
		$(currentTarget).next().slideToggle().toggleClass('select__header--active');
	});

	clickSelectItem();
}

function clickSelectItem(nameSection = '#settingsSection') {
	$(`${nameSection} .select__item`).click(({ currentTarget }) => {
		const title = $(currentTarget).find('.select__name').data('title');
		const select = $(currentTarget).parents('.select').data('select');
		const statusid = $(currentTarget).find('.select__name').data(select);

		setDataAttrSelectedItem(title, select, statusid);
	});
}

function setDataAttrSelectedItem(title, select, statusid) {
	if (select === 'removenameid') {
		settingsObject.removelongname = title.replace(/["']/g , '&quot;');
		settingsObject.removenameid = statusid;
	} else if (select === 'autoupdate') {
		settingsObject.autoupdatetitle = title;
		settingsObject.autoupdatevalue = statusid;
	}

	renderSection();
}

function clearFieldsForm() {
	for (const key in settingsObject) {
		settingsObject[key] = '';
	}

	renderSection();
}

function memberInputField() {
	$('.form__item').keyup(({ currentTarget }) => {
		const nameField = $(currentTarget).attr('name');
		const fieldValue = $(currentTarget).val();

		settingsObject[nameField] = fieldValue ? fieldValue : '';
	});
}

function setNameDepartOnPage(settings) {
	const { nameid = '', shortname = '', longname = '', autoupdatetitle = '', autoupdatevalue = '', email = '' } = settings;
	const options = {
		page: 'settings',
		header: {
			longname,
			nameid
		}
	};
	settingsObject.nameid = nameid;
	settingsObject.shortname = shortname;
	settingsObject.longname = longname;
	settingsObject.email = email;
	settingsObject.autoupdatetitle = autoupdatetitle;
	settingsObject.autoupdatevalue = autoupdatevalue;

	renderheader.renderHeaderPage(options);
	renderSection();
}

function getDepartmentFromDB() {
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
				departmentCollection.set(i + 1, item);
			});
		},
		error: () => {
			service.modal('download');
		}
	});
}

function setNameDepartmentInDB(array, nameTable, action) {
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

function getNameDepartmentFromDB() {
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

			setNameDepartOnPage(...dataFromDB);
		},
		error: () => {
			service.modal('download');
		}
	});
}

export { settingsObject, sendUsers };
