'use strict';

export const changeEmail = (data) => {
	const { statuschangeemail } = data;

	return statuschangeemail ? `
		<form class="form form--settings" action="#" method="GET">
			<div class="form__field">
				<label class="form__name form__name--settings" for="emailManager">Введите новый email</label>
				<input class="form__item form__item--settings" name="changeemail" id="emailManager" type="email" placeholder="Введите новый email"/>
			</div>
			<button class="btn btn--changes" data-name="changeemail" type="button">Сохранить</button>
		</form>
	` : '';
};
