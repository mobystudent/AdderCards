'use strict';

import $ from 'jquery';

$(window).on('load', () => {
	authentication();
});

function authentication() {
	$('#login').click(() => {
		$('.wrapper--login').addClass('wrapper--hide');
		$('.wrapper--page').removeClass('wrapper--hide');
	});
}
