'use strict';

import $ from 'jquery';
import Scrollbar from 'smooth-scrollbar';

$(window).on('load', () => {
	switchControl();
	sortItems();
});

function switchControl() {
	$('.control').click((e) => {
		const nameBtn = $(e.target).data('name');

		if (!nameBtn) return;

		$('.main').hide();
		$('.control__item').removeClass('control__item--active');

		if (!$(e.target).hasClass('control__item--active')) {
			$(e.target).addClass('control__item--active');
			$(`.main[data-name='${nameBtn}']`).show();
		}

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

export default {
	showDataInTable,
	modal,
	scrollbar
};
