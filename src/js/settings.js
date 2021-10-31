'use strict';

import $ from 'jquery';
import Scrollbar from 'smooth-scrollbar';
import service from './service.js';
import renderheader from './parts/renderheader.js';

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

$(window).on('load', () => {
	getNameDepartmentFromDB();
	renderSection();
});

function templateSettingsForm() {
	const changeNameTemplate = templateChangeNameForm();
	const addDepartTemplate = templateAddDepartForm();
	const removeDepartTemplate = templateRemoveDepartForm();
	const timeAutoUploadTemplate = templateTimeAutoUploadForm();
	const changeEmailTemplate = templateChangeEmailForm();

	return `
		${changeNameTemplate}
		${addDepartTemplate}
		${removeDepartTemplate}
		${timeAutoUploadTemplate}
		${changeEmailTemplate}
	`;
}

function templateChangeNameForm() {
	const changeNameBtnValue = settingsObject.statuschangename ? 'Отменить' : 'Изменить';
	const changeNameBtnClass = settingsObject.statuschangename ? 'btn--settings-disabled' : '';
	const changeLongNameValue = settingsObject.changelongname ? settingsObject.changelongname : '';
	const changeShortNameValue = settingsObject.changeshortname ? settingsObject.changeshortname : '';
	const changeNameView = settingsObject.statuschangename ? `
		<form class="form form--settings" action="#" method="GET">
			<div class="form__field">
				<label class="form__name form__name--settings" for="changelongname">Введите новое полное название</label>
				<input class="form__input form__input--settings form__item" name="changelongname" id="changelongname" type="text" value="${changeLongNameValue}" placeholder="Введите новое полное название"/>
			</div>
			<div class="form__field">
				<label class="form__name form__name--settings" for="changeshortname">Введите сокращенное название</label>
				<input class="form__input form__input--settings form__item" name="changeshortname" id="changeshortname" type="text" value="${changeShortNameValue}" placeholder="Введите сокращенное название"/>
				<span class="form__text">
					Например: Химический факультет - Химфак <br/>
					Учебный центр социально-воспитательной и внеобразовательной деятельности - УЦСВВОД <br/>
					Центр трудоустройства студентов и выпускников - Трудцентр
				</span>
			</div>
			<button class="btn btn--changes" data-name="changename" type="button">Подтвердить</button>
		</form>
	` : '';

	return `
		<div class="settings__section" data-block="changename">
			<div class="settings__wrap">
				<h3 class="settings__title">Название подразделения</h3>
				<div class="settings__department" data-nameid="${settingsObject.nameid}" data-shortname="${settingsObject.shortname}" data-longname="${settingsObject.longname}">
					<span class="settings__longname">${settingsObject.longname}</span>
					<small class="settings__separ">/</small>
					<span class="settings__shortname">${settingsObject.shortname}</span>
				</div>
			</div>
			<div class="settings__btn-wrap">
				<button class="btn btn--settings ${changeNameBtnClass}" data-name="changename" type="button">${changeNameBtnValue}</button>
			</div>
			${changeNameView}
			<div class="info info--settings">
				<p class="info__item info__item--warn info__item--fields">Предупреждение! Не все поля заполненны.</p>
				<p class="info__item info__item--error info__item--name">Ошибка! Имя содержит недопустимые символы. Разрешены: кириллические буквы, дефис, апостроф.</p>
			</div>
		</div>
	`;
}

