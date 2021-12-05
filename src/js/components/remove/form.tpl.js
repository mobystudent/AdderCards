'use strict';

export const form = (data) => {
	const { fio = '', statusid = '', newdepart = '', newnameid = '', statustitle = '', cardvalidto  = '', photofile = '' } = data;
	const fioValue = fio ? fio : 'Выберите пользователя';
	const fioClassView = fio ? 'select__value--selected-form' : '';
	const reasonValue = statustitle ? statustitle : 'Выберите причину удаления';
	const reasonClassView = statustitle ? 'select__value--selected-form' : '';
	const photoUrl = photofile ? photofile : './images/avatar.svg';
	const newdepartValue = newdepart ? newdepart : 'Выберите подразделение';
	const newdepartClassView = newdepart ? 'select__value--selected-form' : '';
	const departView = statusid === 'changeDepart' ? `
		<div class="form__field" data-name="depart">
			<span class="form__name form__name--form">Новое подразделение</span>
			<div class="form__select select select--form" data-type="newnameid" data-select="newnameid">
				<header class="select__header select__header--form">
					<span class="select__value select__value--form ${newdepartClassView}" data-title="${newdepartValue}" data-newnameid="${newnameid}">${newdepartValue}</span>
				</header>
				<ul class="select__list select__list--form"></ul>
			</div>
		</div>
	` : '';
	const cardvalidtoView = statusid === 'remove' ? `
		<div class="form__field" data-name="date">
			<label class="form__label">
				<span class="form__name form__name--form">Дата завершения действия пропуска</span>
				<input class="form__item form__item--form" id="removeDatepicker" name="date" type="text" value="${cardvalidto}" placeholder="Введите дату завершения действия пропуска" readonly="readonly" required="required"/>
			</label>
		</div>
	` : '';

	return `
		<div class="form__fields">
			<div class="form__field">
				<span class="form__name form__name--form">Пользователь</span>
				<div class="form__select select select--form" data-select="fio">
					<header class="select__header select__header--form">
						<span class="select__value select__value--form ${fioClassView}" data-title="${fioValue}" data-fio="fio">${fioValue}</span>
					</header>
					<ul class="select__list select__list--form"></ul>
				</div>
			</div>
			<div class="form__field">
				<span class="form__name form__name--form">Причина удаления/отчисления</span>
				<div class="form__select select select--form" data-type="statusid" data-select="reason">
					<header class="select__header select__header--form">
						<span class="select__value select__value--form ${reasonClassView}" data-title="${reasonValue}" data-reason="${statusid}">${reasonValue}</span>
					</header>
					<ul class="select__list select__list--form">
						<li class="select__item">
							<span class="select__name select__name--form" data-title="Перевод в другое подразделение" data-reason="changeDepart">Перевод в другое подразделение</span>
						</li>
						<li class="select__item">
							<span class="select__name select__name--form" data-title="Увольнение/отчисление" data-reason="remove">Увольнение/отчисление</span>
						</li>
					</ul>
				</div>
			</div>
			${departView}
			${cardvalidtoView}
		</div>
		<div class="form__aside">
			<div class="form__img">
				<img class="img img--form img--form-remove" src="${photoUrl}" alt="user avatar"/>
			</div>
		</div>
	`;
};
