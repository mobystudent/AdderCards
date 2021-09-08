'use strict';

import $ from 'jquery';
import datepickerFactory from 'jquery-datepicker';
import datepickerRUFactory from 'jquery-datepicker/i18n/jquery.ui.datepicker-ru';
import { nameDeparts } from './nameDepart.js';

datepickerFactory($);
datepickerRUFactory($);

const removeCollection = new Map();
const removeObject = {
	fio: '',
	statusid: '',
	statustitle: '',
	newdepart: '',
	newnameid: '',
	cardvalidto: '',
	photourl: ''
};

$(window).on('load', () => {
	addUser();
	toggleSelect();
	getAddUsersInDB();
	submitIDinBD();
});

function templateRemoveTable(data) {
	const { id = '', fio = '', post = '', statustitle = '', newdepart = '',  cardvalidto = '', statusNewdepart = '', statusCardvalidto = '' } = data;
	const newDepartValue = newdepart ? newdepart : '';
	const cardvalidtoValue = cardvalidto ? cardvalidto : '';
	const newDepartView = statusNewdepart ? `
		<div class="table__cell table__cell--body table__cell--department">
			<span class="table__text table__text--body">${newDepartValue}</span>
		</div>
	` : '';
	const cardvalidtoView = statusCardvalidto ? `
		<div class="table__cell table__cell--body table__cell--cardvalidto">
			<span class="table__text table__text--body">${cardvalidtoValue}</span>
		</div>
	` : '';

	return `
		<div class="table__row" data-id="${id}">
			<div class="table__cell table__cell--body table__cell--fio">
				<span class="table__text table__text--body">${fio}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--post">
				<span class="table__text table__text--body">${post}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--statustitle">
				<span class="table__text table__text--body">${statustitle}</span>
			</div>
			${newDepartView}
			${cardvalidtoView}
			<div class="table__cell table__cell--body table__cell--edit">
				<button class="table__btn table__btn--edit" type="button">
					<svg class="icon icon--edit icon--edit-black">
						<use class="icon__item" xlink:href="./images/sprite.svg#edit"></use>
					</svg>
				</button>
			</div>
			<div class="table__cell table__cell--body table__cell--delete">
				<button class="table__btn table__btn--delete" type="button">
					<svg class="icon icon--delete icon--delete-black">
						<use class="icon__item" xlink:href="./images/sprite.svg#delete"></use>
					</svg>
				</button>
			</div>
		</div>
	`;
}

function templateRemoveForm(data) {
	const { id = '', fio = '', statusid = '', newdepart = '', newnameid = '', statustitle = '', cardvalidto  = '', post = '', photourl = '' } = data;
	const fioValue = fio ? fio : 'Выберите пользователя';
	const fioClassView = fio ? 'select__value--selected' : '';
	const reasonValue = statustitle ? statustitle : 'Выберите причину удаления';
	const reasonClassView = statustitle ? 'select__value--selected' : '';
	const photoUrl = photourl ? photourl : './images/avatar.svg';
	const newdepartValue = newdepart ? newdepart : 'Выберите подразделение';
	const newdepartClassView = newdepart ? 'select__value--selected' : '';
	const departView = statusid === 'changeDepart' ? `
		<div class="form__field" data-name="depart">
			<span class="form__name">Новое подразделение</span>
			<div class="form__select form__item select" data-field="newdepart" data-type="newnameid" data-select="newnameid">
				<header class="select__header">
					<span class="select__value ${newdepartClassView}" data-title="${newdepartValue}" data-newnameid="${newnameid}" data-placeholder="Выберите подразделение">${newdepartValue}</span>
				</header>
				<ul class="select__list"></ul>
			</div>
		</div>
	` : '';
	const cardvalidtoView = statusid === 'remove' ? `
		<div class="form__field" data-name="date">
			<label class="form__label">
				<span class="form__name">Дата завершения действия пропуска</span>
				<input class="form__input form__item" id="removeDatepicker" data-field="date" name="date" type="text" value="${cardvalidto}" placeholder="Введите дату завершения действия пропуска" required="required"/>
			</label>
		</div>
	` : '';

	return `
		<div class="form__fields">
			<div class="form__field">
				<span class="form__name">Пользователь</span>
				<div class="form__select form__item select" data-field="fio" data-select="fio">
					<header class="select__header">
						<span class="select__value ${fioClassView}" data-title="${fioValue}" data-fio="fio" data-placeholder="Выберите пользователя">${fioValue}</span>
					</header>
					<ul class="select__list"></ul>
				</div>
			</div>
			<div class="form__field">
				<span class="form__name">Причина удаления</span>
				<div class="form__select form__item select" data-field="statustitle" data-type="statusid" data-select="reason">
					<header class="select__header">
						<span class="select__value ${reasonClassView}" data-title="${reasonValue}" data-reason="${statusid}" data-placeholder="Выберите причину удаления">${reasonValue}</span>
					</header>
					<ul class="select__list">
						<li class="select__item">
							<span class="select__name" data-title="Перевод в другое подразделение" data-reason="changeDepart">Перевод в другое подразделение</span>
						</li>
						<li class="select__item">
							<span class="select__name" data-title="Увольнение" data-reason="remove">Увольнение</span>
						</li>
					</ul>
				</div>
			</div>
			${departView}
			${cardvalidtoView}
			<div class="form__field form__field--hide">
				<span class="form__item form__item--hide form__item--id" data-field="id" data-value="${id}"></span>
			</div>
			<div class="form__field form__field--hide">
				<span class="form__item form__item--hide form__item--post" data-field="post" data-value="${post}"></span>
			</div>
		</div>
		<div class="form__aside">
			<div class="form__img">
				<img class="img img--form img--form-remove" src="${photoUrl}" alt="user avatar"/>
			</div>
		</div>
	`;
}

