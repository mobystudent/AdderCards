'use strict';

import $ from 'jquery';
import convert from './convert.js';
import service from './service.js';
import { nameDeparts } from './nameDepart.js';

const constCollection = new Map(); // БД пользователей которым разрешили выдачу карт
let counter = 0;

$(window).on('load', () => {
	submitIDinBD();
	printReport();
	autoRefresh();
	showDataFromStorage();
});

function templateConstTable(data) {
	const { id = '', fio = '', post  = '', cardid = '', cardname = '', statustitle = '' } = data;
	const typeIDField = cardid ? `
		<span class="table__text table__text--body">${cardid}</span>
	` : `
		<input class="table__input" />
	`;

	return `
		<div class="table__row table__row--time" data-id="${id}">
			<div class="table__cell table__cell--body table__cell--fio">
				<span class="table__text table__text--body">${fio}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--post">
				<span class="table__text table__text--body">${post}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--cardid">
				${typeIDField}
			</div>
			<div class="table__cell table__cell--body table__cell--cardname">
				<span class="table__text table__text--body">${cardname}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--statustitle">
				<span class="table__text table__text--body">${statustitle}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--signature">
				<span class="table__text table__text--body"></span>
			</div>
			<div class="table__cell table__cell--body table__cell--clear">
				<button class="table__btn table__btn--clear" type="button">
					<svg class="icon icon--clear">
						<use class="icon__item" xlink:href="./images/sprite.svg#clear"></use>
					</svg>
				</button>
			</div>
		</div>
	`;
}

function templateConstTabs(data) {
	const { idname = '', shortname = '', status = '' } = data;
	const statusView = status ? 'tab__item--active' : '';

	return `
		<button class="tab__item ${statusView}" type="button" data-depart=${idname}>
			<span class="tab__name">${shortname}</span>
		</button>
	`;
}

function renderTable(activeDepart, nameTable = '#tableConst') {
	$(`${nameTable} .table__content`).html('');

	constCollection.forEach((item) => {
		if (item.nameid == activeDepart) {
			$(`${nameTable} .table__content`).append(templateConstTable(item));
		}
	});
}

function userFromDB(array, nameTable = '#tableConst') {
	const objToCollection = {
		id: '',
		fio: '',
		post: '',
		nameid: '',
		cardid: '',
		cardname: '',
		photofile: '',
		photourl: '',
		statusid: '',
		statustitle: '',
		department: '',
		сardvalidto: ''
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

		constCollection.set(i, itemObject);
	});

	dataAdd(nameTable);
}

function dataAdd(nameTable, page = 'const') {
	const filterNameDepart = filterDepart(constCollection);

	viewAllCount();

	if (constCollection.size) {
		emptySign(nameTable, 'full');
	} else {
		emptySign(nameTable, 'empty');

		return;
	}

	if (filterNameDepart.length > 1) {
		addTabs(filterNameDepart[0]);
		changeTabs();
	} else {
		$(`.tab--${page}`).html('');
	}

	showActiveDataOnPage(filterNameDepart[0]);
	convertCardIDInCardName();
	clearNumberCard();
}

function showDataFromStorage(nameTable = '#tableConst', page = 'const') {
	const storageCollection = JSON.parse(localStorage.getItem(page));

	if (storageCollection && !constCollection.size) {
		const lengthStorage = storageCollection.collection.length;
		counter = storageCollection.collection[lengthStorage - 1].id; // id последнего элемента в localStorage

		storageCollection.collection.forEach((item) => {
			constCollection.set(counter, item);
			counter++;
		});

		dataAdd(nameTable);
	} else {
		getDatainDB('const', 'card');
	}
}

function setDataInStorage(page = 'const') {
	localStorage.setItem(page, JSON.stringify({
		collection: [...constCollection.values()]
	}));
}

function showActiveDataOnPage(activeDepart) {
	nameDeparts.forEach((depart) => {
		const { idname = '', longname = '' } = depart;

		if (idname === activeDepart) {
			showTitleDepart(longname, idname);
		}
	});

	renderTable(activeDepart);
	countItems(activeDepart);
}

function showTitleDepart(depart, id, page = 'const') {
	$(`.main__depart--${page}`).text(depart).attr({'data-depart': depart, 'data-id': id});
}

