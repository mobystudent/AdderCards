'use strict';

export const form = (data, selects) => {
	const { posttitle = '', datetitle = '', statusid = '', statustitle = '' } = data;
	const { post: postSelect, statusid: statusidSelect } = selects;
	const postValue = posttitle ? posttitle : 'Выберите должность';
	const postClassView = posttitle ? 'select__value--selected-form' : '';
	const statusValue = statustitle ? statustitle : 'Выберите статус';
	const statusClassView = statustitle ? 'select__value--selected-form' : '';
	const filterDiffClassView = datetitle || posttitle || statusid ? '' : 'btn--cancel-disabled';
	const filterBtnBlock = datetitle || posttitle || statusid ? '' : 'disabled="disabled"';

	return `
		<div class="form__wrap form__wrap--filter">
			<div class="form__fields form__fields--filter">
				<div class="form__field form__field--filter">
					<span class="form__name form__name--form">Фильтровать по должности</span>
					<div class="select" data-select="post">
						<header class="select__header select__header--form">
							<span class="select__value select__value--form ${postClassView}" data-title="${postValue}" data-type="${posttitle}">${postValue}</span>
						</header>
						<ul class="select__list select__list--form">${postSelect}</ul>
					</div>
				</div>
				<div class="form__field form__field--filter">
					<span class="form__name form__name--form">Фильтровать по статусу</span>
					<div class="select" data-select="statusid">
						<header class="select__header select__header--form">
							<span class="select__value select__value--form ${statusClassView}" data-title="${statusValue}" data-type="${statusid}">${statusValue}</span>
						</header>
						<ul class="select__list select__list--form">${statusidSelect}</ul>
					</div>
				</div>
				<div class="form__field form__field--filter">
					<label class="form__label">
						<span class="form__name form__name--form">Фильтровать по дате</span>
						<input class="form__item form__item--form" id="reportDatepicker" name="date" type="text" value="${datetitle}" placeholder="Выберите дату" readonly="readonly"/>
					</label>
				</div>
			</div>
			<button class="btn btn--cancel ${filterDiffClassView}" type="reset" ${filterBtnBlock}>Сбросить фильтры</button>
		</div>
	`;
};
