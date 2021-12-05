'use strict';

export const pageTitle = (data) => {
	const { page = '', longname = '', nameid = '' } = data;
	const nameDepart = longname && nameid ? `
		<span class="main__depart" data-depart="${longname}" data-id="${nameid}">${longname}</span>
	` : '';

	return `
		<div class="main__title-wrap">
			<h1 class="main__title">${page}</h1>
			${nameDepart}
		</div>
	`;
};
