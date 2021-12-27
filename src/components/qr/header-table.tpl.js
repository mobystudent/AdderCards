'use strict';

export const headerTable = (data) => {
	const { statusassign, statusmanual } = data;
	const assingBtnCheck = statusassign ? 'checked="checked"' : '';
	const assignView = statusmanual ? `
		<div class="table__cell table__cell--header table__cell--switch-assign">
			<div class="switch switch--item">
				<label class="switch__wrap switch__wrap--item" id="assignAll">
					<input class="switch__input" type="checkbox" ${assingBtnCheck}/>
					<span class="switch__btn"></span>
				</label>
			</div>
		</div>
	` : '';

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
			<span class="table__text table__text--header">ID qr-кода</span>
		</div>
		<div class="table__cell table__cell--header table__cell--cardname">
			<span class="table__text table__text--header">Номер qr-кода</span>
		</div>
		<div class="table__cell table__cell--header table__cell--statustitle">
			<span class="table__text table__text--header">Статус</span>
		</div>
		${assignView}
		<div class="table__cell table__cell--header table__cell--signature">
			<span class="table__text table__text--header">Подпись</span>
		</div>
	`;
};
