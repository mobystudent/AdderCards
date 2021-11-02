'use strict';

import $ from 'jquery';

const collection = new Set(); // БД сформированных qr-кодов

$(window).on('load', () => {
	countQRCodes();
	submitIDinBD();
});

function templateDownloadTable(data) {
	const { cardid = '', cardname = '' } = data;

	return `
		<div class="table__row table__row--time">
			<div class="table__cell table__cell--body table__cell--cardid">
				<span class="table__text table__text--body">${cardid}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--cardname">
				<span class="table__text table__text--body">${cardname}</span>
			</div>
		</div>
	`;
}

function countQRCodes() {
	$('.field__textarea').bind('input', ({ target }) => {
		const itemCodesContext = $(target).val();
		const cardsArray = itemCodesContext.split('\n');

		$('.main__count--generate').text(cardsArray.length);
		addQRCodesInTable(cardsArray);
	});
}

function addQRCodesInTable(array) {
	$('#addQRCodes').click(() => {
		if (collection.size) return;

		array.forEach((item) => {
			collection.add({
				cardid: convertCardId(item),
				cardname: item
			});
		});

		dataAdd();

		$('.field__textarea').val('');
		$('.main__count--all-generate').text(collection.size);
	});
}

function convertCardId(cardNum) {
	const partOne = cardNum.slice(0, 3);
	const partTwo = cardNum.slice(4);
	let partOneHEX = parseInt(partOne).toString(16);
	let partTwoHEX = parseInt(partTwo).toString(16);

	partTwoHEX = addZeroinNum(partTwoHEX, 4);

	let tenCode = parseInt((partOneHEX + partTwoHEX), 16).toString();

	return addZeroinNum(tenCode, 10);
}

function addZeroinNum(item, numLength) {
	if (item.length < numLength) {
		const diff = numLength - item.length;

		for (let i = 0; i < diff; i++) {
			item = `0${item}`;
		}
	}

	return item;
}

function dataAdd(nameTable = '#tableGenerate') {
	if (collection.size) {
		emptySign('full');
	} else {
		emptySign('empty');

		return;
	}

	$(`${nameTable} .table__content`).html('');
	collection.forEach((item) => {
		$(`${nameTable} .table__content`).append(templateDownloadTable(item));
	});
}

function submitIDinBD() {
	$('#submitGenerate').click(() => {
		getData();


	});
}

function emptySign(status, nameTable = '#tableGenerate') {
	if (status == 'empty') {
		$(nameTable)
			.addClass('table__body--empty')
			.html('')
			.append('<p class="table__nothing">Новых данных нет</p>');
	} else {
		$(nameTable)
			.removeClass('table__body--empty')
			.html('')
			.append('<div class="table__content"></div>');
	}
}

function getData() {
	const data = {
		"PasswordHash":"88020F057FE7287D8D57494382356F97",
		"UserName":"admin"
	};
	let resultAuthent = {};

	$.ajax({
		url: "http://localhost:40001/json/Authenticate",
		method: "post",
		dataType: "json",
		contentType: 'application/json',
		data: JSON.stringify(data),
		async: false,
		success: (data) => {
			console.log(data);
			const { UserSID = '', UserToken = 0 } = data;

			resultAuthent = {
				UserSID,
				UserToken
			};

			// collection.clear();
		},
		error: (data) => {
			console.log(data);
		}
	});

	return resultAuthent;
}

export default {
};
