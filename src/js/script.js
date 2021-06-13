'use strict';

import $ from 'jquery';
import QRCode from 'qrcode';
import { json } from './data.js';
import { shortNameDepart } from './shortNameDepart.js';
// import Convert from './convert.js';
import convert from './convert.js';

$(window).on('load', () => {
	getData();
	stringifyJSON();
	delegationID();
	clearNumberCard();
	printReport();
	switchControl();
	addTimeCard();
	deleteTimeCard();
	changeCountQRCodes();
	addIDinDB();
	sortPerson();
	createQRCode();

	countItems('#tableTime .table__content', 'time');

	convert.viewConvertCardId();
});

function getData() {
	$.ajax({
		// url: "ftp_user@192.168.56.101",
		url: "/ajax.php",
		dataType: "json",
		success: function(data) {
			console.log('succsess '+data);
		},
		error: function() {
			console.log('error');
		}
	});
}

function stringifyJSON() {
	const strJson = JSON.stringify(json);

	return strJson;
}

function delegationID() {
	const dataArr = JSON.parse(stringifyJSON());
	const depart = Object.values(dataArr).map((item) => item);
	const filterArrCards = depart.filter((item) => {
		if (item.StatusID == 'newCard' || item.StatusID == 'changeCard') return item;
	});
	const filterArrQRs = depart.filter((item) => {
		if (item.StatusID == 'newQR' || item.StatusID == 'changeQR') return item;
	});

	if (filterArrCards) {
		addTabs(filterArrCards, '#tableConst', 'const');
		viewAllCountAndTitleDefault(filterArrCards, 'const');
		changeTabs('#tableConst', 'const');
		createTable('#tableConst');
		addCountCards(filterArrCards, '#tableConst', 'const');
		focusFirstCell('const');
	}

	if (filterArrQRs) {
		addTabs(filterArrQRs, '#tableQR', 'qr');
		viewAllCountAndTitleDefault(filterArrQRs, 'qr');
		changeTabs('#tableQR', 'qr');
		createTable('#tableQR');
		addCountCards(filterArrQRs, '#tableQR', 'qr');
		focusFirstCell('qr');
	}
}

function addTabs(filterIDItems, nameTable, modDepart) {
	const filterNameDepart = filterDepart(filterIDItems);

	if (filterNameDepart.length > 1) {
		filterNameDepart.forEach((item, i) => {
			const arrDepart = Object.entries(shortNameDepart);

			arrDepart.forEach((depart) => {
				if (item == depart[0]) {
					$(`.tab--${modDepart}`).append(`
						<button class="tab__item${i == 0 ? ' tab__item--active' : ''}" type="button" data-depart=${depart[0]}>
							<span class="tab__name">${depart[1]}</span>
						</button>
					`);
					$(nameTable).append(`
						<div class="table__content table__content--const" data-content=${depart[0]}>
						</div>
					`);
				}
			});
		});
	} else {
		$(nameTable).append(`
			<div class="table__content table__content--const table__content--active" data-content=${filterNameDepart}>
			</div>
		`);
	}
}

function filterDepart(filterIDItems) {
	const arrayDepart = filterIDItems.reduce((acc, item) => {
		acc.push(item.NameID);
		return acc;
	}, []);
	const filterIdDepart = new Set(arrayDepart);

	return [...filterIdDepart];
}

function addCountCards(filterIDItems, nameTable, modDepart) {
	const filterNameDepart = filterDepart(filterIDItems);

	if (filterNameDepart.length > 1) {
		$(`${nameTable} .table__content--const`).eq(0).addClass('table__content--active');

		countItems(`${nameTable} .table__content--active`, modDepart);
	}
}

function viewAllCountAndTitleDefault(filterIDItems, modDepart) {
	const activeTabDepart = $(`.tab--${modDepart} .tab__item--active`).data('depart');

	$(`.main[data-name="const"]`).show();
	$(`.main__count--all-${modDepart}`).text(filterIDItems.length);

	filterIDItems.forEach((item) => {
		if (item.NameID == activeTabDepart) {
			$(`.main__depart--${modDepart}`).text(item.Department);
		}
	});
}

