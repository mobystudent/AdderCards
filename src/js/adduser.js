'use strict';

import $ from 'jquery';

$(window).on('load', () => {
	downloadFoto();
});

function downloadFoto() {
	$('.form__input--file').change((e) => {
		const fileReader = new FileReader();

		fileReader.onload = (e) => {
			$('.img--form').attr('src', e.target.result);
		};

		fileReader.readAsDataURL($(e.target)[0].files[0]);
	});
}

export default {
};
