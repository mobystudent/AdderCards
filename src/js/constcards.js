'use strict';

import $ from 'jquery';
import { nameDeparts } from './nameDepart.js';
import convert from './convert.js';

const constCollection = new Map(); // БД пользователей которым разрешили выдачу карт
// const constFillOutCardCollection = new Set(); // БД постоянных карт с присвоеными id
// const constReportCollection = new Set(); // БД постоянных карт с присвоеными id для отчета

$(window).on('load', () => {
	getDatainDB();
	submitIDinBD();
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
			<div class="table__cell table__cell--body table__cell--clear">
				<button class="table__btn table__btn--clear" type="button">
					<svg class="icon icon--clear">
						<use class="icon__item" xlink:href="#clear"></use>
					</svg>
				</button>
			</div>
			<div class="table__cell table__cell--body table__cell--signature">
				<span class="table__text table__text--body">Подпись</span>
			</div>
		</div>
	`;
}

// function renderTable(nameTable = '#tableConst') {
// 	$(nameTable)
// 		.html('')
// 		.append(`
// 			<div class="table__content table__content--active">
// 			</div>
// 		`);
//
// 	timeCollection.forEach((item) => {
// 		$(`${nameTable} .table__content`).append(templateTimeTable(item));
// 	});
// }

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

	array.forEach((elem) => {
		const indexCollection = constCollection.size;
		const itemObject = Object.assign({}, objToCollection);

		for (const itemField in itemObject) {
			for (const key in elem) {
				if (itemField === key) {
					itemObject[itemField] = elem[key];
				} else if (itemField === 'id') {
					itemObject[itemField] = indexCollection;
				}
			}
		}

		constCollection.set(indexCollection, itemObject);
	});

	dataAdd(nameTable);
}

function dataAdd(nameTable) {
	const filterNameDepart = filterDepart(constCollection);

	viewAllCount(constCollection, 'const');

	if (constCollection.size) {
		$(`${nameTable} .table__nothing`).hide();
	} else {
		addEmptySign(nameTable);
		countItems(filterNameDepart[0], 'const');

		return;
	}

	if (filterNameDepart.length > 1) {
		addTabs(constCollection, 'const');
		showActiveDataOnPage(constCollection , nameTable, 'const', filterNameDepart[0]);
		changeTabs(nameTable, 'const');
	} else {
		$(nameTable)
			.html('')
			.append(`
				<div class="table__content table__content--active">
				</div>
			`);
		$(`.tab--const`).html('');

		constCollection.forEach((user) => {
			const { nameid = '', department = '' } = user;

			showTitleDepart(department, nameid, 'const');

			$(`${nameTable} .table__content--active`).append(templateConstTable(user));
		});

		convertCardIDInCardName();
		clearNumberCard();
	}
}

function showActiveDataOnPage(collection, nameTable, modDepart, nameDepart) {
	$(`.tab--${modDepart} .tab__item`).removeClass('tab__item--active');
	$(`.tab__item[data-depart=${nameDepart}]`).addClass('tab__item--active');

	$(nameTable)
		.html('')
		.append(`
			<div class="table__content table__content--active">
			</div>
		`);

	collection.forEach((user) => {
		if (user.nameid == nameDepart) {
			$(`${nameTable} .table__content--active`).append(templateConstTable(user));
		}
	});

	nameDeparts.forEach((depart) => {
		const { idName = '', longName = '' } = depart;

		if (idName == nameDepart) {
			showTitleDepart(longName, idName, modDepart);
		}
	});

	countItems(nameDepart, modDepart);
	convertCardIDInCardName();
	clearNumberCard();
}

function showTitleDepart(depart, id, modDepart) {
	$(`.main__depart--${modDepart}`).text(depart).attr({'data-depart': depart, 'data-id': id});
}

function submitIDinBD() {
	$('#submitConstCard').click(() => {
		const idActiveDepart = $('.main__depart--const').attr('data-id');
		const filterDepatCollection = [...constCollection.values()].filter((user) => user.nameid == idActiveDepart);
		const identifiedItems = filterDepatCollection.every((user) => user.cardid);

		console.log(identifiedItems);

		if (identifiedItems) {
			const idFilterUsers = filterDepatCollection.map((item) => item.id);

			constCollection.forEach((item) => {
				item.date = getCurrentDate();
			});

			console.log(constCollection);

			return;

			setAddUsersInDB([...constCollection.values()], 'constcard', 'report');

			filterDepatCollection.splice(0);
			idFilterUsers.forEach((key) => {
				constCollection.delete(key);
			});

			dataAdd('#tableConst');

			if (!constCollection.size) {
				showTitleDepart('', '', 'const');
			}

			$('.info__warn').hide();
		} else {
			$('.info__warn').show();
		}

		// console.warn(constFillOutCardCollection); // пойдет в БД
		// console.warn(constReportCollection); // пойдет в отчет
		// createObjectForBD();
		// constFillOutCardCollection.clear();
	});
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

function addEmptySign(nameTable) {
	$(nameTable)
		.addClass('table__body--empty')
		.html('')
		.append(`
			<p class="table__nothing">Новых данных нет</p>
		`);
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

function clearNumberCard() {
	$('.table__content').click((e) => {
		if ($(e.target).closest('.table__btn--clear').hasClass('table__btn--clear')) {
			setDataInTable(e.target, '', '');
		}
	});
}

function convertCardIDInCardName(nameTable = '#tableConst') {
	$(`${nameTable} .table__content`).click((e) => {
		if (!$(e.target).hasClass('table__input')) return;

		$('.table__input').on('input', (e) => {
			const cardIdVal = $(e.target).val().trim();
			const convertNumCard = convert.convertCardId(cardIdVal);

			if (!convertNumCard) {
				$(e.target).parents('.main').find('.info__item--error').show();

				return;
			}

			setDataInTable(e.target, cardIdVal, convertNumCard);
			checkInvalidValueCardID('const');
			// focusNext(e.target);
			// dataAdd('#tableConst');
		});
	});
}

function setDataInTable(item, cardid, cardname) {
	const userID = $(item).parents('.table__row').data('id');
	const nameDepart = $('.main__depart--const').attr('data-id');

	constCollection.forEach((user) => {
		if (user.id === userID) {
			user.cardid = cardid;
			user.cardname = cardname;
		}
	});

	showActiveDataOnPage(constCollection ,'#tableConst', 'const', nameDepart);
}

function checkInvalidValueCardID(namePage) {
	const checkValueCard = [...constCollection.values()].every((user) => {
		if (user.cardid) {
			return convert.convertCardId(user.cardid);
		}
	});

	if (checkValueCard) $(`.main[data-name=${namePage}]`).find('.info__item--error').hide();
}

function focusNext(item) {
	const nextRow = $(item).parents('.table__row').next();

	if (nextRow) {
		$(nextRow).find('.table__input').focus();
	}
}

// Общие функции с картами и кодами
function countItems(idDepart, modDepart) {
	const countItemfromDep = [...constCollection.values()].filter((user) => user.nameid === idDepart);

	$(`.main__count--${modDepart}`).text(countItemfromDep.length);
}

function viewAllCount(collection, modDepart) {
	$(`.main__count--all-${modDepart}`).text(collection.size);
}

function addTabs(collection, modDepart) {
	const filterNameDepart = filterDepart(collection);

	$(`.tab--${modDepart}`).html('');

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

function changeTabs(nameTable, modDepart) {
	$(`.tab--${modDepart}`).click((e) => {
		if (!$(e.target).parents('.tab__item').length && !$(e.target).hasClass('tab__item')) return;

		const nameDepart = $(e.target).closest('.tab__item').data('depart');

		showActiveDataOnPage(constCollection, nameTable, modDepart, nameDepart);
	});
}

function filterDepart(collection) {
	const arrayDepart = [...collection.values()].reduce((acc, item) => {
		acc.push(item.nameid);
		return acc;
	}, []);
	const filterIdDepart = new Set(arrayDepart);

	return [...filterIdDepart];
}

function getDatainDB() {
	$.ajax({
		url: "./php/const-card-get.php",
		method: "post",
		success: function(data) {
			const dataFromDB = JSON.parse(data);

			userFromDB(dataFromDB);
		},
		error: function(data) {
			console.log(data);
		}
	});
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

export default {

};
