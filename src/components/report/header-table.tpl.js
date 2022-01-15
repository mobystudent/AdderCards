'use strict';

import { cells } from '../../structure/report.strt.js';
import row from '../row.tpl';

export const headerTable = () => {
	return`
		${row(cells)}
	`;
};
