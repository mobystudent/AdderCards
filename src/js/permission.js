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

export default {
	clickAllowDisallowPermiss,
	confirmAllAllowDisallow
};
