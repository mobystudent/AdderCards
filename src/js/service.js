'use strict';

import $ from 'jquery';
import { json } from './data.js';

$(window).on('load', () => {
	printReport();
	toggleSelect();
	setUsersFromSelect();
	switchControl();
	sortItems();
});

function stringifyJSON() {
	const strJson = JSON.stringify(json);

	return strJson;
}

function printReport() {
	$('.btn--print').click(() => {
		window.print();
	});
}

function toggleSelect() {
	$('.select__header').click((e) => {
		$(e.currentTarget).next().slideToggle();
		$(e.currentTarget).toggleClass('select__header--active');
	});

	clickSelectItem();
}

function clickSelectItem() {
	$('.select__item').click((e) => {
		const title = $(e.currentTarget).find('.select__name').data('title');
		const select = $(e.currentTarget).parents('.select').data('select');

		$(e.currentTarget).parents('.select').find('.select__value').addClass('select__value--selected').text(title);
		$(e.currentTarget).parent().slideUp();
		$(e.currentTarget).parents('.select').find('.select__header').removeClass('select__header--active');

		setDataAttrSelectedItem(title, select, e.currentTarget);
	});
}

function setDataAttrSelectedItem(title, select, elem) {
	const dataType = $(elem).find('.select__name').data(select);
	let attr = '';

	if (select == 'reason') {
		if (dataType == 'changeDepart') {
			$('.form__field--depart').show();

			$(elem).parents('.main').find('.wrap--content').addClass('wrap--content-remove-transfer').removeClass('wrap--content-remove-item');
		} else {
			$('.form__field--depart').hide();

			$(elem).parents('.main').find('.wrap--content').addClass('wrap--content-remove-item').removeClass('wrap--content-remove-transfer');
		}
	} else if (select == 'change') {
		if (dataType == 'changeFIO') {
			$('.form__field--new-post').hide();
			$('.form__field--new-fio').show();
		} else if (dataType == 'changePost') {
			$('.form__field--new-fio').hide();
			$('.form__field--new-post').show();
		} else {
			$('.form__field--new-fio, .form__field--new-post').hide();
		}
	}

	if (dataType) {
		attr = {'title': title, [`${select}`]: dataType};
	} else {
		attr = {'title': title};
	}

	$(elem).parents('.select').find('.select__value--selected').data(attr);
}

function setUsersFromSelect() {
	const dataArr = JSON.parse(stringifyJSON());
	const user = Object.values(dataArr).map((item) => item);

	user.forEach((item) => {
		const name = item.FIO;

		$('.select[data-select="fio"]').find('.select__list').append(`
			<li class="select__item">
				<span class="select__name" data-title="${name}">
					${name}
				</span>
			</li>
		`);
	});

	clickSelectItem();
}

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
	const nameTables = ['const', 'qr', 'permis', 'add', 'remove', 'edit', 'request', 'download'];

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

export default {
	printReport,
	showDataInTable
};