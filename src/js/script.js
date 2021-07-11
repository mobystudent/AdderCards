'use strict';

import $ from 'jquery';
import { json } from './data.js';
import { shortNameDepart } from './shortNameDepart.js';
import timeCard from './timecards.js';
import constCard from './constcards.js';
import qrcodes from './qrcodes.js';
import permission from './permission.js';
// import constqr from './constqr.js';
import service from './service.js';

const permissionCollection = new Set(); // БД пользователей которым разрешили выдачу карт и qr

$(window).on('load', () => {
	getData();
	stringifyJSON();
	defaultDataInTables();
	// addIDinDB();
	permissionAdd();
	addNewUserInTable();

	//service functions
	service.showDataInTable();

	//const cards
	constCard.submitIDinBD();

	//time cards
	timeCard.addTimeCard();
	timeCard.deleteTimeCard();
	timeCard.clearNumberCard();
	timeCard.convertCardIDInCardName();
	timeCard.submitIDinBD();
});

function getData() {
	$.ajax({
		// url: "ftp_user@192.168.56.101",
		url: "/ajax.php",
		dataType: "json",
		success: function(data) {
			console.log('succsess '+data);
		},
		error: function() {
			console.log('error');
		}
	});
}

function stringifyJSON() {
	const strJson = JSON.stringify(json);

	return strJson;
}

function defaultDataInTables() {
	$(`.main[data-name="const"]`).show();
	countItems('#tableTime .table__content', 'time');
	$('#tableTime .table__content').append(timeCard.templateTimeTable());
}

function delegationID(users) {
	const filterArrCards = users.filter((item) => {
		if (item.StatusID == 'newCard' || item.StatusID == 'changeCard') return item;
	});
	const filterArrQRs = users.filter((item) => {
		if (item.StatusID == 'newQR' || item.StatusID == 'changeQR') return item;
	});

	if (filterArrCards.length) {
		console.log('Count');
		addTabs(filterArrCards, '#tableConst', 'const');
		viewAllCountAndTitleDefault(filterArrCards, 'const');
		changeTabs(filterArrCards, '#tableConst', 'const');
		createTable(filterArrCards, '#tableConst');
		addCountCards(filterArrCards, '#tableConst', 'const');
		focusFirstCell('const');

		constCard.clearNumberCard();
		constCard.convertCardIDInCardName();
	}

	if (filterArrQRs.length) {
		console.log('Count 2');
		addTabs(filterArrQRs, '#tableQR', 'qr');
		viewAllCountAndTitleDefault(filterArrQRs, 'qr');
		changeTabs(filterArrQRs, '#tableQR', 'qr');
		createTable(filterArrQRs, '#tableQR');
		addCountCards(filterArrQRs, '#tableQR', 'qr');
		focusFirstCell('qr');
	}
}

function addTabs(filterIDItems, nameTable, modDepart) {
	const filterNameDepart = filterDepart(filterIDItems);

	if (filterNameDepart.length > 1) {
		filterNameDepart.forEach((item, i) => {
			const arrDepart = Object.entries(shortNameDepart);

			arrDepart.forEach((depart) => {
				if (item == depart[0]) {
					$(`.tab--${modDepart}`).append(`
						<button class="tab__item${i == 0 ? ' tab__item--active' : ''}" type="button" data-depart=${depart[0]}>
							<span class="tab__name">${depart[1]}</span>
						</button>
					`);
					$(nameTable).append(`
						<div class="table__content table__content--const" data-content=${depart[0]}>
						</div>
					`);
				}
			});
		});
	} else {
		$(nameTable).append(`
			<div class="table__content table__content--const table__content--active" data-content=${filterNameDepart}>
			</div>
		`);
	}
}

function filterDepart(filterIDItems) {
	const arrayDepart = filterIDItems.reduce((acc, item) => {
		acc.push(item.NameID);
		return acc;
	}, []);
	const filterIdDepart = new Set(arrayDepart);

	return [...filterIdDepart];
}

function addCountCards(filterIDItems, nameTable, modDepart) {
	const filterNameDepart = filterDepart(filterIDItems);
	// console.log(filterNameDepart.length);

	if (filterNameDepart.length) {
		$(`${nameTable} .table__content--const`).eq(0).addClass('table__content--active');


		countItems(`${nameTable} .table__content--active`, modDepart);
	}
}

function countItems(tableContent, modDepart) {
	const countItemfromDep = $(tableContent).eq(0).find('.table__row').length;

	$(`.main__count--${modDepart}`).text(countItemfromDep);
}

