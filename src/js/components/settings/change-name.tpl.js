'use strict';

export const changeName = (data) => {
	const { statuschangename, changelongname, changeshortname, nameid, shortname, longname } = data;
	const changeNameBtnValue = statuschangename ? 'Отменить' : 'Изменить';
	const changeNameBtnClass = statuschangename ? 'btn--settings-disabled' : '';
	const changeLongNameValue = changelongname ? changelongname : '';
	const changeShortNameValue = changeshortname ? changeshortname : '';
	const changeNameView = statuschangename ? `
		<form class="form form--settings" action="#" method="GET">
			<div class="form__field">
				<label class="form__name form__name--settings" for="changelongname">Введите новое полное название</label>
				<input class="form__item form__item--settings" name="changelongname" id="changelongname" type="text" value="${changeLongNameValue}" placeholder="Введите новое полное название"/>
			</div>
			<div class="form__field">
				<label class="form__name form__name--settings" for="changeshortname">Введите сокращенное название</label>
				<input class="form__item form__item--settings" name="changeshortname" id="changeshortname" type="text" value="${changeShortNameValue}" placeholder="Введите сокращенное название"/>
				<span class="form__text">
					Например: Химический факультет - Химфак <br/>
					Учебный центр социально-воспитательной и внеобразовательной деятельности - УЦСВВОД <br/>
					Центр трудоустройства студентов и выпускников - Трудцентр
				</span>
			</div>
			<button class="btn btn--changes" data-name="changename" type="button">Подтвердить</button>
		</form>
	` : '';

	return `
		<div class="settings__section" data-block="changename">
			<div class="settings__wrap">
				<h3 class="settings__title">Название подразделения</h3>
				<div class="settings__department" data-nameid="${nameid}" data-shortname="${shortname}" data-longname="${longname}">
					<span class="settings__longname">${longname}</span>
					<small class="settings__separ">/</small>
					<span class="settings__shortname">${shortname}</span>
				</div>
			</div>
			<div class="settings__btn-wrap">
				<button class="btn btn--settings ${changeNameBtnClass}" data-name="changename" type="button">${changeNameBtnValue}</button>
			</div>
			${changeNameView}
			<div class="info info--settings">
				<p class="info__item info__item--warn info__item--fields">Предупреждение! Не все поля заполненны.</p>
				<p class="info__item info__item--error info__item--name">Ошибка! Имя содержит недопустимые символы. Разрешены: кириллические буквы, дефис, апостроф.</p>
			</div>
		</div>
	`;
};
