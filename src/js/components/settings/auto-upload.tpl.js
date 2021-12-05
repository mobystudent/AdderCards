'use strict';

export const autoUpload = (data) => {
	const { statustimeautoupdate, autoupdatetitle, autoupdatevalue } = data;
	const arrayTimeAutoUploadValues = [
		{
			title: '5 мин.',
			value: 5
		},
		{
			title: '10 мин.',
			value: 10
		},
		{
			title: '15 мин.',
			value: 15
		},
		{
			title: '20 мин.',
			value: 20
		},
		{
			title: '30 мин.',
			value: 30
		},
		{
			title: '45 мин.',
			value: 45
		},
		{
			title: '1 час',
			value: 60
		}
	];
	const timeAutoUploadSelect = arrayTimeAutoUploadValues.reduce((select, { title, value }) => {
		select += `
			<li class="select__item">
				<span class="select__name select__name--settings" data-title="${title}" data-autoupdate="${value}">${title}</span>
			</li>
		`;

		return select;
	}, '');
	const timeAutoUploadBtnValue = statustimeautoupdate ? 'Отменить' : 'Изменить';
	const timeAutoUploadBtnClass = statustimeautoupdate ? 'btn--settings-disabled' : '';
	const timeAutoUploadValue = autoupdatetitle ? autoupdatetitle : 'Выберите период автообновления';
	const timeAutoUploadClassView = autoupdatetitle ? 'select__value--selected-settings' : '';
	const timeAutoUploadView = statustimeautoupdate ? `
		<form class="form form--settings" action="#" method="GET">
			<div class="form__field">
				<div class="form__item select select--settings" data-type="autoupdate" data-select="autoupdate">
					<header class="select__header select__header--settings">
						<span class="select__value select__value--settings ${timeAutoUploadClassView}" data-title="${timeAutoUploadValue}" data-autoupdate="${autoupdatevalue}">${timeAutoUploadValue}</span>
					</header>
					<ul class="select__list select__list--settings">
						${timeAutoUploadSelect}
						<li class="select__item">
							<span class="select__name select__name--settings" data-autoupdate="отключить" data-value="none">отключить</span>
						</li>
					</ul>
				</div>
			</div>
			<button class="btn btn--changes" data-name="timeautoupdate" type="button">Подтвердить</button>
		</form>
	` : '';

	return `
		<div class="settings__section" data-block="timeautoupdate">
			<div class="settings__wrap">
				<h3 class="settings__title">Период автообновления данных в таблицах</h3>
				<span class="settings__value settings__value--autoupdate" data-value="${autoupdatevalue}">${autoupdatetitle}</span>
			</div>
			<div class="settings__btn-wrap">
				<button class="btn btn--settings ${timeAutoUploadBtnClass}" type="button" data-name="timeautoupdate">${timeAutoUploadBtnValue}</button>
			</div>
			${timeAutoUploadView}
			<div class="info info--settings">
				<p class="info__item info__item--warn info__item--fields">Предупреждение! Не выбрано время.</p>
			</div>
		</div>
	`;
};
