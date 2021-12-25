'use strict';

export const form = (data, selects) => {
	const { fio = '', statusid = '', newpost = '', newfio = '', statustitle = '', photofile = '', newphotourl = '' } = data;
	const { changeList = '' } = selects;
	const fioValue = fio ? fio : 'Выберите пользователя';
	const fioClassView = fio ? 'select__value--selected-form' : '';
	const changeValue = statustitle ? statustitle : 'Выберите тип изменения';
	const changeClassView = statustitle ? 'select__value--selected-form' : '';
	const fioView = statusid === 'changeFIO' ? `
		<div class="form__field" data-name="newfio">
			<label class="form__label">
				<span class="form__name form__name--form">Новое ФИО</span>
				<input class="form__item form__item--form" name="newfio" type="text" value="${newfio}" placeholder="Введите новое ФИО" required="required"/>
			</label>
		</div>
	` : '';
	const postView = statusid === 'changePost' ? `
		<div class="form__field" data-name="newpost">
			<label class="form__label">
				<span class="form__name form__name--form">Новая должность</span>
				<input class="form__item form__item--form" name="newpost" type="text" value="${newpost}" placeholder="Введите новую должность" required/>
			</label>
		</div>
	` : '';
	const imageView = statusid === 'changeImage' ? `
		<div class="form__field" data-name="newimage">
			<input class="form__item form__item--file" id="editFile" name="photofile" type="file" required="required"/>
			<label class="form__download" for="editFile">
				<svg class="icon icon--download">
					<use xlink:href="./images/sprite.svg#download"></use>
				</svg>
				<span class="form__title form__title--page">Загрузить фото</span>
			</label>
		</div>
	` : '';
	let photoUrl;

	if (photofile && !newphotourl) {
		photoUrl = photofile;
	} else if (newphotourl) {
		photoUrl = newphotourl;
	} else {
		photoUrl = './images/avatar.svg';
	}

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
				<span class="form__name form__name--form">Тип изменения</span>
				<div class="form__select select select--form" data-type="statusid" data-select="change">
					<header class="select__header select__header--form">
						<span class="select__value select__value--form ${changeClassView}" data-title="${changeValue}" data-change="${statusid}">${changeValue}</span>
					</header>
					<ul class="select__list select__list--form">
						${changeList}
					</ul>
				</div>
			</div>
			${postView}
			${fioView}
		</div>
		<div class="form__aside">
			<div class="form__img">
				<img class="img img--form img--form-edit" src="${photoUrl}" alt="user avatar"/>
			</div>
			${imageView}
		</div>
	`;
};
