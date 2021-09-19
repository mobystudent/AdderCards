'use strict';

import $ from 'jquery';
import service from './service.js';
import messageMail from './mail.js';

const permissionCollection = new Map(); // БД пользователей при старте
const departmentCollection = new Map();  // Коллекци подразделений
const permisObject = {
	statusAllow: false,
	statusDisallow: false
};

$(window).on('load', () => {
	submitIDinBD();
	autoRefresh();
	confirmAllAllowDisallow();
	showDataFromStorage();
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
	const { idname = '', shortname = '', status = '' } = data;
	const statusView = status ? 'tab__item--active' : '';

	return `
		<button class="tab__item ${statusView}" type="button" data-depart=${idname}>
			<span class="tab__name">${shortname}</span>
		</button>
	`;
}

function templatePermissionHeaderTable() {
	const allowBtnValue = permisObject.statusAllow ? 'Отменить' : 'Разрешить все';
	const disallowBtnValue = permisObject.statusDisallow ? 'Отменить' : 'Запретить все';
	const allowBtnClassView = permisObject.statusAllow ? 'btn--allow-cancel' : '';
	const disallowBtnClassView = permisObject.statusDisallow ? 'btn--disallow-cancel' : '';
	const allowDiffClassView = permisObject.statusDisallow ? 'btn--allow-disabled' : '';
	const disallowDiffClassView = permisObject.statusAllow ? 'btn--disallow-disabled' : '';
	const allowBtnBlock = permisObject.statusDisallow ? 'disabled="disabled"' : '';
	const disallowBtnBlock = permisObject.statusAllow ? 'disabled="disabled"' : '';

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

function renderHeaderTable(page = 'permis') {
	$(`.table--${page} .table__header`).html('');
	$(`.table--${page} .table__header`).append(templatePermissionHeaderTable());
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

	getDepartmentInDB('department');
	showActiveDataOnPage(filterNameDepart[0]);
	clickAllowDisallowPermis();
}

function showDataFromStorage(nameTable = '#tablePermis', page = 'permis') {
	const storageCollection = JSON.parse(localStorage.getItem(page));

	if (storageCollection && !permissionCollection.size) {
		const { statusAllow, statusDisallow } = storageCollection.controls;

		storageCollection.collection.forEach((item, i) => {
			const itemID = storageCollection.collection[i].id;

			permissionCollection.set(itemID, item);
		});

		permisObject.statusAllow = statusAllow;
		permisObject.statusDisallow = statusDisallow;

		renderHeaderTable();
		dataAdd(nameTable);
	} else {
		getDatainDB('permis');
	}
}

function setDataInStorage(page = 'permis') {
	localStorage.setItem(page, JSON.stringify({
		controls: permisObject,
		collection: [...permissionCollection.values()]
	}));
}

function showActiveDataOnPage(activeDepart) {
	departmentCollection.forEach((depart) => {
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
				setAddUsersInDB(allowItems, 'permis', 'remove');
			}

			if (disallowItems.length) {
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

			$(`.main__count--${page}`).text(permissionCollection.size);
			localStorage.removeItem(page);

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

		setDataInStorage();
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

		setDataInStorage();
		renderHeaderTable();
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

	setDataInStorage();
	renderHeaderTable();
}

function autoRefresh(page = 'permis') {
	const timeReload = 15000 * 15;  //  15 минут
	let markInterval;

	$(`.switch--${page}`).click((e) => {
		const statusSwitch = $(e.currentTarget).find('.switch__input').prop('checked');

		permissionCollection.clear();

		if (statusSwitch && !markInterval) {
			markInterval = setInterval(() => {
				getDatainDB('permis');
			}, timeReload);
		} else {
			clearInterval(markInterval);

			markInterval = false;
		}

		getDatainDB('permis');
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
			typeTable: typeTable,
			action: action,
			nameTable: nameTable,
			array: array
		},
		success: () => {
			const title = action === 'add' ? 'Отклонено' : 'Одобрено';

			service.modal('success');

			sendMail({
				department: nameDepart,
				count: array.length,
				title: title,
				users: array
			});
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
	const recipient = 'xahah55057@secbuf.com';
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
			departmentCollection.forEach((depart) => {
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

		localStorage.removeItem(page); // в самом конце, т.к. функции выше записывают в localStorage
	});
}

function filterDepart(collection) {
	const arrayDepart = [...collection.values()].map((item) => item.nameid);

	return [...new Set(arrayDepart)];
}

export default {
};
