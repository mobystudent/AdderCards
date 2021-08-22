'use strict';

import $ from 'jquery';

const editCollection = new Map();
let editObject = {
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
	const { id = '', fio = '', post = '', statustitle = '', newfio = '', newpost = '', photofile = '' } = data;

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
			<div class="table__cell table__cell--body table__cell--fio">
				<span class="table__text table__text--body">${newfio}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--post">
				<span class="table__text table__text--body">${newpost}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--photofile" title=${photofile}>
				<span class="table__text table__text--body">${photofile}</span>
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
	const { fio = '', statusid = '', newpost = '', newfio = '', statustitle = '', post = '', photourl = '' } = data;
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
				const typeSelect = $(item).data('select');
				const nameId = $(item).find('.select__value--selected').attr(`data-${typeSelect}`);
				const fieldType = $(item).data('type');
				const valueItem = $(item).find('.select__value--selected').attr('data-title');

				object[fieldType] = nameId;
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

		if (validationEmptyFields(userData)) {
			userFromForm(userData);
			clearFieldsForm();
			showFieldsInTable();
		}
	});
}

function userFromForm(object, page = 'edit') {
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
	const postUser = $('#editForm .form__item--post').data('value');

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

	editCollection.set(indexCollection, itemObject);

	dataAdd('#tableEdit');
}

function dataAdd(nameTable) {
	if (editCollection.size) {
		$('.table__nothing').hide();
		$(nameTable)
			.html('')
			.removeClass('table__body--empty')
			.append(`
				<div class="table__content table__content--active">
				</div>
			`);
	} else {
		addEmptySign(nameTable);

		return;
	}

	renderTable();
	$('.main__count--edit').text(editCollection.size);
	deleteUser();
	editUser();
}

function showFieldsInTable() {
	const existDepart = [...editCollection.values()].every((elem) => elem.newdepart);
	const existDate = [...editCollection.values()].every((elem) => elem.date);
	const wrapDefClasses = 'wrap wrap--content';

	console.log(editCollection);
	console.log(existDepart);
	console.log(existDate);

	return false;

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

function toggleSelect(nameTable = '#editForm') {
	$(`${nameTable} .select__header`).click((e) => {
		$(e.currentTarget).next().slideToggle();
		$(e.currentTarget).toggleClass('select__header--active');
	});

	clickSelectItem();
}

function clickSelectItem(nameTable = '#editForm') {
	$(`${nameTable} .select__item`).click((e) => {
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
	const statustitle = select === 'change' ? title : '';
	const post = $('#editForm .form__item--post').data('value');

	$('#editForm .form__wrap').html('');

	if (select === 'fio') {
		editObject.fio = fio;
		editObject.statustitle = '';
		editObject.statusid = '';
		editObject.post = post;
	} else {
		editObject.statustitle = statustitle;
		editObject.statusid = statusid;
	}

	console.warn(editObject);

	$('#editForm .form__wrap').append(templateEditForm(editObject));

	if (statusid === 'changeImage') {
		downloadFoto();
	}
	toggleSelect();
}

function clearFieldsForm() {
	const clearObject = {
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

	$('#editForm .form__wrap').html('').append(templateEditForm(clearObject));

	toggleSelect();
	getAddUsersInDB();
}

function addEmptySign(nameTable) {
	$(nameTable)
		.addClass('table__body--empty')
		.html('')
		.append(`
			<p class="table__nothing">Новых данных нет</p>
		`);
}

function downloadFoto() {
	$('#editForm .form__input--file').change((e) => {
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
	const extentionArray = ['giff', 'png', 'jpg', 'jpeg'];
	let correctName = 'hide';
	let correctPost = 'hide';
	let countNameWords = 'hide';
	let extensionImg = 'hide';

	for (let key in fields) {
		if (key == 'newfio' && fields[key]) {
			const countWords = fields[key].trim().split(' ');

			correctName = fields[key].match(/[^а-яА-ЯiIъїё.'-\s]/g) ? 'show' : 'hide';
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

function deleteUser() {
	$('.table__content').click((e) => {
		if ($(e.target).parents('.table__btn--delete').length || $(e.target).hasClass('table__btn--delete')) {
			const idRemove = $(e.target).closest('.table__row').data('id');

			editCollection.delete(idRemove);
			renderTable();
		}

		if (editCollection.size == 0) {
			addEmptySign('#tableEdit');
		}

		$('.main__count--edit').text(editCollection.size);
	});
}

function editUser() {
	$('.table__content').click((e) => {
		if ($(e.target).parents('.table__btn--edit').length || $(e.target).hasClass('table__btn--edit')) {
			const idEdit = $(e.target).closest('.table__row').data('id');

			renderForm(idEdit);
			editCollection.delete(idEdit);
			renderTable();
			toggleSelect();
			getAddUsersInDB();
		}

		$('.main__count--edit').text(editCollection.size);
	});
}

function renderForm(id, nameTable = '#editForm') {
	$(`${nameTable} .form__wrap`).html('');

	editCollection.forEach((user) => {
		if (user.id == id) {
			console.log(user);
			$(`${nameTable} .form__wrap`).append(templateEditForm(user));
		}
	});
}

function submitIDinBD() {
	$('#submitEditUser').click(() => {
		if (!editCollection.size) return;

		const idDepart = $('.main__depart--edit').attr('data-id');
		const nameDepart = $('.main__depart--edit').attr('data-depart');

		editCollection.forEach((elem) => {
			elem.nameid = idDepart;
			elem.department = nameDepart;
			elem.date = getCurrentDate();
		});


		setEditUsersInDB([...editCollection.values()], idDepart);

		editCollection.clear();
		addEmptySign('#tableEdit');

		renderTable();
		$('.main__count--add').text(editCollection.size);
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

function setEditUsersInDB(array, nameid) {
	$.ajax({
		url: "./php/add-user-request.php",
		method: "post",
		dataType: "html",
		data: {
			nameTable: 'request',
			nameid: nameid,
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
