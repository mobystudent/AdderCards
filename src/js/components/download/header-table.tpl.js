'use strict';

export const headerTable = () => {
	return `
		<div class="table__cell table__cell--header table__cell--codepicture">
			<span class="table__text table__text--header">Код для изображения</span>
		</div>
		<div class="table__cell table__cell--header table__cell--cardid">
			<span class="table__text table__text--header">ID qr-кода</span>
		</div>
		<div class="table__cell table__cell--header table__cell--cardname">
			<span class="table__text table__text--header">Номер qr-кода</span>
		</div>
		<div class="table__cell table__cell--header table__cell--delete">
			<svg class="icon icon--delete icon--delete-white">
				<use class="icon__item" xlink:href="./images/sprite.svg#delete"></use>
			</svg>
		</div>
	`;
};
