'use strict';

export const headerTable = (data) => {
	const { statusallow, statusdisallow } = data;
	const allowBtnValue = statusallow ? 'Отменить' : 'Разрешить все';
	const disallowBtnValue = statusdisallow ? 'Отменить' : 'Запретить все';
	const allowBtnClassView = statusallow ? 'btn--allow-cancel' : '';
	const disallowBtnClassView = statusdisallow ? 'btn--disallow-cancel' : '';
	const allowDiffClassView = statusdisallow ? 'btn--allow-disabled' : '';
	const disallowDiffClassView = statusallow ? 'btn--disallow-disabled' : '';
	const allowBtnBlock = statusdisallow ? 'disabled="disabled"' : '';
	const disallowBtnBlock = statusallow ? 'disabled="disabled"' : '';

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
		<div class="table__cell table__cell--header table__cell--btn-permis">
			<button class="btn btn--allow ${allowBtnClassView} ${allowDiffClassView}" id="allowAll" type="button" data-type="allow" ${allowBtnBlock}>
				${allowBtnValue}
			</button>
			<button class="btn btn--disallow ${disallowBtnClassView} ${disallowDiffClassView}" id="disallowAll" type="button" data-type="disallow" ${disallowBtnBlock}>
				${disallowBtnValue}
			</button>
		</div>
	`;
};
