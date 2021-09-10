'use strict';

import $ from 'jquery';
import service from './service.js';
import { nameDeparts } from './nameDepart.js';

const permissionCollection = new Map(); // БД пользователей при старте
const permisObject = {
	statusAllow: false,
	statusDisallow: false
};

$(window).on('load', () => {
	getDatainDB('permission');
	submitIDinBD();
	autoRefresh();
	confirmAllAllowDisallow();
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
		<div class="table__row table__row--permis ${rowClassView}" data-id="${id}">
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
	const { idname = '', shortname = '', status = '' } = data;
	const statusView = status ? 'tab__item--active' : '';

	return `
		<button class="tab__item ${statusView}" type="button" data-depart=${idname}>
			<span class="tab__name">${shortname}</span>
		</button>
	`;
}

function templatePermissionHeaderTable(data) {
	const { statusAllow = '', statusDisallow = '' } = data;
	const allowBtnValue = statusAllow ? 'Отменить' : 'Разрешить все';
	const disallowBtnValue = statusDisallow ? 'Отменить' : 'Запретить все';
	const allowBtnClassView = statusAllow ? 'btn--allow-cancel' : '';
	const disallowBtnClassView = statusDisallow ? 'btn--disallow-cancel' : '';
	const allowDiffClassView = statusDisallow ? 'btn--allow-disabled' : '';
	const disallowDiffClassView = statusAllow ? 'btn--disallow-disabled' : '';
	const allowBtnBlock = statusDisallow ? 'disabled="disabled"' : '';
	const disallowBtnBlock = statusAllow ? 'disabled="disabled"' : '';

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

function renderTable(activeDepart, nameTable = '#tablePermis') {
	$(`${nameTable} .table__content`).html('');

	permissionCollection.forEach((item) => {
		if (item.nameid == activeDepart) {
			$(`${nameTable} .table__content`).append(templatePermissionTable(item));
		}
	});
}

function renderHeaderTable(page) {
	$(`.table--${page} .table__header`).html('');
	$(`.table--${page} .table__header`).append(templatePermissionHeaderTable(permisObject));
}

function userFromDB(array, nameTable = '#tablePermis') {
	const objToCollection = {
		id: '',
		fio: '',
		post: '',
		nameid: '',
		statusid: '',
		statustitle: '',
		department: '',
		statususer: '',
		statuspermis: ''
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

		permissionCollection.set(i, itemObject);
	});

	dataAdd(nameTable);
}

function dataAdd(nameTable, page = 'permis') {
	const filterNameDepart = filterDepart(permissionCollection);

	viewAllCount();

	if (permissionCollection.size) {
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
	clickAllowDisallowPermis();
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

function showTitleDepart(depart, id, page = 'permis') {
	$(`.main__depart--${page}`).text(depart).attr({'data-depart': depart, 'data-id': id});
}

function submitIDinBD(page = 'permis', nameTable = '#tablePermis') {
	$('#submitPermis').click(() => {
		const activeDepart = $(`.main__depart--${page}`).attr('data-id');
		const filterDepatCollection = [...permissionCollection.values()].filter((user) => user.nameid == activeDepart);
		const checkedItems = filterDepatCollection.every((user) => user.statuspermis);

		if (checkedItems) {
			const allowItems = filterDepatCollection.filter((item) => item.statuspermis === 'allow');
			const disallowItems = filterDepatCollection.filter((item) => item.statuspermis === 'disallow');
			const idFilterUsers = filterDepatCollection.map((item) => item.id);

			if (allowItems.length) {
				delegationID(allowItems);
				setAddUsersInDB(allowItems, 'permission', 'remove');
			} else {
				disallowItems.forEach((item) => {
					item.date = getCurrentDate();
				});

				setAddUsersInDB(disallowItems, 'reject', 'add');
			}

			filterDepatCollection.splice(0);
			idFilterUsers.forEach((key) => {
				permissionCollection.delete(key);
			});

			dataAdd(nameTable);
			clickAllowDisallowPermis();
			resetControlBtns();
			confirmAllAllowDisallow();

			if (!permissionCollection.size) {
				showTitleDepart('', '');
			}

			$('.info__item--warn').hide();
		} else {
			$('.info__item--warn').show();
		}
	});
}

function delegationID(users) {
	const filterArrCards = users.filter((item) => item.statusid == 'newCard' || item.statusid == 'changeCard');
	const filterArrQRs = users.filter((item) => item.statusid == 'newQR' || item.statusid == 'changeQR');

	setAddUsersInDB(filterArrCards, 'const', 'add', 'card');
	setAddUsersInDB(filterArrQRs, 'const', 'add', 'qr');
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

function clickAllowDisallowPermis(nameTable = '#tablePermis') {
	$(`${nameTable} .table__content`).click((e) => {
		if (!$(e.target).hasClass('btn--allow') && !$(e.target).hasClass('btn--disallow')) return;

		const userID = $(e.target).parents('.table__row').data('id');
		const typeBtn = $(e.target).data('type');

		permissionCollection.forEach((item) => {
			if (item.id === userID) {
				const status = item[typeBtn] ? false : true;

				item.statususer = status ? true : false;
				item.statuspermis = typeBtn;
				item[typeBtn] = status;
				item.allowblock = typeBtn === 'disallow' && status ? true : false;
				item.disallowblock = typeBtn === 'allow' && status ? true : false;

				renderTable(item.nameid);
			}
		});
	});
}

function confirmAllAllowDisallow(page = 'permis') {
	$('#allowAll, #disallowAll').click((e) => {
		const typeBtn = $(e.target).data('type');
		const statusTypeBtn = typeBtn === 'allow' ? 'statusAllow' : 'statusDisallow';
		const activeDepart = $(`.main__depart--${page}`).attr('data-id');

		permisObject[statusTypeBtn] = permisObject[statusTypeBtn] ? false : true;

		permissionCollection.forEach((item) => {
			if (item.nameid === activeDepart) {
				item.statususer = permisObject[statusTypeBtn] ? true : false;
				item.statuspermis = typeBtn;
				item.allow = '';
				item.disallow = '';
				item.allowblock = permisObject[statusTypeBtn] ? true : false;
				item.disallowblock = permisObject[statusTypeBtn] ? true : false;
			}
		});

		renderHeaderTable(page);
		renderTable(activeDepart);
		confirmAllAllowDisallow();
	});
}

function resetControlBtns(nameTable = '#tablePermis', page = 'permis') {
	const activeDepart = $(`.main__depart--${page}`).attr('data-id');

	permisObject.statusAllow = '';
	permisObject.statusDisallow = '';

	$(`${nameTable} .table__content`).html('');

	permissionCollection.forEach((item) => {
		if (item.nameid == activeDepart) {
			item.statususer = '';
			item.statuspermis = '';
			item.allow = '';
			item.disallow = '';
			item.allowblock = '';
			item.disallowblock = '';

			$(`${nameTable} .table__content`).append(templatePermissionTable(item));
		}
	});

	renderHeaderTable(page);
}

function autoRefresh(nameTable = '#tablePermis', page = 'permis') {
	const timeReload = 15000 * 15;  //  15 минут
	let markInterval;

	$(`.switch--${page}`).click((e) => {
		const statusSwitch = $(e.currentTarget).find('.switch__input').prop('checked');

		permissionCollection.clear();

		if (statusSwitch && !markInterval) {
			getDatainDB('permission');

			markInterval = setInterval(() => {
				getDatainDB('permission');
			}, timeReload);
		} else {
			clearInterval(markInterval);

			markInterval = false;
		}

		getDatainDB('permission');
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

function getDatainDB(nameTable) {
	$.ajax({
		url: "./php/output-request.php",
		method: "post",
		dataType: "html",
		data: {
			nameTable: nameTable
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
function countItems(activeDepart, page = 'permis') {
	const countItemfromDep = [...permissionCollection.values()].filter((user) => user.nameid === activeDepart);

	$(`.main__count--${page}`).text(countItemfromDep.length);
}

function viewAllCount(page = 'permis') {
	$(`.main__count--all-${page}`).text(permissionCollection.size);
}

function addTabs(activeTab, page = 'permis') {
	const filterNameDepart = filterDepart(permissionCollection);

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

					$(`.tab--${page}`).append(templatePermissionTabs(objTab));
				}
			});
		});
	}
}

function changeTabs(page = 'permis') {
	$(`.tab--${page}`).click((e) => {
		if (!$(e.target).parents('.tab__item').length && !$(e.target).hasClass('tab__item')) return;

		const activeDepart = $(e.target).closest('.tab__item').data('depart');

		addTabs(activeDepart);
		showActiveDataOnPage(activeDepart);
		resetControlBtns();
		confirmAllAllowDisallow();
	});
}

function filterDepart(collection) {
	const arrayDepart = [...collection.values()].map((item) => item.nameid);

	return [...new Set(arrayDepart)];
}

export default {
};
