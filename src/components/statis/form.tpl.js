'use strict';

export const form = (data, selects) => {
	const { departtitle = '', departid = '', datetitle = '', typeid = '', typetitle = '' } = data;
	const { departs: departSelect, types: typeSelect } = selects;
	const departValue = departtitle ? departtitle : 'Выберите подразделение';
	const departClassView = departtitle ? 'select__value--selected-form' : '';
	const typeValue = typetitle ? typetitle : 'Выберите статус';
	const typeClassView = typetitle ? 'select__value--selected-form' : '';
	const filterDiffClassView = datetitle || departtitle || typeid ? '' : 'btn--cancel-disabled';
	const filterBtnBlock = datetitle || departtitle || typeid ? '' : 'disabled="disabled"';

	return `
		<div class="form__wrap form__wrap--filter">
			<div class="form__fields form__fields--filter">
				<div class="form__field form__field--filter">
					<span class="form__name form__name--form">Фильтровать по подразделению</span>
					<div class="select" data-select="depart">
						<header class="select__header select__header--form">
							<span class="select__value select__value--form ${departClassView}" data-title="${departValue}" data-type="${departid}">${departValue}</span>
						</header>
						<ul class="select__list select__list--form">${departSelect}</ul>
					</div>
				</div>
				<div class="form__field form__field--filter">
					<span class="form__name form__name--form">Фильтровать по типу</span>
					<div class="select" data-select="type">
						<header class="select__header select__header--form">
							<span class="select__value select__value--form ${typeClassView}" data-title="${typeValue}" data-type="${typeid}">${typeValue}</span>
						</header>
						<ul class="select__list select__list--form">${typeSelect}</ul>
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
