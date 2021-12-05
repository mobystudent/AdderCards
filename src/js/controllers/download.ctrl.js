'use strict';

import $ from 'jquery';
import service from '../service.js';
import renderheader from '../parts/renderheader.js';

import { table } from '../components/download/table.tpl.js';
import { count } from '../components/download/count.tpl.js';

const downloadCollection = new Map(); // БД сформированных qr-кодов
const parseQRCollection = new Map(); // БД загруженых qr-кодов
const dbQRCodesCollection = new Map();  // Коллекция всех добавленных qr-кодов
const parseCount = {
	item: {
		title: 'Количество загруженых qr-кодов:&nbsp',
		get count() {
			return parseQRCollection.size;
		}
	}
};
const downloadCount = {
	item: {
		title: 'Количество сгенерированных qr-кодов:&nbsp',
		get count() {
			return downloadCollection.size;
		}
	}
};
let counter = 0;

$(window).on('load', () => {
	const options = {
		page: 'download',
		header: {}
	};

	renderheader.renderHeaderPage(options);
	addQRCodesInTable();
	countQRCodes();
	submitIDinBD();
	showDataFromStorage();
});

function renderTable(nameTable = '#tableDownload') {
	$(`${nameTable} .table__content`).html('');

	downloadCollection.forEach((item) => {
		$(`${nameTable} .table__content`).append(table(item));
	});

	renderCount();
}

function renderCount() {
	const pageParts = [
		{
			type: 'download',
			object: downloadCount
		},
		{
			type: 'parse',
			object: parseCount
		}
	];

	pageParts.forEach((page) => {
		$(`.main__wrap-info--${page.type} .main__cards`).html('');
		for (let key in page.object) {
			$(`.main__wrap-info--${page.type} .main__cards`).append(count(page.object[key]));
		}
	});
}

function countQRCodes(nameForm = '#downloadForm') {
	$(`${nameForm} .form__item--textarea`).bind('input', ({ target }) => {
		const itemCodesContext = $(target).val();
		const itemCodes = itemCodesContext.split('\n');

		itemCodes.filter((item) => item).forEach((item, i) => {
			parseQRCollection.set(i, item.split(' '));
		});

		renderCount();
	});
}

function addQRCodesInTable(page = 'download') {
	$('#addQRCodes').click(() => {
		const correctCount = [...parseQRCollection.values()].every((code) => code.length >= 3);
		const correctCodePicture = [...parseQRCollection.values()].every((code) => code.find((elem) => elem.includes('N-') && elem.length === 42));
		const correctIDQR = [...parseQRCollection.values()].every((code) => code.find((elem) => elem.length === 10));
		const correctNameQR = [...parseQRCollection.values()].every((code) => code.find((elem) => elem.length === 16));
		const statusCount = !correctCount ? 'show' : 'hide';
		const statusCodePicture = !correctCodePicture ? 'show' : 'hide';
		const statusIDQR = !correctIDQR ? 'show' : 'hide';
		const statusNameQR = !correctNameQR ? 'show' : 'hide';

		const valid = [statusCount, statusCodePicture, statusIDQR, statusNameQR].every((mess) => mess === 'hide');

		$(`.main[data-name=${page}]`).find('.info__item--error.info__item--missed')[statusCount]();
		$(`.main[data-name=${page}]`).find('.info__item--error.info__item--codepicture')[statusCodePicture]();
		$(`.main[data-name=${page}]`).find('.info__item--error.info__item--cardid')[statusIDQR]();
		$(`.main[data-name=${page}]`).find('.info__item--error.info__item--cardname')[statusNameQR]();

		if (valid) {
			getQRCodesFromDB();
			codeFromForm();
			clearFieldsForm();
		}
	});
}

