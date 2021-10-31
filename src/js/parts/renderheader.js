'use strict';

import $ from 'jquery';

const pageItems = [
	{
		name: 'const',
		title: 'Добавить постоянную карту',
		titlePage: 'Добавление карт пользователям'
	},
	{
		name: 'time',
		title: 'Добавить временную карту',
		titlePage: 'Добавление временных карт'
	},
	{
		name: 'qr',
		title: 'Добавить QR-код',
		titlePage: 'Добавление QR-кодов пользователям'
	},
	{
		name: 'download',
		title: 'Загрузить QR-код',
		titlePage: 'Загрузка QR-кодов'
	},
	{
		name: 'permis',
		title: 'Разрешение на добавление',
		titlePage: 'Разрешение на добавление <br> идентификаторов пользователям'
	},
	{
		name: 'add',
		title: 'Добавить пользователя',
		titlePage: 'Добавить новых пользователей'
	},
	{
		name: 'remove',
		title: 'Удалить пользователя',
		titlePage: 'Удаление пользователей'
	},
	{
		name: 'edit',
		title: 'Редактировать пользователя',
		titlePage: 'Редактировать пользователей'
	},
	{
		name: 'reject',
		title: 'Отклоненные пользователи',
		titlePage: 'Отклоненные пользователи'
	},
	{
		name: 'request',
		title: 'Запрос на изменение',
		titlePage: 'Запрос на изменение данных'
	},
	{
		name: 'settings',
		title: 'Настройки',
		titlePage: 'Настройки'
	},
	{
		name: 'report',
		title: 'Отчёт по изменения',
		titlePage: 'Отчёт по изменениям'
	}
];
const pageObject = {
	active: ''
};

$(window).on('load', () => {
	setUrlSection();
	switchControl();
});

function templateControls() {
	const controlsList = pageItems.reduce((list, { name, title }) => {
		const controlClass = name === pageObject.active ? 'control__item--active' : '';

		list += `
			<button class="control__item ${controlClass}" type="button" data-name="${name}">${title}</button>
		`;

		return list;
	}, '');

	return `
		${controlsList}
	`;
}

function templateHeaderPage(title, header) {
	const { longname = '', nameid = '' } = header;
	const nameDepart = longname && nameid ? `
		<span class="main__depart" data-depart="${longname}" data-id="${nameid}">${longname}</span>
	` : '';

	return `
		<div class="main__title-wrap">
			<h1 class="main__title">${title}</h1>
			${nameDepart}
		</div>
	`;
}

function renderControls() {
	$('.control__container').html('');
	$('.control__container').append(templateControls());
}

function renderHeaderPage(props) {
	pageItems.forEach(({ name, titlePage }) => {
		const { page = '', header = {} } = props;

		// if (page === pageObject.active) {
		if (page === name) {
			// console.log(page);
			// console.log(pageObject.active);
			// return;
			$(`.main[data-name=${page}] .main__title-wrap`).remove('');
			$(`.main[data-name=${page}] .container`).prepend(templateHeaderPage(titlePage, header));
		}
	});
}

function switchControl() {
	$('.control').click(({ target }) => {
		const nameBtn = $(target).data('name');

		if (!nameBtn) return;

		setUrlSection(nameBtn);
		focusFirstCell(nameBtn);
	});
}

function setUrlSection(page = '') {
	const nameSection = location.search.indexOf('name=');

	if (!page) {
		if (nameSection !== -1)  {
			page = location.search.slice(nameSection + 5);
		} else {
			const controls = $('.control__item');

			if (![...controls].length) return;

			page = $([...controls][0]).data('name');
		}
	}

	const urlApp = `${location.origin}${location.pathname}?name=${page}`;
	pageObject.active = page;

	$('.main').hide();
	$(`.main[data-name='${page}']`).show();
	// $('.main .main__title-wrap').remove('');
	history.replaceState(null, null, urlApp);

	renderControls();
	// renderHeaderPage(section);
}

function focusFirstCell(nameTable) {
	const rows = $(`.table--${nameTable} .table__content--active`).find('.table__row');

	$(rows).eq(0).find('.table__input').focus();
}

export default {
	renderHeaderPage
};