function viewAllCountAndTitleDefault(filterIDItems, modDepart) {
	const activeTabDepart = $(`.tab--${modDepart} .tab__item--active`).data('depart');

	$(`.main__count--all-${modDepart}`).text(filterIDItems.length);

	console.log(filterIDItems);

	filterIDItems.forEach((item) => {
		// if (activeTabDepart && item.NameID == activeTabDepart) {
		// 	$(`.main__depart--${modDepart}`).text(item.Department);
		// } else {
		$(`.main__depart--${modDepart}`).text(item.Department).attr('data-depart', item.Department);
		// }
	});
}

function changeTabs(depart, nameTable, modDepart) {
	$(`.tab--${modDepart} .tab__item`).click((e) => {
		const nameDepart = $(e.target).closest('.tab__item').data('depart');

		$(`${nameTable} .table__content--const`).removeClass('table__content--active');
		$(`.tab--${modDepart} .tab__item`).removeClass('tab__item--active');
		$(`.main__depart--${modDepart}`).text('').attr('data-depart', '');
		$(`${nameTable} .table__content--const[data-content=${nameDepart}]`).addClass('table__content--active');
		$(e.target).closest('.tab__item').addClass('tab__item--active');

		countItems(`${nameTable} .table__content--active`, modDepart);

		depart.forEach((item) => {
			if (item.NameID == nameDepart) {
				$(`.main__depart--${modDepart}`).text(item.Department).attr('data-depart', item.Department);
			}
		});

		focusFirstCell(modDepart);
		// convert.checkValFieldsCardId(e.target);
	});
}

function createTable(users, nameTable, tabName = '') {
	const limitUser = users.map((item) => {
		const {
			FIO = '',
			Department = '',
			FieldGroup = '',
			Badge = '',
			CardName = '',
			CardID = '',
			CardValidTo = '',
			PIN = '',
			CardStatus = 1,
			Security = 0,
			Disalarm = 0,
			VIP = 0,
			DayNightCLM = 0,
			AntipassbackDisabled = 0,
			PhotoFile = '',
			EmployeeNumber = '',
			Post = '',
			NameID = '',
			StatusID = '',
			IDUser = '',
			TitleID = '',
			NewFIO = '',
			NewPost = '',
			NewDepart = '',
			Data = '',
			CodePicture = ''
		} = item;

		if (!tabName) {
			return {
				FIO,
				Post,
				NameID,
				CardID,
				CardName,
				StatusID,
				IDUser
			};
		} else if (tabName === 'permis') {
			return {
				FIO,
				Post,
				NameID,
				StatusID,
				IDUser
			};
		} else if (tabName === 'add') {
			return {
				FIO,
				Post,
				Department,
				TitleID,
				IDUser
			};
		} else if (tabName === 'remove') {
			return {
				FIO,
				Department,
				TitleID,
				NewDepart,
				IDUser
			};
		} else if (tabName === 'edit') {
			return {
				FIO,
				Department,
				TitleID,
				NewFIO,
				NewPost,
				IDUser
			};
		}
	});

	if (tabName === 'add' || tabName === 'remove' || tabName === 'edit') {
		if (!$(nameTable).find('.table__content').length) {
			$(nameTable).append(`<div class="table__content table__content--const"></div>`);
		} else {
			$(nameTable).find('.table__row').remove();
		}
	}

	limitUser.forEach((item) => {
		let tableContent = '';
		let countRows = '';

		if (tabName === 'add' || tabName === 'remove' || tabName === 'edit' ) {
			tableContent = $(`${nameTable} .table__content--const`);
		} else {
			tableContent = $(`${nameTable} .table__content--const[data-content=${item.NameID}]`);
		}

		tableContent.append(`<div class="table__row" data-id=${item.IDUser}></div>`);

		if (tabName === 'add' || tabName === 'remove' || tabName === 'edit' ) {
			countRows = $(`${nameTable} .table__content--const .table__row`).length;
		} else {
			countRows = $(`${nameTable} .table__content--const[data-content=${item.NameID}] .table__row`).length;
		}

		for (let itemValue in item) {
			let statusValue;

			if (itemValue == 'StatusID') {
				switch(item[itemValue]) {
					case 'newCard':
						statusValue = 'Новая карта';
						break;
					case 'changeCard':
						statusValue = 'Замена карты';
						break;
					case 'newQR':
						statusValue = 'Новый QR-код';
						break;
					case 'changeQR':
						statusValue = 'Замена QR-кода';
						break;
					case 'changeFIO':
						statusValue = 'Изменение ФИО';
						break;
					case 'changePost':
						statusValue = 'Изменение должности';
						break;
					case 'changeDepart':
						statusValue = 'Перевод в другое подразделение';
						break;
				}
			} else {
				statusValue = item[itemValue];
			}

			itemValue = itemValue.toLocaleLowerCase();

			if (itemValue === 'cardid') {
				tableContent.find(`.table__row:nth-child(${countRows})`).append(`
					<div class="table__cell table__cell--body table__cell--${itemValue}" data-name="${itemValue}" data-info="true" data-value="">
						<input class="table__input" />
					</div>
				`);
			} else if (itemValue !== 'iduser') {
				tableContent.find(`.table__row:nth-child(${countRows})`).append(`
					<div class="table__cell table__cell--body table__cell--${itemValue}" data-name="${itemValue}" data-info="true" data-value="${statusValue}">
						<span class="table__text table__text--body">
							${statusValue}
						</span>
					</div>
				`);
			}
		}

		if (!tabName) {
			tableContent.find(`.table__row:nth-child(${countRows})`).append(`
				<div class="table__cell table__cell--clear">
					<button class="table__btn table__btn--clear" type="button">
						<svg class="icon icon--clear">
							<use class="icon__item" xlink:href="#clear"></use>
						</svg>
					</button>
				</div>
				<div class="table__cell table__cell--signature">
					<span class="table__text table__text--body"></span>
				</div>
			`);
		} else if (tabName === 'permis') {
			tableContent.find(`.table__row:nth-child(${countRows})`).append(`
				<div class="table__cell table__cell--body table__cell--buttons">
					<button class="btn btn--allow" data-type="allow" data-cancel="Отменить" data-allow="Разрешить" type="button">
						Разрешить
					</button>
					<button class="btn btn--disallow" data-type="disallow" data-cancel="Отменить" data-disallow="Запретить" type="button">
						Запретить
					</button>
				</div>
			`);
		}
	});
}

