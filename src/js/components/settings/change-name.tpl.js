'use strict';

export const changeName = (data) => {
	const { statuschangename, changelongname, changeshortname } = data;
	const changeLongNameValue = changelongname ? changelongname : '';
	const changeShortNameValue = changeshortname ? changeshortname : '';

	return statuschangename ? `
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
};