function templateRemoveHeaderTable(data) {
	const { statusNewdepart = '', statusCardvalidto = '' } = data;
	const newDepartView = statusNewdepart ? `
		<div class="table__cell table__cell--header table__cell--department">
			<span class="table__text table__text--header">Новое подразделение</span>
		</div>
	` : '';
	const cardvalidtoView = statusCardvalidto ? `
		<div class="table__cell table__cell--header table__cell--cardvalidto">
			<span class="table__text table__text--header">Дата</span>
		</div>
	` : '';

	return `
		<div class="table__cell table__cell--header table__cell--fio">
			<span class="table__text table__text--header">Фамилия Имя Отчество</span>
			<button class="btn btn--sort" type="button" data-direction="true"></button>
		</div>
		<div class="table__cell table__cell--header table__cell--post">
			<span class="table__text table__text--header">Должность</span>
		</div>
		<div class="table__cell table__cell--header table__cell--statustitle">
			<span class="table__text table__text--header">Причина удаления</span>
		</div>
		${newDepartView}
		${cardvalidtoView}
		<div class="table__cell table__cell--header table__cell--edit">
			<svg class="icon icon--edit icon--edit-white">
				<use class="icon__item" xlink:href="./images/sprite.svg#edit"></use>
			</svg>
		</div>
		<div class="table__cell table__cell--header table__cell--delete">
			<svg class="icon icon--delete icon--delete-white">
				<use class="icon__item" xlink:href="./images/sprite.svg#delete"></use>
			</svg>
		</div>
	`;
}

function renderTable(nameTable = '#tableRemove') {
	$(`${nameTable} .table__content`).html('');

	removeCollection.forEach((item) => {
		$(`${nameTable} .table__content`).append(templateRemoveTable(item));
	});
}

function addUser() {
	$('#removeUser').click((e) => {
		const form = $(e.target).parents('.form');
		const fields = $(form).find('.form__item');
		const userData = [...fields].reduce((object, item) => {
			const fieldName = $(item).data('field');

			if ($(item).hasClass('select')) {
				const typeSelect = $(item).data('select');
				const nameId = $(item).find('.select__value--selected').attr(`data-${typeSelect}`);
				const fieldType = $(item).data('type');
				const valueItem = $(item).find('.select__value--selected').attr('data-title');

				if (typeSelect == 'reason') {
					if (nameId == 'remove') {
						const inputValue = $(e.target).parents('.form').find('.form__item[data-field="date"]').val();

						object.cardvalidto = inputValue;
					}

					object[fieldType] = nameId;
					object[fieldName] = valueItem;
				} else if (typeSelect == 'newnameid' && nameId) {
					object[fieldType] = nameId;
					object[fieldName] = valueItem;
				} else if (typeSelect == 'fio') {
					object[fieldName] = valueItem;
				}
			} else if ($(item).hasClass('form__item--hide')) {
				const valueItem = $(item).data('value');

				object[fieldName] = valueItem;
			}

			return object;
		}, {});

		console.log(userData);

		if (validationEmptyFields(userData)) {
			userFromForm(userData);
			clearFieldsForm();
			showFieldsInHeaderTable();
		}
	});
}

