'use strict';

import $ from 'jquery';
import service from '../service.js';

import { table } from '../components/download/table.tpl.js';
import { headerTable } from '../components/download/header-table.tpl.js';
import { count } from '../components/count.tpl.js';
import { pageTitle } from '../components/page-title.tpl.js';

const downloadCollection = new Map(); // БД сформированных qr-кодов
const parseQRCollection = new Map(); // БД загруженых qr-кодов
const dbQRCodesCollection = new Map();  // Коллекция всех добавленных qr-кодов
const downloadObject = {
	page: 'Загрузка QR-кодов'
};
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
	renderHeaderPage();
	addQRCodesInTable();
	countQRCodes();
	submitIDinBD();
	showDataFromStorage();
});

function renderHeaderPage(page = 'download') {
	$(`.main[data-name=${page}] .main__title-wrap`).html('');
	$(`.main[data-name=${page}] .container`).prepend(pageTitle(downloadObject));
}

function renderTable() {
	if (!downloadCollection.size) {
		return `<p class="table__nothing">Новых данных нет</p>`;
	} else {
		return [...downloadCollection.values()].reduce((content, item) => {
			content += table(item);

			return content;
		}, '');
	}
}

function renderCountParse() {
	$(`.main__wrap-info--parse .main__cards`).html('');
	$(`.main__wrap-info--parse .main__cards`).append(count(parseCount.item));
}

function renderCount() {
	return Object.values(downloadCount).reduce((content, item) => {
		content += count(item);

		return content;
	}, '');
}

function renderInfo(errors = [], page = 'download') {
	const info = [
		{
			type: 'warn',
			title: 'have',
			message: 'Предупреждение! QR-код с такими данными уже сгенерирован!'
		},
		{
			type: 'warn',
			title: 'contains',
			message: 'Предупреждение! QR-код с такими данными был присвоена ранее!'
		},
		{
			type: 'error',
			title: 'codepicture',
			message: 'Ошибка! Не верно введена строка с кодом для QR изображения. <br> Должен быть код для QR изображения. Например: N-9533263293161909169-16909647123891645267'
		},
		{
			type: 'error',
			title: 'cardid',
			message: 'Ошибка! Не верно введена строка с кодом для QR ID. <br> Код из 10 цифр и букв. Например: 31788A8476'
		},
		{
			type: 'error',
			title: 'cardname',
			message: 'Ошибка! Не верно введена строка с кодом для QR name. <br> Код из 16 цифр и букв. Например: E3918631788A8476'
		},
		{
			type: 'error',
			title: 'missed',
			message: 'Ошибка! Пропущена одна из трех обязательных частей qr-кода, для конвертирования.'
		}
	];

	$(`.container--${page} .info`).html('');
	info.forEach((item) => {
		const { type, title, message } = item;

		errors.forEach((error) => {
			if (error === title) {
				$(`.container--${page} .info`).append(`
					<p class="info__item info__item--${type}">${message}</p>
				`);
			}
		});
	});
}

function render(page = 'download') {
	$(`.container--${page} .wrap--content-download`).html('');
	$(`.container--${page} .wrap--content-download`).append(`
		<div class="main__wrap-info">
			<div class="main__cards">${renderCount()}</div>
		</div>
		<div class="wrap wrap--table">
			<div class="table">
				<header class="table__header">${headerTable()}</header>
				<div class="table__body">${renderTable()}</div>
			</div>
		</div>
	`);

	deleteUser();
}

function countQRCodes(nameForm = '#downloadForm') {
	$(`${nameForm} .form__item--textarea`).bind('input', ({ target }) => {
		const itemCodesContext = $(target).val();
		const itemCodes = itemCodesContext.split('\n');

		itemCodes.filter((item) => item).forEach((item, i) => {
			parseQRCollection.set(i, item.split(' '));
		});

		renderCountParse();
	});
}

function addQRCodesInTable() {
	$('#addQRCodes').click(() => {
		const correctCount = [...parseQRCollection.values()].every((code) => code.length >= 3);
		const correctCodePicture = [...parseQRCollection.values()].every((code) => code.find((elem) => elem.includes('N-') && elem.length === 42));
		const correctIDQR = [...parseQRCollection.values()].every((code) => code.find((elem) => elem.length === 10));
		const correctNameQR = [...parseQRCollection.values()].every((code) => code.find((elem) => elem.length === 16));
		const errorsArr = [];

		if (!correctCount) errorsArr.push('missed');
		if (!correctCodePicture) errorsArr.push('codepicture');
		if (!correctIDQR) errorsArr.push('cardid');
		if (!correctNameQR) errorsArr.push('cardname');

		if (!errorsArr.length) {
			getQRCodesFromDB();
			codeFromForm();
			clearFieldsForm();
		} else {
			renderInfo(errorsArr);
		}
	});
}

function codeFromForm() {
	parseQRCollection.forEach((elem) => {
		const codePicture = elem.find((obj) => obj.includes('N-') && obj.length === 42);
		const idQR = elem.find((obj) => obj.length === 10);
		const nameQR = elem.find((obj) => obj.length === 16);
		const uniqueCode = [...downloadCollection.values()].some(({ cardid }) => idQR === cardid);
		const containsCode = [...dbQRCodesCollection.values()].some(({ cardid }) => idQR === cardid);

		if (uniqueCode) {
			renderInfo(['have']);

			return;
		}

		if (containsCode) {
			renderInfo(['contains']);

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

	dataAdd();
	setDataInStorage();
}

function dataAdd() {
	render();
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
	}

	dataAdd();
}

function setDataInStorage(page = 'download') {
	localStorage.setItem(page, JSON.stringify({
		collection: [...downloadCollection.values()]
	}));
}

function deleteUser(page = 'download') {
	$(`.container--${page} .table__body`).click(({ target }) => {
		if ($(target).parents('.table__btn--delete').length || $(target).hasClass('table__btn--delete')) {
			const userID = $(target).closest('.table__row').data('id');

			downloadCollection.forEach(({ id }) => {
				if (userID === id) {
					downloadCollection.delete(userID);
				}
			});

			dataAdd();
			setDataInStorage();

			if (!downloadCollection.size) {
				localStorage.removeItem(page);
			}
		}
	});
}

function clearFieldsForm(nameForm = '#downloadForm') {
	$(`${nameForm} .form__item--textarea`).val('');
	parseQRCollection.clear();

	setTimeout(() => {
		renderInfo();
	}, 5000);

	renderCountParse();
}

function submitIDinBD(page = 'download') {
	$('#submitDownloadQR').click(() => {
		if (!downloadCollection.size) return;

		setAddUsersInDB([...downloadCollection.values()], 'download', 'add');

		downloadCollection.clear();
		render();

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
