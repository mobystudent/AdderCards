'use strict';

export const headerTable = (data) => {
	const { statusresend } = data;
	const resendBtnValue = statusresend ? 'Отменить' : 'Выбрать все';
	const resendBtnClassView = statusresend ? 'btn--resend-cancel' : '';

	return `
		<div class="table__cell table__cell--header table__cell--fio">
			<span class="table__text table__text--header">Фамилия Имя Отчество</span>
			<button class="btn btn--sort" type="button" data-direction="true"></button>
		</div>
		<div class="table__cell table__cell--header table__cell--post">
			<span class="table__text table__text--header">Должность</span>
			<button class="btn btn--sort" type="button" data-direction="true"></button>
		</div>
		<div class="table__cell table__cell--header table__cell--statustitle">
			<span class="table__text table__text--header">Статус</span>
		</div>
		<div class="table__cell table__cell--header table__cell--date">
			<span class="table__text table__text--header">Дата</span>
		</div>
		<div class="table__cell table__cell--header table__cell--btn-resend">
			<button class="btn btn--resend ${resendBtnClassView}" id="resendAll" type="button">${resendBtnValue}</button>
		</div>
		<div class="table__cell table__cell--header table__cell--view">
			<svg class="icon icon--view icon--view-white">
				<use class="icon__item" xlink:href="./images/sprite.svg#view"></use>
			</svg>
		</div>
	`;
};
