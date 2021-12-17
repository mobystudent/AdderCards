'use strict';

import $ from 'jquery';
import QRCode from 'qrcode';
import service from '../service.js';
import messageMail from '../mail.js';
import { settingsObject, sendUsers } from './settings.ctrl.js';

import { table } from '../components/qr/table.tpl.js';
import { headerTable } from '../components/qr/header-table.tpl.js';
import { switchElem } from '../components/switch.tpl.js';
import { count } from '../components/count.tpl.js';
import { tabs } from '../components/tabs.tpl.js';
import { qrItems } from '../components/qr/qr-items.tpl.js';
import { pageTitle } from '../components/page-title.tpl.js';

const qrCollection = new Map(); // БД пользователей которым разрешили выдачу qr-кодов
const departmentCollection = new Map(); // Коллекция подразделений
const generateCollection = new Map(); // Коллекция сформированных qr-кодов
const qrObject = {
	page: 'Добавление QR-кодов пользователям',
	nameid: '',
	longname: '',
	shortname: '',
	statusmanual: '',
	statusassign: ''
};
const qrSwitch = {
	refresh: {
		type: 'refresh',
		status: false,
		marker: 0
	},
	assign: {
		type: 'assign',
		status: false
	}
};
const qrCount = {
	item: {
		title: 'Количество пользователей:&nbsp',
		get count() {
			return [...qrCollection.values()].filter(({ nameid }) => nameid === qrObject.nameid).length;
		}
	},
	all: {
		title: 'Общее количество пользователей:&nbsp',
		get count() {
			return qrCollection.size;
		}
	},
	generate: {
		title: 'Осталось сгенерированных QR:&nbsp',
		get count() {
			return generateCollection.size;
		}
	}
};

$(window).on('load', () => {
	getGeneratedQRFromDB();
	submitIDinBD();
	showDataFromStorage();
	typeAssignCode();
	renderSwitch();
});

function renderHeaderPage(page = 'qr') {
	$(`.main[data-name=${page}] .main__title-wrap`).html('');
	$(`.main[data-name=${page}] .container`).prepend(pageTitle(qrObject));
}

function renderTable(status, page = 'qr') {
	let stateTable;

	if (status == 'empty') {
		stateTable = `<p class="table__nothing">Новых данных нет</p>`;
	} else {
		stateTable = [...qrCollection.values()].reduce((content, item) => {
			if (item.nameid === qrObject.nameid) {
				content += table(item, qrObject);
			}

			return content;
		}, '');
	}

	$(`.table--${page}`).html('');
	$(`.table--${page}`).append(`
		<header class="table__header">${headerTable(qrObject)}</header>
		<div class="table__body">${stateTable}</div>
		`);

	assignAllQR();
	renderCount();
}

function renderQRItems(array) {
	$('.document').html('');
	$('.document').append(qrItems(array, qrObject));
}

function renderSwitch(page = 'qr') {
	$(`.main__wrap-info--${page} .main__switchies`).html('');

	for (let key in qrSwitch) {
		let switchText;
		let tooltip;

		if (qrSwitch[key].type === 'assign') {
			switchText = qrSwitch[key].status ? 'Ручное присвоение' : 'Автоприсвоение';
			tooltip = 'Если в данной опции выставлено автоприсвоение, тогда коды будут автоматически присвоены пользователям. Важно! При нехватке кодов для всех пользователей данная ф-я будет отключена. <br/> Если в данной опции выставлено ручное присваивание, тогда код будет присваеватся для каждого пользоватебя в отдельности.';
		} else {
			switchText = 'Автообновление';
			tooltip = 'Если данная опция включена, тогда при поступлении новых данных, они автоматически отобразятся в таблице. Перезагружать страницу не нужно.<br/> Рекомендуется отключить данную функцию при работе с данными в таблице!';
		}

		const item = {
			switchText,
			tooltip,
			key: qrSwitch[key]
		};

		$(`.main__wrap-info--${page} .main__switchies`).append(switchElem(item));
	}

	autoRefresh();
	typeAssignCode();
}

