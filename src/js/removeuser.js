'use strict';

import $ from 'jquery';
import datepickerFactory from 'jquery-datepicker';
import datepickerRUFactory from 'jquery-datepicker/i18n/jquery.ui.datepicker-ru';
import { nameDeparts } from './nameDepart.js';

datepickerFactory($);
datepickerRUFactory($);

const removeCollection = new Map();

$(window).on('load', () => {
	addUser();
	toggleSelect();
	datepicker();
	setDepartInSelect();
	getAddUsersInDB();
});

function templateRemoveTable(data) {
	const { id = '', fio = '', post = '', titleid = '', newdepart = '',  date  = '' } = data;

	return `
		<div class="table__row" data-id="${id}">
			<div class="table__cell table__cell--body table__cell--fio">
				<span class="table__text table__text--body">${fio}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--post">
				<span class="table__text table__text--body">${post}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--titleid">
				<span class="table__text table__text--body">${titleid}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--depart">
				<span class="table__text table__text--body">${newdepart}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--date">
				<span class="table__text table__text--body">${date}</span>
			</div>
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
	const { fio = '', statusid = '', newdepart = '', newnameid = '', titleid = '', date  = '' } = data;
	const departClassView = statusid == 'changeDepart' ? '' : 'form__field--hide';
	const dateClassView = statusid == 'remove' ? '' : 'form__field--hide';

	return `
		<div class="form__fields">
			<div class="form__field">
				<span class="form__name">Пользователь</span>
				<div class="form__select form__item select" data-field="fio" data-select="fio">
					<header class="select__header">
						<span class="select__value select__value--selected" data-title="${fio}" data-fio="fio" data-placeholder="Выберите пользователя">${fio}</span>
					</header>
					<ul class="select__list"></ul>
				</div>
			</div>
			<div class="form__field">
				<span class="form__name">Причина удаления</span>
				<div class="form__select form__item select" data-field="titleid" data-type="statusid" data-select="reason">
					<header class="select__header">
						<span class="select__value select__value--selected" data-title="${titleid}" data-reason="${statusid}" data-placeholder="Выберите причину удаления">${titleid}</span>
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
			<div class="form__field ${departClassView}" data-name="depart">
				<span class="form__name">Новое подразделение</span>
				<div class="form__select form__item select" data-field="newdepart" data-type="newnameid" data-select="new-name-id">
					<header class="select__header">
						<span class="select__value select__value--selected" data-title="${newdepart}" data-new-name-id="${newnameid}" data-placeholder="Выберите подразделение">${newdepart}</span>
					</header>
					<ul class="select__list"></ul>
				</div>
			</div>
			<div class="form__field ${dateClassView}" data-name="date">
				<label class="form__label">
					<span class="form__name">Дата завершения действия пропуска</span>
					<input class="form__input form__item" id="removeDatepicker" data-field="date" name="date" type="text" value="${date}" placeholder="Введите дату завершения действия пропуска" required="required"/>
				</label>
			</div>
		</div>
		<div class="form__aside">
			<div class="form__img">
				<img class="img img--form img--form-remove" src="./images/avatar.svg" alt="user avatar"/>
			</div>
		</div>
	`;
}

function renderTable() {
	$('#tableRemove .table__content').html('');

	removeCollection.forEach((item) => {
		$('#tableRemove .table__content').append(templateRemoveTable(item));
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

						object.date = inputValue;
					}

					object[fieldType] = nameId;
					object[fieldName] = valueItem;
				} else if (typeSelect == 'new-name-id' && nameId) {
					object[fieldType] = nameId;
					object[fieldName] = valueItem;
				} else if (typeSelect == 'fio') {
					object[fieldName] = valueItem;
				}
			}

			return object;
		}, {});

		console.log(userData);

		if (validationEmptyFields(userData)) {
			userFromForm(userData);
			clearFieldsForm(fields);
			showFieldsInTable();
		}
	});
}

function userFromForm(object, page = 'remove') {
	const objToCollection = {
		id: '',
		fio: '',
		date: '',
		post: '',
		nameid: '',
		photofile: '',
		photourl: '',
		titleid: '',
		statusid: '',
		newdepart: '',
		newnameid: '',
		department: ''
	};
	const indexCollection = removeCollection.size;
	const itemObject = Object.assign({}, objToCollection);
	const departName = $(`.main__depart--${page}`).attr('data-depart');
	const departID = $(`.main__depart--${page}`).attr('data-id');
	const postUser = $('#removeForm .form__wrap').data('post');

	for (const itemField in itemObject) {
		for (const key in object) {
			if (itemField === key) {
				itemObject[itemField] = object[key];
			} else if (itemField === 'id') {
				itemObject[itemField] = indexCollection;
			} else if (itemField === 'department') {
				itemObject[itemField] = departName;
			} else if (itemField === 'nameid') {
				itemObject[itemField] = departID;
			} else if (itemField === 'post') {
				itemObject[itemField] = postUser;
			}
		}
	}

	removeCollection.set(indexCollection, itemObject);

	dataAdd('#tableRemove');
}

function dataAdd(nameTable) {
	if (removeCollection.size) {
		$('.table__nothing').hide();
		$(nameTable)
			.html('')
			.removeClass('table__body--empty')
			.append(`
				<div class="table__content table__content--active">
				</div>
			`);
	} else {
		$(nameTable).addClass('table__body--empty').html('');
		$(nameTable).append(`
			<p class="table__nothing">Новых данных нет</p>
		`);

		return;
	}

	renderTable();
	$('.main__count--remove').text(removeCollection.size);
	deleteUser();
	editUser();
}

function setDepartInSelect() {
	nameDeparts.forEach((depart) => {
		const { idName = '', longName = '' } = depart;

		$('.select[data-field="newdepart"] .select__list').append(`
			<li class="select__item">
				<span class="select__name" data-title="${longName}" data-new-name-id="${idName}">${longName}</span>
			</li>
		`);
	});

	clickSelectItem();
}

function showFieldsInTable() {
	const existDepart = [...removeCollection.values()].every((elem) => elem.newdepart);
	const existDate = [...removeCollection.values()].every((elem) => elem.date);
	const wrapDefClasses = 'wrap wrap--content';

	console.log(removeCollection);
	console.log(existDepart);
	console.log(existDate);

	if (existDepart && !existDate) {
		const actionArr = [
			{
				name: 'date',
				action: 'addClass'
			},
			{
				name: 'newdepart',
				action: 'removeClass'
			}
		];
		const classAttr = `${wrapDefClasses} wrap--content-remove-transfer`;

		changeViewFieldsInTable(actionArr, classAttr);
	} else if (!existDepart && existDate) {
		const actionArr = [
			{
				name: 'date',
				action: 'removeClass'
			},
			{
				name: 'newdepart',
				action: 'addClass'
			}
		];
		const classAttr = `${wrapDefClasses} wrap--content-remove-item`;

		changeViewFieldsInTable(actionArr, classAttr);
	} else {
		const actionArr = [
			{
				name: 'date',
				action: 'removeClass'
			},
			{
				name: 'newdepart',
				action: 'removeClass'
			}
		];
		const classAttr = `${wrapDefClasses} wrap--content-remove-all`;

		changeViewFieldsInTable(actionArr, classAttr);
	}
}

function changeViewFieldsInTable(arr, classAttr) {
	arr.forEach((elem) => {
		const { name = '', action = '' } = elem;

		$(`.table--remove .table__cell--${name}`)[action]('table__cell--hide');
	});

	$('.main[data-name="remove"]').find('.wrap--content').attr('class', classAttr);
}

function setUsersInSelect(users) {
	users.forEach((item) => {
		const { id = '', fio = '' } = item;

		$('.select[data-select="fio"]').find('.select__list').append(`
			<li class="select__item">
				<span class="select__name" data-title="${fio}" data-id="${id}">
					${fio}
				</span>
			</li>
		`);
	});

	clickSelectItem();
}

function toggleSelect() {
	$('#removeForm .select__header').click((e) => {
		$(e.currentTarget).next().slideToggle();
		$(e.currentTarget).toggleClass('select__header--active');
	});

	clickSelectItem();
}

function clickSelectItem() {
	$('#removeForm .select__item').click((e) => {
		const title = $(e.currentTarget).find('.select__name').data('title');
		const id = $(e.currentTarget).find('.select__name').data('id');
		const select = $(e.currentTarget).parents('.select').data('select');

		$(e.currentTarget).parents('.select').find('.select__value').addClass('select__value--selected').text(title);
		$(e.currentTarget).parent().slideUp();
		$(e.currentTarget).parents('.select').find('.select__header').removeClass('select__header--active');

		if (select === 'fio') {
			getAddUsersInDB(id);
		}

		setDataAttrSelectedItem(title, select, e.currentTarget);
	});
}

function setDataAttrSelectedItem(title, select, elem) {
	const dataType = $(elem).find('.select__name').data(select);
	let attr = '';

	if (select == 'reason') {
		if (dataType == 'changeDepart') {
			$('.main[data-name="remove"] .form__field[data-name="depart"]').removeClass('form__field--hide');
			$('.main[data-name="remove"] .form__field[data-name="date"]').addClass('form__field--hide');
			$('.main[data-name="remove"] .form__field[data-name="date"]').find('.form__input').val('');
		} else {
			const newDepartFields = $('#removeForm').find('.form__item[data-field="newdepart"]');

			$('.main[data-name="remove"] .form__field[data-name="depart"]').addClass('form__field--hide');
			$('.main[data-name="remove"] .form__field[data-name="date"]').removeClass('form__field--hide');

			const typeSelect = 'newdepart';
			const placeholder = newDepartFields.find('.select__value').data('placeholder');
			const attr = {'data-title': 'title', [`data-${typeSelect}`]: typeSelect};

			newDepartFields.find('.select__value--selected')
				.removeClass('select__value--selected')
				.attr(attr)
				.text(placeholder);
		}
	}

	if (dataType) {
		attr = {'data-title': title, [`data-${select}`]: dataType};
	} else {
		attr = {'data-title': title};
	}

	$(elem).parents('.select').find('.select__value--selected').attr(attr);
}

function clearFieldsForm(array) {
	[...array].forEach((item) => {
		if ($(item).hasClass('select')) {
			const typeSelect = $(item).data('select');
			const placeholder = $(item).find('.select__value').data('placeholder');
			const attr = {'data-title': 'title', [`data-${typeSelect}`]: typeSelect};

			if (typeSelect == 'new-name-id') {
				$(item).parents('.form__field').addClass('form__field--hide');
			}

			$(item).find('.select__value--selected')
				.removeClass('select__value--selected')
				.attr(attr)
				.text(placeholder);
		} else {
			$(item).val('');
		}
	});

	$('.form__field[data-name="date"]').addClass('form__field--hide');
	$('#removeForm .form__wrap').attr('data-post', '');
	$('.img--form').attr('src', './images/avatar.svg');
	$('.form__field--new-post, .form__field--new-fio, .form__field--depart').hide();
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
	const reader = new FileReader();
	reader.readAsDataURL(photourl);
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

function deleteUser() {
	$('.table__content').click((e) => {
		if ($(e.target).parents('.table__btn--delete').length || $(e.target).hasClass('table__btn--delete')) {
			const idRemove = $(e.target).closest('.table__row').data('id');

			removeCollection.delete(idRemove);
			renderTable();
		}

		$('.main__count--remove').text(removeCollection.size);
	});
}

function editUser() {
	$('.table__content').click((e) => {
		if ($(e.target).parents('.table__btn--edit').length || $(e.target).hasClass('table__btn--edit')) {
			const idEdit = $(e.target).closest('.table__row').data('id');

			renderForm(idEdit);
			removeCollection.delete(idEdit);
			renderTable();
			toggleSelect();
			datepicker();
			getAddUsersInDB();
			setDepartInSelect();
		}

		$('.main__count--remove').text(removeCollection.size);
	});
}

function renderForm(id) {
	$('#removeForm .form__wrap').html('');

	removeCollection.forEach((user) => {
		if (user.id == id) {
			$('#removeForm .form__wrap').append(templateRemoveForm(user));
		}
	});
}

function getAddUsersInDB(id = '') {
	const idDepart = $('.main__depart--remove').attr('data-id');

	$.ajax({
		url: "./php/add-user-output.php",
		method: "post",
		dataType: "html",
		data: {
			id: id,
			nameid: idDepart
		},
		success: function(data) {
			if (id) {
				const { post  = '', photourl  = '' } = JSON.parse(data);

				showUserAvatar(photourl);
				$('#removeForm .form__wrap').attr('data-post', post);
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
