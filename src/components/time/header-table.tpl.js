'use strict';

export const headerTable = () => {
	return `
		<div class="table__cell table__cell--header table__cell--fio">
			<span class="table__text table__text--header">Название</span>
		</div>
		<div class="table__cell table__cell--header table__cell--cardid">
			<span class="table__text table__text--header">ID карты</span>
		</div>
		<div class="table__cell table__cell--header table__cell--cardname">
			<span class="table__text table__text--header">Номер карты</span>
		</div>
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
