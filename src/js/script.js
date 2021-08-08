'use strict';

import $ from 'jquery';
import { nameDeparts } from './nameDepart.js';
import timeCard from './timecards.js';
import constCard from './constcards.js';
import qrCodes from './qrcodes.js';
import permission from './permission.js';
import constQR from './constqr.js';
import addUser from './adduser.js';
import removeUser from './removeuser.js';
import service from './service.js';
import usersFunc from './users-func.js';
import report from './report.js';
import reject from './reject.js';

$(window).on('load', () => {
	getData();
	defaultDataInTables();
	// permissionAdd();

	//permission functions
	// permission.confirmAllAllowDisallow();

	//service functions
	service.showDataInTable();
});

function getData() {
	const data = {
		"PasswordHash":"88020F057FE7287D8D57494382356F97",
		"UserName":"admin"
	};

	$.ajax({
		url: "http://localhost:40001/json/Authenticate",
		method: "post",
		dataType: "json",
		data: data,
		success: function(data) {
			console.log('succsess '+data);
		},
		error: function(data) {
			console.log(data);
		}
	});
}

function defaultDataInTables() {
	$(`.main[data-name="const"]`).show();
}

function createTable() {
	// if (tabName === 'add') {
	// 	return {
	// 		FIO,
	// 		Post,
	// 		Department,
	// 		TitleID,
	// 		IDUser
	// 	};
	// } else if (tabName === 'remove') {
	// 	return {
	// 		FIO,
	// 		Department,
	// 		TitleID,
	// 		NewDepart,
	// 		IDUser
	// 	};
	// } else if (tabName === 'edit') {
	// 	return {
	// 		FIO,
	// 		Department,
	// 		TitleID,
	// 		NewFIO,
	// 		NewPost,
	// 		IDUser
	// 	};
	// }

	// switch(item[itemValue]) {
	// 	case 'newCard':
	// 		statusValue = 'Новая карта';
	// 		break;
	// 	case 'changeCard':
	// 		statusValue = 'Замена карты';
	// 		break;
	// 	case 'newQR':
	// 		statusValue = 'Новый QR-код';
	// 		break;
	// 	case 'changeQR':
	// 		statusValue = 'Замена QR-кода';
	// 		break;
	// 	case 'changeFIO':
	// 		statusValue = 'Изменение ФИО';
	// 		break;
	// 	case 'changePost':
	// 		statusValue = 'Изменение должности';
	// 		break;
	// 	case 'changeDepart':
	// 		statusValue = 'Перевод в другое подразделение';
	// 		break;
	// }
}

function focusFirstCell(nameTable) {
	const rows = $(`.table--${nameTable} .table__content--active`).find('.table__row');

	$(rows).eq(0).find('.table__input').focus();
}

function removeAndFocusActiveBlock(containerBl, block, nameTable) {
	let numActive;

	[...containerBl].forEach((item, i) => {
		if ($(item).hasClass(`${block}--active`)) {
			$(item).remove();
			numActive = i;
		}
	});

	[...containerBl].forEach(() => {
		if (numActive != 0) {
			$(containerBl).eq(numActive - 1).addClass(`${block}--active`);
		} else if (numActive + 1 && numActive == 0) {
			$(containerBl).eq(numActive + 1).addClass(`${block}--active`);
		}
	});

	focusFirstCell(nameTable);
}

function getTableID(name) {
	if (name === 'newCard' || name === 'changeCard') {
		return 'const';
	} else if (name === 'newQR' || name === 'changeQR') {
		return 'qr';
	}
}

function returnToNextTab(item) {
	const dataDepart = $(item).closest('.main').data('name');
	const countTabs = $(`.tab--${dataDepart} .tab__item`);
	const countContent = $(`.table--${dataDepart} .table__content`);

	if (countTabs.length > 1) {
		removeAndFocusActiveBlock(countTabs, 'tab__item', dataDepart);
		removeAndFocusActiveBlock(countContent, 'table__content', dataDepart);
	} else {
		$(`.tab--${dataDepart} .tab__item--active`).remove();
		$(`.table--${dataDepart} .table__content--active`).remove();
		$(`.table--${dataDepart} .table__nothing`).show();
	}
}
