'use strict';

import $ from 'jquery';
import service from './service.js';
import messageMail from './mail.js';
import settingsObject from './settings.js';

const requestCollection = new Map(); // БД отчета
const departmentCollection = new Map();  // Коллекци подразделений
const requestObject = {
	statusallow: '',
	statusdisallow: '',
	nameid: '',
	longname: '',
	shortname: ''
};

$(window).on('load', () => {
	submitIDinBD();
	autoRefresh();
	showDataFromStorage();
});

function templateRequestTable(data) {
	const { id = '', fio = '', post = '', statustitle = '', date = '', statususer = '', allow = '', disallow = '', allowblock = '', disallowblock = '' } = data;
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
			<div class="table__cell table__cell--body table__cell--date">
				<span class="table__text table__text--body">${date}</span>
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

function templateRequestTabs(data) {
	const { nameid = '', shortname = '', status = '' } = data;
	const statusView = status ? 'tab__item--active' : '';

	return `
		<button class="tab__item ${statusView}" type="button" data-depart=${nameid}>
			<span class="tab__name">${shortname}</span>
		</button>
	`;
}

function templateRequestHeaderTable() {
	const allowBtnValue = requestObject.statusallow ? 'Отменить' : 'Разрешить все';
	const disallowBtnValue = requestObject.statusdisallow ? 'Отменить' : 'Запретить все';
	const allowBtnClassView = requestObject.statusallow ? 'btn--allow-cancel' : '';
	const disallowBtnClassView = requestObject.statusdisallow ? 'btn--disallow-cancel' : '';
	const allowDiffClassView = requestObject.statusdisallow ? 'btn--allow-disabled' : '';
	const disallowDiffClassView = requestObject.statusallow ? 'btn--disallow-disabled' : '';
	const allowBtnBlock = requestObject.statusdisallow ? 'disabled="disabled"' : '';
	const disallowBtnBlock = requestObject.statusallow ? 'disabled="disabled"' : '';

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
		<div class="table__cell table__cell--header table__cell--date">
			<span class="table__text table__text--header">Дата</span>
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

function templateHeaderPage(page = 'request') {
	return `
		<h1 class="main__title">Запрос на изменение данных</h1>
		<span class="main__depart main__depart--${page}" data-depart="${requestObject.longname}" data-id="${requestObject.nameid}">${requestObject.longname}</span>
	`;
}

function renderTable(nameTable = '#tableRequest') {
	$(`${nameTable} .table__content`).html('');

	requestCollection.forEach((item) => {
		if (item.nameid === requestObject.nameid) {
			$(`${nameTable} .table__content`).append(templateRequestTable(item));
		}
	});
}

function renderHeaderTable(page = 'request') {
	$(`.table--${page} .table__header`).html('');
	$(`.table--${page} .table__header`).append(templateRequestHeaderTable());
}

function renderHeaderPage(page = 'request') {
	$(`.main[data-name=${page}] .main__title-wrap`).html('');
	$(`.main[data-name=${page}] .main__title-wrap`).append(templateHeaderPage());
}

function userFromDB(array) {
	const objToCollection = {
		id: '',
		fio: '',
		post: '',
		nameid: '',
		statusid: '',
		statustitle: '',
		department: '',
		date: ''
	};

	array.forEach((elem, i) => {
		const itemObject = Object.assign({}, objToCollection);

		for (const itemField in itemObject) {
			for (const key in elem) {
				if (itemField === key) {
					itemObject[itemField] = elem[key];
				}
			}
		}

		requestCollection.set(i, itemObject);
	});

	dataAdd();
}

function dataAdd(page = 'request') {
	const filterNameDepart = filterDepart(requestCollection);
	requestObject.nameid = filterNameDepart[0];

	viewAllCount();
	getDepartmentInDB('department');

	if (requestCollection.size) {
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
	clickAllowDisallowRequest();
	confirmAllAllowDisallow();
}

function showDataFromStorage(page = 'request') {
	const storageCollection = JSON.parse(localStorage.getItem(page));

	if (storageCollection && storageCollection.collection.length && !requestCollection.size) {
		const { statusallow, statusdisallow } = storageCollection.controls;

		storageCollection.collection.forEach((item, i) => {
			const itemID = storageCollection.collection[i].id;

			requestCollection.set(itemID, item);
		});

		requestObject.statusallow = statusallow;
		requestObject.statusdisallow = statusdisallow;

		renderHeaderTable();
		dataAdd();
	} else {
		getDataFromDB('request');
	}
}

function setDataInStorage(page = 'request') {
	localStorage.setItem(page, JSON.stringify({
		controls: requestObject,
		collection: [...requestCollection.values()]
	}));
}

function showActiveDataOnPage() {
	departmentCollection.forEach((depart) => {
		const { nameid, shortname, longname } = depart;

		if (nameid === requestObject.nameid) {
			requestObject.shortname = shortname;
			requestObject.longname = longname;
		}
	});

	renderHeaderPage();
	renderTable();
	countItems();
}

function submitIDinBD(page = 'request') {
	$('#submitRequest').click(() => {
		const filterDepatCollection = [...requestCollection.values()].filter(({ nameid }) => nameid === requestObject.nameid);
		const checkedItems = filterDepatCollection.every(({ statusrequest }) => statusrequest);

		if (checkedItems) {
			const allowItems = filterDepatCollection.filter(({ statusrequest }) => statusrequest === 'allow');
			const disallowItems = filterDepatCollection.filter(({ statusrequest }) => statusrequest === 'disallow');

			$('.info__item--warn').hide();

			if (allowItems.length) {
				// Запрос в Uprox
			}

			if (disallowItems.length) {
				disallowItems.forEach((item) => {
					item.date = service.getCurrentDate();
				});

				setAddUsersInDB(disallowItems, 'reject', 'add', 'reject');
			}

			console.log(filterDepatCollection);

			filterDepatCollection.forEach(({ id: userID }) => {
				[...requestCollection].forEach(([ key, { id } ]) => {
					if (userID === id) {
						requestCollection.delete(key);
					}
				});
			});
			filterDepatCollection.splice(0);

			clearObject();
			resetControlBtns();
			dataAdd();
			renderHeaderTable();
			confirmAllAllowDisallow();

			if (!requestCollection.size) {
				renderHeaderPage();
			}

			countItems();
			localStorage.removeItem(page);
		} else {
			$('.info__item--warn').show();
		}
	});
}

function clearObject() {
	requestObject.nameid = '';
	requestObject.longname = '';
	requestObject.shortname = '';
}

function emptySign(status, nameTable = '#tableRequest') {
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

function clickAllowDisallowRequest(nameTable = '#tableRequest', page = 'request') {
	$(`${nameTable} .table__content`).click(({ target }) => {
		if (!$(target).hasClass('btn--allow') && !$(target).hasClass('btn--disallow')) return;

		const userID = $(target).parents('.table__row').data('id');
		const typeBtn = $(target).data('type');

		requestCollection.forEach((item) => {
			if (+item.id === userID) {
				const status = item[typeBtn] ? false : true;

				item.statususer = status ? true : false;
				item.statusrequest = typeBtn;
				item[typeBtn] = status;
				item.allowblock = typeBtn === 'disallow' && status ? true : false;
				item.disallowblock = typeBtn === 'allow' && status ? true : false;
			}
		});

		const allStatusUsers = [...requestCollection.values()].some(({ statususer }) => statususer);

		if (!allStatusUsers) {
			localStorage.removeItem(page);
		} else {
			setDataInStorage();
		}

		renderTable();
	});
}

function confirmAllAllowDisallow(page = 'request') {
	$(`.table--${page} #allowAll, .table--${page} #disallowAll`).click(({ target }) => {
		const typeBtn = $(target).data('type');
		const statusTypeBtn = typeBtn === 'allow' ? 'statusallow' : 'statusdisallow';
		requestObject[statusTypeBtn] = requestObject[statusTypeBtn] ? false : true;

		requestCollection.forEach((item) => {
			if (item.nameid === requestObject.nameid) {
				item.statususer = requestObject[statusTypeBtn] ? true : false;
				item.statusrequest = typeBtn;
				item.allow = '';
				item.disallow = '';
				item.allowblock = requestObject[statusTypeBtn] ? true : false;
				item.disallowblock = requestObject[statusTypeBtn] ? true : false;
			}
		});

		if (!requestObject.statusallow && !requestObject.statusdisallow) {
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
	requestObject.statusallow = '';
	requestObject.statusdisallow = '';

	requestCollection.forEach((item) => {
		if (item.nameid === requestObject.nameid) {
			item.statususer = '';
			item.statusrequest = '';
			item.allow = '';
			item.disallow = '';
			item.allowblock = '';
			item.disallowblock = '';
		}
	});
}

function autoRefresh(page = 'request') {
	const timeReload = 60000 * settingsObject.autoupdatevalue;
	let markInterval;

	$(`.switch--${page}`).click((e) => {
		const statusSwitch = $(e.currentTarget).find('.switch__input').prop('checked');

		if (statusSwitch && !markInterval) {
			localStorage.removeItem(page);

			getDataFromDB('request');
			resetControlBtns();
			renderHeaderTable();
			confirmAllAllowDisallow();

			markInterval = setInterval(() => {
				getDataFromDB('request');
			}, timeReload);
		} else if (!statusSwitch && markInterval) {
			clearInterval(markInterval);

			markInterval = false;
		}
	});
}

function setAddUsersInDB(array, nameTable, action, typeTable, page = 'request') {
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

function getDepartmentInDB(nameTable) {
	$.ajax({
		url: "./php/output-request.php",
		method: "post",
		dataType: "html",
		async: false,
		data: {
			nameTable
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
function countItems(page = 'request') {
	const countItemfromDep = [...requestCollection.values()].filter(({ nameid }) => nameid === requestObject.nameid);

	$(`.main__count--${page}`).text(countItemfromDep.length);
}

function viewAllCount(page = 'request') {
	$(`.main__count--all-${page}`).text(requestCollection.size);
}

function addTabs(page = 'request') {
	const filterNameDepart = filterDepart(requestCollection);

	$(`.tab--${page}`).html('');

	if (filterNameDepart.length > 1) {
		filterNameDepart.forEach((item) => {
			departmentCollection.forEach((depart) => {
				const { nameid = '', shortname = '' } = depart;

				if (item == nameid) {
					const tabItem = {
						nameid,
						shortname,
						status: requestObject.nameid === nameid ? true : false
					};

					$(`.tab--${page}`).append(templateRequestTabs(tabItem));
				}
			});
		});
	}
}

function changeTabs(page = 'request') {
	$(`.tab--${page}`).click(({ target }) => {
		if (!$(target).parents('.tab__item').length && !$(target).hasClass('tab__item')) return;

		const activeDepart = $(target).closest('.tab__item').data('depart');
		requestObject.nameid = activeDepart;

		resetControlBtns();
		renderHeaderTable();
		addTabs();
		showActiveDataOnPage();
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