function userFromForm(object, page = 'remove', nameForm = '#removeForm', nameTable = '#tableRemove') {
	const objToCollection = {
		id: '',
		fio: '',
		cardvalidto: '',
		post: '',
		nameid: '',
		photofile: '',
		photourl: '',
		statustitle: '',
		statusid: '',
		newdepart: '',
		newnameid: '',
		department: '',
		dateEnd: ''
	};
	const indexCollection = removeCollection.size;
	const itemObject = Object.assign({}, objToCollection);
	const departName = $(`.main__depart--${page}`).attr('data-depart');
	const departID = $(`.main__depart--${page}`).attr('data-id');
	const postUser = $(`${nameForm} .form__item--post`).data('value');
	const idUser = $(`${nameForm} .form__item--id`).data('value');

	for (const itemField in itemObject) {
		for (const key in object) {
			if (itemField === key) {
				itemObject[itemField] = object[key];
			} else if (itemField === 'id') {
				itemObject[itemField] = idUser;
			} else if (itemField === 'department') {
				itemObject[itemField] = departName;
			} else if (itemField === 'nameid') {
				itemObject[itemField] = departID;
			} else if (itemField === 'post') {
				itemObject[itemField] = postUser;
			}
		}
	}

	// [...removeCollection].forEach((item, index) => {
	// 	console.warn(item);
	// 	console.warn(index);
	//
	// 	removeCollection.set(index, item);
	// });
	//
	// console.log(removeCollection);

	console.log(indexCollection);

	removeCollection.set(indexCollection, itemObject);

	showTableCells();
	dataAdd(nameTable);
}

function dataAdd(nameTable, page = 'remove') {
	if (removeCollection.size) {
		emptySign(nameTable, 'full');
	} else {
		emptySign(nameTable, 'empty');

		return;
	}

	renderTable();
	$(`.main__count--${page}`).text(removeCollection.size);
	deleteUser();
	editUser();
}

function setDepartInSelect() {
	nameDeparts.forEach((depart) => {
		const { idName = '', longName = '' } = depart;

		$('.select[data-field="newdepart"] .select__list').append(`
			<li class="select__item">
				<span class="select__name" data-title="${longName}" data-newnameid="${idName}">${longName}</span>
			</li>
		`);
	});

	clickSelectItem();
}

function showFieldsInHeaderTable(page = 'remove') {
	const arrayStatusCells = [
		{
			name: 'newdepart',
			status: 'statusNewdepart'
		},
		{
			name: 'cardvalidto',
			status: 'statusCardvalidto'
		}
	];
	const statusFields = {
		statusNewdepart: false,
		statusCardvalidto: false
	};

	$(`.table--${page} .table__header`).html('');

	showTableCells();

	[...removeCollection.values()].forEach((elem) => {
		for (const key in elem) {
			for (const { name, status } of arrayStatusCells) {
				if ((key == name) && elem[status]) {
					statusFields[status] = elem[status];
				}
			}
		}
	});

	const newdepart = [...removeCollection.values()].some((cell) => cell.statusNewdepart) ? '-newdepart' : '';
	const cardvalidto = [...removeCollection.values()].some((cell) => cell.statusCardvalidto) ? '-cardvalidto' : '';
	const className = `wrap wrap--content wrap--content-${page}${newdepart}${cardvalidto}`;

	$(`.main[data-name="${page}"]`).find('.wrap--content').attr('class', className);
	$(`.table--${page} .table__header`).append(templateRemoveHeaderTable(statusFields));
}

function showTableCells() {
	const statusNewdepart = [...removeCollection.values()].some((cell) => cell.newdepart);
	const statusCardvalidto = [...removeCollection.values()].some((cell) => cell.cardvalidto);

	removeCollection.forEach((elem) => {
		elem.statusNewdepart = statusNewdepart;
		elem.statusCardvalidto = statusCardvalidto;
	});
}

