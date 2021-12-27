'use strict';

export const headerTable = (data) => {
	const { statusnewfio, statusnewpost, statusnewphotofile } = data;
	const newfioView = statusnewfio ? `
		<div class="table__cell table__cell--header table__cell--fio">
			<span class="table__text table__text--header">Новое Фамилия Имя Отчество</span>
			<button class="btn btn--sort" type="button" data-direction="true"></button>
		</div>
	` : '';
	const newpostView = statusnewpost ? `
		<div class="table__cell table__cell--header table__cell--post">
			<span class="table__text table__text--header">Новая должность</span>
		</div>
	` : '';
	const newphotofileView = statusnewphotofile ? `
		<div class="table__cell table__cell--header table__cell--photoname">
			<span class="table__text table__text--header">Новая фотография</span>
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
			<span class="table__text table__text--header">Тип изменения</span>
		</div>
		${newfioView}
		${newpostView}
		${newphotofileView}
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
