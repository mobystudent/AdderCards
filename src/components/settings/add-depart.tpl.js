'use strict';

export const addDepart = (data) => {
	const { statusadddepart, addlongname, addshortname, addnameid } = data;
	const addLongNameValue = addlongname ? addlongname : '';
	const addShortNameValue = addshortname ? addshortname : '';
	const addIDNameValue = addnameid ? addnameid : '';

	return statusadddepart ? `
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
					Переводим сокращенное название на английский (не должно быть больше 9 символов). <br/>
					Например: Химический факультет - ChemDep (Химфак) <br/>
					Учебный центр социально-воспитательной и внеобразовательной деятельности - TCSENEA (УЦСВВОД) <br/>
					Центр трудоустройства студентов и выпускников - EmlCen (Трудцентр)
				</span>
			</div>
			<button class="btn btn--changes" data-name="adddepart" type="button">Подтвердить</button>
		</form>
	` : '';
};
