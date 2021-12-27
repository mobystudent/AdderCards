'use strict';

export const headerTable = (data) => {
	const { statusnewdepart, statuscardvalidto } = data;
	const newDepartView = statusnewdepart ? `
		<div class="table__cell table__cell--header table__cell--department">
			<span class="table__text table__text--header">Новое подразделение</span>
		</div>
	` : '';
	const cardvalidtoView = statuscardvalidto ? `
		<div class="table__cell table__cell--header table__cell--cardvalidto">
			<span class="table__text table__text--header">Дата</span>
		</div>
	` : '';

	return `
		<div class="table__cell table__cell--header table__cell--fio">
			<span class="table__text table__text--header">Фамилия Имя Отчество</span>
			<button class="btn btn--sort" type="button" data-direction="true"></button>
		</div>
		<div class="table__cell table__cell--header table__cell--post">
			<span class="table__text table__text--header">Должность</span>
		</div>
		<div class="table__cell table__cell--header table__cell--statustitle">
			<span class="table__text table__text--header">Причина удаления</span>
		</div>
		${newDepartView}
		${cardvalidtoView}
		<div class="table__cell table__cell--header table__cell--edit">
			<svg class="icon icon--edit icon--edit-white">
				<use class="icon__item" xlink:href="./images/sprite.svg#edit"></use>
			</svg>
		</div>
		<div class="table__cell table__cell--header table__cell--delete">
			<svg class="icon icon--delete icon--delete-white">
				<use class="icon__item" xlink:href="./images/sprite.svg#delete"></use>
			</svg>
		</div>
	`;
};
