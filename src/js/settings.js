'use strict';

import $ from 'jquery';
import Scrollbar from 'smooth-scrollbar';
import service from './service.js';

const departmentCollection = new Map();  // Коллекци подразделений
const settingsObject = {
	department: '',
	statuschangename: '',
	changelongname: '',
	changeshortname: ''
};

$(window).on('load', () => {
	showChangesFields();
	settingsScrollbar();
	toggleSelect();
	setDepartInSelect();
});

function templateSettingsForm() {
	console.log(settingsObject);
	const changeNameBtnValue = settingsObject.statuschangename ? 'Отменить' : 'Изменить';
	const changelongnameValue = settingsObject.statuschangename ? '' : settingsObject.changelongname;
	const changeshortnameValue = settingsObject.statuschangename ? '' : settingsObject.changeshortname;
	const changeNameBtnClass = settingsObject.statuschangename ? 'btn--settings-disabled' : '';
	const changeNameView = settingsObject.statuschangename ? `
		<form class="form form--settings" action="#" method="GET">
			<div class="form__field">
				<label class="form__name form__name--settings" for="changelongname">Введите полное новое название</label>
				<input class="form__input form__input--settings form__item" data-field="changelongname" name="changelongname" id="changelongname" type="text" value="${changelongnameValue}" placeholder="Введите полное новое название"/>
			</div>
			<div class="form__field">
				<label class="form__name form__name--settings" for="changeshortname">Введите сокращенное название</label>
				<input class="form__input form__input--settings form__item" data-field="changeshortname" name="changeshortname" id="changeshortname" type="text" value="${changeshortnameValue}" placeholder="Введите сокращенное название"/>
				<span class="form__text">Например: Химический факультет - Химфак <br/>
				Учебный центр социально-воспитательной и внеобразовательной деятельности - УЦСВВОД <br/>
				Центр трудоустройства студентов и выпускников - Трудцентр</span>
			</div>
			<button class="btn btn--changes" data-name="changename" type="button">Сохранить</button>
		</form>
	` : '';

	return `
		<div class="settings__section" data-block="changename">
			<div class="settings__wrap">
				<h3 class="settings__title">Название подразделения</h3>
				<span class="settings__value">${settingsObject.department}</span>
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

function renderSection(nameSection = '#settingsSection') {
	$(`${nameSection} .settings__content`).html('');
	$(`${nameSection} .settings__content`).append(templateSettingsForm());
}

function showChangesFields() {
	$('.btn--settings').click((e) => {
		settingsObject.statuschangename = $(e.currentTarget).hasClass('btn--settings-disabled') ? false : true;
		settingsObject.department = $('.main__depart--settings').attr('data-depart');

		renderSection();
		memberInputField();
		applyFieldsChanges();
		showChangesFields();
	});
}

function clearFieldsForm() {
	settingsObject.statuschangename = '';
	settingsObject.changelongname = '';
	settingsObject.changeshortname = '';

	renderSection();
	memberInputField();
	showChangesFields();
	toggleSelect();
}

function memberInputField() {
	$('.form__input').keyup((e) => {
		const nameField = $(e.currentTarget).data('field');
		const fieldValue = $(e.currentTarget).val();

		settingsObject[nameField] = fieldValue ? fieldValue : settingsObject[nameField];
	});
}

function applyFieldsChanges(page = 'settings') {
	$('.btn--changes').click((e) => {
		const nameBlock = $(e.currentTarget).attr('data-name');
		const fields = $(`.settings__section[data-block=${nameBlock}]`).find('.form__item');
		const userData = [...fields].reduce((object, item) => {
			const fieldName = $(item).data('field');
			const inputValue = $(item).val();

			object[fieldName] = inputValue;

			if (nameBlock === 'changename') {
				const idDepart = $(`.main__depart--${page}`).attr('data-id');

				object.nameid = idDepart;
			}

			return object;
		}, {});

		console.log(userData);

		if (validationEmptyFields(userData)) {
			setNameDepartmentInDB([userData], 'department', 'add');
			clearFieldsForm();
		}
	});
}

function validationEmptyFields(fields, page = 'settings') {
	const validFields = Object.values(fields).every((item) => item);
	const statusMess = !validFields ? 'show' : 'hide';
	let correctName = 'hide';

	for (let key in fields) {
		if ((key == 'changelongname' || key == 'changeshortname') && fields[key]) {
			correctName = fields[key].match(/[^а-яА-ЯiIъїЁё.'-\s]/g) ? 'show' : 'hide';
		}
	}

	const valid = [statusMess, correctName].every((mess) => mess === 'hide');

	$(`.main[data-name=${page}]`).find('.info__item--warn.info__item--fields')[statusMess]();
	$(`.main[data-name=${page}]`).find('.info__item--error.info__item--name')[correctName]();

	return valid;
}

function settingsScrollbar(nameSection = '#settingsSection') {
	Scrollbar.init($('.settings__content').get(0), {
		alwaysShowTracks: true
	});

	// Scrollbar.init($(`${nameSection} .select__list`).get(0), {
	// 	alwaysShowTracks: true
	// });
}

function setDepartInSelect(nameSection = '#settingsSection') {
	departmentCollection.forEach((depart) => {
		const { idname = '', longname = '' } = depart;
		const quoteName = longname.replace(/["']/g , '&quot;');
		console.log(quoteName);

		$(`${nameSection} .select[data-field="removedepart"] .select__list`).append(`
			<li class="select__item">
				<span class="select__name select__name--settings" data-title="${quoteName}" data-newnameid="${idname}">${quoteName}</span>
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
		const value = $(e.currentTarget).find('.select__name').data('value');
		const select = $(e.currentTarget).parents('.select').data('select');

		if (select === 'department') {
			getDepartmentInDB('department');
		}

		setDataAttrSelectedItem(title, select, e.currentTarget);
	});
}

function setDataAttrSelectedItem(title, select, elem, nameForm = '#editForm') {
	// $(e.currentTarget)
	// .parents('.select')
	// .find('.select__value--settings')
	// .attr({ 'data-value': value, 'data-title': title })
	// .text(title);
	// $(e.currentTarget).parents('.select__header').slideUp();

	renderSection(settingsObject, 'clear');

	toggleSelect();
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
			service.modal('update');
		},
		error: () => {
			service.modal('download');
		}
	});
}