function focusFirstCell(nameTable) {
	const rows = $(`.table--${nameTable} .table__content--active`).find('.table__row');

	$(rows).eq(0).find('.table__input').focus();
}

// Добавление
// function addIDinDB() {
// 	$('#submitConstCard').click((e) => {
// 		returnToNextTab(e.target);
// 	});
// }

function removeAndFocusActiveBlock(containerBl, block, nameTable) {
	let numActive;

	[...containerBl].forEach((item, i) => {
		if ($(item).hasClass(`${block}--active`)) {
			$(item).remove();
			numActive = i;
		}
	});

	[...containerBl].forEach(() => {
		if (numActive != 0) {
			$(containerBl).eq(numActive - 1).addClass(`${block}--active`);
		} else if (numActive + 1 && numActive == 0) {
			$(containerBl).eq(numActive + 1).addClass(`${block}--active`);
		}
	});

	focusFirstCell(nameTable);
}

// Вкладка разрешение на добавление
function permissionAdd() {
	const dataArr = JSON.parse(stringifyJSON());
	const depart = Object.values(dataArr).map((item) => item);

	addTabs(depart, '#tablePermiss', 'permis');
	viewAllCountAndTitleDefault(depart, 'permis');
	changeTabs(depart ,'#tablePermiss', 'permis');
	createTable(depart, '#tablePermiss', 'permis');
	addCountCards(depart, '#tablePermiss', 'permis');
	focusFirstCell('permis');

	confirmPermission(depart);
}

function confirmPermission(objectItems) {
	$('#submitPermis').click((e) => {
		const typeItems = $('#tablePermiss .table__content--active').find('.table__row');
		const checkedItems = [...typeItems].every((item) => $(item).is('[data-type]'));

		if (checkedItems) {
			const classBtns = ['#allowAll', '#disallowAll'];
			const allowItems = [...typeItems].filter((item) => {
				const typePerson = $(item).data('type');

				$(item).remove();

				console.warn(item);

				if (typePerson === 'allow') return item;
			});
			const returnUsers = allowItems.reduce((acc, elem) => {
				const idObj = $(elem).data('id');

				objectItems.forEach((obj) => {
					if (obj.IDUser == idObj) acc.push(obj);
				});

				return acc;
			}, []);
			// permissionCollection
			console.log(returnUsers);
			const nameTable = returnUsers.map((item) => {
				return getTableID(item.StatusID);
			});

			nameTable.forEach((table) => {
				$(`.table--${table} .table__body`).removeClass('table__body--empty');
				$(`.table--${table} .table__nothing`).hide();
			});

			classBtns.forEach((item) => {
				const typeBtn = $(item).data('type');
				const textBtn = $(item).data(typeBtn);

				$(item).removeClass(`btn--${typeBtn}-disabled btn--${typeBtn}-cancel`).removeAttr('disabled', 'disabled');
				$(`.table__header .btn--${typeBtn}`).text(textBtn);
			});

			returnToNextTab(e.target);
			delegationID(returnUsers);
			// convert.viewConvertCardId();

			$('.info__warn').hide();
		} else {
			$('.info__warn').show();
		}
	});
}