function changeTabs(nameTable, modDepart) {
	const dataArr = JSON.parse(stringifyJSON());
	const depart = Object.values(dataArr).map((item) => item);

	$(`.tab--${modDepart} .tab__item`).click((e) => {
		const nameDepart = $(e.target).closest('.tab__item').data('depart');

		$(`${nameTable} .table__content--const`).removeClass('table__content--active');
		$(`.tab--${modDepart} .tab__item`).removeClass('tab__item--active');
		$(`.main__depart--${modDepart}`).text('');
		$(`${nameTable} .table__content--const[data-content=${nameDepart}]`).addClass('table__content--active');
		$(e.target).closest('.tab__item').addClass('tab__item--active');

		countItems(`${nameTable} .table__content--active`, modDepart);

		depart.forEach((item) => {
			if (item.NameID == nameDepart) {
				$(`.main__depart--${modDepart}`).text(item.Department);
			}
		});

		focusFirstCell(modDepart);
		convert.checkValFieldsCardId(e.target);
	});
}

function createTable(nameTable) {
	const dataArr = JSON.parse(stringifyJSON());

	const user = Object.values(dataArr).map((item) => item);
	const limitUser = user.map((item) => {
		const {
			FIO = '',
			Department = '',
			FieldGroup = '',
			Badge = '',
			CardName = '',
			CardID = '',
			CardValidTo = '',
			PIN = '',
			CardStatus = 1,
			Security = 0,
			Disalarm = 0,
			VIP = 0,
			DayNightCLM = 0,
			AntipassbackDisabled = 0,
			PhotoFile = '',
			EmployeeNumber = '',
			Post = '',
			NameID = '',
			StatusID = ''
		} = item;

		return {
			FIO,
			Post,
			NameID,
			CardID,
			CardName,
			StatusID
		};
	});

	limitUser.forEach((item) => {
		const tableContent = $(`${nameTable} .table__content--const[data-content=${item.NameID}]`);
		tableContent.append(`<div class="table__row"></div>`);

		const countRows = $(`${nameTable} .table__content--const[data-content=${item.NameID}] .table__row`).length;

		for (let itemValue in item) {
			let statusValue;

			if (itemValue == 'StatusID') {
				switch(item[itemValue]) {
					case 'newCard':
						statusValue = 'Новая карта';
						break;
					case 'changeCard':
						statusValue = 'Замена карты';
						break;
					case 'changeQR':
						statusValue = 'Новый QR-код';
						break;
					case 'newQR':
						statusValue = 'Замена QR-кода';
						break;
					case 'changeFIO':
						statusValue = 'Замена ФИО';
						break;
				}
			} else {
				statusValue = item[itemValue];
			}

			itemValue = itemValue.toLocaleLowerCase();

			if (itemValue === 'cardid') {
				tableContent.find(`.table__row:nth-child(${countRows})`).append(`
					<div class="table__cell table__cell--body table__cell--${itemValue}">
						<input class="table__input" />
					</div>
				`);
			} else {
				tableContent.find(`.table__row:nth-child(${countRows})`).append(`
					<div class="table__cell table__cell--body table__cell--${itemValue}">
						<span class="table__text table__text--body">
							${statusValue}
						</span>
					</div>
				`);
			}
		}

		tableContent.find(`.table__row:nth-child(${countRows})`).append(
			`<div class="table__cell table__cell--clear">
				<button class="table__btn table__btn--clear" type="button">
					<svg class="icon icon--clear">
						<use class="icon__item" xlink:href="#clear"></use>
					</svg>
				</button>
			</div>
			<div class="table__cell table__cell--signature">
				<span class="table__text table__text--body"></span>
			</div>`
		);
	});
}

function printReport() {
	$('.btn--print').click((e) => {
		$(e.target).closest('.main').find('.tab__item--active').data('depart');

		window.print();
	});
}

function clearNumberCard() {
	$('.table__btn').click((e) => {
		const cardsUser = $(e.target).parents('.table__row');

		cardsUser.find('.table__cell--cardid input').val('');
		cardsUser.find('.table__cell--cardname span').text('');
		cardsUser.find('.table__cell--cardid input').removeAttr('readonly');

		convert.checkValFieldsCardId(e.target);
	});
}

function switchControl() {
	$('.btn--control').click((e) => {
		const nameBtn = $(e.target).data('name');

		$('.main').hide();
		$(`.main[data-name='${nameBtn}']`).show();

		focusFirstCell(nameBtn);
	});
}

function focusFirstCell(nameTable) {
	const rows = $(`.table--${nameTable} .table__content--active`).find('.table__row');

	$(rows).eq(0).find('.table__input').focus();
}

