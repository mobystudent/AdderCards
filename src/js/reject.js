'use strict';

import $ from 'jquery';
import service from './service.js';
import Scrollbar from 'smooth-scrollbar';
import settingsObject from './settings.js';

const rejectCollection = new Map(); // БД отклоненных пользователей
const rejectObject = {
	statusresend: ''
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
	const resendBtnValue = rejectObject.statusresend ? 'Отменить' : 'Выбрать все';
	const resendBtnClassView = rejectObject.statusresend ? 'btn--resend-cancel' : '';

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

function templateHeaderPage(page = 'request') {
	const { nameid = '', longname = '' } = settingsObject;

	return `
		<h1 class="main__title">Отклоненные пользователи</h1>
		<span class="main__depart main__depart--${page}" data-depart="${longname}" data-id="${nameid}">${longname}</span>
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

function renderHeaderPage(page = 'reject') {
	$(`.main[data-name=${page}] .main__title-wrap`).html('');
	$(`.main[data-name=${page}] .main__title-wrap`).append(templateHeaderPage());
}

function userFromDB(array) {
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

	dataAdd();
}

function dataAdd() {
	if (rejectCollection.size) {
		emptySign('full');
	} else {
		emptySign('empty');

		return;
	}

	viewAllCount();
	renderTable();
	resendUsers();
}

function showDataFromStorage(page = 'reject') {
	const storageCollection = JSON.parse(localStorage.getItem(page));

	if (storageCollection && storageCollection.collection.length && !rejectCollection.size) {
		const { statusresend } = storageCollection.controls;

		storageCollection.collection.forEach((item, i) => {
			const itemID = storageCollection.collection[i].id;

			rejectCollection.set(itemID, item);
		});

		rejectObject.statusresend = statusresend;

		renderHeaderTable();
		dataAdd();
	} else {
		getDataFromDB('reject');
	}

	resendAllUsers();
}

function setDataInStorage(page = 'reject') {
	localStorage.setItem(page, JSON.stringify({
		controls: rejectObject,
		collection: [...rejectCollection.values()]
	}));
}

function emptySign(status, nameTable = '#tableReject') {
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
	$(`${nameTable} .table__content`).click(({ target }) => {
		if (!$(target).parents('.table__btn--view').length || !$(target).hasClass('table__btn--view')) {
			const userID = $(target).parents('.table__row').data('id');

			$('.form__wrap').removeClass('form__wrap--hide');

			renderForm(userID);
			Scrollbar.init($('.form__item--message').get(0));
		}
	});
}

function resendUsers(nameTable = '#tableReject', page = 'reject') {
	$(`${nameTable} .table__content`).click((e) => {
		if (!$(e.target).hasClass('btn--resend')) return;

		const userID = $(e.target).parents('.table__row').data('id');
		const user = rejectCollection.get(userID);
		user.resend = user.resend ? false : true;
		user.statususer = user.resend;
		const allStatusUsers = [...rejectCollection.values()].some(({ resend }) => resend);

		if (!allStatusUsers) {
			localStorage.removeItem(page);
		} else {
			setDataInStorage();
		}

		renderTable();
	});
}

function resendAllUsers(page = 'reject') {
	$('#resendAll').click(() => {
		rejectObject.statusresend = rejectObject.statusresend ? false : true;

		rejectCollection.forEach((item) => {
			item.resend = '';
			item.statususer = rejectObject.statusresend;
			item.resendblock = rejectObject.statusresend;
		});

		if (!rejectObject.statusresend) {
			localStorage.removeItem(page);
		} else {
			setDataInStorage();
		}

		renderHeaderTable();
		renderTable();
		resendAllUsers();
	});
}

function autoRefresh(page = 'reject') {
	const timeReload = 60000 * settingsObject.autoupdatevalue;
	let markInterval;

	$(`.switch--${page}`).click((e) => {
		const statusSwitch = $(e.currentTarget).find('.switch__input').prop('checked');

		rejectCollection.clear();

		if (statusSwitch && !markInterval) {
			getDataFromDB('reject');

			markInterval = setInterval(() => {
				getDataFromDB('reject');
			}, timeReload);
		} else if (!statusSwitch && markInterval) {
			clearInterval(markInterval);

			markInterval = false;
		}
	});
}

function setNameDepartOnPage() {
	renderHeaderPage();
	viewDataUser();
	autoRefresh();
	showDataFromStorage();
}

// Общие функции с картами и кодами
function viewAllCount(page = 'reject') {
	$(`.main__count--all-${page}`).text(rejectCollection.size);
}

function getDataFromDB(nameTable) {
	$.ajax({
		url: "./php/output-request.php",
		method: "post",
		dataType: "html",
		data: {
			idDepart: settingsObject.nameid,
			nameTable
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
