'use strict';

export const tabs = (data) => {
	const { nameid = '', shortname = '', status = '' } = data;
	const statusView = status ? 'tab__item--active' : '';

	return `
		<button class="tab__item ${statusView}" type="button" data-depart=${nameid}>
			<span class="tab__name">${shortname}</span>
		</button>
	`;
};
