'use strict';

import $ from 'jquery';
import service from './service.js';
import Scrollbar from 'smooth-scrollbar';

const rejectCollection = new Map(); // БД отклоненных пользователей

$(window).on('load', () => {
	getDatainDB('reject');
	viewDataUser();
	autoRefresh();
});

function templateRejectTable(data) {
	const { id = '', fio = '', post = '', statustitle = '', date = '' } = data;

	return `
		<div class="table__row table__row--permis" data-id="${id}">
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
			<div class="table__cell table__cell--body table__cell--btn-choice">
				<button class="btn btn--choice" id="choice" type="button">Выбрать</button>
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
				<span class="form__name">Фамилия Имя Отчество</span>
				<span class="form__item form__item--static" data-field="fio">${fio}</span>
			</div>
			<div class="form__field">
				<span class="form__name">Должность</span>
				<span class="form__item form__item--static" data-field="post">${post}</span>
			</div>
			<div class="form__field">
				<span class="form__name">Статус</span>
				<span class="form__item form__item--static" data-field="statustitle">${statustitle}</span>
			</div>
			<div class="form__field">
				<span class="form__name">Дата</span>
				<span class="form__item form__item--static" data-field="date">${date}</span>
			</div>
		</div>
		<div class="form__aside">
			<div class="form__img">
				<img class="img img--form img--form-edit" src="${photourl}" alt="user avatar"/>
			</div>
		</div>
		<div class="form__message">
			<span class="form__name">Причина отклонения</span>
			<p class="form__item form__item--static form__item--message" data-field="reason">Не привлекательная внешность.</p>
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

function userFromDB(array, nameTable = '#tableReject') {
	const objToCollection = {
		id: '',
		fio: '',
		post: '',
		statusid: '',
		statustitle: '',
		department: '',
		date: ''
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

	$(`.main__count--${page}`).text(rejectCollection.size);
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

function autoRefresh(page = 'permis') {
	const timeReload = 15000 * 15;  //  15 минут
	let markInterval;

	$(`.switch--${page}`).click(() => {
		const statusSwitch = $('.switch__input').prop('checked');

		if (statusSwitch && !markInterval) {
			getDatainDB('permission');

			markInterval = setInterval(() => {
				getDatainDB('permission');
			}, timeReload);
		} else {
			clearInterval(markInterval);

			markInterval = false;
		}
	});
}

function getDatainDB(nameTable, page = 'reject') {
	const idDepart = $(`.main__depart--${page}`).attr('data-id');

	$.ajax({
		url: "./php/output-request.php",
		method: "post",
		dataType: "html",
		data: {
			idDepart: idDepart,
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
