'use strict';

import $ from 'jquery';
import QRCode from 'qrcode';

const qrCollection = new Set(); // БД сформированных qr-кодов
const qrNeedsUsersCollection = new Set(); // БД qr-кодов которые будут присвоены пользователям в QRconst
const qrFillOutUsersCollection = new Set(); // БД пользователей с присвоеными qr-кодами

$(window).on('load', () => {

	addQRCodesInTable('.field__textarea');
	countQRCodes();
	addQRCodeUsers();
	addUsersInBD();
});

function countQRCodes() {
	$('.field__textarea').bind('input', (e) => {
		const filterItems = arrayQRCodes(e.target);
		const countQRs = filterItems.length;

		$('.main__count--download').text(countQRs);
	});
}

function arrayQRCodes(elem) {
	const itemCodesContext = $(elem).val();
	const itemCodes = itemCodesContext.split('\n');
	const filterItems = itemCodes.filter((item) => item ? true : false);

	return filterItems;
}

function addQRCodesInTable(elem) {
	$('#addQRCodes').click(() => {
		const filterItems = arrayQRCodes(elem);
		const parseQRItem = filterItems.map((item) =>  item.split(' '));

		parseQRItem.forEach((item) => {
			const codePicture = item.find((obj) => obj.includes('N-'));
			const idQR = item.find((obj) => obj.length === 10);
			const nameQR = item.find((obj) => obj.length === 16);

			qrCollection.add({
				codepicture: codePicture,
				cardid: idQR,
				cardname: nameQR
			});
		});

		createTable();
		$('.field__textarea').val('');
		$('.main__count--all-download').text(qrCollection.size);
		$('.main__count--download').text('0');
	});
}

function createTable() {
	if (!$('#tableDownload').find('.table__content').length) {
		$('#tableDownload').append(`<div class="table__content table__content--active"></div>`);
	} else {
		$('#tableDownload .table__content--active').html('');
	}

	qrCollection.forEach((item) => {
		const { codepicture = '', cardid = '', cardname = '' } = item;

		$('#tableDownload .table__content').append(templateDownloadTable(codepicture, cardid, cardname));

		removeEmptyPlugTable('download');
	});
}

// Удалить пустую заглушку, если таблица не пустая
function removeEmptyPlugTable(tableName) {
	$(`.table--${tableName} .table__body`).removeClass('table__body--empty');
	$(`.table--${tableName} .table__nothing`).hide();
}

function templateDownloadTable(codepicture, cardid, cardname) {
	return `
		<div class="table__row table__row--time">
			<div class="table__cell table__cell--body table__cell--codepicture" data-name="codepicture" data-info="true" data-value="${codepicture}">
				<span class="table__text table__text--body">${codepicture}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--cardid" data-name="cardid" data-info="true" data-value="${cardid}">
				<span class="table__text table__text--body">${cardid}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--cardname" data-name="cardname" data-info="true" data-value="${cardname}">
				<span class="table__text table__text--body">${cardname}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--delete">
				<button class="table__btn table__btn--delete" type="button">
					<svg class="icon icon--delete">
						<use class="icon__item" xlink:href="#delete"></use>
					</svg>
				</button>
			</div>
		</div>
	`;
}

// Получить кол-во нуждающихся пользователей из таблицы QR
function validationCountQRUsers() {
	const countItemsTableQR = $('#tableQR .table__content--active .table__row').length;
	const visibleMessage = countItemsTableQR ? 'hide' : 'show';

	$('.info__item--users')[visibleMessage]();

	return !countItemsTableQR ? false : countItemsTableQR;
}

function addQRCodeUsers() {
	$('#submitDownloadQR').click(() => {
		const countNeedsQRUsers = validationCountQRUsers();

		if (!countNeedsQRUsers) return;

		[...qrCollection].forEach((elem, i) => {
			const objectWithDate = {};

			if (i < countNeedsQRUsers) {
				for (let key in elem) {
					objectWithDate[key] = elem[key];
				}
				objectWithDate.date = getCurrentDate();

				qrNeedsUsersCollection.add(objectWithDate);
				qrCollection.delete(elem);
			}
		});

		createTable();
		assignQRCodeUsers();
		$('.main__count--all-download').text(qrNeedsUsersCollection.size);
	});
}

function getCurrentDate() {
	const date = new Date();
	const currentDay = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
	const currentMonth = date.getMonth() < 10 ? `0${date.getMonth()}` : date.getMonth();
	const currentYear = date.getFullYear() < 10 ? `0${date.getFullYear()}` : date.getFullYear();

	return `${currentDay}-${currentMonth}-${currentYear}`;
}

