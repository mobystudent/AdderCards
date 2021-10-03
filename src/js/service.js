'use strict';

import $ from 'jquery';
import Scrollbar from 'smooth-scrollbar';
// const serviceObject = {
// 	activesection: ''
// }

$(window).on('load', () => {
	setUrlSection();
	switchControl();
	sortItems();
});

function templateControls(section) {
	const arrayControlsValues = [
		{
			name: 'const',
			title: 'Добавить постоянную карту'
		},
		{
			name: 'time',
			title: 'Добавить временную карту'
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
	const controlsList = arrayControlsValues.reduce((list, { name, title }) => {
		const controlClass = name === section ? 'control__item--active' : '';

		list += `
			<button class="control__item ${controlClass}" type="button" data-name="${name}">${title}</button>
		`;

		return list;
	}, '');

	return `
		${controlsList}
	`;
}

function setUrlSection(section = '') {
	const nameSection = location.search.indexOf('name=');

	if (!section) {
		if (nameSection !== -1)  {
			section = location.search.slice(nameSection + 5);
		} else {
			const controls = $('.control__item');

			if (![...controls].length) return;

			section = $([...controls][0]).data('name');
		}
	}

	const urlApp = `${location.origin}${location.pathname}?name=${section}`;

	$('.main').hide();
	$(`.main[data-name='${section}']`).show();
	history.replaceState(null, null, urlApp);

	renderControls(section);
}

function renderControls(data) {
	$('.control__container').html('');
	$('.control__container').append(templateControls(data));
}

function switchControl() {
	$('.control').click((e) => {
		const nameBtn = $(e.target).data('name');

		if (!nameBtn) return;

		setUrlSection(nameBtn);
		focusFirstCell(nameBtn);
	});
}

function focusFirstCell(nameTable) {
	const rows = $(`.table--${nameTable} .table__content--active`).find('.table__row');

	$(rows).eq(0).find('.table__input').focus();
}

// Сортировка
function sortItems() {
	$('.btn--sort').click((e) => {
		const pageName = $(e.target).closest('.main').data('name');
		const arrRows = $(e.target).parents('.table').find('.table__content--active .table__row');
		const nameField = $(e.target).parent().data('name');
		const arrNames = arrRows.map((i, item) => {
			const namePerson = $(item).find(`.table__cell--${nameField}`).text().trim();

			return {
				item,
				name: namePerson
			};
		});

		const sortItemsForNames = switchSortButton(arrNames, pageName, e.target);

		[...sortItemsForNames].forEach((elem) => {
			$(`.table--${pageName} .table__content--active`).append(elem.item);
		});
	});
}

function switchSortButton(arr, tableName, item) {
	if ($(item).data('direction')) {
		arr.sort((a, b) => a.name > b.name ? 1 : -1);
		$(item)
			.addClass('btn--sort-up')
			.removeClass('btn--sort-down')
			.data('direction', false);
	} else {
		arr.sort((a, b) => a.name < b.name ? 1 : -1);
		$(item)
			.addClass('btn--sort-down')
			.removeClass('btn--sort-up')
			.data('direction', true);
	}

	return arr;
}

//Показывать данные в таблицах о пользователях
function showDataInTable() {
	const nameTables = ['const', 'qr', 'permis', 'add', 'remove', 'edit', 'request', 'download', 'report', 'reject'];

	nameTables.forEach((item) => {
		if (!$(`.table--${item} .table__body .table__content`).length) {
			$(`.table--${item} .table__body`).addClass('table__body--empty');
			$(`.table--${item} .table__nothing`).show();
		} else {
			$(`.table--${item} .table__body`).removeClass('table__body--empty');
			$(`.table--${item} .table__nothing`).hide();
		}
	});
}

function modal(action) {
	$('.modal').addClass('modal--active');
	$('.modal__item').addClass('modal__item--active');
	$('.modal__message').hide();
	$(`.modal__message--${action}`).show();

	$('.modal__close').click(() => {
		$('.modal').removeClass('modal--active');
		$('.modal__item').removeClass('modal__item--active');
	});
}

function scrollbar() {
	const tables = $('.table__body');

	[...tables].forEach((item) => {
		Scrollbar.init(item, {
			alwaysShowTracks: true
		});
	});
}

function getCurrentDate() {
	const date = new Date();
	const month = date.getMonth() + 1;
	const currentDay = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
	const currentMonth = month < 10 ? `0${month}` : month;
	const currentYear = date.getFullYear() < 10 ? `0${date.getFullYear()}` : date.getFullYear();
	const currentHour = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
	const currentMinute = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();

	return `${currentDay}-${currentMonth}-${currentYear} ${currentHour}:${currentMinute}`;
}

export default {
	showDataInTable,
	modal,
	scrollbar,
	getCurrentDate
};
