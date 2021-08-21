'use strict';

import $ from 'jquery';
import { nameDeparts } from './nameDepart.js';

const editCollection = new Map();
let editObject = {
	fio: '',
	statusid: '',
	titleid: '',
	newpost: '',
	newfio: '',
	photourl: ''
};

$(window).on('load', () => {
	addUser();
	toggleSelect();
	getAddUsersInDB();
});

function templateEditTable(data) {
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
			<div class="table__cell table__cell--body table__cell--newdepart">
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

function templateEditForm(data) {
	const { fio = '', statusid = '', newpost = '', newfio = '', titleid = '', post = '', photourl = '' } = data;
	const fioValue = fio ? fio : 'Выберите пользователя';
	const fioClassView = fio ? 'select__value--selected' : '';
	const changeValue = titleid ? titleid : 'Выберите тип изменения';
	const changeClassView = titleid ? 'select__value--selected' : '';
	const photoUrl = photourl ? photourl : './images/avatar.svg';
	const fioView = statusid === 'changeFIO' ? `
		<div class="form__field" data-name="newfio">
			<label class="form__label">
				<span class="form__name">Новое ФИО</span>
				<input class="form__input form__item" data-field="newfio" name="newfio" type="text" value="${newfio}" placeholder="Введите новое ФИО" required/>
			</label>
		</div>
	` : '';
	const postView = statusid === 'changePost' ? `
		<div class="form__field" data-name="newpost">
			<label class="form__label">
				<span class="form__name">Новая должность</span>
				<input class="form__input form__item" data-field="newpost" name="newpost" type="text" value="${newpost}" placeholder="Введите новую должность" required/>
			</label>
		</div>
	` : '';
	const imageView = statusid === 'changeImage' ? `
		<div class="form__field" data-name="newimage">
			<input class="form__input form__input--file form__item" id="editFile" data-field="photofile" data-url="${photoUrl}" name="photofile" type="file" required>
			<label class="form__download" for="editFile">
				<svg class="icon icon--download">
					<use xlink:href="./images/sprite.svg#download"></use>
				</svg>
				<span class="form__title">Загрузить фото</span>
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
				<span class="form__name">Тип изменения</span>
				<div class="form__select form__item select" data-field="titleid" data-type="statusid" data-select="change">
					<header class="select__header">
						<span class="select__value ${changeClassView}" data-title="${changeValue}" data-change="${statusid}" data-placeholder="Выберите тип изменения">${changeValue}</span>
					</header>
					<ul class="select__list">
						<li class="select__item">
							<span class="select__name" data-title="Утеря пластиковой карты" data-change="changeCard">Утеря пластиковой карты</span>
						</li>
						<li class="select__item">
							<span class="select__name" data-title="Утеря QR-кода" data-change="changeQR">Утеря QR-кода</span>
						</li>
						<li class="select__item">
							<span class="select__name" data-title="Изменение ФИО" data-change="changeFIO">Изменение ФИО</span>
						</li>
						<li class="select__item">
							<span class="select__name" data-title="Изменение должности" data-change="changePost">Изменение должности</span>
						</li>
						<li class="select__item">
							<span class="select__name" data-title="Изменение фото" data-change="changeImage">Изменение фото</span>
						</li>
					</ul>
				</div>
			</div>
			${postView}
			${fioView}
			<div class="form__field form__field--hide">
				<span class="form__item form__item--post" data-field="post" data-value="${post}"></span>
			</div>
		</div>
		<div class="form__aside">
			<div class="form__img">
				<img class="img img--form img--form-edit" src="${photoUrl}" alt="user avatar"/>
			</div>
			${imageView}
		</div>
	`;
}

function renderTable() {
	$('#tableEdit .table__content').html('');

	editCollection.forEach((item) => {
		$('#tableEdit .table__content').append(templateEditTable(item));
	});
}

function addUser() {
	$('#editUser').click((e) => {
		const form = $(e.target).parents('.form');
		const fields = $(form).find('.form__item');
		const userData = [...fields].reduce((object, item) => {
			const fieldName = $(item).data('field');

			// console.warn($(item));

			if ($(item).hasClass('select')) {
				const valueItem = $(item).find('.select__value--selected').attr('data-title');

				object[fieldName] = valueItem;
			} else if ($(item).hasClass('form__item--post')) {
				const valueItem = $(item).data('value');

				object[fieldName] = valueItem;
			} else if ($(item).attr('data-field') == 'photofile') {
				const fieldUrl = $(item).data('url');
				const inputValue = $(item).data('value');

				object.photourl = fieldUrl;
				object[fieldName] = inputValue;
			} else {
				const inputValue = $(item).val();

				object[fieldName] = inputValue;
			}

			return object;
		}, {});

		console.log(userData);

		// if (validationEmptyFields(userData)) {
		// 	userFromForm(userData);
		// 	clearFieldsForm(fields);
		// 	showFieldsInTable();
		// }
	});
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
	$('#editForm .select__header').click((e) => {
		$(e.currentTarget).next().slideToggle();
		$(e.currentTarget).toggleClass('select__header--active');
	});

	clickSelectItem();
}

function clickSelectItem() {
	$('#editForm .select__item').click((e) => {
		const title = $(e.currentTarget).find('.select__name').data('title');
		const id = $(e.currentTarget).find('.select__name').data('id');
		const select = $(e.currentTarget).parents('.select').data('select');

		if (select === 'fio') {
			getAddUsersInDB(id); // вывести должность в скрытое поле
		}

		setDataAttrSelectedItem(title, select, e.currentTarget);
		getAddUsersInDB(); // вывести всех польлзователе в селект
	});
}

function setDataAttrSelectedItem(title, select, elem) {
	const statusid = $(elem).find('.select__name').data(select);
	const fio = select === 'fio' ? title : '';
	const titleid = select === 'change' ? title : '';
	const post = $('#editForm .form__item--post').data('value');

	$('#editForm .form__wrap').html('');

	if (select === 'fio') {
		editObject.fio = fio;
		editObject.titleid = '';
		editObject.statusid = '';
		editObject.post = post;
	} else {
		editObject.titleid = titleid;
		editObject.statusid = statusid;
	}

	console.warn(editObject);

	$('#editForm .form__wrap').append(templateEditForm(editObject));

	if (statusid === 'changeImage') {
		downloadFoto();
	}
	toggleSelect();
}

function downloadFoto() {
	$('#editForm .form__input--file').change((e) => {
		console.log('After change here');
		const file = e.target.files[0];
		const url = URL.createObjectURL(file);
		const fileName = $(e.target).val();

		console.log(url);
		console.log(fileName);

		$('.img--form').attr('src', url);
		editCollection.photourl = url;
		$(e.target).attr({ 'data-value': fileName, 'data-url': url });
	});
}

function showUserAvatar(photourl) {
	console.log(photourl);
	// const reader = new FileReader();
	// reader.readAsDataURL(photourl);
	// reader.onloadend = function() {
	// 	const base64data = reader.result;
	// 	console.log(base64data);
	// }
	// $('.img--form-remove').attr('src', photourl);
}

function getAddUsersInDB(id = '') {
	const idDepart = $('.main__depart--edit').attr('data-id');

	$.ajax({
		url: "./php/add-user-output.php",
		method: "post",
		dataType: "html",
		data: {
			id: id,
			nameid: idDepart
		},
		async: false,
		success: function(data) {
			if (id) {
				const { post  = '', photourl  = '' } = JSON.parse(data);

				showUserAvatar(photourl);
				$('#editForm .form__item--post').attr('data-value', post);
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
