'use strict';

import $ from 'jquery';

const editCollection = new Map();
const editObject = {
	fio: '',
	statusid: '',
	statustitle: '',
	newpost: '',
	newfio: '',
	photourl: ''
};

$(window).on('load', () => {
	addUser();
	toggleSelect();
	getAddUsersInDB();
	submitIDinBD();
});

function templateEditTable(data) {
	const { id = '', fio = '', post = '', statustitle = '', newfio = '', newpost = '', photofile = '', statusNewfio = '', statusNewpost = '', statusPhotofile = '' } = data;
	const newFioValue = newfio ? newfio : '';
	const newPostValue = newpost ? newpost : '';
	const photofileValue = photofile ? photofile : '';
	const newFioView = statusNewfio ? `
		<div class="table__cell table__cell--body table__cell--fio">
			<span class="table__text table__text--body">${newFioValue}</span>
		</div>
	` : '';
	const newPostView = statusNewpost ? `
		<div class="table__cell table__cell--body table__cell--post">
			<span class="table__text table__text--body">${newPostValue}</span>
		</div>
	` : '';
	const photofileView = statusPhotofile ? `
		<div class="table__cell table__cell--body table__cell--photofile">
			<span class="table__text table__text--body">${photofileValue}</span>
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
			${newFioView}
			${newPostView}
			${photofileView}
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
	const { id = '', fio = '', statusid = '', newpost = '', newfio = '', statustitle = '', post = '', photourl = '' } = data;
	const fioValue = fio ? fio : 'Выберите пользователя';
	const fioClassView = fio ? 'select__value--selected' : '';
	const changeValue = statustitle ? statustitle : 'Выберите тип изменения';
	const changeClassView = statustitle ? 'select__value--selected' : '';
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
				<div class="form__select form__item select" data-field="statustitle" data-type="statusid" data-select="change">
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
				<span class="form__item form__item--hide form__item--id" data-field="id" data-value="${id}"></span>
			</div>
			<div class="form__field form__field--hide">
				<span class="form__item form__item--hide form__item--post" data-field="post" data-value="${post}"></span>
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

function templateEditHeaderTable(data) {
	const { statusNewfio = '', statusNewpost = '', statusPhotofile = '' } = data;
	const newFioView = statusNewfio ? `
		<div class="table__cell table__cell--header table__cell--fio">
			<span class="table__text table__text--header">Новое Фамилия Имя Отчество</span>
			<button class="btn btn--sort" type="button" data-direction="true"></button>
		</div>
	` : '';
	const newPostView = statusNewpost ? `
		<div class="table__cell table__cell--header table__cell--post">
			<span class="table__text table__text--header">Новая должность</span>
		</div>
	` : '';
	const photofileView = statusPhotofile ? `
		<div class="table__cell table__cell--header table__cell--image">
			<span class="table__text table__text--header">Новая фотография</span>
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
			<span class="table__text table__text--header">Тип изменения</span>
		</div>
		${newFioView}
		${newPostView}
		${photofileView}
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

function renderTable(nameTable = '#tableEdit') {
	$(`${nameTable} .table__content`).html('');

	editCollection.forEach((item) => {
		$(`${nameTable} .table__content`).append(templateEditTable(item));
	});
}

function addUser() {
	$('#editUser').click((e) => {
		const form = $(e.target).parents('.form');
		const fields = $(form).find('.form__item');
		const userData = [...fields].reduce((object, item) => {
			const fieldName = $(item).data('field');

			if ($(item).hasClass('select')) {
				const typeSelect = $(item).data('select');
				const nameId = $(item).find('.select__value--selected').attr(`data-${typeSelect}`);
				const fieldType = $(item).data('type');
				const valueItem = $(item).find('.select__value--selected').attr('data-title');

				if (typeSelect === 'change') {
					object[fieldType] = nameId;
				}

				object[fieldName] = valueItem;
			} else if ($(item).hasClass('form__item--hide')) {
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

		if (validationEmptyFields(userData)) {
			userFromForm(userData);
			clearFieldsForm();
			showFieldsInHeaderTable();
		}
	});
}

function userFromForm(object, page = 'edit', nameForm = '#editForm', nameTable = '#tableEdit') {
	const objToCollection = {
		id: '',
		fio: '',
		date: '',
		post: '',
		nameid: '',
		photofile: '',
		photourl: '',
		statustitle: '',
		statusid: '',
		newpost: '',
		newfio: '',
		department: ''
	};
	const indexCollection = editCollection.size;
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

	editCollection.set(indexCollection, itemObject);

	showTableCells();
	dataAdd(nameTable);
}

function dataAdd(nameTable, page = 'edit') {
	if (editCollection.size) {
		emptySign(nameTable, 'full');
	} else {
		emptySign(nameTable, 'empty');

		return;
	}

	renderTable();
	$(`.main__count--${page}`).text(editCollection.size);
	deleteUser();
	editUser();
}

function showFieldsInHeaderTable(page = 'edit') {
	const arrayStatusCells = [
		{
			name: 'newfio',
			status: 'statusNewfio'
		},
		{
			name: 'newpost',
			status: 'statusNewpost'
		},
		{
			name: 'newpost',
			status: 'statusPhotofile'
		}
	];
	const statusFields = {
		statusNewfio: false,
		statusNewpost: false,
		statusPhotofile: false
	};

	$(`.table--${page} .table__header`).html('');

	showTableCells();

	[...editCollection.values()].forEach((elem) => {
		for (const key in elem) {
			for (const { name, status } of arrayStatusCells) {
				if ((key == name) && elem[status]) {
					statusFields[status] = elem[status];
				}
			}
		}
	});

	const newfio = [...editCollection.values()].some((cell) => cell.statusNewfio) ? '-newfio' : '';
	const newpost = [...editCollection.values()].some((cell) => cell.statusNewpost) ? '-newpost' : '';
	const photofile = [...editCollection.values()].some((cell) => cell.statusPhotofile) ? '-photofile' : '';
	const className = `wrap wrap--content wrap--content-${page}${newfio}${newpost}${photofile}`;

	$(`.main[data-name="${page}"]`).find('.wrap--content').attr('class', className);
	$(`.table--${page} .table__header`).append(templateEditHeaderTable(statusFields));
}

function showTableCells() {
	const statusNewfio = [...editCollection.values()].some((cell) => cell.newfio);
	const statusNewpost = [...editCollection.values()].some((cell) => cell.newpost);
	const statusPhotofile = [...editCollection.values()].some((cell) => cell.photofile);

	editCollection.forEach((elem) => {
		elem.statusNewfio = statusNewfio;
		elem.statusNewpost = statusNewpost;
		elem.statusPhotofile = statusPhotofile;
	});
}

function setUsersInSelect(users, nameForm = '#editForm') {
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

function toggleSelect(nameForm = '#editForm') {
	$(`${nameForm} .select__header`).click((e) => {
		$(e.currentTarget).next().slideToggle();
		$(e.currentTarget).toggleClass('select__header--active');
	});

	clickSelectItem();
}

function clickSelectItem(nameForm = '#editForm') {
	$(`${nameForm} .select__item`).click((e) => {
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

function setDataAttrSelectedItem(title, select, elem, nameForm = '#editForm') {
	const statusid = $(elem).find('.select__name').data(select);
	const fio = select === 'fio' ? title : '';
	const statustitle = select === 'change' ? title : '';
	const post = $(`${nameForm} .form__item--post`).data('value');
	const id = $(`${nameForm} .form__item--id`).data('value');

	$(`${nameForm} .form__wrap`).html('');

	if (select === 'fio') {
		editObject.fio = fio;
		editObject.statustitle = '';
		editObject.statusid = '';
		editObject.post = post;
		editObject.id = id;
	} else {
		editObject.statustitle = statustitle;
		editObject.statusid = statusid;
	}

	$(`${nameForm} .form__wrap`).append(templateEditForm(editObject));

	if (statusid === 'changeImage') {
		downloadFoto();
	}

	toggleSelect();
}

function clearFieldsForm(nameForm = '#editForm') {
	const clearObject = {
		id: '',
		fio: '',
		statustitle: '',
		statusid: '',
		post: ''
	};
	editObject = {
		fio: '',
		statusid: '',
		statustitle: '',
		newpost: '',
		newfio: '',
		photourl: ''
	};

	$(`${nameForm} .form__wrap`).html('').append(templateEditForm(clearObject));

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

function downloadFoto(nameForm = '#editForm') {
	$(`${nameForm} .form__input--file`).change((e) => {
		const file = e.target.files[0];
		const url = URL.createObjectURL(file);
		const fileName = $(e.target).val();

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

function validationEmptyFields(fields) {
	const validFields = Object.values(fields).every((item) => item);
	const statusMess = !validFields ? 'show' : 'hide';
	const extentionArray = ['gif', 'png', 'jpg', 'jpeg'];
	let correctName = 'hide';
	let correctPost = 'hide';
	let countNameWords = 'hide';
	let extensionImg = 'hide';

	for (let key in fields) {
		if (key == 'newfio' && fields[key]) {
			const countWords = fields[key].trim().split(' ');

			correctName = fields[key].match(/[^а-яА-ЯiIъїЁё.'-\s]/g) ? 'show' : 'hide';
			countNameWords = (countWords.length < 2) ? 'show' : 'hide';
		} else if (key == 'newpost' && fields[key]) {
			correctPost = fields[key].match(/[^а-яА-ЯiIъїё0-9.'-\s]/g) ? 'show' : 'hide';
		} else if (key == 'photofile' && fields[key]) {
			const extenName = fields[key].lastIndexOf('.');
			const extenImg = fields[key].slice(extenName + 1);

			extensionImg = extentionArray.some((item) => item == extenImg) ? 'hide' : 'show';
		}
	}

	const valid = [statusMess, correctName, countNameWords, correctPost, extensionImg].every((mess) => mess === 'hide');

	$('.main[data-name="edit"]').find('.info__item--warn.info__item--fields')[statusMess]();
	$('.main[data-name="edit"]').find('.info__item--error.info__item--name')[correctName]();
	$('.main[data-name="edit"]').find('.info__item--error.info__item--post')[correctPost]();
	$('.main[data-name="edit"]').find('.info__item--error.info__item--short')[countNameWords]();
	$('.main[data-name="edit"]').find('.info__item--error.info__item--image')[extensionImg]();

	return valid;
}

function deleteUser(nameTable = '#tableEdit', page = 'edit') {
	$('.table__content').click((e) => {
		if ($(e.target).parents('.table__btn--delete').length || $(e.target).hasClass('table__btn--delete')) {
			const idRemove = $(e.target).closest('.table__row').data('id');

			editCollection.forEach((user, i) => {
				if (user.id === idRemove) {
					editCollection.delete(i);
				}
			});

			showFieldsInHeaderTable();
			renderTable();
		}

		if (!editCollection.size) {
			emptySign(nameTable, 'empty');
		}

		$(`.main__count--${page}`).text(editCollection.size);
	});
}

function editUser(page = 'edit') {
	$('.table__content').click((e) => {
		if ($(e.target).parents('.table__btn--edit').length || $(e.target).hasClass('table__btn--edit')) {
			const idEdit = $(e.target).closest('.table__row').data('id');

			showFieldsInHeaderTable();
			renderForm(idEdit);
			renderTable();
			toggleSelect();
			getAddUsersInDB();
		}

		$(`.main__count--${page}`).text(editCollection.size);
	});
}

function renderForm(id, nameForm = '#editForm') {
	$(`${nameForm} .form__wrap`).html('');

	editCollection.forEach((user, i) => {
		if (user.id === id) {
			$(`${nameForm} .form__wrap`).append(templateEditForm(user));
			editCollection.delete(i);
		}
	});
}

function submitIDinBD(nameTable = '#tableEdit', page = 'edit') {
	$('#submitEditUser').click(() => {
		if (!editCollection.size) return;

		const idDepart = $(`.main__depart--${page}`).attr('data-id');
		const nameDepart = $(`.main__depart--${page}`).attr('data-depart');

		editCollection.forEach((elem) => {
			elem.nameid = idDepart;
			elem.department = nameDepart;
			elem.date = getCurrentDate();
		});

		const changeCardArray = [...editCollection.values()].filter((elem) => elem.statusid === 'changeCard');
		const changeQRArray = [...editCollection.values()].filter((elem) => elem.statusid === 'changeQR');
		const changeFIOArray = [...editCollection.values()].filter((elem) => elem.statusid === 'changeFIO');
		const changePostArray = [...editCollection.values()].filter((elem) => elem.statusid === 'changePost');
		// const changeImageArray = [...editCollection.values()].filter((elem) => elem.statusid === 'changeImage');

		console.log(changeFIOArray);

		if (changeCardArray) {
			setAddUsersInDB(changeCardArray, 'permission', page);
		}
		if (changeQRArray) {
			setAddUsersInDB(changeQRArray, 'permission', page);
		}
		if (changeFIOArray) {
			setAddUsersInDB(changeFIOArray, 'add', page);
		}
		if (changePostArray) {
			setAddUsersInDB(changePostArray, 'add', page);
		}
		// if (changeImageArray) {
		// 	setAddUsersInDB(changePostArray, 'add');
		// }

		editCollection.clear();
		emptySign(nameTable, 'empty');

		renderTable();
		$(`.main__count--${page}`).text(editCollection.size);
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

function getAddUsersInDB(id = '', nameForm = '#editForm', page = 'edit') {
	const idDepart = $(`.main__depart--${page}`).attr('data-id');
	const nameTable = 'edit';

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
