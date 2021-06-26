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
	generateQRCode('.field__textarea');

	$('.field__textarea').bind('input', (e) => {
		countQRCodes(e.target);
		generateQRCode(e.target);
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

function generateQRCode(elem) {
	const filterItems = arrayQRCodes(elem);

	createQRCode(filterItems);
	assignUserQRCode(filterItems);
}

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
