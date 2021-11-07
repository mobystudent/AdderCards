'use strict';

import $ from 'jquery';
import convert from './convert.js';
import service from './service.js';
import messageMail from './mail.js';
import settingsObject from './settings.js';
import renderheader from './parts/renderheader.js';

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
		<div class="table__row" data-id="${id}">
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

function renderTable(nameTable = '#tableConst') {
	$(`${nameTable} .table__content`).html('');

	constCollection.forEach((item) => {
		if (item.nameid === constObject.nameid) {
			$(`${nameTable} .table__content`).append(templateConstTable(item));
		}
	});
}

function userFromDB(array) {
	const objToCollection = {
		id: '',
		fio: '',
		post: '',
		nameid: '',
		photofile: '',
		statusid: '',
		statustitle: '',
		department: '',
		сardvalidto: '',
		cardid: '',
		cardname: ''
	};

	array.forEach((elem, i) => {
		const itemObject = {...objToCollection};

		for (const itemField in itemObject) {
			for (const key in elem) {
				if (itemField === key) {
					itemObject[itemField] = elem[key];
				}
			}
		}

		constCollection.set(i, itemObject);
	});

	dataAdd();
}

function dataAdd(page = 'const') {
	const filterNameDepart = filterDepart();
	constObject.nameid = filterNameDepart[0];

	viewAllCount();
	getDepartmentFromDB();

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
		getDataFromDB('const', 'card');
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

	const options = {
		page: 'const',
		header: {
			longname: constObject.longname,
			nameid: constObject.nameid
		}
	};

	renderheader.renderHeaderPage(options);
	renderTable();
	countItems();
}

function submitIDinBD(page = 'const') {
	$('#submitConstCard').click(() => {
		const filterDepatCollection = [...constCollection.values()].filter(({ nameid }) => nameid == constObject.nameid);
		const checkedItems = filterDepatCollection.every(({ cardid }) => cardid);

		if (checkedItems) {
			$('.info__item--warn').hide();

			constCollection.forEach((item) => {
				if (item.nameid === constObject.nameid) {
					item.date = service.getCurrentDate();
				}
			});

			setAddUsersInDB(filterDepatCollection, 'const', 'report', 'card');

			filterDepatCollection.forEach(({ id: userID }) => {
				[...constCollection].forEach(([ key, { id } ]) => {
					if (userID === id) {
						constCollection.delete(key);
					}
				});
			});
			filterDepatCollection.splice(0);

			clearObject();
			dataAdd();

			if (!constCollection.size) {
				const options = {
					page: 'const',
					header: {}
				};

				renderheader.renderHeaderPage(options);
			}

			countItems();
			localStorage.removeItem(page);
		} else {
			$('.info__item--warn').show();
		}
	});
}

function clearObject() {
	constObject.nameid = '';
	constObject.longname = '';
	constObject.shortname = '';
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
			const userID = $(target).parents('.table__row').data('id');
			let collectionID;

			[...constCollection].forEach(([ key, { id } ]) => {
				if (userID === +id) {
					collectionID = key;
				}
			});

			setDataInTable(collectionID);
		}
	});
}

function convertCardIDInCardName(nameTable = '#tableConst') {
	$(`${nameTable} .table__content`).click(({ target }) => {
		if (!$(target).hasClass('table__input')) return;

		$('.table__input').on('input', ({ target }) => {
			const cardIdVal = $(target).val().trim();
			const convertNumCard = convert.convertCardId(cardIdVal);
			const userID = $(target).parents('.table__row').data('id');
			const cardObj = {
				cardid: cardIdVal,
				cardname: convertNumCard
			};
			let collectionID;

			if (!convertNumCard) {
				$(target).parents('.main').find('.info__item--error').show();

				return;
			}

			[...constCollection].forEach(([ key, { id } ]) => {
				if (userID === +id) {
					collectionID = key;
				}
			});

			setDataInTable(collectionID, cardObj);
			checkInvalidValueCardID();
		});
	});
}

function setDataInTable(userID, cardObj, page = 'const') {
	const user = constCollection.get(userID);
	user.cardid = cardObj ? cardObj.cardid : '';
	user.cardname = cardObj ? cardObj.cardname : '';
	const allStatusUsers = [...constCollection.values()].some(({ cardid }) => cardid);

	if (!allStatusUsers) {
		localStorage.removeItem(page);
	} else {
		setDataInStorage();
	}

	showActiveDataOnPage();
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

	$(`.switch--${page}`).click(({ target }) => {
		if (!$(target).hasClass('switch__input')) return;

		const statusSwitch = $(target).prop('checked');

		if (statusSwitch && !markInterval) {
			localStorage.removeItem(page);

			getDataFromDB('const', 'card');

			markInterval = setInterval(() => {
				getDataFromDB('const', 'card');
			}, timeReload);
		} else if (!statusSwitch && markInterval) {
			clearInterval(markInterval);

			markInterval = false;
		}
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

function getDataFromDB(nameTable, typeTable) {
	$.ajax({
		url: "./php/output-request.php",
		method: "post",
		dataType: "html",
		data: {
			nameTable,
			typeTable
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

function getDepartmentFromDB() {
	$.ajax({
		url: "./php/output-request.php",
		method: "post",
		dataType: "html",
		async: false,
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
	const recipient = settingsObject.email;
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
	const filterNameDepart = filterDepart();

	$(`.tab--${page}`).html('');

	filterNameDepart.forEach((item) => {
		departmentCollection.forEach(({ nameid = '', shortname = '' }) => {
			if (item === nameid) {
				const tabItem = {
					nameid,
					shortname,
					status: constObject.nameid === nameid
				};

				$(`.tab--${page}`).append(templateConstTabs(tabItem));
			}
		});
	});
}

function changeTabs(page = 'const') {
	$(`.tab--${page}`).click(({ target }) => {
		if (!$(target).parents('.tab__item').length && !$(target).hasClass('tab__item')) return;

		const activeDepart = $(target).closest('.tab__item').data('depart');
		constObject.nameid = activeDepart;

		addTabs();
		showActiveDataOnPage();

		localStorage.removeItem(page); // в самом конце, т.к. функции выше записывают в localStorage
	});
}

function filterDepart() {
	const arrayDepart = [...constCollection.values()].map(({ nameid }) => nameid);

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
