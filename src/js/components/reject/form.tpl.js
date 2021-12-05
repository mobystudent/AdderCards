'use strict';

export const form = (data) => {
	const { fio = '', post = '', statustitle = '', date = '', photourl = '' } = data;

	return `
		<div class="form__fields">
			<div class="form__field">
				<span class="form__name form__name--form">Фамилия Имя Отчество</span>
				<span class="form__item form__item--static" data-field="fio">${fio}</span>
			</div>
			<div class="form__field">
				<span class="form__name form__name--form">Должность</span>
				<span class="form__item form__item--static" data-field="post">${post}</span>
			</div>
			<div class="form__field">
				<span class="form__name form__name--form">Статус</span>
				<span class="form__item form__item--static" data-field="statustitle">${statustitle}</span>
			</div>
			<div class="form__field">
				<span class="form__name form__name--form">Дата</span>
				<span class="form__item form__item--static" data-field="date">${date}</span>
			</div>
		</div>
		<div class="form__aside">
			<div class="form__img">
				<img class="img img--form img--form-edit" src="${photourl}" alt="user avatar"/>
			</div>
		</div>
		<div class="form__message">
			<span class="form__name form__name--form">Причина отклонения</span>
			<p class="form__item form__item--static form__item--message" data-field="reason">Не привлекательная внешность.</p>
		</div>
	`;
};
