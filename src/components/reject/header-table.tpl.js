'use strict';

import { cells } from '../../structure/reject.strt.js';
import row from '../row.tpl';

export const headerTable = (data) => {
	const { statusresend } = data;
	const resendBtnValue = statusresend ? 'Отменить' : 'Выбрать все';
	const resendBtnClassView = statusresend ? 'btn--resend-cancel' : '';

	return `
		${row(cells)}
		<div class="table__cell table__cell--header table__cell--btn-resend">
			<button class="btn btn--resend ${resendBtnClassView}" id="resendAll" type="button">${resendBtnValue}</button>
		</div>
		<div class="table__cell table__cell--header table__cell--view">
			<svg class="icon icon--view icon--view-white">
				<use class="icon__item" xlink:href="./images/sprite.svg#view"></use>
			</svg>
		</div>
	`;
};
