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
	shortname: '',
	statusmanual: '',
	statusassign: ''
};
const qrSwitch = {
	refresh: {
		type: 'refresh',
		status: false
	},
	assign: {
		type: 'assign',
		status: false
	}
};

$(window).on('load', () => {
	getGeneratedQRFromDB();
	submitIDinBD();
	showDataFromStorage();
	renderSwitch();
});

function templateQRTable(data) {
	const { id = '', fio = '', post  = '', cardid = '', cardname = '', statustitle = '' } = data;
	const assingBtnCheck = qrObject.statusassign ? 'checked="checked"' : '';
	const assignView = qrObject.statusmanual ? `
		<div class="table__cell table__cell--body table__cell--switch-assign">
			<div class="switch switch--item">
				<label class="switch__wrap switch__wrap--item">
					<input class="switch__input" type="checkbox" ${assingBtnCheck} disabled="disabled"/>
					<span class="switch__btn switch__btn--disabled"></span>
				</label>
			</div>
		</div>
	` : '';

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
			${assignView}
			<div class="table__cell table__cell--body table__cell--signature">
				<span class="table__text table__text--body"></span>
			</div>
		</div>
	`;
}

function templateQRHeaderTable() {
	const assingBtnCheck = qrObject.statusassign ? 'checked="checked"' : '';
	const assignView = qrObject.statusmanual ? `
		<div class="table__cell table__cell--header table__cell--switch-assign">
			<div class="switch switch--item">
				<label class="switch__wrap switch__wrap--item" id="assignAll">
					<input class="switch__input" type="checkbox" ${assingBtnCheck}/>
					<span class="switch__btn"></span>
				</label>
			</div>
		</div>
	` : '';

	return `
		<div class="table__cell table__cell--header table__cell--fio">
			<span class="table__text table__text--header">Фамилия Имя Отчество</span>
			<button class="btn btn--sort" type="button" data-direction="true"></button>
		</div>
		<div class="table__cell table__cell--header table__cell--post">
			<span class="table__text table__text--header">Должность</span>
			<button class="btn btn--sort" type="button" data-direction="true"></button>
		</div>
		<div class="table__cell table__cell--header table__cell--cardid">
			<span class="table__text table__text--header">ID qr-кода</span>
		</div>
		<div class="table__cell table__cell--header table__cell--cardname">
			<span class="table__text table__text--header">Номер qr-кода</span>
		</div>
		<div class="table__cell table__cell--header table__cell--statustitle">
			<span class="table__text table__text--header">Статус</span>
		</div>
		${assignView}
		<div class="table__cell table__cell--header table__cell--signature">
			<span class="table__text table__text--header">Подпись</span>
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

function templateQRSwitch(data, page = 'qr') {
	const { type, status } = data;
	const assingBtnCheck = qrSwitch[type].status ? 'checked="checked"' : '';
	const assingBtnClass = type === 'refresh' && !status ? 'switch__name--disabled' : '';
	let switchText;
	let tooltipInfo;

	if (type === 'assign') {
		switchText = status ? 'Ручное присвоение' : 'Автоприсвоение';
		tooltipInfo = 'Если в данной опции выставлено автоприсвоение, тогда коды будут автоматически присвоены пользователям. Важно! При нехватке кодов для всех пользователей данная ф-я будет отключена. <br/> Если в данной опции выставлено ручное присваивание, тогда код будет присваеватся для каждого пользоватебя в отдельности.';
	} else {
		switchText = 'Автообновление';
		tooltipInfo = 'Если данная опция включена, тогда при поступлении новых данных, они автоматически отобразятся в таблице. Перезагружать страницу не нужно.<br/> Рекомендуется отключить данную функцию при работе с данными в таблице!';
	}

	return `
		<div class="main__switch">
			<div class="tooltip">
				<span class="tooltip__item">!</span>
				<div class="tooltip__info tooltip__info--${type}">${tooltipInfo}</div>
			</div>
			<div class="switch switch--${type}-${page}">
				<label class="switch__wrap switch__wrap--head">
					<input class="switch__input" type="checkbox" ${assingBtnCheck}/>
					<small class="switch__btn"></small>
				</label>
				<span class="switch__name ${assingBtnClass}">${switchText}</span>
			</div>
		</div>
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

function renderHeaderTable(page = 'qr') {
	$(`.table--${page} .table__header`).html('');
	$(`.table--${page} .table__header`).append(templateQRHeaderTable());
}

function renderQRItems(array) {
	$('.document').html('');
	$('.document').append(templateQRItems(array));
}

function renderSwitch(page = 'qr') {
	$(`.main__wrap-info--${page} .main__switchies`).html('');
	for (let key in qrSwitch) {
		$(`.main__wrap-info--${page} .main__switchies`).append(templateQRSwitch(qrSwitch[key]));
	}

	autoRefresh();
	typeAssignCode();
}

function userFromDB(array) {
	const objToCollection = {
		id: '',
		fio: '',
		post: '',
		nameid: '',
		photofile: '',
		statusid: '', // посмотреть используется ли в отчете
		statustitle: '', // посмотреть используется ли в отчете
		department: '', // посмотреть используется ли в отчете
		сardvalidto: '',
		codeid: '',
		codepicture: '',
		cardid: '',
		cardname: '',
		pictureurl: ''
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

	dataAdd();
}

function typeAssignCode(page = 'qr') {
	$(`.switch--assign-${page}`).click(({ target }) => {
		if (!$(target).hasClass('switch__input')) return;

		qrObject.statusmanual = $(target).prop('checked');
		qrSwitch.assign.status = qrObject.statusmanual;

		if (qrSwitch.refresh.status || qrSwitch.assign.status) {
			setDataInStorage();
		} else {
			localStorage.removeItem(page);
		}

		resetControlSwitch();
		assignCodes();
		showFieldsInHeaderTable();
		renderTable();
	});
}

function assignCodes(page = 'qr') {
	if (qrCollection.size > generateCollection.size && !qrObject.statusmanual) {
		$(`.main[data-name=${page}]`).find('.info__item--warn.info__item--deficit').show();

		return;
	} else {
		$(`.main[data-name=${page}]`).find('.info__item--warn.info__item--deficit').hide();
	}

	if (!qrObject.statusmanual) {
		qrCollection.forEach((user, i) => {
			generateCollection.forEach((code, j) => {
				if (i === j) {
					const { id, codepicture, cardid, cardname } = code;

					user.codeid = id;
					user.codepicture = codepicture;
					user.cardid = cardid;
					user.cardname = cardname;
				}
			});
		});
	} else {
		assignAllQR();
	}
}

function dataAdd(page = 'qr') {
	const filterNameDepart = filterDepart();
	qrObject.nameid = filterNameDepart[0];

	getDepartmentFromDB();

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

	viewAllCount();
	showFieldsInHeaderTable();
	viewGenerateCount();
	assignCodes();
	showActiveDataOnPage();
}

function showDataFromStorage(page = 'qr') {
	const storageCollection = JSON.parse(localStorage.getItem(page));

	if (storageCollection && storageCollection.collection.length && !qrCollection.size) {
		const { statusmanual, statusassign } = storageCollection.controls;
		const { assign, refresh } = storageCollection.settings;

		storageCollection.collection.forEach((item, i) => {
			const itemID = storageCollection.collection[i].id;

			qrCollection.set(itemID, item);
		});

		qrObject.statusassign = statusassign;
		qrObject.statusmanual = statusmanual;
		qrSwitch.assign = assign;
		qrSwitch.refresh = refresh;

		renderHeaderTable();
		dataAdd();
	} else {
		getDataFromDB('const', 'qr');
	}
}

function setDataInStorage(page = 'qr') {
	localStorage.setItem(page, JSON.stringify({
		settings: qrSwitch,
		controls: qrObject,
		collection: [...qrCollection.values()]
	}));
}

function showFieldsInHeaderTable(page = 'qr') {
	const assignMod = qrObject.statusmanual ? '-manual' : '';
	const className = `wrap wrap--content wrap--content-${page}${assignMod}`;

	$(`.main[data-name="${page}"]`).find('.wrap--content').attr('class', className);

	renderHeaderTable();
	assignAllQR();
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
		const filterDepartCollection = [...qrCollection.values()].filter(({ nameid }) => nameid == qrObject.nameid);
		const checkedItems = filterDepartCollection.every(({ cardid }) => cardid);

		if (checkedItems) {
			$(`.main[data-name=${page}]`).find('.info__item--warn.info__item--fields').hide();

			qrCollection.forEach((item) => {
				if (item.nameid === qrObject.nameid) {
					item.date = service.getCurrentDate();
				}
			});

			setAddUsersInDB(filterDepartCollection, 'const', 'report', 'qr');

			filterDepartCollection.forEach(({ id: userID, codeid }) => {
				[...qrCollection].forEach(([ key, { id } ]) => {
					if (userID === id) {
						qrCollection.delete(key);
					}
				});
				[...generateCollection].forEach(([ key, { id } ]) => {
					if (codeid === id) {
						generateCollection.delete(key);
					}
				});
			});
			filterDepartCollection.splice(0);

			if (!qrObject.statusmanual) {
				clearObject();
				resetControlSwitch();
			} else {
				clearObject();
				qrObject.statusmanual = true;
			}

			dataAdd();
			renderHeaderTable();
			typeAssignCode();
			assignAllQR();

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
	for (const key in qrObject) {
		qrObject[key] = '';
	}
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

function assignAllQR(page = 'qr') {
	$(`.table--${page} #assignAll`).click(({ target }) => {
		if (!$(target).hasClass('switch__input')) return;

		const filterDepartCollection = [...qrCollection.values()].filter(({ nameid }) => nameid === qrObject.nameid);
		qrObject.statusassign = $(target).prop('checked');

		if (filterDepartCollection.length > generateCollection.size) {
			qrObject.statusassign = false;

			$(`.main[data-name=${page}]`).find('.info__item--warn.info__item--deficit').show();

			return;
		} else {
			$(`.main[data-name=${page}]`).find('.info__item--warn.info__item--deficit').hide();
		}

		if (qrObject.statusassign) {
			let counter = 0;

			qrCollection.forEach((user) => {
				if (user.nameid === qrObject.nameid && !user.codeid) {
					const { id, codepicture, cardid, cardname } = generateCollection.get(counter);

					user.codeid = id;
					user.codepicture = codepicture;
					user.cardid = cardid;
					user.cardname = cardname;

					counter++;
				}
			});
		} else {
			resetControlSwitch();
		}

		renderTable();
		setDataInStorage();
	});
}

