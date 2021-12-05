'use strict';

export const table = (data, obj) => {
	const { id = '', fio = '', post  = '', cardid = '', cardname = '', statustitle = '' } = data;
	const { statusassign, statusmanual } = obj;
	const assingBtnCheck = statusassign ? 'checked="checked"' : '';
	const assignView = statusmanual ? `
		<div class="table__cell table__cell--body table__cell--switch-assign">
			<div class="switch switch--item">
				<label class="switch__wrap switch__wrap--item">
					<input class="switch__input" type="checkbox" ${assingBtnCheck} disabled="disabled"/>
					<span class="switch__btn switch__btn--disabled"></span>
				</label>
			</div>
		</div>
	` : '';

	return `
		<div class="table__row table__row--time" data-id="${id}">
			<div class="table__cell table__cell--body table__cell--fio">
				<span class="table__text table__text--body">${fio}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--post">
				<span class="table__text table__text--body">${post}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--cardid">
				<span class="table__text table__text--body">${cardid}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--cardname">
				<span class="table__text table__text--body">${cardname}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--statustitle">
				<span class="table__text table__text--body">${statustitle}</span>
			</div>
			${assignView}
			<div class="table__cell table__cell--body table__cell--signature">
				<span class="table__text table__text--body"></span>
			</div>
		</div>
	`;
};
