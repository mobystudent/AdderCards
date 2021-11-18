'use strict';

import $ from 'jquery';
import service from './service.js';
import messageMail from './mail.js';
import settingsObject from './settings.js';
import renderheader from './parts/renderheader.js';

const permissionCollection = new Map(); // БД пользователей при старте
const departmentCollection = new Map();  // Коллекци подразделений
const permisObject = {
	statusallow: '',
	statusdisallow: '',
	nameid: '',
	longname: '',
	shortname: ''
};
const permisSwitch = {
	refresh: {
		type: 'refresh',
		status: false
	}
};
const permisCount = {
	item: {
		title: 'Количество пользователей:&nbsp',
		get count() {
			return [...permissionCollection.values()].filter(({ nameid }) => nameid === permisObject.nameid).length;
		}
	},
	all: {
		title: 'Общее количество пользователей:&nbsp',
		get count() {
			return permissionCollection.size;
		}
	}
};

$(window).on('load', () => {
	submitIDinBD();
	showDataFromStorage();
	renderSwitch();
});

function templatePermissionTable(data) {
	const { id = '', fio = '', post = '', statustitle = '', statususer = '', allow = '', disallow = '', allowblock = '', disallowblock = '' } = data;
	const rowClassView = statususer ? 'table__row--disabled' : '';
	const allowBtnValue = allow ? 'Отменить' : 'Разрешить';
	const disallowBtnValue = disallow ? 'Отменить' : 'Запретить';
	const allowBtnClassView = allow ? 'btn--allow-cancel' : '';
	const disallowBtnClassView = disallow ? 'btn--disallow-cancel' : '';
	const allowDiffClassView = allowblock ? 'btn--allow-disabled' : '';
	const disallowDiffClassView = disallowblock ? 'btn--disallow-disabled' : '';
	const allowBtnBlock = allowblock ? 'disabled="disabled"' : '';
	const disallowBtnBlock = disallowblock ? 'disabled="disabled"' : '';

	return `
		<div class="table__row ${rowClassView}" data-id="${id}">
			<div class="table__cell table__cell--body table__cell--fio">
				<span class="table__text table__text--body">${fio}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--post">
				<span class="table__text table__text--body">${post}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--statustitle">
				<span class="table__text table__text--body">${statustitle}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--btn-permis">
				<button class="btn btn--allow ${allowBtnClassView} ${allowDiffClassView}" type="button" data-type="allow" ${allowBtnBlock}>
					${allowBtnValue}
				</button>
				<button class="btn btn--disallow ${disallowBtnClassView} ${disallowDiffClassView}" type="button" data-type="disallow" ${disallowBtnBlock}>
					${disallowBtnValue}
				</button>
			</div>
		</div>
	`;
}

function templatePermissionTabs(data) {
	const { nameid = '', shortname = '', status = '' } = data;
	const statusView = status ? 'tab__item--active' : '';

	return `
		<button class="tab__item ${statusView}" type="button" data-depart=${nameid}>
			<span class="tab__name">${shortname}</span>
		</button>
	`;
}

function templatePermissionHeaderTable() {
	const allowBtnValue = permisObject.statusallow ? 'Отменить' : 'Разрешить все';
	const disallowBtnValue = permisObject.statusdisallow ? 'Отменить' : 'Запретить все';
	const allowBtnClassView = permisObject.statusallow ? 'btn--allow-cancel' : '';
	const disallowBtnClassView = permisObject.statusdisallow ? 'btn--disallow-cancel' : '';
	const allowDiffClassView = permisObject.statusdisallow ? 'btn--allow-disabled' : '';
	const disallowDiffClassView = permisObject.statusallow ? 'btn--disallow-disabled' : '';
	const allowBtnBlock = permisObject.statusdisallow ? 'disabled="disabled"' : '';
	const disallowBtnBlock = permisObject.statusallow ? 'disabled="disabled"' : '';

	return `
		<div class="table__cell table__cell--header table__cell--fio">
			<span class="table__text table__text--header">Фамилия Имя Отчество</span>
			<button class="btn btn--sort" type="button" data-direction="true"></button>
		</div>
		<div class="table__cell table__cell--header table__cell--post">
			<span class="table__text table__text--header">Должность</span>
			<button class="btn btn--sort" type="button" data-direction="true"></button>
		</div>
		<div class="table__cell table__cell--header table__cell--statustitle">
			<span class="table__text table__text--header">Статус</span>
		</div>
		<div class="table__cell table__cell--header table__cell--btn-permis">
			<button class="btn btn--allow ${allowBtnClassView} ${allowDiffClassView}" id="allowAll" type="button" data-type="allow" ${allowBtnBlock}>
				${allowBtnValue}
			</button>
			<button class="btn btn--disallow ${disallowBtnClassView} ${disallowDiffClassView}" id="disallowAll" type="button" data-type="disallow" ${disallowBtnBlock}>
				${disallowBtnValue}
			</button>
		</div>
	`;
}

