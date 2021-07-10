'use strict';

import $ from 'jquery';
// import { json } from './data.js';
const qrCollection = new Set(); // БД сформированных qr-кодов
const qrNeedsUsersCollection = new Set(); // БД qr-кодов которые будут присвоены пользователям в QRconst

$(window).on('load', () => {

	addQRCodesInTable('.field__textarea');
	assignQRCodeUsers();
});

// function stringifyJSON() {
// 	const strJson = JSON.stringify(json);
//
// 	return strJson;
// }

function changeCountQRCodes() {
	countQRCodes('.field__textarea');

	$('.field__textarea').bind('input', (e) => {
		countQRCodes(e.target);
	});
}

function arrayQRCodes(elem) {
	const itemCodesContext = $(elem).val();
	const itemCodes = itemCodesContext.split('\n');
	const filterItems = itemCodes.filter((item) => item ? true : false);

	return filterItems;
}

function countQRCodes(elem) {
	const filterItems = arrayQRCodes(elem);
	const countQRs = filterItems.length;

	$('.main__count--download').text(countQRs);
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
				codePicture,
				idQR,
				nameQR
			});
		});

		createTable();
		$('.field__textarea').val('');
		countQRCodes('.field__textarea');
	});
}

function createTable() {
	if (!$('#tableDownload').find('.table__content').length) {
		$('#tableDownload').append(`<div class="table__content table__content--active"></div>`);
	} else {
		$('#tableDownload .table__content--active').html('');
	}

	qrCollection.forEach((item) => {
		const { codePicture = '', idQR = '', nameQR = '' } = item;

		$('#tableDownload .table__content').append(templateDownloadTable(codePicture, idQR, nameQR));

		removeEmptyPlugTable('download');
	});
}

// Удалить пустую заглушку, если таблица не пустая
function removeEmptyPlugTable(tableName) {
	$(`.table--${tableName} .table__body`).removeClass('table__body--empty');
	$(`.table--${tableName} .table__nothing`).hide();
}

function templateDownloadTable(codePicture, idQR, nameQR) {
	return `
		<div class="table__row table__row--time">
			<div class="table__cell table__cell--body table__cell--codepicture" data-name="codepicture" data-info="true" data-value="${codePicture}">
				<span class="table__text table__text--body">${codePicture}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--cardid" data-name="cardid" data-info="true" data-value="${idQR}">
				<span class="table__text table__text--body">${idQR}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--cardname" data-name="cardname" data-info="true" data-value="${nameQR}">
				<span class="table__text table__text--body">${nameQR}</span>
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

// function generateQRCode(elem) {
// 	$('#addQRCodes').click(() => {
// 		const filterItems = arrayQRCodes(elem);
//
// 		console.log(filterItems);
//
// 		// createQRCode(filterItems);
// 		// assignUserQRCode(filterItems);
// 	});
// }


// Получить кол-во нуждающихся пользователей из таблицы QR
function validationCountQRUsers() {
	const countItemsTableQR = $('#tableQR .table__content--active .table__row').length;
	const visibleMessage = countItemsTableQR ? 'hide' : 'show';

	$('.info__item--users')[visibleMessage]();

	return !countItemsTableQR ? false : countItemsTableQR;
}

function assignQRCodeUsers() {
	$('#submitDownloadQR').click(() => {
		const countNeedsQRUsers = validationCountQRUsers();

		if (!countNeedsQRUsers) return;

		// const itemUsers = $('#tableDownload .table__content--active').find('.table__row');
		// const object = {
		// 	cardname: '',
		// 	cardID: '',
		// 	date: '',
		// 	codepicture: ''
		// };
		// const valueFields = [...itemUsers].map((row) => {
		// 	const cells = $(row).find('.table__cell');
		// 	const cellInfo = [...cells].filter((cell) => $(cell).attr('data-info'));
		// 	const valueField = cellInfo.map((cell) => {
		// 		const name = $(cell).attr('data-name');
		// 		const value = $(cell).attr('data-value');
		//
		// 		return {[name]: value};
		// 	});
		//
		// 	return valueField;
		// });
		// valueFields.forEach((elem) => {
		// 	const itemObject = Object.assign({}, object);
		//
		// 	for (const itemField in itemObject) {
		// 		for (const item of elem) {
		// 			for (const key in item) {
		// 				if (itemField == key) {
		// 					itemObject[itemField] = item[key];
		// 				} else if (itemField == 'data') {
		// 					itemObject[itemField] = getCurrentDate();
		// 				}
		// 			}
		// 		}
		// 	}
		//
		// 	fillOutArr.push(itemObject);
		// });
		// qrNeedsUsersCollection

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

		console.error(qrCollection);
		console.warn(qrNeedsUsersCollection);

		createTable();
	});
}

function getCurrentDate() {
	const date = new Date();
	const currentDay = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
	const currentMonth = date.getMonth() < 10 ? `0${date.getMonth()}` : date.getMonth();
	const currentYear = date.getFullYear() < 10 ? `0${date.getFullYear()}` : date.getFullYear();

	return `${currentDay}-${currentMonth}-${currentYear}`;
}

// function createQRCode(arrCodes) {
// 	const canvasArray = $('.canvas__code');
//
// 	[...canvasArray].forEach((item, i) => {
// 		QRCode.toDataURL(arrCodes[i])
// 		.then(url => {
// 			$(item).attr('src', url);
// 		})
// 		.catch(err => {
// 			console.error(err);
// 		});
// 	});
// }

// function assignUserQRCode(arrCodes) {
// 	const dataArr = JSON.parse(stringifyJSON());
// 	const depart = Object.values(dataArr).map((item) => item);
//
// 	const filterArrQRs = depart.filter((item) => {
// 		if (item.StatusID == 'newQR' || item.StatusID == 'changeQR') return item;
// 	});
// 	const countUserHasCode = filterArrQRs.length;
// 	const fieldsQRCodes = $('.table--qr .table__cell--cardid input');
//
// 	filterArrQRs.forEach((item, i) => {
// 		item.CardID = arrCodes[i];
// 		$(fieldsQRCodes[i]).val(arrCodes[i])
// 	});
//
// 	remoteAddedCodes(countUserHasCode);
// }

// function remoteAddedCodes(count) {
// 	const filterItems = arrayQRCodes('.field__textarea');
// 	filterItems.splice(0, count);
// 	const joinnewArrCodes = filterItems.join('\n');
//
// 	$('.field__textarea').val(joinnewArrCodes);
// 	countQRCodes('.field__textarea');
// }

export default {
	changeCountQRCodes
};
