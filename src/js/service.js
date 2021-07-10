'use strict';

import $ from 'jquery';

$(window).on('load', () => {
	printReport();
});


function printReport() {
	$('.btn--print').click((e) => {
		window.print();
	});
}

export default {
	printReport
};
