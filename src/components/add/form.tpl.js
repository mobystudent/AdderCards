'use strict';

export const form = (data, selects) => {
	const { fio = '', photourl = '', post = '', statusid = '', statustitle = '', cardvalidtotitle = '', cardvalidtoid = '', cardvalidto = '' } = data;
	const { cardvalidtoList = '', typeList = '' } = selects;
	const typeValue = statustitle ? statustitle : 'Выберите тип идентификатора';
	const typeClassView = statustitle ? 'select__value--selected-form' : '';
	const cardvalidtoValue = cardvalidtotitle ? cardvalidtotitle : 'Выберите окончание действия пропуска';
	const cardvalidtoClassView = cardvalidtotitle ? 'select__value--selected-form' : '';
	const photoValue = photourl ? photourl : './images/avatar.svg';
	const cardvalidtoView = cardvalidtoid === 'date' ? `
		<div class="form__field">
			<label class="form__label">
				<span class="form__name form__name--form">Дата окончания</span>
				<input class="form__item form__item--form" id="addDatepicker" data-field="date" name="date" type="text" value="${cardvalidto}" placeholder="Введите дату" readonly="readonly" required="required"/>
			</label>
		</div>
	` : '';

	return `
		<div class="form__fields">
			<div class="form__field">
				<label class="form__label">
					<span class="form__name form__name--form">Фамилия Имя Отчество</span>
					<input class="form__item form__item--form" data-field="fio" name="fio" type="text" value="${fio}" placeholder="Введите ФИО" required="required"/>
				</label>
			</div>
			<div class="form__field">
				<label class="form__label">
					<span class="form__name form__name--form">Должность</span>
					<input class="form__item form__item--form" data-field="post" name="post" type="text" value="${post}" placeholder="Введите должность" required="required"/>
				</label>
			</div>
			<div class="form__field">
				<span class="form__name form__name--form">Тип идентификатора</span>
				<div class="form__select select select--form" data-field="statustitle" data-type="statusid" data-select="type">
					<header class="select__header select__header--form">
						<span class="select__value select__value--form ${typeClassView}" data-title="${typeValue}" data-type="${statusid}">${typeValue}</span>
					</header>
					<ul class="select__list select__list--form">
						${typeList}
					</ul>
				</div>
			</div>
			<div class="form__field">
				<span class="form__name form__name--form">Окончание действия пропуска</span>
				<div class="form__select select select--form" data-field="cardvalidtotitle" data-type="statuscardvalidto" data-select="cardvalidto">
					<header class="select__header select__header--form">
						<span class="select__value select__value--form ${cardvalidtoClassView}" data-title="${cardvalidtoValue}" data-cardvalidto="${cardvalidtoid}">${cardvalidtoValue}</span>
					</header>
					<ul class="select__list select__list--form">
						${cardvalidtoList}
					</ul>
				</div>
			</div>
			${cardvalidtoView}
		</div>
		<div class="form__aside">
			<div class="form__img">
				<img class="img img--form" src="${photoValue}" alt="user avatar"/>
			</div>
			<div class="form__field">
				<input class="form__item form__item--file" id="addFile" name="photofile" type="file" required="required"/>
				<label class="form__download" for="addFile">
					<svg class="icon icon--download">
						<use xlink:href=./images/sprite.svg#download></use>
					</svg>
					<span class="form__title form__title--page">Загрузить фото</span>
				</label>
			</div>
		</div>
	`;
};
