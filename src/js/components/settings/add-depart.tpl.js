'use strict';

export const addDepart = (data) => {
	const { statusadddepart, addlongname, addshortname, addnameid } = data;
	const addDepartBtnValue = statusadddepart ? 'Отменить' : 'Добавить';
	const addDepartBtnClass = statusadddepart ? 'btn--settings-disabled' : '';
	const addLongNameValue = addlongname ? addlongname : '';
	const addShortNameValue = addshortname ? addshortname : '';
	const addIDNameValue = addnameid ? addnameid : '';
	const addDepartView = statusadddepart ? `
		<form class="form form--settings" action="#" method="GET">
			<div class="form__field">
				<label class="form__name form__name--settings" for="addlongname">Введите новое полное название</label>
				<input class="form__item form__item--settings" name="addlongname" id="addlongname" type="text" value="${addLongNameValue}" placeholder="Введите новое полное название"/>
			</div>
			<div class="form__field">
				<label class="form__name form__name--settings" for="addshortname">Введите сокращенное название</label>
				<input class="form__item form__item--settings" name="addshortname" id="addshortname" type="text" value="${addShortNameValue}" placeholder="Введите сокращенное название"/>
				<span class="form__text">
					Например: Химический факультет - Химфак <br/>
					Учебный центр социально-воспитательной и внеобразовательной деятельности - УЦСВВОД <br/>
					Центр трудоустройства студентов и выпускников - Трудцентр
				</span>
			</div>
			<div class="form__field">
				<label class="form__name form__name--settings" for="addnameid">Введите id подразделения</label>
				<input class="form__item form__item--settings" name="addnameid" id="addnameid" type="text" value="${addIDNameValue}" placeholder="Введите id подразделения"/>
				<span class="form__text">
					Переводим сокращенное название на английский (не должно быть большей 9 символов). <br/>
					Например: Химический факультет - ChemDep (Химфак) <br/>
					Учебный центр социально-воспитательной и внеобразовательной деятельности - TCSENEA (УЦСВВОД) <br/>
					Центр трудоустройства студентов и выпускников - EmlCen (Трудцентр)
				</span>
			</div>
			<button class="btn btn--changes" data-name="adddepart" type="button">Подтвердить</button>
		</form>
	` : '';

	return `
		<div class="settings__section" data-block="adddepart">
			<div class="settings__wrap">
				<h3 class="settings__title">Добавить подразделение</h3>
			</div>
			<div class="settings__btn-wrap">
				<button class="btn btn--settings ${addDepartBtnClass}" data-name="adddepart" type="button">${addDepartBtnValue}</button>
			</div>
			${addDepartView}
			<div class="info info--settings">
				<p class="info__item info__item--warn info__item--fields">Предупреждение! Не все поля заполненны.</p>
				<p class="info__item info__item--error info__item--name">Ошибка! Имя содержит недопустимые символы. Разрешены: кириллические буквы, дефис, апостроф.</p>
				<p class="info__item info__item--error info__item--long">Ошибка! ID подразделения должно быть не более 9 символов.</p>
			</div>
		</div>
	`;
};
