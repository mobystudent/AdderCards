'use strict';

// import $ from '../../node_modules/jquery';
import $ from 'jquery';
import '../controllers/time.ctrl.js';
import '../controllers/const.ctrl.js';
import '../controllers/download.ctrl.js';
import '../controllers/permis.ctrl.js';
import '../controllers/qr.ctrl.js';
import '../controllers/add.ctrl.js';
import '../controllers/remove.ctrl.js';
import '../controllers/edit.ctrl.js';
import '../controllers/report.ctrl.js';
import '../controllers/reject.ctrl.js';
import '../controllers/request.ctrl.js';
import '../controllers/settings.ctrl.js';
import './login.js';
import service from './service.js';
import './parts/renderheader.js';

$(window).on('load', () => {
	// service.scrollbar();
	service.showDataInTable();
});

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