function resetControlSwitch() {
	qrObject.statusassign = '';

	qrCollection.forEach((user) => {
		user.codeid = '';
		user.codepicture = '';
		user.cardid = '';
		user.cardname = '';
	});
}

function autoRefresh(page = 'qr') {
	const timeReload = 60000 * settingsObject.autoupdatevalue;
	let markInterval;

	$(`.switch--refresh-${page}`).click(({ target }) => {
		if (!$(target).hasClass('switch__input')) return;

		const statusSwitch = $(target).prop('checked');
		qrSwitch.refresh.status = statusSwitch;

		if (statusSwitch && !markInterval) {
			localStorage.removeItem(page);

			qrObject.statusassign = '';

			getDataFromDB('const', 'qr');
			assignCodes();

			markInterval = setInterval(() => {
				getDataFromDB('const', 'qr');
			}, timeReload);
		} else if (!statusSwitch && markInterval) {
			clearInterval(markInterval);

			markInterval = false;
		}

		if (qrSwitch.refresh.status || qrSwitch.assign.status) {
			setDataInStorage();
		} else {
			localStorage.removeItem(page);
		}

		renderSwitch();
	});
}

function viewGenerateCount(page = 'qr') {
	$(`.main__count--generate-${page}`).text(generateCollection.size);
}

function setAddUsersInDB(array, nameTable, action, typeTable) {
	new Promise((resolve) => {
		const filterUsers = [];

		qrCollection.forEach((user) => {
			if (user.codeid) {
				QRCode.toDataURL(user.codepicture)
				.then((url) => {
					user.pictureurl = url;

					filterUsers.push(user);
				})
				.catch((error) => {
					service.modal('qr');
					console.log(error);
				});
			}
		});

		setTimeout(() => {
			resolve(filterUsers);
		}, 0);
	}).then((array) => {
		renderQRItems(array);
	}).then(() => {
		$.ajax({
			url: "./php/change-user-request.php",
			method: "post",
			dataType: "html",
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

		if (qrObject.statusmanual) {
			resetControlSwitch();
			renderHeaderTable();
			assignAllQR();
		}

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
