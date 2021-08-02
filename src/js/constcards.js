'use strict';

import $ from 'jquery';
import { json } from './data.js';
import { nameDeparts } from './nameDepart.js';
import convert from './convert.js';

const constCollection = new Map(); // БД пользователей которым разрешили выдачу карт
// const constFillOutCardCollection = new Set(); // БД постоянных карт с присвоеными id
// const constReportCollection = new Set(); // БД постоянных карт с присвоеными id для отчета

$(window).on('load', () => {
	userdFromJSON();
	submitIDinBD();
});

function stringifyJSON() {
	const strJson = JSON.stringify(json);

	return strJson;
}

function userdFromJSON() {
	const dataArr = JSON.parse(stringifyJSON());
	const depart = Object.values(dataArr).map((item) => item);
	const objToCollection = {
		id: '',
		fio: '',
		post: '',
		nameid: '',
		cardid: '',
		cardname: '',
		statusid: '',
		statustitle: '',
		department: ''
	};

	depart.forEach((elem, i) => {
		const itemObject = Object.assign({}, objToCollection);

		for (const itemField in itemObject) {
			for (const key in elem) {
				if (itemField === key.toLocaleLowerCase()) {
					itemObject[itemField] = elem[key];
				} else if (itemField === 'id') {
					itemObject[itemField] = i;
				}
			}
		}

		constCollection.set(i, itemObject);
	});

	dataAdd('#tableConst');
}

function templateConstTable(data) {
	const { id = '', fio = '', post  = '', cardid = '', cardname = '', statustitle = '' } = data;
	let typeIDField = '';

	if (cardid) {
		typeIDField = `<span class="table__text table__text--body">${cardid}</span>`;
	} else {
		typeIDField = `<input class="table__input" />`;
	}

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

function dataAdd(nameTable) {
	const filterNameDepart = filterDepart(constCollection);

	viewAllCount(constCollection, 'const');

	if (constCollection.size) {
		$(`${nameTable} .table__nothing`).hide();
	} else {
		$(nameTable).addClass('table__body--empty').html('');
		$(nameTable).append(`
			<p class="table__nothing">Новых данных нет</p>
		`);

		countItems(filterNameDepart[0], 'const');
		
		return;
	}

	if (filterNameDepart.length > 1) {
		addTabs(constCollection, 'const');
		showActiveDataOnPage(constCollection , nameTable, 'const', filterNameDepart[0]);
		changeTabs(nameTable, 'const');
	} else {
		$(nameTable).html('');
		$(nameTable).append(`
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
	$(nameTable).html('');
	$(`.tab--${modDepart} .tab__item`).removeClass('tab__item--active');
	$(nameTable).append(`
		<div class="table__content table__content--active">
		</div>
	`);
	$(`.tab__item[data-depart=${nameDepart}]`).addClass('tab__item--active');

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

		console.log(constCollection);

		// valueFields.forEach((elem) => {
		// 	const objectWithDate = {};
		//
		// 	for (let key in elem) {
		// 		objectWithDate[key] = elem[key];
		// 	}
		// 	objectWithDate.date = getCurrentDate();
		//
		// });

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

function getCurrentDate() {
	const date = new Date();
	const currentDay = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
	const currentMonth = date.getMonth() < 10 ? `0${date.getMonth()}` : date.getMonth();
	const currentYear = date.getFullYear() < 10 ? `0${date.getFullYear()}` : date.getFullYear();

	return `${currentDay}-${currentMonth}-${currentYear}`;
}

function clearNumberCard() {
	$('.table__content').click((e) => {
		if ($(e.target).closest('.table__btn--clear').hasClass('table__btn--clear')) {
			setDataInTable(e.target, '', '');
		}
	});
}

function convertCardIDInCardName() {
	$('.table__input').on('input', (e) => {
		if (!$(e.target).hasClass('table__input')) return;

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
	const checkValueCard = [...constCollection.values()].every((user) => convert.convertCardId(user.cardid) || user.cardid === '');

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

export default {

};
