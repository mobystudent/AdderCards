'use strict';

import $ from 'jquery';

function addTimeCard() {
	$('.main__btn').click(() => {
		$('#tableTime .table__content').append(`
			<div class="table__row table__row--time">
				<div class="table__cell table__cell--body table__cell--nametitle">
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
		`);

		countItems('#tableTime .table__content', 'time');
		deleteTimeCard();
	});
}

function deleteTimeCard() {
	$('.table__btn--delete').click((e) => {
		$(e.target).parents('.table__row--time').remove();

		countItems('#tableTime .table__content', 'time');
	});
}

function countItems(tableContent, modDepart) {
	const countItemfromDep = $(tableContent).eq(0).find('.table__row').length;

	$(`.main__count--${modDepart}`).text(countItemfromDep);
}

export default {
	addTimeCard,
	deleteTimeCard
};
