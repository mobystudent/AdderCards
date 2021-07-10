'use strict';

import $ from 'jquery';
import QRCode from 'qrcode';

$(window).on('load', () => {

	addUsersInBD();
});

function addUsersInBD() {
	$('#submitConstQR').click(() => {

	});
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
		});
	});
}

export default {

};
