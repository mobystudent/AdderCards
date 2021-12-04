'use strict';

import $ from 'jquery';
import service from './service.js';
import Scrollbar from 'smooth-scrollbar';
import messageMail from './mail.js';
import { settingsObject, sendUsers } from './settings.js';
import renderheader from './parts/renderheader.js';

const rejectCollection = new Map(); // БД отклоненных пользователей
const rejectObject = {
	statusresend: ''
};
const rejectSwitch = {
	refresh: {
		type: 'refresh',
		status: false,
		marker: 0
	}
};
const rejectCount = {
	item: {
		title: 'Количество отклоненных пользователей:&nbsp',
		get count() {
			return rejectCollection.size;
		}
	}
};

$(window).on('load', () => {
	const options = {
		page: 'reject',
		header: {
			longname: settingsObject.longname,
			nameid: settingsObject.nameid
		}
	};

	renderheader.renderHeaderPage(options);
	submitIDinBD();
	showDataFromStorage();
	renderSwitch();
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

function templateRejectSwitch(data, page = 'reject') {
	const { type, status } = data;
	const assingBtnCheck = status ? 'checked="checked"' : '';
	const assingBtnClass = type === 'refresh' && !status ? 'switch__name--disabled' : '';
	let switchText;
	let tooltipInfo;

	if (type === 'refresh') {
		switchText = 'Автообновление';
		tooltipInfo = 'Если данная опция включена, тогда при поступлении новых данных, они автоматически отобразятся в таблице. Перезагружать страницу не нужно.<br/> Рекомендуется отключить данную функцию при работе с данными в таблице!';
	}

	return `
		<div class="main__switch">
			<div class="tooltip">
				<span class="tooltip__item">!</span>
				<div class="tooltip__info tooltip__info--${type}">${tooltipInfo}</div>
			</div>
			<div class="switch switch--${type}-${page}">
				<label class="switch__wrap switch__wrap--head">
					<input class="switch__input" type="checkbox" ${assingBtnCheck}/>
					<small class="switch__btn"></small>
				</label>
				<span class="switch__name ${assingBtnClass}">${switchText}</span>
			</div>
		</div>
	`;
}

function templateRejectCount(data) {
	const { title, count } = data;

	return `
		<p class="main__count-wrap">
			<span class="main__count-text">${title}</span>
			<span class="main__count">${count}</span>
		</p>
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
		if (+item.id === id) {
			$(`${nameForm} .form__wrap`).append(templateRejectForm(item));
		}
	});
}

function renderHeaderTable(page = 'reject') {
	$(`.table--${page} .table__header`).html('');
	$(`.table--${page} .table__header`).append(templateRejectHeaderTable());
}

function renderSwitch(page = 'reject') {
	$(`.main__wrap-info--${page} .main__switchies`).html('');
	for (let key in rejectSwitch) {
		$(`.main__wrap-info--${page} .main__switchies`).append(templateRejectSwitch(rejectSwitch[key]));
	}

	autoRefresh();
}

function renderCount(page = 'reject') {
	$(`.main__wrap-info--${page} .main__cards`).html('');
	for (let key in rejectCount) {
		$(`.main__wrap-info--${page} .main__cards`).append(templateRejectCount(rejectCount[key]));
	}
}

function userFromDB(array) {
	const objToCollection = {
		id: '',
		fio: '',
		post: '',
		photofile: '',
		photourl: '',
		statusid: '',
		statustitle: '',
		statususer: '',
		сardvalidto: '',
		resend: ''
	};

	array.forEach((elem, i) => {
		const itemObject = {...objToCollection};

		for (const itemField in itemObject) {
			for (const key in elem) {
				if (itemField === key) {
					itemObject[itemField] = elem[key];
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

	renderTable();
	renderCount();
	viewDataUser();
	resendUsers();
}

function showDataFromStorage(page = 'reject') {
	const storageCollection = JSON.parse(localStorage.getItem(page));

	if (storageCollection && storageCollection.collection.length && !rejectCollection.size) {
		const { statusresend } = storageCollection.controls;
		const { refresh } = storageCollection.settings;

		storageCollection.collection.forEach((item, i) => {
			const itemID = storageCollection.collection[i].id;

			rejectCollection.set(itemID, item);
		});

		rejectObject.statusresend = statusresend;
		rejectSwitch.refresh = refresh;

		renderHeaderTable();
		dataAdd();
	} else {
		getDataFromDB('reject');
	}

	resendAllUsers();
}

function setDataInStorage(page = 'reject') {
	localStorage.setItem(page, JSON.stringify({
		settings: rejectSwitch,
		controls: rejectObject,
		collection: [...rejectCollection.values()]
	}));
}

function submitIDinBD(page = 'reject') {
	$('#submitReject').click(() => {
		const checkedItems = [...rejectCollection.values()].some(({ statususer }) => statususer);

		if (checkedItems) {
			const resendItems = [...rejectCollection.values()].filter(({ statususer }) => statususer);

			$('.info__item--warn').hide();

			resendItems.forEach((elem) => {
				elem.nameid = settingsObject.nameid;
				elem.department = settingsObject.longname;
			});

			setAddUsersInDB(resendItems, 'permis', 'add');

			resendItems.forEach(({ id: userID }) => {
				[...rejectCollection].forEach(([ key, { id } ]) => {
					if (userID === id) {
						rejectCollection.delete(key);
					}
				});
			});
			resendItems.splice(0);

			clearObject();
			dataAdd();
			resendAllUsers();
			localStorage.removeItem(page);
		} else {
			$('.info__item--warn').show();
		}
	});
}

function clearObject() {
	rejectObject.statusresend = '';
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

function viewDataUser(nameTable = '#tableReject', nameForm = '#rejectForm') {
	$(`${nameTable} .table__content`).click(({ target }) => {
		if ($(target).parents('.table__btn--view').length || $(target).hasClass('table__btn--view')) {
			const userID = $(target).parents('.table__row').data('id');

			$(`${nameForm} .form__wrap`).removeClass('form__wrap--hide');

			renderForm(userID);
			Scrollbar.init($('.form__item--message').get(0));
		}
	});
}

function resendUsers(nameTable = '#tableReject', page = 'reject') {
	$(`${nameTable} .table__content`).click((e) => {
		if (!$(e.target).hasClass('btn--resend')) return;

		const userID = $(e.target).parents('.table__row').data('id');
		let collectionID;

		[...rejectCollection].forEach(([ key, { id } ]) => {
			if (userID === +id) {
				collectionID = key;
			}
		});

		const user = rejectCollection.get(collectionID);
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

	$(`.switch--refresh-${page}`).click(({ target }) => {
		if (!$(target).hasClass('switch__input')) return;

		const statusSwitch = $(target).prop('checked');
		rejectSwitch.refresh.status = statusSwitch;

		if (statusSwitch && !rejectSwitch.refresh.marker) {
			localStorage.removeItem(page);
			rejectCollection.clear();

			getDataFromDB('reject');
			setDataInStorage();

			rejectSwitch.refresh.marker = setInterval(() => {
				getDataFromDB('reject');
			}, timeReload);
		} else if (!statusSwitch && rejectSwitch.refresh.marker) {
			clearInterval(rejectSwitch.refresh.marker);

			rejectSwitch.refresh.marker = false;
			localStorage.removeItem(page);
		}

		renderSwitch();
	});
}

// Общие функции с картами и кодами
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

			sendMail({
				department: settingsObject.longname,
				count: rejectCollection.size,
				title: 'Повторно добавить',
				users: [...rejectCollection.values()]
			});
		},
		error: () => {
			service.modal('error');
		}
	});
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

function sendMail(obj) {
	const sender =  sendUsers.manager;
	const recipient = sendUsers.secretary;
	const subject = 'Запрос на повторное добавление пользователей в БД';

	$.ajax({
		url: "./php/mail.php",
		method: "post",
		dataType: "html",
		async: false,
		data: {
			sender,
			recipient,
			subject,
			message: messageMail(obj)
		},
		success: () => {
			console.log('Email send is success');
		},
		error: () => {
			service.modal('email');
		}
	});
}

export default {

};
