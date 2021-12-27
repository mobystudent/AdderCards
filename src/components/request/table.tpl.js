'use strict';

export const table = (data) => {
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
};
