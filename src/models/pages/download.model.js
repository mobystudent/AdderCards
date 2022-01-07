'use strict';

import MainModel from '../main.model.js';

import { table } from '../../components/download/table.tpl.js';
import { headerTable } from '../../components/download/header-table.tpl.js';
import { count } from '../../components/count.tpl.js';
import { pageTitle } from '../../components/page-title.tpl.js';

class DownloadModel extends MainModel {
	constructor(props) {
		super({ ...props, table });

		({
			parseCount: this.parseCount,
			object: this.object = {},
			collection: this.collection = new Map()
		} = props);
	}

	renderCount(countItem) {
		return Object.values(countItem).reduce((content, item) => {
			content += count(item);

			return content;
		}, '');
	}

	render() {
		return `
			${pageTitle(this.object)}
			<div class="wrap wrap--content wrap--content-parse">
				<div class="main__wrap-info main__wrap-info--parse">
					<div class="main__cards">${this.renderCount(this.parseCount)}</div>
				</div>
				<form class="form form--download" action="#" method="GET">
					<div class="form__field">
						<textarea class="form__item form__item--textarea" placeholder="Загрузите текстовые коды для конвертирования">${this.object.textqr}</textarea>
					</div>
				</form>
			</div>
			<div class="main__btns">
				<button class="btn" id="addQRCodes" type="button">Добавить</button>
			</div>
			<div class="info info--page">${this.renderInfo()}</div>
			<div class="wrap wrap--content wrap--content-download">
				<div class="main__wrap-info">
					<div class="main__cards">${this.renderCount(this.count)}</div>
				</div>
				<div class="wrap wrap--table">
					<div class="table">
						<header class="table__header">${headerTable()}</header>
						<div class="table__body">${this.renderTable()}</div>
					</div>
				</div>
			</div>
			<div class="main__btns">
				<button class="btn btn--submit" type="button">Присвоить</button>
			</div>
		`;
	}
}

export default DownloadModel;
