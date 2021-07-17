'use strict';

import $ from 'jquery';

$(window).on('load', () => {

});

function clickAllowDisallowPermiss() {
	$('.btn--disallow, .btn--allow').click((e) => {
		const typeBtn = $(e.target).data('type');
		const diffBtn = typeBtn === 'disallow' ? 'allow' : 'disallow';

		$(e.target).parents('.table__row').toggleClass('table__row--disabled');
		$(e.target).siblings(`.btn--${diffBtn}`).toggleClass(`btn--${diffBtn}-disabled`);

		if ($(e.target).hasClass(`btn--${typeBtn}-cancel`)) {
			changeStatusDisallowBtn(e.target, 'removeClass', false, typeBtn, typeBtn, diffBtn);
		} else {
			changeStatusDisallowBtn(e.target, 'addClass', true, 'cancel', typeBtn, diffBtn);
		}
	});
}

function changeStatusDisallowBtn(elem, classStatus, disabled, valText, typeBtn, diffBtn) {
	$(elem).siblings(`.btn--${diffBtn}`).attr('disabled', disabled);
	$(elem).parents('.table__row');
	$(elem)[classStatus](`btn--${typeBtn}-cancel`);

	if (valText === 'cancel') {
		$(elem).parents('.table__row').attr('data-type', typeBtn);
	} else {
		$(elem).parents('.table__row').removeAttr('data-type');
	}

	const textBtn = $(elem).data(valText);
	$(elem).text(textBtn);
}

function confirmAllAllowDisallow() {
	$('#allowAll, #disallowAll').click((e) => {
		const typeBtn = $(e.target).data('type');
		const typeAttrItemsBtn = $(e.target).hasClass(`btn--${typeBtn}-cancel`) ? 'disabled'  : false;
		const dataTypeItem = $(e.target).hasClass(`btn--${typeBtn}-cancel`) ? 'attr' : 'removeAttr';
		const classBtns = ['allow', 'disallow'];

		$('.table--permis .table__content--active .table__row').toggleClass('table__row--disabled')[dataTypeItem]('data-type', typeBtn);

		classBtns.forEach((item) => {
			$(`.table--permis .table__content--active .table__row .btn--${item}`).toggleClass(`btn--${item}-disabled`).attr('disabled', typeAttrItemsBtn);
		});
	});
}

function templatePermissionTable(data) {
	const { id = '', fio = '', post = '', statusid = '' } = data;

	return `
		<div class="table__row table__row--time" data-id="${id}">
			<div class="table__cell table__cell--body table__cell--fio">
				<span class="table__text table__text--body">${fio}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--post">
				<span class="table__text table__text--body">${post}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--statusid">
				<span class="table__text table__text--body">${statusid}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--control">
				<button class="btn btn--allow" data-type="allow" data-cancel="Отменить" data-allow="Разрешить" type="button">
					Разрешить
				</button>
				<button class="btn btn--disallow" data-type="disallow" data-cancel="Отменить" data-disallow="Запретить" type="button">
					Запретить
				</button>
			</div>
		</div>
	`;
}

export default {
	clickAllowDisallowPermiss,
	confirmAllAllowDisallow,
	templatePermissionTable
};
