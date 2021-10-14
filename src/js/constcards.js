'use strict';

import $ from 'jquery';
import convert from './convert.js';
import service from './service.js';
import messageMail from './mail.js';
import settingsObject from './settings.js';

const constCollection = new Map(); // БД пользователей которым разрешили выдачу карт
const departmentCollection = new Map();  // Коллекци подразделений
const constObject = {
	nameid: '',
	longname: '',
	shortname: ''
};

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
	const { nameid = '', shortname = '', status = '' } = data;
	const statusView = status ? 'tab__item--active' : '';

	return `
		<button class="tab__item ${statusView}" type="button" data-depart=${nameid}>
			<span class="tab__name">${shortname}</span>
		</button>
	`;
}

function templateHeaderPage(page = 'const') {
	return `
		<h1 class="main__title">Добавление карт пользователям</h1>
		<span class="main__depart main__depart--${page}" data-depart="${constObject.longname}" data-id="${constObject.nameid}">${constObject.longname}</span>
	`;
}

function renderTable(nameTable = '#tableConst') {
	$(`${nameTable} .table__content`).html('');

	constCollection.forEach((item) => {
		if (item.nameid === constObject.nameid) {
			$(`${nameTable} .table__content`).append(templateConstTable(item));
		}
	});
}

function renderHeaderPage(page = 'const') {
	$(`.main[data-name=${page}] .main__title-wrap`).html('');
	$(`.main[data-name=${page}] .main__title-wrap`).append(templateHeaderPage());
}

function userFromDB(array) {
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

	dataAdd();
}

function dataAdd(page = 'const') {
	const filterNameDepart = filterDepart(constCollection);
	constObject.nameid = filterNameDepart[0];

	viewAllCount();
	getDepartmentInDB('department');

	if (constCollection.size) {
		emptySign('full');
	} else {
		emptySign('empty');

		return;
	}

	if (filterNameDepart.length > 1) {
		addTabs();
		changeTabs();
	} else {
		$(`.tab--${page}`).html('');
	}

	showActiveDataOnPage();
	convertCardIDInCardName();
	clearNumberCard();
}

function showDataFromStorage(page = 'const') {
	const storageCollection = JSON.parse(localStorage.getItem(page));

	if (storageCollection && storageCollection.collection.length && !constCollection.size) {
		storageCollection.collection.forEach((item, i) => {
			const itemID = storageCollection.collection[i].id;

			constCollection.set(itemID, item);
		});

		dataAdd();
	} else {
		getDatainDB('const', 'card');
	}
}

function setDataInStorage(page = 'const') {
	localStorage.setItem(page, JSON.stringify({
		collection: [...constCollection.values()]
	}));
}

function showActiveDataOnPage() {
	departmentCollection.forEach((depart) => {
		const { nameid, shortname, longname } = depart;

		if (nameid === constObject.nameid) {
			constObject.shortname = shortname;
			constObject.longname = longname;
		}
	});

	renderHeaderPage();
	renderTable();
	countItems();
}

function submitIDinBD(page = 'const') {
	$('#submitConstCard').click(() => {
		const filterDepatCollection = [...constCollection.values()].filter(({ nameid }) => nameid == constObject.nameid);
		const checkedItems = filterDepatCollection.every(({ cardid }) => cardid);

		if (checkedItems) {
			const idFilterUsers = filterDepatCollection.map(({ id }) => id);

			constCollection.forEach((item) => {
				if (item.nameid === constObject.nameid) {
					item.date = service.getCurrentDate();
				}
			});

			setAddUsersInDB(filterDepatCollection, 'const', 'report', 'card');

			constObject.nameid = '';
			constObject.longname = '';
			constObject.shortname = '';

			filterDepatCollection.splice(0);
			idFilterUsers.forEach((key) => {
				constCollection.delete(key);
			});

			dataAdd();

			if (!constCollection.size) {
				renderHeaderPage();
			}

			countItems();
			localStorage.removeItem(page);

			$('.info__item--warn').hide();
		} else {
			$('.info__item--warn').show();
		}

		// createObjectForBD();
	});
}

function emptySign(status, nameTable = '#tableConst') {
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
	$(`${nameTable} .table__content`).click(({ target }) => {
		if ($(target).parents('.table__btn--clear').length || $(target).hasClass('table__btn--clear')) {
			const userID = $(target).closest('.table__row').data('id');

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

function setDataInTable(userID, cardObj) {
	const user = constCollection.get(userID);
	user.cardid = cardObj ? cardObj.cardid : '';
	user.cardname = cardObj ? cardObj.cardname : '';

	showActiveDataOnPage();
	setDataInStorage();
}

function checkInvalidValueCardID(page = 'const') {
	const filterDepatCollection = [...constCollection.values()].filter(({ nameid }) => nameid == constObject.nameid);
	const checkValueCard = filterDepatCollection.every(({ cardid }) => {
		if(cardid) convert.convertCardId(cardid);
	});

	if (checkValueCard) {
		$(`.main[data-name=${page}]`).find('.info__item--error').hide();
	}
}

function autoRefresh(page = 'const') {
	const timeReload = 60000 * settingsObject.autoupdatevalue;
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
		async: false,
		data: {
			typeTable,
			action,
			nameTable,
			array
		},
		success: (data) => {
			console.log(data);
			window.print();
			service.modal('success');

			sendMail({
				department: constObject.longname,
				count: constCollection.size,
				title: 'Добавлено',
				users: [...constCollection.values()]
			});
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

function getDepartmentInDB(nameTable) {
	$.ajax({
		url: "./php/output-request.php",
		method: "post",
		dataType: "html",
		async: false,
		data: {
			nameTable: nameTable
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
	const recipient = settingsObject.email;
	const subject = 'Пользователи успешно добавлены в БД';

	$.ajax({
		url: "./php/mail.php",
		method: "post",
		dataType: "html",
		async: false,
		data: {
			sender: sender,
			recipient: recipient,
			subject: subject,
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
function countItems(page = 'const') {
	const countItemfromDep = [...constCollection.values()].filter(({ nameid }) => nameid === constObject.nameid);

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

function addTabs(page = 'const') {
	const filterNameDepart = filterDepart(constCollection);

	$(`.tab--${page}`).html('');

	if (filterNameDepart.length > 1) {
		filterNameDepart.forEach((item) => {
			departmentCollection.forEach((depart) => {
				const { nameid = '', shortname = '' } = depart;

				if (item == nameid) {
					const tabItem = {
						nameid,
						shortname,
						status: constObject.nameid === nameid ? true : false
					};

					$(`.tab--${page}`).append(templateConstTabs(tabItem));
				}
			});
		});
	}
}

function changeTabs(page = 'const') {
	$(`.tab--${page}`).click((e) => {
		if (!$(e.target).parents('.tab__item').length && !$(e.target).hasClass('tab__item')) return;

		const activeDepart = $(e.target).closest('.tab__item').data('depart');
		constObject.nameid = activeDepart;

		addTabs();
		showActiveDataOnPage();

		localStorage.removeItem(page); // в самом конце, т.к. функции выше записывают в localStorage
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
