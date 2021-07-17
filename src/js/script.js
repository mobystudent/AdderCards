'use strict';

import $ from 'jquery';
import { json } from './data.js';
import { nameDeparts } from './nameDepart.js';
import timeCard from './timecards.js';
import constCard from './constcards.js';
import qrcodes from './qrcodes.js';
import permission from './permission.js';
// import constqr from './constqr.js';
import service from './service.js';
import usersFunc from './users-func.js';

const permissionCollection = new Map(); // БД пользователей при старте
const permissionAddCollection = new Map(); // БД пользователей которым разрешили выдачу карт и qr
const permissCardsCollection = new Map(); // БД пользователей которым разрешили выдачу карт
const permissCodesCollection = new Map(); // БД пользователей которым разрешили выдачу qr

$(window).on('load', () => {
	getData();
	stringifyJSON();
	defaultDataInTables();
	// addIDinDB();
	// permissionAdd();
	userdFromJSON();

	//permission functions
	permission.confirmAllAllowDisallow();

	//service functions
	service.showDataInTable();

	//const cards
	constCard.submitIDinBD();
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
}

let countCards = 0;
let countCodes = 0;

function delegationID(users) {
	const filterArrCards = users.filter((item) => {
		if (item.StatusID == 'newCard' || item.StatusID == 'changeCard') {

			permissCardsCollection.set(countCards, item);
			countCards++;

			return item;
		}
	});
	const filterArrQRs = users.filter((item) => {
		if (item.StatusID == 'newQR' || item.StatusID == 'changeQR') {

			permissCodesCollection.set(countCodes, item);
			countCodes++;

			return item;
		}
	});


	permissionAddCollection.clear();
	// console.log(filterArrCards);
	// console.log(filterArrQRs);
	//
	// console.log(permissCardsCollection);
	// console.log(permissCodesCollection);

	if (permissCardsCollection.size) {
		// addTabs(filterArrCards, '#tableConst', 'const');
		viewAllCount(filterArrCards, 'const');
		// changeTabs(filterArrCards, '#tableConst', 'const');
		createTable(filterArrCards, '#tableConst');
		focusFirstCell('const');

		constCard.clearNumberCard();
		constCard.convertCardIDInCardName();
	}

	if (permissCodesCollection.size) {
		// addTabs(filterArrQRs, '#tableQR', 'qr');
		viewAllCount(filterArrQRs, 'qr');
		// changeTabs(filterArrQRs, '#tableQR', 'qr');
		createTable(filterArrQRs, '#tableQR');
		focusFirstCell('qr');
	}
}

function addTabs(collection, modDepart) {
	const filterNameDepart = filterDepart(collection);

	if (filterNameDepart.length > 1) {
		filterNameDepart.forEach((item) => {
			nameDeparts.forEach((depart) => {
				const { idName = '', shortName = '' } = depart;

				if (item == idName) {
					$(`.tab--${modDepart}`).append(`
						<button class="tab__item" type="button" data-depart=${idName}>
							<span class="tab__name">${shortName}</span>
						</button>
					`);
				}
			});
		});
	}
}

function showActiveDataOnPage(collection, nameTable, modDepart, nameDepart) {
	$(nameTable).html('');
	$(`.tab--${modDepart} .tab__item`).removeClass('tab__item--active');
	$('#tablePermiss').append(`
		<div class="table__content table__content--const table__content--active">
		</div>
	`);
	$(`.tab__item[data-depart=${nameDepart}]`).addClass('tab__item--active');

	countItems(nameDepart, modDepart);

	collection.forEach((user) => {
		if (user.nameid == nameDepart) {
			$('#tablePermiss .table__content--active').append(permission.templatePermissionTable(user));
		}
	});

	nameDeparts.forEach((depart) => {
		const { idName = '', longName = '' } = depart;

		if (idName == nameDepart) {
			showTitleDepart(longName, modDepart);
		}
	});
}

function showTitleDepart(depart, modDepart) {
	$(`.main__depart--${modDepart}`).text(depart).attr('data-depart', depart);
}

function filterDepart(collection) {
	const arrayDepart = [...collection.values()].reduce((acc, item) => {
		acc.push(item.nameid);
		return acc;
	}, []);
	const filterIdDepart = new Set(arrayDepart);

	return [...filterIdDepart];
}

function countItems(idDepart, modDepart) {
	const countItemfromDep = [...permissionCollection.values()].filter((user) => user.nameid === idDepart);

	$(`.main__count--${modDepart}`).text(countItemfromDep.length);
}

function viewAllCount(collection, modDepart) {
	$(`.main__count--all-${modDepart}`).text(collection.size);
}

function changeTabs(depart, nameTable, modDepart) {
	$(`.tab--${modDepart}`).click((e) => {
		if (!$(e.target).parents('.tab__item').length && !$(e.target).hasClass('tab__item')) return;

		const nameDepart = $(e.target).closest('.tab__item').data('depart');

		showActiveDataOnPage(permissionCollection, nameTable, modDepart, nameDepart);
	});
}

function createTable(users, nameTable, tabName = '') {
	// console.warn(users);
	const limitUser = users.map((item) => {
		const {
			FIO = '',
			Department = '',
			CardName = '',
			CardID = '',
			Post = '',
			NameID = '',
			StatusID = '',
			IDUser = '',
			TitleID = '',
			NewFIO = '',
			NewPost = '',
			NewDepart = '',
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
function userdFromJSON() {
	const dataArr = JSON.parse(stringifyJSON());
	const depart = Object.values(dataArr).map((item) => item);
	const objToCollection = {
		fio: '',
		post: '',
		nameid: '',
		statusid: '',
		department: ''
	};
	depart.forEach((elem, i) => {
		const itemObject = Object.assign({}, objToCollection);

		for (const itemField in itemObject) {
			for (const key in elem) {
				if (itemField == key.toLocaleLowerCase()) {
					itemObject[itemField] = elem[key];
				}
			}
		}

		permissionCollection.set(i, itemObject);
	});

	permissionAdd();
}

function permissionAdd() {
	const filterNameDepart = filterDepart(permissionCollection);

	if (permissionCollection.size) {
		$('.table__nothing').hide();

		viewAllCount(permissionCollection, 'permis');
	}

	if (filterNameDepart.length > 1) {
		addTabs(permissionCollection, 'permis');
		showActiveDataOnPage(permissionCollection ,'#tablePermiss', 'permis', filterNameDepart[0]);
		changeTabs(permissionCollection ,'#tablePermiss', 'permis');
	} else {
		$('#tablePermiss').append(`
			<div class="table__content table__content--const table__content--active">
			</div>
		`);

		permissionCollection.forEach((user) => {
			$('#tablePermiss .table__content--active').append(permission.templatePermissionTable(user));
		});
	}

	permission.clickAllowDisallowPermiss();
}

function confirmPermission() {
	let countItem = 0;

	$('#submitPermis').click((e) => {
		const typeItems = $('#tablePermiss .table__content--active').find('.table__row');
		const checkedItems = [...typeItems].every((item) => $(item).is('[data-type]'));

		if (checkedItems) {
			const classBtns = ['#allowAll', '#disallowAll'];
			const allowItems = [...typeItems].filter((item) => {
				const typePerson = $(item).data('type');

				$(item).remove();

				// console.warn(item);

				if (typePerson === 'allow') return item;
			});
			console.log(allowItems);
			const returnUsers = allowItems.reduce((acc, elem) => {
				const idObj = $(elem).data('id');

				objectItems.forEach((obj) => {
					if (obj.IDUser == idObj) acc.push(obj);
				});

				return acc;
			}, []);
			console.warn(returnUsers);
			// permissionAddCollection

			// For Collection
			const objToCollection = {
				fio: '',
				post: '',
				nameid: '',
				statusid: '',
				department: ''
			};

			returnUsers.forEach((elem) => {
				const itemObject = Object.assign({}, objToCollection);

				for (const itemField in itemObject) {
					for (const key in elem) {
						if (itemField == key.toLocaleLowerCase()) {
							itemObject[itemField] = elem[key];
						}
					}
				}

				permissionAddCollection.set(countItem, itemObject);
				countItem++;
			});

			console.log(permissionAddCollection);

			// End for collection

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
			viewAllCount(permissionAddCollection, 'permis');
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
