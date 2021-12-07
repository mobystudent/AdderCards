'use strict';

export const headerTable = () => {
	return `
		<div class="table__cell table__cell--header table__cell--fio">
			<span class="table__text table__text--header">Фамилия Имя Отчество</span>
			<button class="btn btn--sort" type="button" data-direction="true"></button>
		</div>
		<div class="table__cell table__cell--header table__cell--post">
			<span class="table__text table__text--header">Должность</span>
			<button class="btn btn--sort" type="button" data-direction="true"></button>
		</div>
		<div class="table__cell table__cell--header table__cell--cardid">
			<span class="table__text table__text--header">ID карты</span>
		</div>
		<div class="table__cell table__cell--header table__cell--cardname">
			<span class="table__text table__text--header">Номер карты</span>
		</div>
		<div class="table__cell table__cell--header table__cell--statustitle">
			<span class="table__text table__text--header">Статус</span>
		</div>
		<div class="table__cell table__cell--header table__cell--signature">
			<span class="table__text table__text--header">Подпись</span>
		</div>
		<div class="table__cell table__cell--header table__cell--clear">
			<svg class="icon icon--edit icon--edit-white">
				<use class="icon__item" xlink:href="./images/sprite.svg#clear"></use>
			</svg>
		</div>
	`;
};
