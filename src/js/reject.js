'use strict';

import $ from 'jquery';
import service from './service.js';
import Scrollbar from 'smooth-scrollbar';
import settingsObject from './settings.js';

const rejectCollection = new Map(); // БД отклоненных пользователей
const rejectObject = {
	statusResend: false
};

$(window).on('load', () => {
	setNameDepartOnPage();
});

function templateRejectTable(data) {
	const { id = '', fio = '', post = '', statustitle = '', date = '', statususer = '', resend = '', resendblock = '' } = data;
	const rowClassView = statususer ? 'table__row--disabled' : '';
	const resendBtnValue = resend ? 'Отменить' : 'Выбрать';
	const resendBtnClassView = resend  ? 'btn--resend-cancel' : '';
	const resendClassView = resendblock ? 'btn--allow-disabled' : '';
	const resendBtnBlock = resendblock ? 'disabled="disabled"' : '';

	return `
		<div class="table__row ${rowClassView}" data-id="${id}">
			<div class="table__cell table__cell--body table__cell--fio">
				<span class="table__text table__text--body">${fio}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--post">
				<span class="table__text table__text--body">${post}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--statustitle">
				<span class="table__text table__text--body">${statustitle}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--date">
				<span class="table__text table__text--body">${date}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--btn-resend">
				<button class="btn btn--resend ${resendBtnClassView} ${resendClassView}" type="button" ${resendBtnBlock}>${resendBtnValue}</button>
			</div>
			<div class="table__cell table__cell--body table__cell--view">
				<button class="table__btn table__btn--view" type="button">
					<svg class="icon icon--view icon--view-black">
						<use class="icon__item" xlink:href="./images/sprite.svg#view"></use>
					</svg>
				</button>
			</div>
		</div>
	`;
}

function templateRejectForm(data) {
	const { fio = '', post = '', statustitle = '', date = '', photourl = '' } = data;

	return `
		<div class="form__fields">
			<div class="form__field">
				<span class="form__name form__name--form">Фамилия Имя Отчество</span>
				<span class="form__item form__item--static" data-field="fio">${fio}</span>
			</div>
			<div class="form__field">
				<span class="form__name form__name--form">Должность</span>
				<span class="form__item form__item--static" data-field="post">${post}</span>
			</div>
			<div class="form__field">
				<span class="form__name form__name--form">Статус</span>
				<span class="form__item form__item--static" data-field="statustitle">${statustitle}</span>
			</div>
			<div class="form__field">
				<span class="form__name form__name--form">Дата</span>
				<span class="form__item form__item--static" data-field="date">${date}</span>
			</div>
		</div>
		<div class="form__aside">
			<div class="form__img">
				<img class="img img--form img--form-edit" src="${photourl}" alt="user avatar"/>
			</div>
		</div>
		<div class="form__message">
			<span class="form__name form__name--form">Причина отклонения</span>
			<p class="form__item form__item--static form__item--message" data-field="reason">Не привлекательная внешность.</p>
		</div>
	`;
}

function templateRejectHeaderTable() {
	const resendBtnValue = rejectObject.statusResend ? 'Отменить' : 'Выбрать все';
	const resendBtnClassView = rejectObject.statusResend ? 'btn--resend-cancel' : '';

	return `
		<div class="table__cell table__cell--header table__cell--fio">
			<span class="table__text table__text--header">Фамилия Имя Отчество</span>
			<button class="btn btn--sort" type="button" data-direction="true"></button>
		</div>
		<div class="table__cell table__cell--header table__cell--post">
			<span class="table__text table__text--header">Должность</span>
			<button class="btn btn--sort" type="button" data-direction="true"></button>
		</div>
		<div class="table__cell table__cell--header table__cell--statustitle">
			<span class="table__text table__text--header">Статус</span>
		</div>
		<div class="table__cell table__cell--header table__cell--date">
			<span class="table__text table__text--header">Дата</span>
		</div>
		<div class="table__cell table__cell--header table__cell--btn-resend">
			<button class="btn btn--resend ${resendBtnClassView}" id="resendAll" type="button">${resendBtnValue}</button>
		</div>
		<div class="table__cell table__cell--header table__cell--view">
			<svg class="icon icon--view icon--view-white">
				<use class="icon__item" xlink:href="./images/sprite.svg#view"></use>
			</svg>
		</div>
	`;
}

function renderTable(nameTable = '#tableReject') {
	$(`${nameTable} .table__content`).html('');

	rejectCollection.forEach((item) => {
		$(`${nameTable} .table__content`).append(templateRejectTable(item));
	});
}

