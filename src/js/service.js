'use strict';

import $ from 'jquery';

$(window).on('load', () => {
	printReport();
});


function printReport() {
	$('.btn--print').click((e) => {
		console.log('Click');
		// $(e.target).closest('.main').find('.tab__item--active').data('depart');

		const namePage = $(e.target).closest('.main').data('name');

		console.log(namePage);

		if (namePage == 'qr')
			window.print();
	});
}

export default {
	printReport
};
