'use strict';

const row = (cells) => {
	return cells.reduce((context, cell) => {
		const { block, type, title, btnSort } = cell;
		const sorting = btnSort ? '<button class="btn btn--sort" type="button" data-direction="true"></button>' : '';

		context += `
			<div class="table__cell table__cell--${block} table__cell--${type}">
				<span class="table__text table__text--${block}">${title}</span>
				${sorting}
			</div>
		`;

		return context;
	}, '');
};

export default row;
