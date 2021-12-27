'use strict';

export const filter = (data) => {
	const { select, item: { title, statusid } } = data;
	const nameidType = statusid ? statusid : title;

	return `
		<li class="select__item">
			<span class="select__name select__name--form" data-title="${title}" data-${select}="${nameidType}">
				${title}
			</span>
		</li>
	`;
};
