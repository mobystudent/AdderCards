'use strict';

export const qrItems = (data, obj) => {
	const { longname } = obj;
	const qrBlocks = data.reduce((grid, user) => {
		const { fio = '', post = '', pictureurl = '' } = user;
		const fioArr = fio.split(' ');
		let fullName = '';

		if (fioArr.length <= 3) {
			fullName = fioArr.reduce((acc, elem) => {
				const templateName = `<span>${elem}</span>`;

				acc += templateName;

				return acc;
			}, '');
		} else {
			fullName = `<p>${fio}</p>`;
		}

		grid += `
			<article class="document__item">
				<img class="document__code" src="${pictureurl}" alt="qr code" />
				<h3 class="document__name">${fullName}</h3>
				<span class="document__post">${post}</span>
				<p class="document__instruct">Скачайте с Google Play или App Store приложение UProx и отсканируейте через него QR-код.</p>
			</article>
		`;

		return grid;
	}, '');

	return `
		<h2 class="document__depart">${longname}</h2>
		<span class="document__count">Количество qp-кодов: ${data.length}</span>
		<div class="document__grid">
			${qrBlocks}
		</div>
	`;
};
