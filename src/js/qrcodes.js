'use strict';

import $ from 'jquery';

const downloadCollection = new Set(); // БД сформированных qr-кодов
const qrNeedsUsersCollection = new Set(); // БД qr-кодов которые будут присвоены пользователям в QRconst
const qrFillOutUsersCollection = new Set(); // БД пользователей с присвоеными qr-кодами

$(window).on('load', () => {
	addQRCodesInTable('.field__textarea');
	countQRCodes();
	addQRCodeUsers();
	submitIDinBD();
});

function templateDownloadTable(data) {
	const { codepicture = '', cardid = '', cardname = '' } = data;

	return `
		<div class="table__row table__row--time">
			<div class="table__cell table__cell--body table__cell--codepicture">
				<span class="table__text table__text--body">${codepicture}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--cardid">
				<span class="table__text table__text--body">${cardid}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--cardname">
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

function countQRCodes() {
	$('.field__textarea').bind('input', (e) => {
		const filterItems = arrayQRCodes(e.target);

		$('.main__count--download').text(filterItems.length);
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
		const parseQRItem = filterItems.map((item) => item.split(' '));

		parseQRItem.forEach((item) => {
			const codePicture = item.find((obj) => obj.includes('N-'));
			const idQR = item.find((obj) => obj.length === 10);
			const nameQR = item.find((obj) => obj.length === 16);

			downloadCollection.add({
				codepicture: codePicture,
				cardid: idQR,
				cardname: nameQR
			});
		});

		parseQRItem.splice(0);

		dataAdd('#tableDownload');
		$('.field__textarea').val('');
		$('.main__count--download').text(parseQRItem.length);
	});
}

function dataAdd(nameTable) {
	$('.main__count--all-download').text(downloadCollection.size);

	if (downloadCollection.size) {
		$(`${nameTable} .table__nothing`).hide();

		$(nameTable).html('');
		$(nameTable).append(`
			<div class="table__content table__content--active">
			</div>
		`);

		downloadCollection.forEach((item) => {
			$(`${nameTable} .table__content--active`).append(templateDownloadTable(item));
		});
	} else {
		$(nameTable).addClass('table__body--empty').html('');
		$(nameTable).append(`
			<p class="table__nothing">Новых данных нет</p>
		`);

		return;
	}
}

// Удалить пустую заглушку, если таблица не пустая
// function removeEmptyPlugTable(tableName) {
// 	$(`.table--${tableName} .table__body`).removeClass('table__body--empty');
// 	$(`.table--${tableName} .table__nothing`).hide();
// }

function addQRCodeUsers() {
	$('#submitDownloadQR').click(() => {
		const countNeedsQRUsers = validationCountQRUsers();
		const countItemsTableQR = $('#tableQR .table__content--active .table__row').length;

		if (!countNeedsQRUsers) return;

		console.log(downloadCollection.size);
		console.log(countItemsTableQR);

		if (downloadCollection.size > countItemsTableQR) {
			[...downloadCollection].forEach((elem, i) => {
				const objectWithDate = {};

				if (i < countNeedsQRUsers) {
					for (let key in elem) {
						objectWithDate[key] = elem[key];
					}
					objectWithDate.date = service.getCurrentDate();

					qrNeedsUsersCollection.add(objectWithDate);
					downloadCollection.delete(elem);
				}
			});

			$('.info__item--deficit').hide();
			dataAdd('#tableDownload');
			assignQRCodeUsers();
			$('.main__count--all-download').text(downloadCollection.size);
		} else {
			$('.info__item--deficit').show();

			return;
		}
	});
}

// Получить кол-во нуждающихся пользователей из таблицы QR
function validationCountQRUsers() {
	const countItemsTableQR = $('#tableQR .table__content--active .table__row').length;
	const visibleMessage = countItemsTableQR ? 'hide' : 'show';

	$('.info__item--users')[visibleMessage]();

	return !countItemsTableQR ? false : countItemsTableQR;
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

	console.log(valueFields);
	console.log(qrCodesArray);

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

	console.warn(qrFillOutUsersCollection);

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

function submitIDinBD() {
	$('#submitConstQR').click(() => {
		if ($('.document__list').length) return;

		const nameActiveDepart = $('.main__depart--qr').text();
		const countActiveUsers = $('.main__count--qr').text();
		const countCodeOnList = 16;
		let countList = 1;

		$('.document').append(`
			<div class="document__list">
				<h2 class="document__depart">${nameActiveDepart}</h2>
				<span class="document__count">Количество qp-кодов: ${countActiveUsers}</span>
				<div class="document__grid"></div>
			</div>
		`);

		[...qrFillOutUsersCollection].forEach((user, i) => {
			console.log(user);
			$(`.document__list:nth-child(${countList}) .document__grid`).append(templateQRItem(user));
			createQRCode(user.codepicture, i);

			if (!((i + 1) % countCodeOnList)) {
				$('.document').append(`
					<div class="document__list">
						<h2 class="document__depart">${nameActiveDepart}</h2>
						<span class="document__count">Количество qp-кодов: ${countActiveUsers}</span>
						<div class="document__grid"></div>
					</div>
				`);

				countList++;
			}
		});
	});
}

function createQRCode(code, iter) {
	QRCode.toDataURL(code)
	.then(url => {
		$(`.document__item:nth-child(${iter + 1}) .document__code`).attr('src', url);
	})
	.catch(err => {
		console.error(err);

		return;
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
		<article class="document__item">
			<img class="document__code" src="" alt="qr code" />
			<h3 class="document__name">${fullName}</h3>
			<span class="document__post">${post}</span>
			<p class="document__instruct">Скачайте с Google Play или App Store приложение UProx и отсканируейте через него QR-код.</p>
		</article>
	`;
}

export default {
};