function assignQRCodeUsers() {
	const itemUsers = $('#tableQR .table__content--active').find('.table__row');
	const valueFields = [...itemUsers].map((row) => {
		const cells = $(row).find('.table__cell');
		const cellInfo = [...cells].filter((cell) => $(cell).attr('data-info'));
		const valueField = cellInfo.reduce((acc, cell) => {
			const name = $(cell).attr('data-name');
			const value = $(cell).attr('data-value');

			acc[name] = value;

			return acc;
		}, {});

		return valueField;
	});
	const qrCodesArray = Array.from(qrNeedsUsersCollection);

	valueFields.forEach((elem, i) => {
		for (const keyItem in elem) {
			for (const key in qrCodesArray[i]) {
				if (keyItem == key) {
					elem[keyItem] = qrCodesArray[i][key];
				} else {
					elem[key] = qrCodesArray[i][key];
				}
			}
		}

		qrFillOutUsersCollection.add(elem);
	});

	createTableFill();
}

function createTableFill() {
	$('#tableQR .table__content--active').html('');
	const dataToFillTable = [...qrFillOutUsersCollection].map((elem) => {
		return {
			fio: elem.fio,
			post: elem.post,
			cardid: elem.cardid,
			cardname: elem.cardname,
			statusid: elem.statusid
		};
	});

	console.warn(dataToFillTable);

	dataToFillTable.forEach((item, i) => {
		$('#tableQR .table__content--active').append(`<div class="table__row" data-id="0"></div>`);

		for (let itemValue in item) {
			let statusValue;
			itemValue = itemValue.toLocaleLowerCase();

			if (itemValue == 'StatusID') {
				switch(item[itemValue]) {
					case 'newCard':
						statusValue = 'Новая карта';
						break;
					case 'changeCard':
						statusValue = 'Замена карты';
						break;
					case 'newQR':
						statusValue = 'Новый QR-код';
						break;
					case 'changeQR':
						statusValue = 'Замена QR-кода';
						break;
					case 'changeFIO':
						statusValue = 'Изменение ФИО';
						break;
					case 'changePost':
						statusValue = 'Изменение должности';
						break;
					case 'changeDepart':
						statusValue = 'Перевод в другое подразделение';
						break;
				}
			} else {
				statusValue = item[itemValue];
			}

		$('#tableQR').find(`.table__row:nth-child(${i + 1})`).append(`
			<div class="table__cell table__cell--body table__cell--${itemValue}" data-name="${itemValue}" data-info="true" data-value="${statusValue}">
				<span class="table__text table__text--body">
					${statusValue}
				</span>
			</div>
		`);
	}

		$('#tableQR').find(`.table__row:nth-child(${i + 1})`).append(`
			<div class="table__cell table__cell--clear">
				<button class="table__btn table__btn--clear" type="button">
					<svg class="icon icon--clear">
						<use class="icon__item" xlink:href="#clear"></use>
					</svg>
				</button>
			</div>
			<div class="table__cell table__cell--signature">
				<span class="table__text table__text--body"></span>
			</div>
		`);
	});
}

function addUsersInBD() {
	$('#submitConstQR').click(() => {
		[...qrFillOutUsersCollection].forEach((user, i) => {
			$('.canvas__grid').append(templateQRItem(user));
			createQRCode(user.codepicture, i);
		});
	});
}

function createQRCode(code, iter) {
	QRCode.toDataURL(code)
	.then(url => {
		$(`.canvas__item:nth-child(${iter + 1}) .canvas__code`).attr('src', url);
	})
	.catch(err => {
		console.error(err);
	});
}

function templateQRItem(user) {
	const { fio = '', post = '' } = user;
	const fioArr = fio.split(' ');
	let fullName = '';

	if (fioArr.length <= 3) {
		fullName = fioArr.reduce((acc, elem) => {
			const templateName = `<span>${elem}</span>`;

			acc += templateName;

			return acc;
		}, '');
	} else {
		fullName = `<p>${fio}</p>`;
	}

	return `
		<article class="canvas__item">
			<img class="canvas__code" src="" alt="qr code" />
			<h3 class="canvas__name">${fullName}</h3>
			<span class="canvas__post">${post}</span>
			<p class="canvas__instruct">Скачайте с Google Play или App Store приложение UProx и отсканируейте через него QR-код.</p>
		</article>
	`;
}

export default {
};