function setUsersInSelect(users, nameForm = '#removeForm') {
	users.forEach((item) => {
		const { id = '', fio = '' } = item;

		$(`${nameForm} .select[data-select="fio"]`).find('.select__list').append(`
			<li class="select__item">
				<span class="select__name" data-title="${fio}" data-id="${id}">
					${fio}
				</span>
			</li>
		`);
	});

	clickSelectItem();
}

function toggleSelect(nameForm = '#removeForm') {
	$(`${nameForm} .select__header`).click((e) => {
		$(e.currentTarget).next().slideToggle();
		$(e.currentTarget).toggleClass('select__header--active');
	});

	clickSelectItem();
}

function clickSelectItem(nameForm = '#removeForm') {
	$(`${nameForm} .select__item`).click((e) => {
		const title = $(e.currentTarget).find('.select__name').data('title');
		const id = $(e.currentTarget).find('.select__name').data('id');
		const select = $(e.currentTarget).parents('.select').data('select');

		if (select === 'fio') {
			getAddUsersInDB(id); // вывести должность в скрытое поле
		// } else if (select === 'newnameid') {
		// 	console.log('Select');
		}

		setDataAttrSelectedItem(title, select, e.currentTarget);
		getAddUsersInDB(); // вывести всех польлзователе в селект
		setDepartInSelect();
	});
}

function setDataAttrSelectedItem(title, select, elem, nameForm = '#removeForm') {
	const fio = select === 'fio' ? title : '';
	const post = $(`${nameForm} .form__item--post`).data('value');
	const id = $(`${nameForm} .form__item--id`).data('value');
	const statusid = select === 'reason' ? $(elem).find('.select__name').data(select) : '';
	const statustitle = select === 'reason' ? title : '';
	const newnameid = select === 'newnameid' ? $(elem).find('.select__name').data(select) : '';
	const newdepart = select === 'newnameid' ? title : '';

	$(`${nameForm} .form__wrap`).html('');

	if (select === 'fio') {
		removeObject.fio = fio;
		removeObject.statustitle = '';
		removeObject.statusid = '';
		removeObject.newdepart = '';
		removeObject.newnameid = '';
		removeObject.post = post;
		removeObject.id = id;
	} else if (select === 'reason') {
		removeObject.statustitle = statustitle;
		removeObject.statusid = statusid;
		removeObject.newdepart = '';
		removeObject.newnameid = '';
	} else {
		removeObject.newdepart = newdepart;
		removeObject.newnameid = newnameid;
	}

	$(`${nameForm} .form__wrap`).append(templateRemoveForm(removeObject));

	if (select === 'reason') {
		setDepartInSelect();
		datepicker();
	}

	toggleSelect();
}

