'use strict';

export const table = (data, obj) => {
	const { id = '', fio = '', post = '', statustitle = '', newdepart = '',  cardvalidto = '' } = data;
	const { statusnewdepart, statuscardvalidto } = obj;
	const newdepartView = statusnewdepart ? `
		<div class="table__cell table__cell--body table__cell--department">
			<span class="table__text table__text--body">${newdepart}</span>
		</div>
	` : '';
	const cardvalidtoView = statuscardvalidto ? `
		<div class="table__cell table__cell--body table__cell--cardvalidto">
			<span class="table__text table__text--body">${cardvalidto}</span>
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
			${newdepartView}
			${cardvalidtoView}
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
