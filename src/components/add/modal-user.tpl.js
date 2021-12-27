'use strict';

export const modalUser = (data) => {
	const { fio = '', post = '', date = '', photofile = '' } = data;

	return `
		<h2 class="modal__title">Пользователь с данным именем уже был добавлен!</h2>
		<div class="modal__wrap">
			<div class="modal__fields">
				<div class="modal__field">
					<span class="modal__name">Фамилия Имя Отчество</span>
					<span class="modal__value">${fio}</span>
				</div>
				<div class="modal__field">
					<span class="modal__name">Должность</span>
					<span class="modal__value">${post}</span>
				</div>
				<div class="modal__field">
					<span class="modal__name">Дата добавления</span>
					<span class="modal__value">${date}</span>
				</div>
			</div>
			<div class="modal__aside">
				<div class="modal__img">
					<img class="img img--form" src="${photofile}" alt="user avatar"/>
				</div>
			</div>
		</div>
		<p class="modal__propose">Выберите действие с добавляемым пользователем.<br/><span class="modal__mark modal__mark--add">всё равно добавить</span> или <span class="modal__mark modal__mark--cancel">отменить добавление</span>:</p>
		<div class="modal__btns">
			<button class="modal__btn modal__btn--add" type="button" data-name="add">Добавить</button>
			<button class="modal__btn modal__btn--cancel" type="button" data-name="cancel">Отмена</button>
		</div>
	`;
};