function templateAddDepartForm() {
	const addDepartBtnValue = settingsObject.statusadddepart ? 'Отменить' : 'Добавить';
	const addDepartBtnClass = settingsObject.statusadddepart ? 'btn--settings-disabled' : '';
	const addLongNameValue = settingsObject.addlongname ? settingsObject.addlongname : '';
	const addShortNameValue = settingsObject.addshortname ? settingsObject.addshortname : '';
	const addIDNameValue = settingsObject.addnameid ? settingsObject.addnameid : '';
	const addDepartView = settingsObject.statusadddepart ? `
		<form class="form form--settings" action="#" method="GET">
			<div class="form__field">
				<label class="form__name form__name--settings" for="addlongname">Введите новое полное название</label>
				<input class="form__input form__input--settings form__item" name="addlongname" id="addlongname" type="text" value="${addLongNameValue}" placeholder="Введите новое полное название"/>
			</div>
			<div class="form__field">
				<label class="form__name form__name--settings" for="addshortname">Введите сокращенное название</label>
				<input class="form__input form__input--settings form__item" name="addshortname" id="addshortname" type="text" value="${addShortNameValue}" placeholder="Введите сокращенное название"/>
				<span class="form__text">
					Например: Химический факультет - Химфак <br/>
					Учебный центр социально-воспитательной и внеобразовательной деятельности - УЦСВВОД <br/>
					Центр трудоустройства студентов и выпускников - Трудцентр
				</span>
			</div>
			<div class="form__field">
				<label class="form__name form__name--settings" for="addnameid">Введите id подразделения</label>
				<input class="form__input form__input--settings form__item" name="addnameid" id="addnameid" type="text" value="${addIDNameValue}" placeholder="Введите id подразделения"/>
				<span class="form__text">
					Переводим сокращенное название на английский (не должно быть большей 9 символов). <br/>
					Например: Химический факультет - ChemDep (Химфак) <br/>
					Учебный центр социально-воспитательной и внеобразовательной деятельности - TCSENEA (УЦСВВОД) <br/>
					Центр трудоустройства студентов и выпускников - EmlCen (Трудцентр)
				</span>
			</div>
			<button class="btn btn--changes" data-name="adddepart" type="button">Подтвердить</button>
		</form>
	` : '';

	return `
		<div class="settings__section" data-block="adddepart">
			<div class="settings__wrap">
				<h3 class="settings__title">Добавить подразделение</h3>
			</div>
			<div class="settings__btn-wrap">
				<button class="btn btn--settings ${addDepartBtnClass}" data-name="adddepart" type="button">${addDepartBtnValue}</button>
			</div>
			${addDepartView}
			<div class="info info--settings">
				<p class="info__item info__item--warn info__item--fields">Предупреждение! Не все поля заполненны.</p>
				<p class="info__item info__item--error info__item--name">Ошибка! Имя содержит недопустимые символы. Разрешены: кириллические буквы, дефис, апостроф.</p>
				<p class="info__item info__item--error info__item--long">Ошибка! ID подразделения должно быть не более 9 символов.</p>
			</div>
		</div>
	`;
}

function templateRemoveDepartForm() {
	const removeDepartBtnValue = settingsObject.statusremovedepart ? 'Отменить' : 'Удалить';
	const removeDepartBtnClass = settingsObject.statusremovedepart ? 'btn--settings-disabled' : '';
	const removedepartValue = settingsObject.removelongname ? settingsObject.removelongname : 'Выберите подразделение';
	const removedepartClassView = settingsObject.removelongname ? 'select__value--selected-settings' : '';
	const removeDepartView = settingsObject.statusremovedepart ? `
		<form class="form form--settings" action="#" method="GET">
			<div class="form__field">
				<h3 class="form__name form__name--settings">Выбрать подразделение</h3>
				<div class="form__item select select--settings" data-type="removenameid" data-select="removenameid">
					<header class="select__header select__header--settings">
						<span class="select__value select__value--settings ${removedepartClassView}" data-title="${removedepartValue}" data-removenameid="${settingsObject.removenameid}">${removedepartValue}</span>
					</header>
					<ul class="select__list select__list--settings"></ul>
				</div>
			</div>
			<button class="btn btn--changes" data-name="removedepart" type="button">Подтвердить</button>
		</form>
	` : '';

	return `
		<div class="settings__section" data-block="removedepart">
			<div class="settings__wrap">
				<h3 class="settings__title">Удалить подразделение</h3>
			</div>
			<div class="settings__btn-wrap">
				<button class="btn btn--settings ${removeDepartBtnClass}" data-name="removedepart" type="button">${removeDepartBtnValue}</button>
			</div>
			${removeDepartView}
			<div class="info info--settings">
				<p class="info__item info__item--warn info__item--fields">Предупреждение! Не выбрано подразделение.</p>
			</div>
		</div>
	`;
}

