'use strict';

import $ from 'jquery';
import Scrollbar from 'smooth-scrollbar';
import service from './service.js';

const departmentCollection = new Map();  // Коллекци подразделений
const settingsObject = {
	nameid: '',
	shortname: '',
	longname: '',
	action: '',
	statuschangename: '',
	changelongname: '',
	changeshortname: '',
	statusadddepart: '',
	addlongname: '',
	addshortname: '',
	addnameid: '',
	statusremovedepart: '',
	removelongname: '',
	removenameid: ''
};

$(window).on('load', () => {
	getNameDepartmentFromDB('settings');
});

function templateSettingsForm() {
	console.log(settingsObject);
	const changeNameTemplate = templateChangeNameForm();
	const addDepartTemplate = templateAddDepartForm();
	const removeDepartTemplate = templateRemoveDepartForm();

	return `
		${changeNameTemplate}
		${addDepartTemplate}
		${removeDepartTemplate}
	`;
}

function templateChangeNameForm() {
	const changeNameBtnValue = settingsObject.statuschangename ? 'Отменить' : 'Изменить';
	const changeNameBtnClass = settingsObject.statuschangename ? 'btn--settings-disabled' : '';
	const changeNameView = settingsObject.statuschangename ? `
		<form class="form form--settings" action="#" method="GET">
			<div class="form__field">
				<label class="form__name form__name--settings" for="changelongname">Введите полное новое название</label>
				<input class="form__input form__input--settings form__item" data-field="changelongname" name="changelongname" id="changelongname" type="text" value="${settingsObject.changelongname}" placeholder="Введите полное новое название"/>
			</div>
			<div class="form__field">
				<label class="form__name form__name--settings" for="changeshortname">Введите сокращенное название</label>
				<input class="form__input form__input--settings form__item" data-field="changeshortname" name="changeshortname" id="changeshortname" type="text" value="${settingsObject.changeshortname}" placeholder="Введите сокращенное название"/>
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
				<span class="settings__department" data-nameid="${settingsObject.nameid}" data-shortname="${settingsObject.shortname}" data-longname="${settingsObject.longname}">${settingsObject.longname}</span>
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
	const addDepartView = settingsObject.statusadddepart ? `
		<form class="form form--settings" action="#" method="GET">
			<div class="form__field">
				<label class="form__name form__name--settings" for="addlongname">Введите полное новое название</label>
				<input class="form__input form__input--settings form__item" data-field="addlongname" name="addlongname" id="addlongname" type="text" value="${settingsObject.addlongname}" placeholder="Введите полное новое название"/>
			</div>
			<div class="form__field">
				<label class="form__name form__name--settings" for="addshortname">Введите сокращенное название</label>
				<input class="form__input form__input--settings form__item" data-field="addshortname" name="addshortname" id="addshortname" type="text" value="${settingsObject.addshortname}" placeholder="Введите сокращенное название"/>
				<span class="form__text">
					Например: Химический факультет - Химфак <br/>
					Учебный центр социально-воспитательной и внеобразовательной деятельности - УЦСВВОД <br/>
					Центр трудоустройства студентов и выпускников - Трудцентр
				</span>
			</div>
			<div class="form__field">
				<label class="form__name form__name--settings" for="addnameid">Введите id подразделения</label>
				<input class="form__input form__input--settings form__item" data-field="addnameid" name="addnameid" id="addnameid" type="text" value="${settingsObject.addnameid}" placeholder="Введите id подразделения"/>
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
				<div class="form__item select select--settings" data-field="removedepart" data-type="removenameid" data-select="removenameid">
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

function renderSection(nameSection = '#settingsSection') {
	$(`${nameSection} .settings__content`).html('');
	$(`${nameSection} .settings__content`).append(templateSettingsForm());
}

function showChangesFields() {
	$('.btn--settings').click((e) => {
		const typeBtn = $(e.currentTarget).data('name');
		settingsObject[`status${typeBtn}`] = $(`.btn--settings[data-name=${typeBtn}]`).hasClass('btn--settings-disabled') ? false : true;

		renderSection();
		memberInputField();
		toggleSelect();
		applyFieldsChanges();
		showChangesFields();
		contentScrollbar();
		getDepartmentInDB('department');
		setDepartInSelect();
	});
}

function applyFieldsChanges() {
	$('.btn--changes').click((e) => {
		const nameBlock = $(e.currentTarget).attr('data-name');
		const fields = $(`.settings__section[data-block=${nameBlock}]`).find('.form__item');
		const userData = [...fields].reduce((object, item) => {
			const fieldName = $(item).data('field');

			if ($(item).hasClass('select')) {
				const typeSelect = $(item).data('select');
				const nameId = $(item).find('.select__value--selected-settings').attr(`data-${typeSelect}`);
				const fieldType = $(item).data('type');
				const valueItem = $(item).find('.select__value--selected-settings').attr('data-title');

				// console.log(typeSelect);
				// console.log(nameId);
				// console.log(fieldType);
				// console.log(valueItem);

				if (typeSelect === 'removenameid') {
					object[fieldType] = nameId;
				}

				object[fieldName] = valueItem;
			} else {
				if (nameBlock === 'changename') {
					const idDepart = settingsObject.nameid;

					object.nameid = idDepart;
				}

				const inputValue = $(item).val();

				object[fieldName] = inputValue;
			}

			return object;
		}, {});

		console.log(userData);

		if (validationEmptyFields(userData)) {
			setNameDepartmentInDB([userData], 'settings', settingsObject.action);
			clearFieldsForm();
			getNameDepartmentFromDB('settings');
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
	departmentCollection.forEach((depart) => {
		const { nameid = '', longname = '' } = depart;
		const quoteName = longname.replace(/["']/g , '&quot;');

		$('.select[data-field="removedepart"] .select__list').append(`
			<li class="select__item">
				<span class="select__name select__name--settings" data-title="${quoteName}" data-removenameid="${nameid}">${quoteName}</span>
			</li>
		`);
	});

	clickSelectItem();
}

function toggleSelect(nameSection = '#settingsSection') {
	$(`${nameSection} .select__header`).click((e) => {
		$(e.currentTarget).next().slideToggle();
		$(e.currentTarget).toggleClass('select__header--active');
	});

	clickSelectItem();
}

function clickSelectItem(nameSection = '#settingsSection') {
	$(`${nameSection} .select__item`).click((e) => {
		const title = $(e.currentTarget).find('.select__name').data('title');
		const select = $(e.currentTarget).parents('.select').data('select');

		setDataAttrSelectedItem(title, select, e.currentTarget);
	});
}

function setDataAttrSelectedItem(title, select, elem) {
	const statusremovedepart = select === 'removenameid' ? title : '';
	const removenameid = select === 'removenameid' ? $(elem).find('.select__name').data(select) : '';
	const removedepart = select === 'removenameid' ? title : '';
	const quoteRemovedepart = removedepart ? removedepart.replace(/["']/g , '&quot;') : '';

	if (select === 'removenameid') {
		settingsObject.statusremovedepart = statusremovedepart;
		settingsObject.removelongname = quoteRemovedepart;
		settingsObject.removenameid = removenameid;
	}

	console.warn(settingsObject);

	renderSection();
	showChangesFields();
	applyFieldsChanges();
	toggleSelect();
	setDepartInSelect();
}

function clearFieldsForm() {
	settingsObject.action = '';
	settingsObject.statuschangename = '';
	settingsObject.changelongname = '';
	settingsObject.changeshortname = '';
	settingsObject.statusadddepart = '';
	settingsObject.addlongname = '';
	settingsObject.addshortname = '';
	settingsObject.addnameid = '';
	settingsObject.statusremovedepart = '';
	settingsObject.removelongname = '';
	settingsObject.removenameid = '';

	renderSection();
	showChangesFields();
}

function memberInputField() {
	$('.form__input').keyup((e) => {
		const nameField = $(e.currentTarget).data('field');
		const fieldValue = $(e.currentTarget).val();

		settingsObject[nameField] = fieldValue ? fieldValue : settingsObject[nameField];
	});
}

function validationEmptyFields(fields, page = 'settings') {
	const validFields = Object.values(fields).every((item) => item);
	const statusMess = !validFields ? 'show' : 'hide';
	let correctName = 'hide';
	let countNameidLetters = 'hide';
	let nameBlock = '';

	if (settingsObject.statuschangename) {
		nameBlock = 'changename';
		settingsObject.action = 'change';

		for (let key in fields) {
			if ((key == 'changelongname' || key == 'changeshortname') && fields[key]) {
				correctName = fields[key].match(/[^а-яА-ЯiIъїЁё.'-\s]/g) ? 'show' : 'hide';
			}
		}
	} else if (settingsObject.statusadddepart) {
		nameBlock = 'adddepart';
		settingsObject.action = 'add';

		for (let key in fields) {
			if ((key == 'addlongname' || key == 'addshortname') && fields[key]) {
				correctName = fields[key].match(/[^а-яА-ЯiIъїЁё.'-\s]/g) ? 'show' : 'hide';
			} else if (key == 'addnameid' && fields[key]) {
				const countLetters = fields[key].trim().split(' ');

				countNameidLetters = (countLetters.length > 9) ? 'show' : 'hide';
			}
		}
	} else if (settingsObject.statusremovedepart) {
		nameBlock = 'removedepart';
		settingsObject.action = 'remove';
	}

	const valid = [statusMess, correctName, countNameidLetters].every((mess) => mess === 'hide');

	$('.info')[!valid ? 'show' : 'hide']();
	$(`.main[data-name=${page}] .settings__section[data-block=${nameBlock}]`).find('.info__item--warn.info__item--fields')[statusMess]();
	$(`.main[data-name=${page}] .settings__section[data-block=${nameBlock}]`).find('.info__item--error.info__item--name')[correctName]();
	$(`.main[data-name=${page}] .settings__section[data-block=${nameBlock}]`).find('.info__item--error.info__item--long')[countNameidLetters]();

	return valid;
}

function setNameDepartOnPage(depart, page = 'settings') {
	const { nameid = '', shortname = '', longname = '' } = depart;
	settingsObject.nameid = nameid;
	settingsObject.shortname = shortname;
	settingsObject.longname = longname;

	$(`.main__depart--${page}`).attr({ 'data-depart': settingsObject.longname, 'data-id': settingsObject.nameid }).text(settingsObject.longname);

	renderSection();
	contentScrollbar();
	showChangesFields();
	toggleSelect();
	setDepartInSelect();
}

function getDepartmentInDB(nameTable) {
	$.ajax({
		url: "./php/output-request.php",
		method: "post",
		dataType: "html",
		async: false,
		data: {
			nameTable: nameTable
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
			action: action,
			nameTable: nameTable,
			array: array
		},
		success: () => {
			// console.log(data);
			service.modal('update');
		},
		error: () => {
			service.modal('download');
		}
	});
}

function getNameDepartmentFromDB(nameTable, page = 'settings') {
	const idDepart = $(`.main__depart--${page}`).attr('data-id');

	$.ajax({
		url: "./php/output-request.php",
		method: "post",
		dataType: "html",
		async: false,
		data: {
			idDepart: idDepart,
			nameTable: nameTable
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
