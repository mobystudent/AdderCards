'use strict';

import $ from 'jquery';
import QRCode from 'qrcode';
import service from './service.js';
import messageMail from './mail.js';
import settingsObject from './settings.js';
import renderheader from './parts/renderheader.js';

const qrCollection = new Map(); // БД пользователей которым разрешили выдачу qr-кодов
const departmentCollection = new Map(); // Коллекция подразделений
const generateCollection = new Map(); // Коллекция сформированных qr-кодов
const qrObject = {
	nameid: '',
	longname: '',
	shortname: ''
};

$(window).on('load', () => {
	getGeneratedQRFromDB();
	submitIDinBD();
	printReport();
	autoRefresh();
	showDataFromStorage();
});

function templateQRTable(data) {
	const { id = '', fio = '', post  = '', cardid = '', cardname = '', statustitle = '' } = data;

	return `
		<div class="table__row table__row--time" data-id="${id}">
			<div class="table__cell table__cell--body table__cell--fio">
				<span class="table__text table__text--body">${fio}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--post">
				<span class="table__text table__text--body">${post}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--cardid">
				<span class="table__text table__text--body">${cardid}</span>
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
		</div>
	`;
}

function templateQRItems(users) {
	const qrBlocks = users.reduce((grid, user) => {
		const { fio = '', post = '', pictureurl = '' } = user;
		const fioArr = fio.split(' ');
		let fullName = '';

		if (fioArr.length <= 3) {
			fullName = fioArr.reduce((acc, elem) => {
				const templateName = `<span>${elem}</span>`;

				acc += templateName;

				return acc;
			}, '');
		} else {
			fullName = `<p>${fio}</p>`;
		}

		grid += `
			<article class="document__item">
				<img class="document__code" src="${pictureurl}" alt="qr code" />
				<h3 class="document__name">${fullName}</h3>
				<span class="document__post">${post}</span>
				<p class="document__instruct">Скачайте с Google Play или App Store приложение UProx и отсканируейте через него QR-код.</p>
			</article>
		`;

		return grid;
	}, '');

	return `
		<h2 class="document__depart">${qrObject.longname}</h2>
		<span class="document__count">Количество qp-кодов: ${users.length}</span>
		<div class="document__grid">
			${qrBlocks}
		</div>
	`;
}

function templateQRTabs(data) {
	const { nameid = '', shortname = '', status = '' } = data;
	const statusView = status ? 'tab__item--active' : '';

	return `
		<button class="tab__item ${statusView}" type="button" data-depart=${nameid}>
			<span class="tab__name">${shortname}</span>
		</button>
	`;
}

function renderTable(nameTable = '#tableQR') {
	$(`${nameTable} .table__content`).html('');

	qrCollection.forEach((item) => {
		if (item.nameid === qrObject.nameid) {
			$(`${nameTable} .table__content`).append(templateQRTable(item));
		}
	});
}

function renderQRItems(array) {
	$('.document').html('');
	$('.document').append(templateQRItems(array));
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
		codepicture: '',
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

		qrCollection.set(i, itemObject);
	});

	assignQRToUsers();
	setDataInStorage();
	dataAdd();
}

function assignQRToUsers(page = 'qr') {
	const statusDificit = qrCollection.size > generateCollection.size ? 'show' : 'hide';
	const statusUsers = !qrCollection.size ? 'show' : 'hide';
	const valid = [statusDificit, statusUsers].every((mess) => mess === 'hide');

	$(`.main[data-name=${page}]`).find('.info__item--warn.info__item--deficit')[statusDificit]();
	$(`.main[data-name=${page}]`).find('.info__item--warn.info__item--users')[statusUsers]();

	if (valid) {
		qrCollection.forEach((user, i) => {
			generateCollection.forEach((code, j) => {
				if (i === j) {
					const { id, codepicture, cardid, cardname } = code;

					user.codeid = id;
					user.codepicture = codepicture;
					user.cardid = cardid;
					user.cardname = cardname;

					generateCollection.delete(j);
				}
			});
		});

		createQRCode(qrCollection);
	}
}

