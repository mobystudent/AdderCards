'use strict';

import $ from 'jquery';
import Scrollbar from 'smooth-scrollbar';

$(window).on('load', () => {
	showChangesFields();
	settingsScrollbar();
	toggleSelect();
});

function showChangesFields() {
	$('.btn--settings').click((e) => {
		const activeText = $(e.currentTarget).attr('data-title');
		const disactiveText = $(e.currentTarget).attr('data-cancel');

		$(e.currentTarget).parents('.settings__section').find('.settings__wrap--change').slideToggle();
		$(e.currentTarget).toggleClass('btn--settings-disabled');

		const btnText = $(e.currentTarget).hasClass('btn--settings-disabled') ? disactiveText : activeText;

		$(e.currentTarget).text(btnText);
	});
}

function settingsScrollbar(nameSection = '#settingsSection') {
	Scrollbar.init($('.settings__content').get(0), {
		alwaysShowTracks: true
	});

	Scrollbar.init($(`${nameSection} .select__list`).get(0), {
		alwaysShowTracks: true
	});
}

function toggleSelect(nameSection = '#settingsSection') {
	$(`${nameSection} .select__header`).click((e) => {
		$(e.currentTarget).next().slideToggle();
		$(e.currentTarget).toggleClass('select__header--active');
	});

	clickSelectItem();
}

function clickSelectItem(nameSection = '#settingsSection') {
	$(`${nameSection} .select__item`).click((e) => {
		const title = $(e.currentTarget).find('.select__name').data('title');
		const value = $(e.currentTarget).find('.select__name').data('value');

		$(e.currentTarget)
			.parents('.select')
			.find('.select__value--settings')
			.attr({ 'data-value': value, 'data-title': title })
			.text(title);
		$(e.currentTarget).parents('.select__header').slideUp();
	});
}