function submitIDinBD(nameTable = '#tableConst', page = 'const') {
	$('#submitConstCard').click(() => {
		const activeDepart = $('.main__depart--const').attr('data-id');
		const filterDepatCollection = [...constCollection.values()].filter((user) => user.nameid == activeDepart);
		const checkedItems = filterDepatCollection.every((user) => user.cardid);

		if (checkedItems) {
			const idFilterUsers = filterDepatCollection.map((item) => item.id);

			constCollection.forEach((item) => {
				if (item.nameid == activeDepart) {
					item.date = getCurrentDate();

					setAddUsersInDB(filterDepatCollection, 'const', 'report', 'card');
				}
			});

			filterDepatCollection.splice(0);
			idFilterUsers.forEach((key) => {
				constCollection.delete(key);
			});

			dataAdd(nameTable);

			if (!constCollection.size) {
				showTitleDepart('', '');
			}

			localStorage.removeItem(page);
			counter = 0;

			$('.info__item--warn').hide();
		} else {
			$('.info__item--warn').show();
		}

		// createObjectForBD();
	});
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

function clearNumberCard(nameTable = '#tableConst') {
	$(`${nameTable} .table__content`).click((e) => {
		if ($(e.target).closest('.table__btn--clear').hasClass('table__btn--clear')) {
			const userID = $(e.target).parents('.table__row').data('id');

			setDataInTable(userID);
		}
	});
}

function convertCardIDInCardName(nameTable = '#tableConst') {
	$(`${nameTable} .table__content`).click((e) => {
		if (!$(e.target).hasClass('table__input')) return;

		$('.table__input').on('input', (e) => {
			const cardIdVal = $(e.target).val().trim();
			const convertNumCard = convert.convertCardId(cardIdVal);
			const userID = $(e.target).parents('.table__row').data('id');
			const cardObj = {
				cardid: cardIdVal,
				cardname: convertNumCard
			};

			if (!convertNumCard) {
				$(e.target).parents('.main').find('.info__item--error').show();

				return;
			}

			setDataInTable(userID, cardObj);
			checkInvalidValueCardID();
		});
	});
}

function setDataInTable(userID, cardObj, page = 'const') {
	const activeDepart = $(`.main__depart--${page}`).attr('data-id');

	constCollection.set(userID, {
		cardid: cardObj ? cardObj.cardid : '',
		cardname: cardObj ? cardObj.cardname : ''
	});

	showActiveDataOnPage(activeDepart);
	setDataInStorage();
}

function checkInvalidValueCardID(page = 'const') {
	const checkValueCard = [...constCollection.values()].every((user) => {
		if (user.cardid) {
			return convert.convertCardId(user.cardid);
		}
	});

	if (checkValueCard) {
		$(`.main[data-name=${page}]`).find('.info__item--error').hide();
	}
}

function autoRefresh(page = 'const') {
	const timeReload = 15000 * 15;  //  15 минут
	let markInterval;

	$(`.switch--${page}`).click((e) => {
		const statusSwitch = $(e.target).find('.switch__input').prop('checked');

		constCollection.clear();

		if (statusSwitch && !markInterval) {
			markInterval = setInterval(() => {
				getDatainDB('const', 'card');
			}, timeReload);
		} else {
			clearInterval(markInterval);

			markInterval = false;
		}

		getDatainDB('const', 'card');
	});
}

function setAddUsersInDB(array, nameTable, action, typeTable) {
	$.ajax({
		url: "./php/change-user-request.php",
		method: "post",
		dataType: "html",
		data: {
			typeTable: typeTable,
			action: action,
			nameTable: nameTable,
			array: array
		},
		success: () => {
			service.modal('success');
		},
		error: () => {
			service.modal('error');
		}
	});
}

function getDatainDB(nameTable, typeTable) {
	$.ajax({
		url: "./php/output-request.php",
		method: "post",
		dataType: "html",
		data: {
			nameTable: nameTable,
			typeTable: typeTable
		},
		success: (data) => {
			const dataFromDB = JSON.parse(data);

			userFromDB(dataFromDB);
		},
		error: () => {
			service.modal('download');
		}
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

// Общие функции с картами и кодами
function countItems(activeDepart, page = 'const') {
	const countItemfromDep = [...constCollection.values()].filter((user) => user.nameid === activeDepart);

	$(`.main__count--${page}`).text(countItemfromDep.length);
}

function viewAllCount(page = 'const') {
	$(`.main__count--all-${page}`).text(constCollection.size);
}

function printReport(page = 'const') {
	$(`.main[data-name=${page}] .btn--print`).click(() => {
		window.print();
	});
}

function addTabs(activeTab, page = 'const') {
	const filterNameDepart = filterDepart(constCollection);

	$(`.tab--${page}`).html('');

	if (filterNameDepart.length > 1) {
		filterNameDepart.forEach((item) => {
			nameDeparts.forEach((depart) => {
				const { idname = '', shortname = '' } = depart;

				if (item == idname) {
					const objTab = {
						idname,
						shortname,
						status: activeTab === idname ? true : false
					};

					$(`.tab--${page}`).append(templateConstTabs(objTab));
				}
			});
		});
	}
}

function changeTabs(page = 'const') {
	$(`.tab--${page}`).click((e) => {
		if (!$(e.target).parents('.tab__item').length && !$(e.target).hasClass('tab__item')) return;

		const activeDepart = $(e.target).closest('.tab__item').data('depart');

		addTabs(activeDepart);
		showActiveDataOnPage(activeDepart);
	});
}

function filterDepart(collection) {
	const arrayDepart = [...collection.values()].map((item) => item.nameid);

	return [...new Set(arrayDepart)];
}

function createObjectForBD() {
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
		Post: ''
	};
	const fillOutObjectInBD = [...constFillOutCardCollection].map((elem) => {
		const itemObject = Object.assign({}, object);

		for (const itemField in itemObject) {
			for (const key in elem) {
				if (itemField.toLocaleLowerCase() == key) {
					itemObject[itemField] = elem[key];
				}
			}
		}

		return itemObject;
	});

	console.log(fillOutObjectInBD);
}

export default {

};
