'use strict';

import { cells } from '../../structure/const.strt.js';
import row from '../row.tpl';

export const headerTable = () => {
	return `
		${row(cells)}
		<div class="table__cell table__cell--header table__cell--clear">
			<svg class="icon icon--edit icon--edit-white">
				<use class="icon__item" xlink:href="./images/sprite.svg#clear"></use>
			</svg>
		</div>
	`;
};
