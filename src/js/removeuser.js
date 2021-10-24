'use strict';

import $ from 'jquery';
import datepickerFactory from 'jquery-datepicker';
import datepickerRUFactory from 'jquery-datepicker/i18n/jquery.ui.datepicker-ru';
import service from './service.js';
import messageMail from './mail.js';
import settingsObject from './settings.js';

datepickerFactory($);
datepickerRUFactory($);

const removeCollection = new Map();
const departmentCollection = new Map();  // Коллекци подразделений
const removeObject = {
	id: '',
	fio: '',
	post: '',
	photofile: '',
	statusid: '',
	statustitle: '',
	cardvalidto: '',
	statuscardvalidto: '',
	newdepart: '',
	newnameid: '',
	statusnewdepart: ''
};
let counter = 0;

$(window).on('load', () => {
	submitIDinBD();
	renderHeaderPage();
	toggleSelect();
	getDepartmentInDB();
	getAddUsersInDB();
	addUser();
	showDataFromStorage();
});

function templateRemoveTable(data) {
	const { id = '', fio = '', post = '', statustitle = '', newdepart = '',  cardvalidto = '' } = data;
	const newdepartView = removeObject.statusnewdepart ? `
		<div class="table__cell table__cell--body table__cell--department">
			<span class="table__text table__text--body">${newdepart}</span>
		</div>
	` : '';
	const cardvalidtoView = removeObject.statuscardvalidto ? `
		<div class="table__cell table__cell--body table__cell--cardvalidto">
			<span class="table__text table__text--body">${cardvalidto}</span>
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
			${newdepartView}
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

function templateRemoveForm() {
	const { fio = '', statusid = '', newdepart = '', newnameid = '', statustitle = '', cardvalidto  = '', photofile = '' } = removeObject;
	const fioValue = fio ? fio : 'Выберите пользователя';
	const fioClassView = fio ? 'select__value--selected-form' : '';
	const reasonValue = statustitle ? statustitle : 'Выберите причину удаления';
	const reasonClassView = statustitle ? 'select__value--selected-form' : '';
	const photoUrl = photofile ? photofile : './images/avatar.svg';
	const newdepartValue = newdepart ? newdepart : 'Выберите подразделение';
	const newdepartClassView = newdepart ? 'select__value--selected-form' : '';
	const departView = statusid === 'changeDepart' ? `
		<div class="form__field" data-name="depart">
			<span class="form__name form__name--form">Новое подразделение</span>
			<div class="form__select form__item select select--form" data-type="newnameid" data-select="newnameid">
				<header class="select__header select__header--form">
					<span class="select__value select__value--form ${newdepartClassView}" data-title="${newdepartValue}" data-newnameid="${newnameid}">${newdepartValue}</span>
				</header>
				<ul class="select__list select__list--form"></ul>
			</div>
		</div>
	` : '';
	const cardvalidtoView = statusid === 'remove' ? `
		<div class="form__field" data-name="date">
			<label class="form__label">
				<span class="form__name form__name--form">Дата завершения действия пропуска</span>
				<input class="form__input form__input--form form__item" id="removeDatepicker" name="date" type="text" value="${cardvalidto}" placeholder="Введите дату завершения действия пропуска" required="required"/>
			</label>
		</div>
	` : '';

	return `
		<div class="form__fields">
			<div class="form__field">
				<span class="form__name form__name--form">Пользователь</span>
				<div class="form__select form__item select select--form" data-select="fio">
					<header class="select__header select__header--form">
						<span class="select__value select__value--form ${fioClassView}" data-title="${fioValue}" data-fio="fio">${fioValue}</span>
					</header>
					<ul class="select__list select__list--form"></ul>
				</div>
			</div>
			<div class="form__field">
				<span class="form__name form__name--form">Причина удаления/отчисления</span>
				<div class="form__select form__item select select--form" data-type="statusid" data-select="reason">
					<header class="select__header select__header--form">
						<span class="select__value select__value--form ${reasonClassView}" data-title="${reasonValue}" data-reason="${statusid}">${reasonValue}</span>
					</header>
					<ul class="select__list select__list--form">
						<li class="select__item">
							<span class="select__name select__name--form" data-title="Перевод в другое подразделение" data-reason="changeDepart">Перевод в другое подразделение</span>
						</li>
						<li class="select__item">
							<span class="select__name select__name--form" data-title="Увольнение/отчисление" data-reason="remove">Увольнение/отчисление</span>
						</li>
					</ul>
				</div>
			</div>
			${departView}
			${cardvalidtoView}
		</div>
		<div class="form__aside">
			<div class="form__img">
				<img class="img img--form img--form-remove" src="${photoUrl}" alt="user avatar"/>
			</div>
		</div>
	`;
}

function templateRemoveHeaderTable() {
	const newDepartView = removeObject.statusnewdepart ? `
		<div class="table__cell table__cell--header table__cell--department">
			<span class="table__text table__text--header">Новое подразделение</span>
		</div>
	` : '';
	const cardvalidtoView = removeObject.statuscardvalidto ? `
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

function templateHeaderPage(page = 'remove') {
	const { nameid = '', longname = '' } = settingsObject;

	return `
		<h1 class="main__title">Удалить пользователя</h1>
		<span class="main__depart main__depart--${page}" data-depart="${longname}" data-id="${nameid}">${longname}</span>
	`;
}

function renderTable(nameTable = '#tableRemove') {
	$(`${nameTable} .table__content`).html('');

	removeCollection.forEach((item) => {
		$(`${nameTable} .table__content`).append(templateRemoveTable(item));
	});
}

function renderForm(nameForm = '#removeForm') {
	$(`${nameForm} .form__wrap`).html('');
	$(`${nameForm} .form__wrap`).append(templateRemoveForm());

	toggleSelect();
	getAddUsersInDB(); // вывести всех пользователей в селект
	datepicker();
	setDepartInSelect();
}

function renderHeaderTable(page = 'remove') {
	$(`.table--${page} .table__header`).html('');
	$(`.table--${page} .table__header`).append(templateRemoveHeaderTable());
}

function renderHeaderPage(page = 'remove') {
	$(`.main[data-name=${page}] .main__title-wrap`).html('');
	$(`.main[data-name=${page}] .main__title-wrap`).append(templateHeaderPage());
}

function addUser(page = 'remove') {
	$('#removeUser').click(() => {
		if (removeObject.cardvalidto) {
			delete removeObject.newnameid;
			delete removeObject.newdepart;
		} else {
			delete removeObject.cardvalidto;
		}

		delete removeObject.statusnewdepart;
		delete removeObject.statuscardvalidto;

		const valid = Object.values(removeObject).every((item) => item);
		const statusMess = !valid ? 'show' : 'hide';

		$(`.main[data-name=${page}]`).find('.info__item--warn.info__item--fields')[statusMess]();

		if (valid) {
			userFromForm();
			clearFieldsForm();
		}
	});
}

function userFromForm() {
	const objToCollection = {
		id: '',
		fio: '',
		post: '',
		photofile: '',
		statusid: '',
		statustitle: '',
		newnameid: '',
		newdepart: '',
		cardvalidto: ''
	};
	const itemObject = {...objToCollection};

	for (const itemField in itemObject) {
		for (const key in removeObject) {
			if (itemField === key) {
				itemObject[itemField] = removeObject[key];
			}
		}
	}

	removeCollection.set(counter, itemObject);
	counter++;

	setDataInStorage();
	dataAdd();
}

function dataAdd() {
	if (removeCollection.size) {
		emptySign('full');
	} else {
		emptySign('empty');

		return;
	}

	viewAllCount();
	showFieldsInHeaderTable();
	renderTable();
	deleteUser();
	editUser();
}

function showDataFromStorage(page = 'remove') {
	const storageCollection = JSON.parse(localStorage.getItem(page));

	if (storageCollection && storageCollection.collection.length && !removeCollection.size) {
		const lengthStorage = storageCollection.collection.length;
		counter = storageCollection.collection[lengthStorage - 1].id + 1; // id последнего элемента в localStorage

		storageCollection.collection.forEach((item, i) => {
			const itemID = storageCollection.collection[i].id;

			removeCollection.set(itemID, item);
		});

		dataAdd();
	}
}

function setDataInStorage(page = 'remove') {
	localStorage.setItem(page, JSON.stringify({
		collection: [...removeCollection.values()]
	}));
}

function setDepartInSelect() {
	departmentCollection.forEach(({ nameid = '', longname = '' }) => {
		const quoteName = longname.replace(/["']/g , '&quot;');

		if (nameid !== settingsObject.nameid) {
			$('.select[data-select="newnameid"] .select__list').append(`
				<li class="select__item">
					<span class="select__name" data-title="${quoteName}" data-newnameid="${nameid}">${quoteName}</span>
				</li>
			`);
		}
	});
}

function showFieldsInHeaderTable(page = 'remove') {
	removeObject.statusnewdepart = [...removeCollection.values()].some(({ newdepart }) => newdepart);
	removeObject.statuscardvalidto = [...removeCollection.values()].some(({ cardvalidto }) => cardvalidto);
	const newdepartMod = removeObject.statusnewdepart ? '-newdepart' : '';
	const cardvalidtoMod = removeObject.statuscardvalidto ? '-cardvalidto' : '';
	const className = `wrap wrap--content wrap--content-${page}${newdepartMod}${cardvalidtoMod}`;

	$(`.main[data-name="${page}"]`).find('.wrap--content').attr('class', className);

	renderHeaderTable();
}

function setUsersInSelect(users, nameForm = '#removeForm') {
	$(`${nameForm} .select[data-select="fio"]`).find('.select__list').html('');

	if (removeCollection.size) {
		removeCollection.forEach((elem) => {
			users = users.filter(({ id }) => elem.id !== id);
		});
	}

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
	$(`${nameForm} .select__header`).click(({ currentTarget }) => {
		$(currentTarget).next().slideToggle().toggleClass('select__header--active');
	});
}

function clickSelectItem(nameForm = '#removeForm') {
	$(`${nameForm} .select__item`).click(({ currentTarget }) => {
		const title = $(currentTarget).find('.select__name').data('title');
		const id = $(currentTarget).find('.select__name').data('id');
		const select = $(currentTarget).parents('.select').data('select');
		const statusid = $(currentTarget).find('.select__name').data(select);

		if (select === 'fio') {
			getAddUsersInDB(id); // вывести должность в скрытое поле
		}

		setDataAttrSelectedItem(title, select, statusid);
	});
}

function setDataAttrSelectedItem(title, select, statusid) {
	if (select === 'fio') {
		removeObject.fio = title;
		removeObject.statustitle = '';
		removeObject.statusid = '';
		removeObject.newdepart = '';
		removeObject.newnameid = '';
		removeObject.cardvalidto = '';
	} else if (select === 'reason') {
		removeObject.statusid = statusid;
		removeObject.statustitle = title;

		if (statusid === 'remove') {
			removeObject.newdepart = '';
			removeObject.newnameid = '';
		} else if (statusid === "changeDepart") {
			removeObject.cardvalidto = '';
		}
	} else if (select === 'newnameid') {
		removeObject.newnameid = statusid;
		removeObject.newdepart = title.replace(/["']/g , '&quot;');
	}

	renderForm();
}

function clearFieldsForm() {
	for (const key in removeObject) {
		removeObject[key] = '';
	}

	renderForm();
}

function emptySign(status, nameTable = '#tableRemove') {
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

	$('#removeDatepicker').change(({ currentTarget }) => {
		const cardvalidtoValue = $(currentTarget).val();

		removeObject.cardvalidto = cardvalidtoValue;
	});
}

function deleteUser(nameTable = '#tableRemove', page = 'remove') {
	$(`${nameTable} .table__content`).click(({ target }) => {
		if ($(target).parents('.table__btn--delete').length || $(target).hasClass('table__btn--delete')) {
			const userID = $(target).closest('.table__row').data('id');

			[...removeCollection].forEach(([ key, { id } ]) => {
				if (userID === +id) {
					removeCollection.delete(key);
				}
			});

			setDataInStorage();
			showFieldsInHeaderTable();
			renderTable();
			viewAllCount();

			if (!removeCollection.size) {
				emptySign('empty');
				localStorage.removeItem(page);
			}
		}
	});
}

function editUser(nameTable = '#tableRemove') {
	$(`${nameTable} .table__content`).click(({ target }) => {
		if ($(target).parents('.table__btn--edit').length || $(target).hasClass('table__btn--edit')) {
			const userID = $(target).closest('.table__row').data('id');

			[...removeCollection].forEach(([ keyCollection, item ]) => {
				if (userID === +item.id) {
					for (let key in item) {
						removeObject[key] = item[key];
					}

					removeCollection.delete(keyCollection);
				}
			});

			renderForm();
			showFieldsInHeaderTable();
			renderTable();
			viewAllCount();
		}
	});
}

function submitIDinBD(page = 'remove') {
	$('#submitRemoveUser').click(() => {
		if (!removeCollection.size) return;

		removeCollection.forEach((user) => {
			user.nameid = settingsObject.nameid;
			user.date = service.getCurrentDate();
		});

		const removeArray = [...removeCollection.values()].filter(({ statusid }) => statusid === 'remove');
		const changeDepartArray = [...removeCollection.values()].filter(({ statusid }) => statusid === 'changeDepart');

		if (removeArray) {
			setAddUsersInDB(removeArray, 'add' , 'remove');
		}
		if (changeDepartArray) {
			setAddUsersInDB(changeDepartArray, 'add', 'transfer');
		}

		removeCollection.clear();
		emptySign('empty');
		renderTable();
		viewAllCount();

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

			sendMail({
				department: settingsObject.longname,
				count: removeCollection.size,
				title: 'Удалить',
				users: [...removeCollection.values()]
			});
		},
		error: () => {
			service.modal('error');
		}
	});
}

function getAddUsersInDB(id = '') {
	$.ajax({
		url: "./php/output-request.php",
		method: "post",
		dataType: "html",
		data: {
			id: id,
			idDepart: settingsObject.nameid,
			nameTable: 'remove'
		},
		success: (data) => {
			if (id) {
				const { id = '', post  = '', photofile = '' } = JSON.parse(data);

				removeObject.post = post;
				removeObject.id = id;
				removeObject.photofile = photofile;

				renderForm();
			} else {
				setUsersInSelect(JSON.parse(data));
			}
		},
		error: () => {
			service.modal('download');
		}
	});
}

function getDepartmentInDB() {
	$.ajax({
		url: "./php/output-request.php",
		method: "post",
		dataType: "html",
		data: {
			nameTable: 'department'
		},
		success: (data) => {
			const dataFromDB = JSON.parse(data);

			dataFromDB.forEach((item, i) => {
				departmentCollection.set(i + 1, item);
			});
		},
		error: () => {
			service.modal('download');
		}
	});
}

function sendMail(obj) {
	const sender = 'chepdepart@gmail.com';
	const recipient = 'xahah55057@secbuf.com';
	const subject = 'Пользователи успешно добавлены в БД';

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

// Общие функции с картами и кодами
function viewAllCount(page = 'remove') {
	$(`.main__count--all-${page}`).text(removeCollection.size);
}

export default {
};
