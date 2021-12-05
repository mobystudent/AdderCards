'use strict';

export const removeDepart = (data) => {
	const { statusremovedepart, removelongname, removenameid } = data;
	const removeDepartBtnValue = statusremovedepart ? 'Отменить' : 'Удалить';
	const removeDepartBtnClass = statusremovedepart ? 'btn--settings-disabled' : '';
	const removedepartValue = removelongname ? removelongname : 'Выберите подразделение';
	const removedepartClassView = removelongname ? 'select__value--selected-settings' : '';
	const removeDepartView = statusremovedepart ? `
		<form class="form form--settings" action="#" method="GET">
			<div class="form__field">
				<h3 class="form__name form__name--settings">Выбрать подразделение</h3>
				<div class="form__item select select--settings" data-type="removenameid" data-select="removenameid">
					<header class="select__header select__header--settings">
						<span class="select__value select__value--settings ${removedepartClassView}" data-title="${removedepartValue}" data-removenameid="${removenameid}">${removedepartValue}</span>
					</header>
					<ul class="select__list select__list--settings"></ul>
				</div>
			</div>
			<button class="btn btn--changes" data-name="removedepart" type="button">Подтвердить</button>
		</form>
	` : '';

	return `
		<div class="settings__section" data-block="removedepart">
			<div class="settings__wrap">
				<h3 class="settings__title">Удалить подразделение</h3>
			</div>
			<div class="settings__btn-wrap">
				<button class="btn btn--settings ${removeDepartBtnClass}" data-name="removedepart" type="button">${removeDepartBtnValue}</button>
			</div>
			${removeDepartView}
			<div class="info info--settings">
				<p class="info__item info__item--warn info__item--fields">Предупреждение! Не выбрано подразделение.</p>
			</div>
		</div>
	`;
};
