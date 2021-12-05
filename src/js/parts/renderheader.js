'use strict';

import $ from 'jquery';

const pageItems = [
	{
		name: 'time',
		title: 'Добавить временную карту'
	},
	{
		name: 'const',
		title: 'Добавить постоянную карту'
	},
	{
		name: 'qr',
		title: 'Добавить QR-код'
	},
	{
		name: 'download',
		title: 'Загрузить QR-код'
	},
	{
		name: 'permis',
		title: 'Разрешение на добавление'
	},
	{
		name: 'add',
		title: 'Добавить пользователя'
	},
	{
		name: 'remove',
		title: 'Удалить пользователя'
	},
	{
		name: 'edit',
		title: 'Редактировать пользователя'
	},
	{
		name: 'reject',
		title: 'Отклоненные пользователи'
	},
	{
		name: 'request',
		title: 'Запрос на изменение'
	},
	{
		name: 'settings',
		title: 'Настройки'
	},
	{
		name: 'report',
		title: 'Отчёт по изменения'
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

function renderControls() {
	$('.control__container').html('');
	$('.control__container').append(templateControls());
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
}

function focusFirstCell(nameTable) {
	const rows = $(`.table--${nameTable} .table__content--active`).find('.table__row');

	$(rows).eq(0).find('.table__input').focus();
}

export default {
};
