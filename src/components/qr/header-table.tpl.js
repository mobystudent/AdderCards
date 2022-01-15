'use strict';

import { cells } from '../../structure/qr.strt.js';
import row from '../row.tpl';

export const headerTable = (data) => {
	const { statusassign, statusmanual } = data;
	const assingBtnCheck = statusassign ? 'checked="checked"' : '';
	const assignView = statusmanual ? `
		<div class="table__cell table__cell--header table__cell--switch-assign">
			<div class="switch switch--item">
				<label class="switch__wrap switch__wrap--item" id="assignAll">
					<input class="switch__input" type="checkbox" ${assingBtnCheck}/>
					<span class="switch__btn"></span>
				</label>
			</div>
		</div>
	` : '';

	return `
		${row(cells)}
		${assignView}
		<div class="table__cell table__cell--header table__cell--signature">
			<span class="table__text table__text--header">Подпись</span>
		</div>
	`;
};