function templateTimeAutoUploadForm() {
	const arrayTimeAutoUploadValues = [
		{
			title: '5 мин.',
			value: 5
		},
		{
			title: '10 мин.',
			value: 10
		},
		{
			title: '15 мин.',
			value: 15
		},
		{
			title: '20 мин.',
			value: 20
		},
		{
			title: '30 мин.',
			value: 30
		},
		{
			title: '45 мин.',
			value: 45
		},
		{
			title: '1 час',
			value: 60
		}
	];
	const timeAutoUploadSelect = arrayTimeAutoUploadValues.reduce((select, { title, value }) => {
		select += `
			<li class="select__item">
				<span class="select__name select__name--settings" data-title="${title}" data-autoupdate="${value}">${title}</span>
			</li>
		`;

		return select;
	}, '');
	const timeAutoUploadBtnValue = settingsObject.statustimeautoupdate ? 'Отменить' : 'Изменить';
	const timeAutoUploadBtnClass = settingsObject.statustimeautoupdate ? 'btn--settings-disabled' : '';
	const timeAutoUploadValue = settingsObject.autoupdatetitle ? settingsObject.autoupdatetitle : 'Выберите период автообновления';
	const timeAutoUploadClassView = settingsObject.autoupdatetitle ? 'select__value--selected-settings' : '';
	const timeAutoUploadView = settingsObject.statustimeautoupdate ? `
		<form class="form form--settings" action="#" method="GET">
			<div class="form__field">
				<div class="form__item select select--settings" data-type="autoupdate" data-select="autoupdate">
					<header class="select__header select__header--settings">
						<span class="select__value select__value--settings ${timeAutoUploadClassView}" data-title="${timeAutoUploadValue}" data-autoupdate="${settingsObject.autoupdatevalue}">${timeAutoUploadValue}</span>
					</header>
					<ul class="select__list select__list--settings">
						${timeAutoUploadSelect}
						<li class="select__item">
							<span class="select__name select__name--settings" data-autoupdate="отключить" data-value="none">отключить</span>
						</li>
					</ul>
				</div>
			</div>
			<button class="btn btn--changes" data-name="timeautoupdate" type="button">Подтвердить</button>
		</form>
	` : '';

	return `
		<div class="settings__section" data-block="timeautoupdate">
			<div class="settings__wrap">
				<h3 class="settings__title">Период автообновления данных в таблицах</h3>
				<span class="settings__value settings__value--autoupdate" data-value="${settingsObject.autoupdatevalue}">${settingsObject.autoupdatetitle}</span>
			</div>
			<div class="settings__btn-wrap">
				<button class="btn btn--settings ${timeAutoUploadBtnClass}" type="button" data-name="timeautoupdate">${timeAutoUploadBtnValue}</button>
			</div>
			${timeAutoUploadView}
			<div class="info info--settings">
				<p class="info__item info__item--warn info__item--fields">Предупреждение! Не выбрано время.</p>
			</div>
		</div>
	`;
}

function templateChangeEmailForm() {
	const changeEmailBtnValue = settingsObject.statuschangeemail ? 'Отменить' : 'Изменить';
	const changeEmailBtnClass = settingsObject.statuschangeemail ? 'btn--settings-disabled' : '';
	const emailValue = settingsObject.email ? settingsObject.email : 'Введите почту';
	const changeEmailView = settingsObject.statuschangeemail ? `
		<form class="form form--settings" action="#" method="GET">
			<div class="form__field">
				<label class="form__name form__name--settings" for="emailManager">Введите новый email</label>
				<input class="form__input form__input--settings form__item" name="changeemail" id="emailManager" type="email" placeholder="Введите новый email"/>
			</div>
			<button class="btn btn--changes" data-name="changeemail" type="button">Сохранить</button>
		</form>
	` : '';

	return `
		<div class="settings__section" data-block="changeemail">
			<div class="settings__wrap">
				<h3 class="settings__title">Email</h3>
				<span class="settings__value">${emailValue}</span>
			</div>
			<div class="settings__btn-wrap">
				<button class="btn btn--settings ${changeEmailBtnClass}" type="button" data-name="changeemail">${changeEmailBtnValue}</button>
			</div>
			${changeEmailView}
			<div class="info info--settings">
				<p class="info__item info__item--warn info__item--fields">Предупреждение! Не все поля заполненны.</p>
				<p class="info__item info__item--error info__item--email">Ошибка! Некорректный email.</p>
			</div>
		</div>
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
	$('.form__input').keyup(({ currentTarget }) => {
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

export default settingsObject;