function renderForm(id, nameForm = '#rejectForm') {
	$(`${nameForm} .form__wrap`).html('');

	rejectCollection.forEach((item) => {
		if (item.id === id) {
			$(`${nameForm} .form__wrap`).append(templateRejectForm(item));
		}
	});
}

function renderHeaderTable(page = 'reject') {
	$(`.table--${page} .table__header`).html('');
	$(`.table--${page} .table__header`).append(templateRejectHeaderTable());
}

function userFromDB(array, nameTable = '#tableReject') {
	const objToCollection = {
		id: '',
		fio: '',
		post: '',
		statusid: '',
		statustitle: '',
		statususer: '',
		resend: ''
	};

	array.forEach((elem, i) => {
		const itemObject = Object.assign({}, objToCollection);

		for (const itemField in itemObject) {
			for (const key in elem) {
				if (itemField === key) {
					itemObject[itemField] = elem[key];
				} else if (itemField === 'id') {
					itemObject[itemField] = i;
				}
			}
		}

		rejectCollection.set(i, itemObject);
	});

	dataAdd(nameTable);
}

function dataAdd(nameTable, page = 'reject') {
	if (rejectCollection.size) {
		emptySign(nameTable, 'full');
	} else {
		emptySign(nameTable, 'empty');

		return;
	}

	renderTable();
	resendUsers();

	$(`.main__count--${page}`).text(rejectCollection.size);
}

function showDataFromStorage(nameTable = '#tableReject', page = 'reject') {
	const storageCollection = JSON.parse(localStorage.getItem(page));

	if (storageCollection && storageCollection.collection.length && !rejectCollection.size) {
		const { statusResend } = storageCollection.controls;

		storageCollection.collection.forEach((item, i) => {
			const itemID = storageCollection.collection[i].id;

			rejectCollection.set(itemID, item);
		});

		rejectObject.statusResend = statusResend;

		dataAdd(nameTable);
	} else {
		getDatainDB('reject');
	}

	renderHeaderTable();
	resendAllUsers();
}

function setDataInStorage(page = 'reject') {
	localStorage.setItem(page, JSON.stringify({
		controls: rejectObject,
		collection: [...rejectCollection.values()]
	}));
}

function emptySign(nameTable, status) {
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

function viewDataUser(nameTable = '#tableReject') {
	$(`${nameTable} .table__content`).click((e) => {
		if (!$(e.target).parents('.table__btn--view').length || !$(e.target).hasClass('table__btn--view')) {

			const userID = $(e.target).parents('.table__row').data('id');

			$('.form__wrap').removeClass('form__wrap--hide');

			renderForm(userID);
			Scrollbar.init($('.form__item--message').get(0));
		}
	});
}

function resendUsers(nameTable = '#tableReject') {
	$(`${nameTable} .table__content`).click((e) => {
		if (!$(e.target).hasClass('btn--resend')) return;

		const userID = $(e.target).parents('.table__row').data('id');
		const user = rejectCollection.get(userID);

		user.resend = user.resend ? false : true;
		user.statususer = user.resend ? true : false;

		setDataInStorage();
		renderTable();
	});
}

function resendAllUsers() {
	$('#resendAll').click(() => {
		rejectObject.statusResend = rejectObject.statusResend ? false : true;

		rejectCollection.forEach((item) => {
			item.resend = '';
			item.statususer = rejectObject.statusResend;
			item.resendblock = rejectObject.statusResend;
		});

		console.log(rejectCollection);

		setDataInStorage();
		renderHeaderTable();
		renderTable();
		resendAllUsers();
	});
}

function autoRefresh(page = 'reject') {
	const timeReload = 15000 * 15;  //  15 минут
	let markInterval;

	$(`.switch--${page}`).click(() => {
		const statusSwitch = $('.switch__input').prop('checked');

		if (statusSwitch && !markInterval) {
			getDatainDB('reject');

			markInterval = setInterval(() => {
				getDatainDB('reject');
			}, timeReload);
		} else {
			clearInterval(markInterval);

			markInterval = false;
		}
	});
}

function setNameDepartOnPage(page = 'reject') {
	const { nameid = '', longname = '' } = settingsObject;

	$(`.main__depart--${page}`).attr({ 'data-depart': longname, 'data-id': nameid }).text(longname);

	viewDataUser();
	autoRefresh();
	showDataFromStorage();
}

function getDatainDB(nameTable) {
	$.ajax({
		url: "./php/output-request.php",
		method: "post",
		dataType: "html",
		data: {
			nameTable: nameTable
		},
		async: false,
		success: (data) => {
			const dataFromDB = JSON.parse(data);

			userFromDB(dataFromDB);
		},
		error: ()  => {
			service.modal('download');
		}
	});
}

export default {

};