function renderCount(page = 'qr') {
	$(`.main__wrap-info--${page} .main__cards`).html('');
	for (let key in qrCount) {
		$(`.main__wrap-info--${page} .main__cards`).append(count(qrCount[key]));
	}
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
		const itemObject = { ...objToCollection };

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
	$(`.main__wrap-info--${page} .switch--assign`).click(({ target }) => {
		if (!$(target).hasClass('switch__input')) return;

		qrObject.statusmanual = $(target).prop('checked');
		qrSwitch.assign.status = qrObject.statusmanual;

		if (qrSwitch.refresh.status || qrSwitch.assign.status) {
			setDataInStorage();
		} else {
			localStorage.removeItem(page);
		}

		resetControlSwitch();
		renderSwitch();
		assignCodes();
		showFieldsInHeaderTable();
		renderTable('full');
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
		showFieldsInHeaderTable();
		renderTable('full');
	} else {
		renderTable('empty');

		return;
	}

	if (filterNameDepart.length > 1) {
		addTabs();
		changeTabs();
	} else {
		$(`.tab--${page}`).html('');
	}

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

		dataAdd();
	} else {
		getDataFromDB('const', 'qr');
		getGeneratedQRFromDB();
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
}

function showActiveDataOnPage() {
	departmentCollection.forEach((depart) => {
		const { nameid, shortname, longname } = depart;

		if (nameid === qrObject.nameid) {
			qrObject.shortname = shortname;
			qrObject.longname = longname;
		}
	});

	renderHeaderPage();
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
				[...qrCollection].forEach(([key, { id }]) => {
					if (userID === id) {
						qrCollection.delete(key);
					}
				});
				[...generateCollection].forEach(([key, { id }]) => {
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
			typeAssignCode();

			if (!qrCollection.size) {
				renderHeaderPage();
			}

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

		renderTable('full');
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

	$(`.main__wrap-info--${page} .switch--refresh`).click(({ target }) => {
		if (!$(target).hasClass('switch__input')) return;

		const statusSwitch = $(target).prop('checked');
		qrSwitch.refresh.status = statusSwitch;

		if (statusSwitch && qrSwitch.refresh.marker == false) {
			localStorage.removeItem(page);

			qrObject.statusassign = '';

			getDataFromDB('const', 'qr');
			getGeneratedQRFromDB();
			assignCodes();

			qrSwitch.refresh.marker = setInterval(() => {
				getDataFromDB('const', 'qr');
				getGeneratedQRFromDB();
			}, timeReload);
		} else if (!statusSwitch && qrSwitch.refresh.marker) {
			clearInterval(qrSwitch.refresh.marker);

			qrSwitch.refresh.marker = false;
		}

		if (qrSwitch.refresh.status || qrSwitch.assign.status) {
			setDataInStorage();
		} else {
			localStorage.removeItem(page);
		}

		renderSwitch();
	});
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
				// window.print();
				service.modal('success');

				sendMail({
					department: qrObject.longname,
					count: array.length,
					title: 'Добавлено',
					users: array
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

			generateCollection.clear();

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
	const sender = sendUsers.operator;
	const recipient = sendUsers.manager;
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

				$(`.tab--${page}`).append(tabs(tabItem));
			}
		});
	});
}

function changeTabs(page = 'qr') {
	$(`.tab--${page}`).click(({ target }) => {
		if (!$(target).parents('.tab__item').length && !$(target).hasClass('tab__item')) return;

		qrObject.nameid = $(target).closest('.tab__item').data('depart');

		if (qrObject.statusmanual) {
			resetControlSwitch();
		}

		addTabs();
		showActiveDataOnPage();
		renderTable('full');

		localStorage.removeItem(page); // в самом конце, т.к. функции выше записывают в localStorage
	});
}

function filterDepart() {
	const arrayDepart = [...qrCollection.values()].map(({ nameid }) => nameid);

	return [...new Set(arrayDepart)];
}

export default {

};
