'use strict';

import $ from 'jquery';
import { json } from './data.js';
import QRCode from 'qrcode';

function stringifyJSON() {
	const strJson = JSON.stringify(json);

	return strJson;
}

function changeCountQRCodes() {
	countQRCodes('.field__textarea');
	// generateQRCode('.field__textarea');
	addQRCodesInTable('.field__textarea');

	$('.field__textarea').bind('input', (e) => {
		countQRCodes(e.target);
		// generateQRCode(e.target);
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
		const filloutObject = parseQRItem.map((item) => {
			const codePicture = item.find((obj) => obj.includes('N-'));
			const idQR = item.find((obj) => obj.length === 10);
			const nameQR = item.find((obj) => obj.length === 16);

			return [
				{
					codePicture,
					idQR,
					nameQR
				}
			];
		});

		createTable(filloutObject);
		$('.field__textarea').val('');
	});
}

function createTable(values) {
	if (!$('#tableDownload').find('.table__content').length) {
		$('#tableDownload').append(`<div class="table__content table__content--active"></div>`);

		[...values].flat(1).forEach((item) => {
			const { codePicture = '', idQR = '', nameQR = '' } = item;

			$('#tableDownload .table__content').append(templateDownloadTable(codePicture, idQR, nameQR));

			$(`.table--download .table__body`).removeClass('table__body--empty');
			$(`.table--download .table__nothing`).hide();
		})
	}
}

function templateDownloadTable(codePicture, idQR, nameQR) {
	return `
		<div class="table__row table__row--time">
			<div class="table__cell table__cell--body table__cell--code" data-name="code" data-info="true" data-value="${codePicture}">
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

function createQRCode(arrCodes) {
	const canvasArray = $('.canvas__code');

	[...canvasArray].forEach((item, i) => {
		QRCode.toDataURL(arrCodes[i])
		.then(url => {
			$(item).attr('src', url);
		})
		.catch(err => {
			console.error(err);
		})
	});
}

function assignUserQRCode(arrCodes) {
	const dataArr = JSON.parse(stringifyJSON());
	const depart = Object.values(dataArr).map((item) => item);

	const filterArrQRs = depart.filter((item) => {
		if (item.StatusID == 'newQR' || item.StatusID == 'changeQR') return item;
	});
	const countUserHasCode = filterArrQRs.length;
	const fieldsQRCodes = $('.table--qr .table__cell--cardid input');

	filterArrQRs.forEach((item, i) => {
		item.CardID = arrCodes[i];
		$(fieldsQRCodes[i]).val(arrCodes[i])
	});

	remoteAddedCodes(countUserHasCode);
}

function remoteAddedCodes(count) {
	const filterItems = arrayQRCodes('.field__textarea');
	filterItems.splice(0, count);
	const joinnewArrCodes = filterItems.join('\n');

	$('.field__textarea').val(joinnewArrCodes);
	countQRCodes('.field__textarea');
}

export default {
	changeCountQRCodes
};