function clearFieldsForm(nameForm = '#removeForm') {
	const clearObject = {
		id: '',
		fio: '',
		statustitle: '',
		statusid: '',
		post: ''
	};
	removeObject = {
		fio: '',
		statusid: '',
		statustitle: '',
		newpost: '',
		newfio: '',
		photourl: ''
	};

	$(`${nameForm} .form__wrap`).html('').append(templateRemoveForm(clearObject));

	toggleSelect();
	getAddUsersInDB();
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

function datepicker() {
	$("#removeDatepicker").datepicker({
		changeMonth: true,
		changeYear: true,
		showOtherMonths: true,
		selectOtherMonths: true,
		minDate: "+1D",
		maxViewMode: 10
	});
}

function showUserAvatar(photourl) {
	console.log(photourl);
	// const reader = new FileReader();
	// reader.readAsDataURL(photourl);
	// reader.onloadend = () => {
	// 	const base64data = reader.result;
	// 	console.log(base64data);
	// }
	// $('.img--form-remove').attr('src', photourl);
}

function validationEmptyFields(fields) {
	const validFields = Object.values(fields).every((item) => item);
	const statusMess = !validFields ? 'show' : 'hide';

	const valid = statusMess === 'hide' ? true : false;

	$('.main[data-name="remove"]').find('.info__item--warn.info__item--fields')[statusMess]();

	return valid;
}

function deleteUser(nameTable = '#tableRemove', page = 'remove') {
	$('.table__content').click((e) => {
		if ($(e.target).parents('.table__btn--delete').length || $(e.target).hasClass('table__btn--delete')) {
			const idRemove = $(e.target).closest('.table__row').data('id');

			removeCollection.forEach((item, i) => {
				if (item.id === idRemove) {
					removeCollection.delete(i);
				}
			});

			showFieldsInHeaderTable();
			renderTable();
			getAddUsersInDB();
		}

		if (!removeCollection.size) {
			emptySign(nameTable, 'empty');
		}

		$(`.main__count--${page}`).text(removeCollection.size);
	});
}

function editUser(page = 'remove') {
	$('.table__content').click((e) => {
		if ($(e.target).parents('.table__btn--edit').length || $(e.target).hasClass('table__btn--edit')) {
			const idEdit = $(e.target).closest('.table__row').data('id');

			showFieldsInHeaderTable();
			renderForm(idEdit);
			renderTable();
			toggleSelect();
			datepicker();
			getAddUsersInDB();
			setDepartInSelect();
		}

		$(`.main__count--${page}`).text(removeCollection.size);
	});
}

function renderForm(id, nameForm = '#removeForm') {
	$(`${nameForm} .form__wrap`).html('');

	removeCollection.forEach((user, i) => {
		if (user.id === id) {
			$(`${nameForm} .form__wrap`).append(templateRemoveForm(user));
			removeCollection.delete(i);
		}
	});
}

function submitIDinBD(nameTable = '#tableRemove', page = 'remove') {
	$('#submitRemoveUser').click(() => {
		if (!removeCollection.size) return;

		const idDepart = $('.main__depart--edit').attr('data-id');
		const nameDepart = $('.main__depart--edit').attr('data-depart');

		removeCollection.forEach((elem) => {
			elem.nameid = idDepart;
			elem.department = nameDepart;
			elem.date = getCurrentDate();
		});

		const removeArray = [...removeCollection.values()].filter((elem) => elem.statusid === 'remove');
		const changeDepartArray = [...removeCollection.values()].filter((elem) => elem.statusid === 'changeDepart');

		if (removeArray) {
			setAddUsersInDB(removeArray, 'add' , 'remove');
		}
		if (changeDepartArray) {
			setAddUsersInDB(changeDepartArray, 'add', 'transfer');
		}

		removeCollection.clear();
		emptySign(nameTable, 'empty');
		renderTable();

		$(`.main__count--${page}`).text(removeCollection.size);
	});
}

function getCurrentDate() {
	const date = new Date();
	const month = date.getMonth() + 1;
	const currentDay = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
	const currentMonth = month < 10 ? `0${month}` : month;
	const currentYear = date.getFullYear() < 10 ? `0${date.getFullYear()}` : date.getFullYear();

	const currentHour = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
	const currentMinute = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();

	return `${currentDay}-${currentMonth}-${currentYear} ${currentHour}:${currentMinute}`;
}

function setAddUsersInDB(array, nameTable, action) {
	$.ajax({
		url: "./php/change-user-request.php",
		method: "post",
		dataType: "html",
		data: {
			action: action,
			nameTable: nameTable,
			array: array
		},
		success: function(data) {
			console.log('succsess '+data);
		},
		error: function(data) {
			console.log(data);
		}
	});
}

function getAddUsersInDB(id = '', nameForm = '#removeForm', page = 'remove') {
	const idDepart = $(`.main__depart--${page}`).attr('data-id');
	const nameTable = 'remove';

	$.ajax({
		url: "./php/output-request.php",
		method: "post",
		dataType: "html",
		data: {
			id: id,
			idDepart: idDepart,
			nameTable: nameTable
		},
		async: false,
		success: function(data) {
			if (id) {
				const { id = '', post  = '', photourl  = '' } = JSON.parse(data);

				showUserAvatar(photourl);
				$(`${nameForm} .form__item--post`).attr('data-value', post);
				$(`${nameForm} .form__item--id`).attr('data-value', id);
			} else {
				setUsersInSelect(JSON.parse(data));
			}
		},
		error: function(data) {
			console.log(data);
		}
	});
}

export default {
};
