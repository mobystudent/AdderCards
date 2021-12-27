'use strict';

export const select = (data) => {
	const { value, id, type, dataid } = data;

	return `
		<li class="select__item">
			<span class="select__name select__name--${type}" data-title="${value}" data-${dataid}="${id}">${value}</span>
		</li>
	`;
};