function templatePermissionSwitch(data, page = 'permis') {
	const { type, status } = data;
	const assingBtnCheck = status ? 'checked="checked"' : '';
	const assingBtnClass = type === 'refresh' && !status ? 'switch__name--disabled' : '';
	let switchText;
	let tooltipInfo;

	if (type === 'refresh') {
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

function templatePermissionCount(data) {
	const { title, count } = data;

	return `
		<p class="main__count-wrap">
			<span class="main__count-text">${title}</span>
			<span class="main__count">${count}</span>
		</p>
	`;
}

function renderTable(nameTable = '#tablePermis') {
	$(`${nameTable} .table__content`).html('');

	permissionCollection.forEach((item) => {
		if (item.nameid === permisObject.nameid) {
			$(`${nameTable} .table__content`).append(templatePermissionTable(item));
		}
	});
}

function renderHeaderTable(page = 'permis') {
	$(`.table--${page} .table__header`).html('');
	$(`.table--${page} .table__header`).append(templatePermissionHeaderTable());
}

function renderSwitch(page = 'permis') {
	$(`.main__wrap-info--${page} .main__switchies`).html('');
	for (let key in permisSwitch) {
		$(`.main__wrap-info--${page} .main__switchies`).append(templatePermissionSwitch(permisSwitch[key]));
	}

	autoRefresh();
}

function renderCount(page = 'permis') {
	$(`.main__wrap-info--${page} .main__cards`).html('');
	for (let key in permisCount) {
		$(`.main__wrap-info--${page} .main__cards`).append(templatePermissionCount(permisCount[key]));
	}
}

function userFromDB(array) {
	const objToCollection = {
		id: '',
		fio: '',
		post: '',
		nameid: '',
		photofile: '',
		photourl: '',
		statusid: '',
		statustitle: '',
		department: '',
		statususer: '',
		сardvalidto: '',
		statuspermis: ''
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

		permissionCollection.set(i, itemObject);
	});

	dataAdd();
}

function dataAdd(page = 'permis') {
	const filterNameDepart = filterDepart();
	permisObject.nameid = filterNameDepart[0];

	getDepartmentFromDB();

	if (permissionCollection.size) {
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

	clickAllowDisallowPermis();
	confirmAllAllowDisallow();
	showActiveDataOnPage();
}

function showDataFromStorage(page = 'permis') {
	const storageCollection = JSON.parse(localStorage.getItem(page));

	if (storageCollection && storageCollection.collection.length && !permissionCollection.size) {
		const { statusallow, statusdisallow } = storageCollection.controls;
		const { refresh } = storageCollection.settings;

		storageCollection.collection.forEach((item, i) => {
			const itemID = storageCollection.collection[i].id;

			permissionCollection.set(itemID, item);
		});

		permisObject.statusallow = statusallow;
		permisObject.statusdisallow = statusdisallow;
		permisSwitch.refresh = refresh;

		renderHeaderTable();
		dataAdd();
	} else {
		getDataFromDB('permis');
	}
}

function setDataInStorage(page = 'permis') {
	localStorage.setItem(page, JSON.stringify({
		settings: permisSwitch,
		controls: permisObject,
		collection: [...permissionCollection.values()]
	}));
}

function showActiveDataOnPage() {
	departmentCollection.forEach((depart) => {
		const { nameid, shortname, longname } = depart;

		if (nameid === permisObject.nameid) {
			permisObject.shortname = shortname;
			permisObject.longname = longname;
		}
	});

	const options = {
		page: 'permis',
		header: {
			longname: permisObject.longname,
			nameid: permisObject.nameid
		}
	};

	renderheader.renderHeaderPage(options);
	renderTable();
	renderCount();
}

function submitIDinBD(page = 'permis') {
	$('#submitPermis').click(() => {
		const filterDepartCollection = [...permissionCollection.values()].filter(({ nameid }) => nameid === permisObject.nameid);
		const checkedItems = filterDepartCollection.every(({ statuspermis }) => statuspermis);

		if (checkedItems) {
			const allowItems = filterDepartCollection.filter(({ statuspermis }) => statuspermis === 'allow');
			const disallowItems = filterDepartCollection.filter(({ statuspermis }) => statuspermis === 'disallow');

			$('.info__item--warn').hide();

			if (allowItems.length) {
				delegationID(allowItems);
				setAddUsersInDB(allowItems, 'permis', 'remove');
			}

			if (disallowItems.length) {
				disallowItems.forEach((item) => {
					item.date = service.getCurrentDate();
				});

				setAddUsersInDB(disallowItems, 'reject', 'add', 'permis');
			}

			filterDepartCollection.forEach(({ id: userID }) => {
				[...permissionCollection].forEach(([ key, { id } ]) => {
					if (userID === id) {
						permissionCollection.delete(key);
					}
				});
			});
			filterDepartCollection.splice(0);

			clearObject();
			resetControlBtns();
			dataAdd();
			renderHeaderTable();
			confirmAllAllowDisallow();

			if (!permissionCollection.size) {
				const options = {
					page: 'permis',
					header: {}
				};

				renderheader.renderHeaderPage(options);
			}

			localStorage.removeItem(page);
		} else {
			$('.info__item--warn').show();
		}
	});
}

function delegationID(users) {
	const filterArrCards = users.filter(({ statusid }) => statusid === 'newCard' || statusid === 'changeCard');
	const filterArrQRs = users.filter(({ statusid }) => statusid === 'newQR' || statusid === 'changeQR');

	setAddUsersInDB(filterArrCards, 'const', 'add', 'card');
	setAddUsersInDB(filterArrQRs, 'const', 'add', 'qr');
}

function clearObject() {
	permisObject.nameid = '';
	permisObject.longname = '';
	permisObject.shortname = '';
}

function emptySign(status, nameTable = '#tablePermis') {
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

function clickAllowDisallowPermis(nameTable = '#tablePermis', page = 'permis') {
	$(`${nameTable} .table__content`).click(({ target }) => {
		if (!$(target).hasClass('btn--allow') && !$(target).hasClass('btn--disallow')) return;

		const userID = $(target).parents('.table__row').data('id');
		const typeBtn = $(target).data('type');

		permissionCollection.forEach((item) => {
			if (+item.id === userID) {
				const status = item[typeBtn] ? false : true;
				item.statususer = status ? true : false;
				item.statuspermis = typeBtn;
				item[typeBtn] = status;
				item.allowblock = typeBtn === 'disallow' && status ? true : false;
				item.disallowblock = typeBtn === 'allow' && status ? true : false;
			}
		});

		const allStatusUsers = [...permissionCollection.values()].some(({ statususer }) => statususer);

		if (!allStatusUsers) {
			localStorage.removeItem(page);
		} else {
			setDataInStorage();
		}

		renderTable();
	});
}

function confirmAllAllowDisallow(page = 'permis') {
	$(`.table--${page} #allowAll, .table--${page} #disallowAll`).click(({ target }) => {
		const typeBtn = $(target).data('type');
		const statusTypeBtn = typeBtn === 'allow' ? 'statusallow' : 'statusdisallow';
		permisObject[statusTypeBtn] = permisObject[statusTypeBtn] ? false : true;

		permissionCollection.forEach((item) => {
			if (item.nameid === permisObject.nameid) {
				item.statususer = permisObject[statusTypeBtn] ? true : false;
				item.statuspermis = typeBtn;
				item.allow = '';
				item.disallow = '';
				item.allowblock = permisObject[statusTypeBtn] ? true : false;
				item.disallowblock = permisObject[statusTypeBtn] ? true : false;
			}
		});

		if (!permisObject.statusallow && !permisObject.statusdisallow) {
			localStorage.removeItem(page);
		} else {
			setDataInStorage();
		}

		renderHeaderTable();
		renderTable();
		confirmAllAllowDisallow();
	});
}

function resetControlBtns() {
	permisObject.statusallow = '';
	permisObject.statusdisallow = '';

	permissionCollection.forEach((item) => {
		item.statususer = '';
		item.statuspermis = '';
		item.allow = '';
		item.disallow = '';
		item.allowblock = '';
		item.disallowblock = '';
	});
}

function autoRefresh(page = 'permis') {
	const timeReload = 60000 * settingsObject.autoupdatevalue;
	let markInterval;

	$(`.switch--refresh-${page}`).click(({ target }) => {
		if (!$(target).hasClass('switch__input')) return;

		const statusSwitch = $(target).prop('checked');
		permisSwitch.refresh.status = statusSwitch;

		if (statusSwitch && !markInterval) {
			localStorage.removeItem(page);
			permissionCollection.clear();

			getDataFromDB('permis');
			resetControlBtns();
			renderHeaderTable();
			confirmAllAllowDisallow();

			markInterval = setInterval(() => {
				getDataFromDB('permis');
			}, timeReload);
		} else if (!statusSwitch && markInterval) {
			clearInterval(markInterval);

			markInterval = false;
		}

		if (permisSwitch.refresh.status) {
			setDataInStorage();
		} else {
			localStorage.removeItem(page);
		}

		renderSwitch();
	});
}

function setAddUsersInDB(array, nameTable, action, typeTable, page = 'permis') {
	const nameDepart = $(`.main__depart--${page}`).attr('data-depart');

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
		success: () => {
			const title = action === 'add' ? 'Reject' : 'Approved';

			service.modal('success');

			sendMail({
				department: nameDepart,
				count: array.length,
				title,
				users: array
			});
		},
		error: () => {
			service.modal('error');
		}
	});
}

function getDataFromDB(nameTable) {
	$.ajax({
		url: "./php/output-request.php",
		method: "post",
		dataType: "html",
		data: {
			nameTable
		},
		async: false,
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
	const { title = '' } = obj;
	const sender = 'chepdepart@gmail.com';
	let subject;
	let recipient;

	if (title === 'Reject') {
		recipient = settingsObject.email;
		subject = 'Пользователи отклонены';
	} else {
		subject = 'Пользователи добавлены в БД';
	}

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
function addTabs(page = 'permis') {
	const filterNameDepart = filterDepart();

	$(`.tab--${page}`).html('');

	if (filterNameDepart.length > 1) {
		filterNameDepart.forEach((item) => {
			departmentCollection.forEach((depart) => {
				const { nameid = '', shortname = '' } = depart;

				if (item == nameid) {
					const tabItem = {
						nameid,
						shortname,
						status: permisObject.nameid === nameid ? true : false
					};

					$(`.tab--${page}`).append(templatePermissionTabs(tabItem));
				}
			});
		});
	}
}

function changeTabs(page = 'permis') {
	$(`.tab--${page}`).click(({ target }) => {
		if (!$(target).parents('.tab__item').length && !$(target).hasClass('tab__item')) return;

		const activeDepart = $(target).closest('.tab__item').data('depart');
		permisObject.nameid = activeDepart;

		resetControlBtns();
		renderHeaderTable();
		addTabs();
		showActiveDataOnPage();
		confirmAllAllowDisallow();

		localStorage.removeItem(page); // в самом конце, т.к. функции выше записывают в localStorage
	});
}

function filterDepart() {
	const arrayDepart = [...permissionCollection.values()].map(({ nameid }) => nameid);

	return [...new Set(arrayDepart)];
}

export default {
};
