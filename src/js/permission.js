'use strict';

import $ from 'jquery';
import { nameDeparts } from './nameDepart.js';

const permissionCollection = new Map(); // БД пользователей при старте

$(window).on('load', () => {
	getDatainDB('permission');
	submitIDinBD();
	autoRefresh();
});

function templatePermissionTable(data) {
	const { id = '', fio = '', post = '', statustitle = '' } = data;

	return `
		<div class="table__row table__row--permis" data-id="${id}">
			<div class="table__cell table__cell--body table__cell--fio">
				<span class="table__text table__text--body">${fio}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--post">
				<span class="table__text table__text--body">${post}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--statustitle">
				<span class="table__text table__text--body">${statustitle}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--control">
				<button class="btn btn--allow" data-type="allow" data-cancel="Отменить" data-allow="Разрешить" type="button">
					Разрешить
				</button>
				<button class="btn btn--disallow" data-type="disallow" data-cancel="Отменить" data-disallow="Запретить" type="button">
					Запретить
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

function userdFromDB(array) {
	const objToCollection = {
		id: '',
		fio: '',
		post: '',
		nameid: '',
		statusid: '',
		statustitle: '',
		department: '',
		statuspermiss: ''
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

	dataAdd('#tablePermis');
	confirmAllAllowDisallow();
}

function dataAdd(nameTable) {
	const filterNameDepart = filterDepart(permissionCollection);

	viewAllCount(permissionCollection, 'permis');

	if (permissionCollection.size) {
		emptySign(nameTable, 'full');
	} else {
		emptySign(nameTable, 'empty');
		countItems(filterNameDepart[0], 'permis');

		return;
	}

	if (filterNameDepart.length > 1) {
		addTabs(permissionCollection, filterNameDepart[0]);
		showActiveDataOnPage(permissionCollection , nameTable, filterNameDepart[0]);
		changeTabs(nameTable, 'permis');
	} else {
		$(`${nameTable} .table__content`).html('');
		$(`.tab--permis`).html('');

		permissionCollection.forEach((user) => {
			const { nameid = '', department = '' } = user;

			showTitleDepart(department, nameid, 'permis');

			$(`${nameTable} .table__content`).append(templatePermissionTable(user));
		});

		clickAllowDisallowPermiss();
	}
}

function showActiveDataOnPage(collection, nameTable, nameDepart, page = 'permis') {
	$(`${nameTable} .table__content`).html('');

	collection.forEach((user) => {
		if (user.nameid == nameDepart) {
			$(`${nameTable} .table__content`).append(templatePermissionTable(user));
		}
	});

	nameDeparts.forEach((depart) => {
		const { idname = '', longname = '' } = depart;

		if (idname == nameDepart) {
			showTitleDepart(longname, idname, page);
		}
	});

	countItems(nameDepart, page);
	clickAllowDisallowPermiss();
}

function showTitleDepart(depart, id, page) {
	$(`.main__depart--${page}`).text(depart).attr({'data-depart': depart, 'data-id': id});
}

function submitIDinBD() {
	$('#submitPermis').click(() => {
		const idActiveDepart = $('.main__depart--permis').attr('data-id');
		const filterDepatCollection = [...permissionCollection.values()].filter((user) => user.nameid == idActiveDepart);
		const checkedItems = filterDepatCollection.every((user) => user.statuspermiss);

		if (checkedItems) {
			const allowItems = filterDepatCollection.filter((item) => item.statuspermiss === 'allow');
			const disallowItems = filterDepatCollection.filter((item) => item.statuspermiss === 'disallow');
			const idFilterUsers = filterDepatCollection.map((item) => item.id);

			console.log(allowItems);
			console.log(disallowItems);

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

			dataAdd('#tablePermis');
			resetControlBtns();

			if (!permissionCollection.size) {
				showTitleDepart('', '', 'permis');
			}

		// 	returnToNextTab(e.target);

			$('.info__warn').hide();
		} else {
			$('.info__warn').show();
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

function clickAllowDisallowPermiss() {
	$('.table__content').click((e) => {
		if (!$(e.target).hasClass('btn--allow') && !$(e.target).hasClass('btn--disallow')) return;

		const typeBtn = $(e.target).data('type');
		const diffBtn = typeBtn === 'disallow' ? 'allow' : 'disallow';
		const userID = $(e.target).parents('.table__row').data('id');

		$(e.target).parents('.table__row').toggleClass('table__row--disabled');
		$(e.target).siblings(`.btn--${diffBtn}`).toggleClass(`btn--${diffBtn}-disabled`);

		if ($(e.target).hasClass(`btn--${typeBtn}-cancel`)) {
			changeStatusDisallowBtn(e.target, 'removeClass', false, typeBtn, typeBtn, diffBtn, userID);
		} else {
			changeStatusDisallowBtn(e.target, 'addClass', true, 'cancel', typeBtn, diffBtn, userID);
		}
	});
}

function changeStatusDisallowBtn(elem, classStatus, disabled, valText, typeBtn, diffBtn, userID) {
	const typePesmiss = valText === 'cancel' ? typeBtn : '';
	const textBtn = $(elem).data(valText);

	$(elem).siblings(`.btn--${diffBtn}`).attr('disabled', disabled);
	$(elem).parents('.table__row');
	$(elem)[classStatus](`btn--${typeBtn}-cancel`);
	$(elem).text(textBtn);

	permissionCollection.forEach((user) => {
		if (user.id === userID) {
			user.statuspermiss = typePesmiss;
		}
	});
}

function confirmAllAllowDisallow() {
	$('#allowAll, #disallowAll').click((e) => {
		const typeBtn = $(e.target).data('type');
		const diffBtn = typeBtn === 'disallow' ? 'allow' : 'disallow';
		const typeAttrItemsBtn = $(e.target).hasClass(`btn--${typeBtn}-cancel`) ? typeBtn : 'cancel';
		const attrPermiss = $(e.target).hasClass(`btn--${typeBtn}-cancel`)  ? '' : typeBtn;
		const dataTypeItem = $(e.target).hasClass(`btn--${typeBtn}-cancel`) ? false : true;
		const textBtn = $(e.target).data(typeAttrItemsBtn);
		const activeDepart = $('.main__depart--permis').attr('data-id');
		const filterDepatCollection = [...permissionCollection.values()].filter((user) => user.nameid == activeDepart);

		$(e.target).toggleClass(`btn--${typeBtn}-cancel`);
		$(e.target).text(textBtn);
		$(e.target).siblings(`.btn--${diffBtn}`).toggleClass(`btn--${diffBtn}-disabled`);
		$(e.target).siblings(`.btn--${diffBtn}`).attr('disabled', dataTypeItem);

		filterDepatCollection.forEach((user) => {
			user.statuspermiss = attrPermiss;
		});

		resetTableControlBtns(dataTypeItem);
	});
}

function resetTableControlBtns(status) {
	const classBtns = ['allow', 'disallow'];
	const rowsActive = $('.table--permis .table__content .table__row');
	const statusBtns = status == true ? 'attr' : 'removeAttr';
	const statusClass = status == true ? 'addClass' : 'removeClass';

	[...rowsActive].forEach((item) => {
		$(item)[statusClass]('table__row--disabled');

		classBtns.forEach((btn) => {
			const typeBtn = $(item).find(`.btn--${btn}`).data(btn);

			$(item).find(`.btn--${btn}`)[statusClass](`btn--${btn}-disabled`)[statusBtns]('disabled', 'disabled');
			$(item).find(`.btn--${btn}`).removeClass(`btn--${btn}-cancel`);
			$(item).find(`.btn--${btn}`).text(typeBtn);
		});
	});
}

function resetControlBtns() {
	const classBtns = ['#allowAll', '#disallowAll'];

	classBtns.forEach((item) => {
		const typeBtn = $(item).data('type');
		const textBtn = $(item).data(typeBtn);

		$(item).removeClass(`btn--${typeBtn}-disabled btn--${typeBtn}-cancel`).removeAttr('disabled', 'disabled');
		$(`.table__header .btn--${typeBtn}`).text(textBtn);
	});
}

function autoRefresh(page = 'permis') {
	const timeReload = 15000 * 5;  //5 минут
	let markInterval;

	$(`.switch--${page}`).click(() => {
		const statusSwitch = $('.switch__input').prop('checked');

		if (statusSwitch && !markInterval) {
			markInterval = setInterval(() => {
				getDatainDB('permission');
			}, timeReload);
		} else {
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
		data: {
			typeTable: typeTable,
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

function getDatainDB(nameTable) {
	$.ajax({
		url: "./php/output-request.php",
		method: "post",
		data: {
			nameTable: nameTable
		},
		success: function(data) {
			const dataFromDB = JSON.parse(data);

			userdFromDB(dataFromDB);
		},
		error: function(data) {
			console.log(data);
		}
	});
}

// Общие функции с картами и кодами
function countItems(idDepart, page) {
	const countItemfromDep = [...permissionCollection.values()].filter((user) => user.nameid === idDepart);

	$(`.main__count--${page}`).text(countItemfromDep.length);
}

function viewAllCount(collection, page) {
	$(`.main__count--all-${page}`).text(collection.size);
}

function addTabs(collection, activeTab, page = 'permis') {
	const filterNameDepart = filterDepart(collection);

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

function changeTabs(nameTable, page) {
	$(`.tab--${page}`).click((e) => {
		if (!$(e.target).parents('.tab__item').length && !$(e.target).hasClass('tab__item')) return;

		const nameDepart = $(e.target).closest('.tab__item').data('depart');

		addTabs(permissionCollection, nameDepart);
		showActiveDataOnPage(permissionCollection, nameTable, nameDepart);
		resetControlBtns();
	});
}

function filterDepart(collection) {
	const arrayDepart = [...collection.values()].map((item) => item.nameid);

	return [...new Set(arrayDepart)];
}

export default {
};