function getTableID(name) {
	if (name === 'newCard' || name === 'changeCard') {
		return 'const';
	} else if (name === 'newQR' || name === 'changeQR') {
		return 'qr';
	}
}

function returnToNextTab(item) {
	const dataDepart = $(item).closest('.main').data('name');
	const countTabs = $(`.tab--${dataDepart} .tab__item`);
	const countContent = $(`.table--${dataDepart} .table__content`);

	if (countTabs.length > 1) {
		removeAndFocusActiveBlock(countTabs, 'tab__item', dataDepart);
		removeAndFocusActiveBlock(countContent, 'table__content', dataDepart);
	} else {
		$(`.tab--${dataDepart} .tab__item--active`).remove();
		$(`.table--${dataDepart} .table__content--active`).remove();
		$(`.table--${dataDepart} .table__nothing`).show();
	}
}

function addNewUserInTable() {
	const userAdd = [];
	const userRemove = [];
	const userEdit = [];
	let countId = 1; //delete

	$('#addUser, #removeUser, #editUser').click((e) => {
		const form = $(e.target).parents('.form');
		const fields = $(form).find('.form__item');
		const typeBtn = $(e.target).data('type');
		const object = {
			FIO: '',
			Department: '',
			FieldGroup: '',
			Badge: '',
			CardName: '',
			CardID: '',
			CardValidTo: '',
			PIN: '',
			CardStatus: 1,
			Security: 0,
			Disalarm: 0,
			VIP: 0,
			DayNightCLM: 0,
			AntipassbackDisabled: 0,
			PhotoFile: '',
			EmployeeNumber: '',
			Post: '',
			NameID: '',
			StatusID: '',
			IDUser: '',
			TitleID: '',
			NewFIO: '',
			NewPost: '',
			NewDepart: '',
			Data: '',
			CodePicture: ''
		};
		const addFields = [...fields].reduce((array, item) => {
			const fieldName = $(item).data('field');

			if ($(item).hasClass('select')) {
				const fieldType = $(item).data('type');
				const typeSelect = $(item).data('select');
				const valueItem = $(item).find('.select__value--selected').data('title');

				if (typeSelect != 'fio') {
					const nameId = $(item).find('.select__value--selected').data(typeSelect);

					array.push({[fieldName]: valueItem}, {[fieldType]: nameId});
				} else {
					array.push({[fieldName]: valueItem});
				}
			} else {
				const inputValue = $(item).val();

				array.push({[fieldName]: inputValue});
			}

			return array;
		}, []);

		addFields.forEach((elem) => {
			for (const itemField in object) {
				for (const key in elem) {
					if (itemField == key) {
						object[itemField] = elem[key];
					}
				}
			}
		});

		object.IDUser = countId;//delete
		countId++;//delete

		switch(typeBtn) {
			case 'add-user':
				userAdd.push(object);
				addUsersInTable('#tableAdd', 'add', userAdd);

				break;
			case 'remove-user':
				userRemove.push(object);
				addUsersInTable('#tableRemove', 'remove', userRemove);

				break;
			case 'edit-user':
				userEdit.push(object);
				addUsersInTable('#tableEdit', 'edit', userEdit);

				break;
		}

		clearFieldsForm(fields);
	});
}

function addUsersInTable(tableID, nameTable, user) {
	createTable(user, tableID, nameTable);
	addCountCards(user, tableID, nameTable);

	$(`.table--${nameTable} .table__body`).removeClass('table__body--empty');
	$(`.table--${nameTable} .table__nothing`).hide();
}

function clearFieldsForm(array) {
	[...array].forEach((item) => {
		if ($(item).hasClass('select')) {
			const typeSelect = $(item).data('select');
			const placeholder = $(item).find('.select__value').data('placeholder');
			let attr = '';

			if (typeSelect != 'fio') {
				attr = {'title': 'title', [`${typeSelect}`]: typeSelect};
			} else {
				attr = {'title': 'title'};
			}

			$(item).find('.select__value--selected')
				.removeClass('select__value--selected')
				.data(attr)
				.text(placeholder);
		} else {
			$(item).val('');
		}
	});

	$('.form__field--new-post, .form__field--new-fio, .form__field--depart').hide();
}
