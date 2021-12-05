'use strict';

export const switchElem = (data, page = 'qr') => {
	const { type, status } = data;
	const assingBtnCheck = status ? 'checked="checked"' : '';
	const assingBtnClass = type === 'refresh' && !status ? 'switch__name--disabled' : '';
	let switchText;
	let tooltipInfo;

	if (type === 'assign') {
		switchText = status ? 'Ручное присвоение' : 'Автоприсвоение';
		tooltipInfo = 'Если в данной опции выставлено автоприсвоение, тогда коды будут автоматически присвоены пользователям. Важно! При нехватке кодов для всех пользователей данная ф-я будет отключена. <br/> Если в данной опции выставлено ручное присваивание, тогда код будет присваеватся для каждого пользоватебя в отдельности.';
	} else {
		switchText = 'Автообновление';
		tooltipInfo = 'Если данная опция включена, тогда при поступлении новых данных, они автоматически отобразятся в таблице. Перезагружать страницу не нужно.<br/> Рекомендуется отключить данную функцию при работе с данными в таблице!';
	}

	return `
		<div class="main__switch">
			<div class="tooltip">
				<span class="tooltip__item">!</span>
				<div class="tooltip__info tooltip__info--${type}">${tooltipInfo}</div>
			</div>
			<div class="switch switch--${type}-${page}">
				<label class="switch__wrap switch__wrap--head">
					<input class="switch__input" type="checkbox" ${assingBtnCheck}/>
					<small class="switch__btn"></small>
				</label>
				<span class="switch__name ${assingBtnClass}">${switchText}</span>
			</div>
		</div>
	`;
};
