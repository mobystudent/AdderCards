'use strict';

import { cells } from '../../structure/time.strt.js';
import row from '../row.tpl';

export const headerTable = () => {
	return `
		${row(cells)}
		<div class="table__cell table__cell--header table__cell--clear">
			<svg class="icon icon--clear icon--clear-white">
				<use class="icon__item" xlink:href="./images/sprite.svg#clear"></use>
			</svg>
		</div>
		<div class="table__cell table__cell--header table__cell--delete">
			<svg class="icon icon--delete icon--delete-white">
				<use class="icon__item" xlink:href="./images/sprite.svg#delete"></use>
			</svg>
		</div>
	`;
};
