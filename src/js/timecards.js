'use strict';

import $ from 'jquery';
import convert from './convert.js';

function templateTimeTable() {
	return `
		<div class="table__row table__row--time">
			<div class="table__cell table__cell--body table__cell--nametitle" data-name="">
				<span class="table__text table__text--body">Временная карта</span>
			</div>
			<div class="table__cell table__cell--body table__cell--cardid">
				<input class="table__input" />
			</div>
			<div class="table__cell table__cell--body table__cell--cardname">
				<span class="table__text table__text--body"></span>
			</div>
			<div class="table__cell table__cell--body table__cell--clear">
				<button class="table__btn table__btn--clear" type="button">
					<svg class="icon icon--clear">
						<use class="icon__item" xlink:href="#clear"></use>
					</svg>
				</button>
			</div>
			<div class="table__cell table__cell--body table__cell--delete">
				<button class="table__btn table__btn--delete" type="button">
					<svg class="icon icon--delete">
						<use class="icon__item" xlink:href="#delete"></use>
					</svg>
				</button>
			</div>
		</div>
	`;
}

function addTimeCard() {
	$('.main__btn').click(() => {
		$('#tableTime .table__content').append(templateTimeTable());

		countItems('#tableTime .table__content', 'time');
		convert.viewConvertCardId();
	});
}

function deleteTimeCard() {
	$('.table__content').click((e) => {
		if ($(e.target).parents('.table__btn--delete').length || $(e.target).hasClass('table__btn--delete')) {

			const countItems = $(e.currentTarget).find('.table__row').length;

			if (countItems === 1) return;

			$(e.target).closest('.table__row').remove();
		}

		countItems('#tableTime .table__content', 'time');
	});
}

function clearNumberCard() {
	$('.table__content').click((e) => {
		if ($(e.target).parents('.table__btn--clear').length || $(e.target).hasClass('table__btn--clear')) {
			const cardsUser = $(e.target).parents('.table__row');

			cardsUser.find('.table__cell--cardid input').val('').removeAttr('readonly');
			cardsUser.find('.table__cell--cardname span').text('');
		}

		convert.checkValFieldsCardId(e.target);
	});
}

function countItems(tableContent, modDepart) {
	const countItemfromDep = $(tableContent).eq(0).find('.table__row').length;

	$(`.main__count--${modDepart}`).text(countItemfromDep);
}

export default {
	addTimeCard,
	deleteTimeCard,
	clearNumberCard,
	templateTimeTable
};
