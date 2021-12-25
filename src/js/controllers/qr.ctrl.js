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
});

function renderHeaderPage(page = 'qr') {
	$(`.main[data-name=${page}] .main__title-wrap`).html('');
	$(`.main[data-name=${page}] .container`).prepend(pageTitle(qrObject));
}

function renderTable() {
	if (!qrCollection.size) {
		return `<p class="table__nothing">Новых данных нет</p>`;
	} else {
		return [...qrCollection.values()].reduce((content, item) => {
			if (item.nameid === qrObject.nameid) {
				content += table(item, qrObject);
			}

			return content;
		}, '');
	}
}

function renderQRItems(array) {
	$('.document').html('');
	$('.document').append(qrItems(array, qrObject));
}

function renderTabs() {
	if (filterDepart().length > 1) {
		return filterDepart().reduce((content, item) => {
			let tabItem;

			departmentCollection.forEach(({ nameid = '', shortname = '' }) => {
				if (item === nameid) {
					tabItem = {
						nameid,
						shortname,
						status: qrObject.nameid === nameid
					};
				}
			});

			content += tabs(tabItem);

			return content;
		}, '');
	} else {
		return '';
	}
}

function renderSwitch() {
	return Object.values(qrSwitch).reduce((content, item) => {
		let switchText;
		let tooltip;

		if (item.type === 'assign') {
			switchText = item.status ? 'Ручное присвоение' : 'Автоприсвоение';
			tooltip = 'Если в данной опции выставлено автоприсвоение, тогда коды будут автоматически присвоены пользователям. Важно! При нехватке кодов для всех пользователей данная ф-я будет отключена. <br/> Если в данной опции выставлено ручное присваивание, тогда код будет присваеватся для каждого пользоватебя в отдельности.';
		} else {
			switchText = 'Автообновление';
			tooltip = 'Если данная опция включена, тогда при поступлении новых данных, они автоматически отобразятся в таблице. Перезагружать страницу не нужно.<br/> Рекомендуется отключить данную функцию при работе с данными в таблице!';
		}

		const switchItem = {
			switchText,
			tooltip,
			key: item
		};

		content += switchElem(switchItem);

		return content;
	}, '');
}

function renderCount() {
	return Object.values(qrCount).reduce((content, item) => {
		content += count(item);

		return content;
	}, '');
}

function renderInfo(errors = [], page = 'qr') {
	const info = [
		{
			type: 'warn',
			title: 'fields',
			message: 'Предупреждение! Не всем пользователям присвоен идентификатор.'
		},
		{
			type: 'warn',
			title: 'deficit',
			message: 'Предупреждение! Недостаточно qr-кодов для присвоения пользователям.'
		}
	];

	$(`.container--${page} .info`).html('');
	info.forEach((item) => {
		const { type, title, message } = item;

		errors.forEach((error) => {
			if (error === title) {
				$(`.container--${page} .info`).append(`
					<p class="info__item info__item--${type}">${message}</p>
				`);
			}
		});
	});
}

function render(page = 'qr') {
	$(`.container--${page} .wrap--content`).html('');
	$(`.container--${page} .wrap--content`).append(`
		<div class="main__wrap-info">
			<div class="main__cards">${renderCount()}</div>
			<div class="main__switchies">${renderSwitch()}</div>
		</div>
		<div class="wrap wrap--table">
			<header class="tab">${renderTabs()}</header>
			<div class="table">
				<header class="table__header">${headerTable(qrObject)}</header>
				<div class="table__body">${renderTable()}</div>
			</div>
		</div>
	`);

	autoRefresh();
	typeAssignCode();
	assignAllQR();
	if (filterDepart().length > 1) changeTabs();
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
	$(`.container--${page} .switch--assign`).click(({ target }) => {
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
		render();
	});
}

function assignCodes() {
	if (qrCollection.size > generateCollection.size && !qrObject.statusmanual) {
		renderInfo(['deficit']);

		return;
	} else {
		renderInfo();
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

function dataAdd() {
	qrObject.nameid = filterDepart()[0];

	getDepartmentFromDB();

	if (qrCollection.size) {
		showFieldsInHeaderTable();
	} else {
		return;
	}

	assignCodes();
	showActiveDataOnPage();
	render();
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
			renderInfo();

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
			renderInfo(['fields']);
		}
	});
}

function clearObject() {
	for (const key in qrObject) {
		qrObject[key] = '';
	}
}

function assignAllQR(page = 'qr') {
	$(`.container--${page} #assignAll`).click(({ target }) => {
		if (!$(target).hasClass('switch__input')) return;

		const filterDepartCollection = [...qrCollection.values()].filter(({ nameid }) => nameid === qrObject.nameid);
		qrObject.statusassign = $(target).prop('checked');

		if (filterDepartCollection.length > generateCollection.size) {
			qrObject.statusassign = false;

			renderInfo(['deficit']);

			return;
		} else {
			renderInfo();
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

		render();
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

	$(`.container--${page} .switch--refresh`).click(({ target }) => {
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

		render();
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


function changeTabs(page = 'qr') {
	$(`.container--${page} .tab`).click(({ target }) => {
		if (!$(target).parents('.tab__item').length && !$(target).hasClass('tab__item')) return;

		qrObject.nameid = $(target).closest('.tab__item').data('depart');

		if (qrObject.statusmanual) {
			resetControlSwitch();
		}

		showActiveDataOnPage();
		render();

		localStorage.removeItem(page); // в самом конце, т.к. функции выше записывают в localStorage
	});
}

function filterDepart() {
	const arrayDepart = [...qrCollection.values()].map(({ nameid }) => nameid);

	return [...new Set(arrayDepart)];
}

export default {

};
