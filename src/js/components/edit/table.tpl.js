'use strict';

export const table = (data, obj) => {
	const { id = '', fio = '', post = '', statustitle = '', newfio = '', newpost = '', newphotoname = '' } = data;
	const { statusnewfio, statusnewpost, statusnewphotofile } = obj;
	const newfioView = statusnewfio ? `
		<div class="table__cell table__cell--body table__cell--fio">
			<span class="table__text table__text--body">${newfio}</span>
		</div>
	` : '';
	const newpostView = statusnewpost ? `
		<div class="table__cell table__cell--body table__cell--post">
			<span class="table__text table__text--body">${newpost}</span>
		</div>
	` : '';
	const newphotofileView = statusnewphotofile ? `
		<div class="table__cell table__cell--body table__cell--photoname">
			<span class="table__text table__text--body">${newphotoname}</span>
		</div>
	` : '';

	return `
		<div class="table__row" data-id="${id}">
			<div class="table__cell table__cell--body table__cell--fio">
				<span class="table__text table__text--body">${fio}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--post">
				<span class="table__text table__text--body">${post}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--statustitle">
				<span class="table__text table__text--body">${statustitle}</span>
			</div>
			${newfioView}
			${newpostView}
			${newphotofileView}
			<div class="table__cell table__cell--body table__cell--edit">
				<button class="table__btn table__btn--edit" type="button">
					<svg class="icon icon--edit icon--edit-black">
						<use class="icon__item" xlink:href="./images/sprite.svg#edit"></use>
					</svg>
				</button>
			</div>
			<div class="table__cell table__cell--body table__cell--delete">
				<button class="table__btn table__btn--delete" type="button">
					<svg class="icon icon--delete icon--delete-black">
						<use class="icon__item" xlink:href="./images/sprite.svg#delete"></use>
					</svg>
				</button>
			</div>
		</div>
	`;
};
