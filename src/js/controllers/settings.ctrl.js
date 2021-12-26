'use strict';

import $ from 'jquery';
import Scrollbar from 'smooth-scrollbar';
import service from '../service.js';

import { changeName } from '../components/settings/change-name.tpl.js';
import { addDepart } from '../components/settings/add-depart.tpl.js';
import { removeDepart } from '../components/settings/remove-depart.tpl.js';
import { autoUpload } from '../components/settings/auto-upload.tpl.js';
import { changeEmail } from '../components/settings/change-email.tpl.js';
import { pageTitle } from '../components/page-title.tpl.js';
import { select } from '../components/select.tpl.js';

const departmentCollection = new Map();	// Коллекци подразделений
const settingsObject = {
	page: 'Настройки',
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

function renderHeaderPage(page = 'settings') {
	$(`.main[data-name=${page}] .main__title-wrap`).html('');
	$(`.main[data-name=${page}] .container`).prepend(pageTitle(settingsObject));
}

function render() {
	const { statuschangename, nameid, shortname, longname, statusadddepart, statusremovedepart, statustimeautoupdate, autoupdatetitle, autoupdatevalue, statuschangeemail, email } = settingsObject;
	const changeNameBtnValue = statuschangename ? 'Отменить' : 'Изменить';
	const changeNameBtnClass = statuschangename ? 'btn--settings-disabled' : '';
	const addDepartBtnValue = statusadddepart ? 'Отменить' : 'Добавить';
	const addDepartBtnClass = statusadddepart ? 'btn--settings-disabled' : '';
	const removeDepartBtnValue = statusremovedepart ? 'Отменить' : 'Удалить';
	const removeDepartBtnClass = statusremovedepart ? 'btn--settings-disabled' : '';
	const timeAutoUploadBtnValue = statustimeautoupdate ? 'Отменить' : 'Изменить';
	const timeAutoUploadBtnClass = statustimeautoupdate ? 'btn--settings-disabled' : '';
	const changeEmailBtnValue = statuschangeemail ? 'Отменить' : 'Изменить';
	const changeEmailBtnClass = statuschangeemail ? 'btn--settings-disabled' : '';
	const emailValue = email ? email : 'Введите почту';

	return `
		<div class="settings__section" data-block="changename">
			<div class="settings__wrap">
				<h3 class="settings__title">Название подразделения</h3>
				<div class="settings__department" data-nameid="${nameid}" data-shortname="${shortname}" data-longname="${longname}">
					<span class="settings__longname">${longname}</span>
					<small class="settings__separ">/</small>
					<span class="settings__shortname">${shortname}</span>
				</div>
			</div>
			<div class="settings__btn-wrap">
				<button class="btn btn--settings ${changeNameBtnClass}" data-name="changename" type="button">${changeNameBtnValue}</button>
			</div>
			${changeName(settingsObject)}
			<div class="info info--settings">
				<p class="info__item info__item--warn info__item--fields">Предупреждение! Не все поля заполнены.</p>
				<p class="info__item info__item--error info__item--name">Ошибка! Имя содержит недопустимые символы. Разрешены: кириллические буквы, дефис, апостроф.</p>
			</div>
		</div>

		<div class="settings__section" data-block="adddepart">
			<div class="settings__wrap">
				<h3 class="settings__title">Добавить подразделение</h3>
			</div>
			<div class="settings__btn-wrap">
				<button class="btn btn--settings ${addDepartBtnClass}" data-name="adddepart" type="button">${addDepartBtnValue}</button>
			</div>
			${addDepart(settingsObject)}
			<div class="info info--settings">
				<p class="info__item info__item--warn info__item--fields">Предупреждение! Не все поля заполнены.</p>
				<p class="info__item info__item--error info__item--name">Ошибка! Имя содержит недопустимые символы. Разрешены: кириллические буквы, дефис, апостроф.</p>
				<p class="info__item info__item--error info__item--long">Ошибка! ID подразделения должно быть не более 9 символов.</p>
			</div>
		</div>

		<div class="settings__section" data-block="removedepart">
			<div class="settings__wrap">
				<h3 class="settings__title">Удалить подразделение</h3>
			</div>
			<div class="settings__btn-wrap">
				<button class="btn btn--settings ${removeDepartBtnClass}" data-name="removedepart" type="button">${removeDepartBtnValue}</button>
			</div>
			${removeDepart(settingsObject)}
			<div class="info info--settings">
				<p class="info__item info__item--warn info__item--fields">Предупреждение! Не выбрано подразделение.</p>
			</div>
		</div>

		<div class="settings__section" data-block="timeautoupdate">
			<div class="settings__wrap">
				<h3 class="settings__title">Период автообновления данных в таблицах</h3>
				<span class="settings__value settings__value--autoupdate" data-value="${autoupdatevalue}">${autoupdatetitle}</span>
			</div>
			<div class="settings__btn-wrap">
				<button class="btn btn--settings ${timeAutoUploadBtnClass}" type="button" data-name="timeautoupdate">${timeAutoUploadBtnValue}</button>
			</div>
			${autoUpload(settingsObject)}
		</div>

		<div class="settings__section" data-block="changeemail">
			<div class="settings__wrap">
				<h3 class="settings__title">Email</h3>
				<span class="settings__value">${emailValue}</span>
			</div>
			<div class="settings__btn-wrap">
				<button class="btn btn--settings ${changeEmailBtnClass}" type="button" data-name="changeemail">${changeEmailBtnValue}</button>
			</div>
			${changeEmail(settingsObject)}
			<div class="info info--settings">
				<p class="info__item info__item--warn info__item--fields">Предупреждение! Не все поля заполнены.</p>
				<p class="info__item info__item--error info__item--email">Ошибка! Некорректный email.</p>
			</div>
		</div>
	`;
}

function renderSection(nameSection = '#settingsSection') {
	$(`${nameSection}`).html('');
	$(`${nameSection}`).append(`
		<div class="settings__content-wrap">
			<div class="settings__content">
				${render()}
			</div>
		</div>
	`);

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
		const quoteName = longname.replace(/["']/g, '&quot;');
		const item = {
			value: quoteName,
			id: nameid,
			type: 'settings',
			dataid: 'removenameid'
		};

		$('.select[data-select="removenameid"] .select__list').append(select(item));
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
		settingsObject.removelongname = title.replace(/["']/g, '&quot;');
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
	settingsObject.nameid = nameid;
	settingsObject.shortname = shortname;
	settingsObject.longname = longname;
	settingsObject.email = email;
	settingsObject.autoupdatetitle = autoupdatetitle;
	settingsObject.autoupdatevalue = autoupdatevalue;

	renderHeaderPage();
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
