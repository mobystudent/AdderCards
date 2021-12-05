'use strict';

export const table = (data) => {
	const { id = '', fio = '', post = '', statustitle = '', date = '', statususer = '', resend = '', resendblock = '' } = data;
	const rowClassView = statususer ? 'table__row--disabled' : '';
	const resendBtnValue = resend ? 'Отменить' : 'Выбрать';
	const resendBtnClassView = resend  ? 'btn--resend-cancel' : '';
	const resendClassView = resendblock ? 'btn--allow-disabled' : '';
	const resendBtnBlock = resendblock ? 'disabled="disabled"' : '';

	return `
		<div class="table__row ${rowClassView}" data-id="${id}">
			<div class="table__cell table__cell--body table__cell--fio">
				<span class="table__text table__text--body">${fio}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--post">
				<span class="table__text table__text--body">${post}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--statustitle">
				<span class="table__text table__text--body">${statustitle}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--date">
				<span class="table__text table__text--body">${date}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--btn-resend">
				<button class="btn btn--resend ${resendBtnClassView} ${resendClassView}" type="button" ${resendBtnBlock}>${resendBtnValue}</button>
			</div>
			<div class="table__cell table__cell--body table__cell--view">
				<button class="table__btn table__btn--view" type="button">
					<svg class="icon icon--view icon--view-black">
						<use class="icon__item" xlink:href="./images/sprite.svg#view"></use>
					</svg>
				</button>
			</div>
		</div>
	`;
};
