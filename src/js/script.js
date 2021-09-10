'use strict';

// import $ from '../../node_modules/jquery';
import $ from 'jquery';
import './timecards.js';
import './constcards.js';
import './qrcodes.js';
import './permission.js';
import './constqr.js';
import './adduser.js';
import './removeuser.js';
import './edituser.js';
import './report.js';
import './reject.js';
import './requestchange.js';
import service from './service.js';

$(window).on('load', () => {
	defaultDataInTables();

	//service functions
	// service.scrollbar();
	service.showDataInTable();
});

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