// Временные карты
function addTimeCard() {
	$('.main__btn').click(() => {
		$('#tableTime .table__content').append(`
			<div class="table__row table__row--time">
				<div class="table__cell table__cell--body table__cell--nametitle">
					<span class="table__text table__text--body">Временная карта</span>
				</div>
				<div class="table__cell table__cell--body table__cell--cardid">
					<input class="table__input" />
				</div>
				<div class="table__cell table__cell--body table__cell--cardname">
					<span class="table__text table__text--body"></span>
				</div>
				<div class="table__cell table__cell--body table__cell--clear">
					<button class="table__btn table__btn--clear" type="button">
						<svg class="icon icon--clear">
							<use class="icon__item" xlink:href="#clear"></use>
						</svg>
					</button>
				</div>
				<div class="table__cell table__cell--body table__cell--delete">
					<button class="table__btn table__btn--delete" type="button">
						<svg class="icon icon--delete">
							<use class="icon__item" xlink:href="#delete"></use>
						</svg>
					</button>
				</div>
			</div>
		`);

		countItems('#tableTime .table__content', 'time');
		deleteTimeCard();
	});
}

function deleteTimeCard() {
	$('.table__btn--delete').click((e) => {
		$(e.target).parents('.table__row--time').remove();

		countItems('#tableTime .table__content', 'time');
	});
}

function countItems(tableContent, modDepart) {
	const countItemfromDep = $(tableContent).eq(0).find('.table__row').length;

	$(`.main__count--${modDepart}`).text(countItemfromDep);
}

// Закрузка QR-кодов
function changeCountQRCodes() {
	countQRCodes('.field__textarea');

	$('.field__textarea').bind('input', (e) => {
		countQRCodes(e.target);
	});
}

function countQRCodes(elem) {
	const itemCodesContext = $(elem).val();
	const itemCodes = itemCodesContext.split('\n');
	const filterItems = itemCodes.filter((item) => item ? true : false);
	const countQRs = filterItems.length;

	$('.main__count--download').text(countQRs);
	createQRCode(filterItems);
}

// Добавление
function addIDinDB() {
	$('.btn--add').click((e) => {
		const dataDepart = $(e.target).closest('.main').data('name');
		const countTabs = $(`.tab--${dataDepart} .tab__item`);
		const countContent = $(`.table--${dataDepart} .table__content`);

		if (countTabs.length > 1) {
			removeAndFocusActiveBlock(countTabs, 'tab__item', dataDepart);
			removeAndFocusActiveBlock(countContent, 'table__content', dataDepart);
		} else {
			$(`.tab--${dataDepart} .tab__item--active`).remove();
			$(`.table--${dataDepart} .table__content--active`).remove();
			$(`.table--${dataDepart} .table__nothing`).show();
		}
	});
}

function removeAndFocusActiveBlock(containerBl, block, nameTable) {
	let numActive;

	[...containerBl].forEach((item, i) => {
		if ($(item).hasClass(`${block}--active`)) {
			$(item).remove();
			numActive = i;
		}
	});

	[...containerBl].forEach(() => {
		if (numActive != 0) {
			$(containerBl).eq(numActive - 1).addClass(`${block}--active`);
		} else if (numActive + 1 && numActive == 0) {
			$(containerBl).eq(numActive + 1).addClass(`${block}--active`);
		}
	});

	focusFirstCell(nameTable);
}

// Сортировка
function sortPerson() {
	$('.btn--sort').click((e) => {
		const dataDepart = $(e.target).closest('.main').data('name');
		const arrRows = $(`.table--${dataDepart} .table__content--active .table__row`);
		const arrNames = arrRows.map((i, item) => {
			const namePerson = $(item).find('.table__cell--fio').text().trim();

			return {
				item,
				name: namePerson
			};
		});

		const sortItemsForNames = switchSortButton(arrNames, dataDepart);

		[...sortItemsForNames].forEach((elem) => {
			$(`.table--${dataDepart} .table__content--active`).append(elem.item);
		});
	});
}

function switchSortButton(arr, depart) {
	if ($(`.table--${depart} .btn--sort`).data('direction')) {
		arr.sort((a, b) => a.name > b.name ? 1 : -1);
		$(`.table--${depart} .btn--sort`)
		.addClass('btn--sort-up')
		.removeClass('btn--sort-down')
		.data('direction', false);
	} else {
		arr.sort((a, b) => a.name < b.name ? 1 : -1);
		$(`.table--${depart} .btn--sort`)
		.addClass('btn--sort-down')
		.removeClass('btn--sort-up')
		.data('direction', true);
	}

	return arr;
}

function createQRCode(arrCodes) {
	const canvasArray = $('.canvas__code');
	// console.log(canvas);

	[...canvasArray].forEach((item, i) => {
		console.log(typeof(arrCodes[i]));
		QRCode.toDataURL(arrCodes[i])
		.then(url => {
			$(item).attr('src', url);
		})
		.catch(err => {
			console.error(err);
		})
	});
}
