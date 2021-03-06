'use strict';

import $ from 'jquery';
import './login.js';
import service from './service.js';
import './parts/renderheader.js';

import Statis from '../controllers/pages/statis.ctrl.js';
import Settings from '../controllers/pages/settings.ctrl.js';
import QR from '../controllers/pages/qr.ctrl.js';
import Time from '../controllers/pages/time.ctrl.js';
import Const from '../controllers/pages/const.ctrl.js';
import Download from '../controllers/pages/download.ctrl.js';
import Edit from '../controllers/pages/edit.ctrl.js';
import Remove from '../controllers/pages/remove.ctrl.js';
import Add from '../controllers/pages/add.ctrl.js';
import Reject from '../controllers/pages/reject.ctrl.js';
import Request from '../controllers/pages/request.ctrl.js';
import Permis from '../controllers/pages/permis.ctrl.js';
import Report from '../controllers/pages/report.ctrl.js';

$(window).on('load', () => {
	// service.scrollbar();
	service.showDataInTable();

	new Statis({ page: 'statis' });
	new Settings({ page: 'settings' });
	new QR({ page: 'qr' });
	new Time({ page: 'time' });
	new Const({ page: 'const' });
	new Download({ page: 'download' });
	new Edit({ page: 'edit' });
	new Remove({ page: 'remove' });
	new Add({ page: 'add' });
	new Reject({ page: 'reject' });
	new Request({ page: 'request' });
	new Permis({ page: 'permis' });
	new Report({ page: 'report' });
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
