'use strict';

export const changeEmail = (data) => {
	const { statuschangeemail, email } = data;
	const changeEmailBtnValue = statuschangeemail ? 'Отменить' : 'Изменить';
	const changeEmailBtnClass = statuschangeemail ? 'btn--settings-disabled' : '';
	const emailValue = email ? email : 'Введите почту';
	const changeEmailView = statuschangeemail ? `
		<form class="form form--settings" action="#" method="GET">
			<div class="form__field">
				<label class="form__name form__name--settings" for="emailManager">Введите новый email</label>
				<input class="form__item form__item--settings" name="changeemail" id="emailManager" type="email" placeholder="Введите новый email"/>
			</div>
			<button class="btn btn--changes" data-name="changeemail" type="button">Сохранить</button>
		</form>
	` : '';

	return `
		<div class="settings__section" data-block="changeemail">
			<div class="settings__wrap">
				<h3 class="settings__title">Email</h3>
				<span class="settings__value">${emailValue}</span>
			</div>
			<div class="settings__btn-wrap">
				<button class="btn btn--settings ${changeEmailBtnClass}" type="button" data-name="changeemail">${changeEmailBtnValue}</button>
			</div>
			${changeEmailView}
			<div class="info info--settings">
				<p class="info__item info__item--warn info__item--fields">Предупреждение! Не все поля заполненны.</p>
				<p class="info__item info__item--error info__item--email">Ошибка! Некорректный email.</p>
			</div>
		</div>
	`;
};