function dataAdd(page = 'qr') {
	const filterNameDepart = filterDepart();
	qrObject.nameid = filterNameDepart[0];

	viewAllCount();
	getDepartmentFromDB();
	viewGenerateCount();

	if (qrCollection.size) {
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
}

function showDataFromStorage(page = 'qr') {
	const storageCollection = JSON.parse(localStorage.getItem(page));

	if (storageCollection && storageCollection.collection.length && !qrCollection.size) {
		storageCollection.collection.forEach((item, i) => {
			const itemID = storageCollection.collection[i].id;

			qrCollection.set(itemID, item);
		});

		dataAdd();
	} else {
		getDataFromDB('const', 'qr');
	}
}

function setDataInStorage(page = 'qr') {
	localStorage.setItem(page, JSON.stringify({
		collection: [...qrCollection.values()]
	}));
}

function showActiveDataOnPage() {
	departmentCollection.forEach((depart) => {
		const { nameid, shortname, longname } = depart;

		if (nameid === qrObject.nameid) {
			qrObject.shortname = shortname;
			qrObject.longname = longname;
		}
	});

	const options = {
		page: 'qr',
		header: {
			longname: qrObject.longname,
			nameid: qrObject.nameid
		}
	};

	renderheader.renderHeaderPage(options);
	renderTable();
	countItems();
}

function submitIDinBD(page = 'qr') {
	$('#submitConstQR').click(() => {
		const filterDepatCollection = [...qrCollection.values()].filter(({ nameid }) => nameid == qrObject.nameid);
		const checkedItems = filterDepatCollection.every(({ cardid }) => cardid);

		if (checkedItems) {
			$(`.main[data-name=${page}]`).find('.info__item--warn.info__item--fields').hide();

			qrCollection.forEach((item) => {
				if (item.nameid === qrObject.nameid) {
					item.date = service.getCurrentDate();
				}
			});

			renderQRItems(filterDepatCollection);
			setAddUsersInDB(filterDepatCollection, 'const', 'report', 'qr');

			filterDepatCollection.forEach(({ id: userID }) => {
				[...qrCollection].forEach(([ key, { id } ]) => {
					if (userID === id) {
						qrCollection.delete(key);
					}
				});
			});
			filterDepatCollection.splice(0);

			clearObject();
			dataAdd();

			if (!qrCollection.size) {
				const options = {
					page: 'qr',
					header: {}
				};

				renderheader.renderHeaderPage(options);
			}

			countItems();
			localStorage.removeItem(page);
		} else {
			$(`.main[data-name=${page}]`).find('.info__item--warn.info__item--fields').show();
		}
	});
}

function clearObject() {
	qrObject.nameid = '';
	qrObject.longname = '';
	qrObject.shortname = '';
}

function emptySign(status, nameTable = '#tableQR') {
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

function createQRCode(users) {
	users.forEach((user) => {
		QRCode.toDataURL(user.codepicture)
		.then((url) => {
			user.pictureurl = url;
		})
		.catch((error) => {
			service.modal('qr');
			console.log(error);
		});
	});
}

function autoRefresh(page = 'qr') {
	const timeReload = 60000 * settingsObject.autoupdatevalue;
	let markInterval;

	$(`.switch--${page}`).click(({ target }) => {
		if (!$(target).hasClass('switch__input')) return;

		const statusSwitch = $(target).prop('checked');

		if (statusSwitch && !markInterval) {
			localStorage.removeItem(page);

			getDataFromDB('const', 'qr');

			markInterval = setInterval(() => {
				getDataFromDB('const', 'qr');
			}, timeReload);
			$(target).next().removeClass('switch__name--disabled');
		} else if (!statusSwitch && markInterval) {
			clearInterval(markInterval);

			markInterval = false;
			$(target).next().addClass('switch__name--disabled');
		}
	});
}

function viewGenerateCount(page = 'qr') {
	$(`.main__count--generate-${page}`).text(generateCollection.size);
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
				department: qrObject.longname,
				count: qrCollection.size,
				title: 'Добавлено',
				users: [...qrCollection.values()]
			});
		},
		error: () => {
			service.modal('error');
		}
	});
}

function getGeneratedQRFromDB() {
	$.ajax({
		url: "./php/output-request.php",
		method: "post",
		dataType: "html",
		async: false,
		data: {
			nameTable: 'download'
		},
		success: (data) => {
			const dataFromDB = JSON.parse(data);

			dataFromDB.forEach((item, i) => {
				generateCollection.set(i, item);
			});
		},
		error: () => {
			service.modal('download');
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
function countItems(page = 'qr') {
	const countItemfromDep = [...qrCollection.values()].filter(({ nameid }) => nameid === qrObject.nameid);

	$(`.main__count--${page}`).text(countItemfromDep.length);
}

function viewAllCount(page = 'qr') {
	$(`.main__count--all-${page}`).text(qrCollection.size);
}

function printReport(page = 'qr') {
	$(`.main[data-name=${page}] .btn--print`).click(() => {
		window.print();
	});
}

function addTabs(page = 'qr') {
	const filterNameDepart = filterDepart();

	$(`.tab--${page}`).html('');

	filterNameDepart.forEach((item) => {
		departmentCollection.forEach(({ nameid = '', shortname = '' }) => {
			if (item === nameid) {
				const tabItem = {
					nameid,
					shortname,
					status: qrObject.nameid === nameid
				};

				$(`.tab--${page}`).append(templateQRTabs(tabItem));
			}
		});
	});
}

function changeTabs(page = 'qr') {
	$(`.tab--${page}`).click(({ target }) => {
		if (!$(target).parents('.tab__item').length && !$(target).hasClass('tab__item')) return;

		const activeDepart = $(target).closest('.tab__item').data('depart');
		qrObject.nameid = activeDepart;

		addTabs();
		showActiveDataOnPage();

		localStorage.removeItem(page); // в самом конце, т.к. функции выше записывают в localStorage
	});
}

function filterDepart() {
	const arrayDepart = [...qrCollection.values()].map(({ nameid }) => nameid);

	return [...new Set(arrayDepart)];
}

export default {

};