function codeFromForm(page = 'download') {
	parseQRCollection.forEach((elem) => {
		const codePicture = elem.find((obj) => obj.includes('N-') && obj.length === 42);
		const idQR = elem.find((obj) => obj.length === 10);
		const nameQR = elem.find((obj) => obj.length === 16);
		const uniqueCode = [...downloadCollection.values()].some(({ cardid }) => idQR === cardid);
		const containsCode = [...dbQRCodesCollection.values()].some(({ cardid }) => idQR === cardid);

		if (uniqueCode) {
			$(`.main[data-name=${page}]`).find('.info__item--warn.info__item--have').show();
			return;
		}

		if (containsCode) {
			$(`.main[data-name=${page}]`).find('.info__item--warn.info__item--contains').show();
			return;
		}

		downloadCollection.set(counter, {
			id: counter,
			codepicture: codePicture,
			cardid: idQR,
			cardname: nameQR
		});
		counter++;
	});

	setDataInStorage();
	dataAdd();
}

function dataAdd() {
	if (downloadCollection.size) {
		emptySign('full');
	} else {
		emptySign('empty');

		return;
	}

	renderTable();
	deleteUser();
}

function showDataFromStorage(page = 'download') {
	const storageCollection = JSON.parse(localStorage.getItem(page));

	if (storageCollection && storageCollection.collection.length && !downloadCollection.size) {
		const lengthStorage = storageCollection.collection.length;
		counter = storageCollection.collection[lengthStorage - 1].id + 1; // id последнего элемента в localStorage

		storageCollection.collection.forEach((item, i) => {
			const itemID = storageCollection.collection[i].id;

			downloadCollection.set(itemID, item);
		});

		dataAdd();
	}
}

function setDataInStorage(page = 'download') {
	localStorage.setItem(page, JSON.stringify({
		collection: [...downloadCollection.values()]
	}));
}

function deleteUser(nameTable = '#tableDownload', page = 'download') {
	$(`${nameTable} .table__content`).click(({ target }) => {
		if ($(target).parents('.table__btn--delete').length || $(target).hasClass('table__btn--delete')) {
			const userID = $(target).closest('.table__row').data('id');

			downloadCollection.forEach(({ id }) => {
				if (userID === id) {
					downloadCollection.delete(userID);
				}
			});

			setDataInStorage();
			renderTable();

			if (!downloadCollection.size) {
				emptySign('empty');
				localStorage.removeItem(page);
			}
		}
	});
}

function clearFieldsForm(nameForm = '#downloadForm', page = 'download') {
	$(`${nameForm} .form__item--textarea`).val('');
	parseQRCollection.clear();

	setTimeout(() => {
		$(`.main[data-name=${page}]`).find('.info__item--warn.info__item--have').hide();
		$(`.main[data-name=${page}]`).find('.info__item--warn.info__item--contains').hide();
	}, 5000);

	renderCount();
}

function emptySign(status, nameTable = '#tableDownload') {
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

function submitIDinBD(page = 'download') {
	$('#submitDownloadQR').click(() => {
		if (!downloadCollection.size) return;

		setAddUsersInDB([...downloadCollection.values()], 'download' , 'add');

		downloadCollection.clear();
		emptySign('empty');
		renderTable();

		localStorage.removeItem(page);
		counter = 0;
	});
}

function setAddUsersInDB(array, nameTable, action) {
	$.ajax({
		url: "./php/change-user-request.php",
		method: "post",
		dataType: "html",
		async: false,
		data: {
			action,
			nameTable,
			array
		},
		success: () => {
			service.modal('success');
		},
		error: () => {
			service.modal('error');
		}
	});
}

function getQRCodesFromDB() {
	$.ajax({
		url: "./php/output-request.php",
		method: "post",
		dataType: "html",
		async: false,
		data: {
			nameTable: 'contains-qr'
		},
		success: (data) => {
			const dataFromDB = JSON.parse(data);

			dataFromDB.forEach((item, i) => {
				dbQRCodesCollection.set(i + 1, item);
			});
		},
		error: () => {
			service.modal('download');
		}
	});
}

export default {
};
