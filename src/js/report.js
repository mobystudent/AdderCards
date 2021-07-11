'use strict';

import $ from 'jquery';

const reportCollection = new Map(); // БД отчета

$(window).on('load', () => {

});

function templateReportTable(data) {
	const { id = '', fio = '', post = '', department = '', statusid = '', date = '' } = data;

	return `
		<div class="table__row table__row--time" data-id="${id}">
			<div class="table__cell table__cell--body table__cell--fio">
				<span class="table__text table__text--body">${fio}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--post">
				<span class="table__text table__text--body">${post}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--department">
				<span class="table__text table__text--body">${department}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--statusid">
				<span class="table__text table__text--body">${statusid}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--date">
				<span class="table__text table__text--body">${date}</span>
			</div>
		</div>
	`;
}

export default {

};
