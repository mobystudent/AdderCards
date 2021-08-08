'use strict';

import $ from 'jquery';
import { nameDeparts } from './nameDepart.js';

const permissionCollection = new Map(); // БД пользователей при старте

$(window).on('load', () => {
	getDatainDB();
	submitIDinBD();
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

function getDatainDB() {
	$.ajax({
		url: "./php/permission-output.php",
		method: "post",
		success: function(data) {
			userdFromDB(JSON.parse(data));
		},
		error: function(data) {
			console.log(data);
		}
	});
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
		$('.table__nothing').hide();
	} else {
		$(nameTable).addClass('table__body--empty').html('');
		$(nameTable).append(`
			<p class="table__nothing">Новых данных нет</p>
		`);

		countItems(filterNameDepart[0], 'permis');

		return;
	}

	if (filterNameDepart.length > 1) {
		addTabs(permissionCollection, 'permis');
		showActiveDataOnPage(permissionCollection , nameTable, 'permis', filterNameDepart[0]);
		changeTabs(nameTable, 'permis');
	} else {
		$(nameTable).html('');
		$(nameTable).append(`
			<div class="table__content table__content--active">
			</div>
		`);
		$(`.tab--permis`).html('');

		permissionCollection.forEach((user) => {
			const { nameid = '', department = '' } = user;

			showTitleDepart(department, nameid, 'permis');

			$(`${nameTable} .table__content--active`).append(templatePermissionTable(user));
		});

		clickAllowDisallowPermiss();
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
			$(`${nameTable} .table__content--active`).append(templatePermissionTable(user));
		}
	});

	nameDeparts.forEach((depart) => {
		const { idName = '', longName = '' } = depart;

		if (idName == nameDepart) {
			showTitleDepart(longName, idName, modDepart);
		}
	});

	countItems(nameDepart, modDepart);
	clickAllowDisallowPermiss();
}

function showTitleDepart(depart, id, modDepart) {
	$(`.main__depart--${modDepart}`).text(depart).attr({'data-depart': depart, 'data-id': id});
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
				setDataInDBWithID(allowItems, idActiveDepart, 'permission-remove');
			} else {
				disallowItems.forEach((item) => {
					item.date = getCurrentDate();
				});

				setDataInDBWithID(disallowItems, idActiveDepart, 'reject');
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

	setDataInDB(filterArrCards, 'const-card');
	setDataInDB(filterArrQRs, 'const-qr');
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
	const rowsActive = $('.table--permis .table__content--active .table__row');
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

function setDataInDBWithID(users, idDepart, nameQuery) {
	$.ajax({
		url: `./php/${nameQuery}.php`,
		method: "post",
		dataType: "html",
		data: {
			nameid: idDepart,
			array: users
		},
		success: function(data) {
			console.log('succsess '+data);
		},
		error: function(data) {
			console.log(data);
		}
	});
}

function setDataInDB(users, nameQuery) {
	$.ajax({
		url: `./php/${nameQuery}.php`,
		method: "post",
		dataType: "html",
		data: {
			array: users
		},
		success: function(data) {
			console.log('succsess '+data);
		},
		error: function(data) {
			console.log(data);
		}
	});
}

// Общие функции с картами и кодами
function countItems(idDepart, modDepart) {
	const countItemfromDep = [...permissionCollection.values()].filter((user) => user.nameid === idDepart);

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

		showActiveDataOnPage(permissionCollection, nameTable, modDepart, nameDepart);
		resetControlBtns();
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
