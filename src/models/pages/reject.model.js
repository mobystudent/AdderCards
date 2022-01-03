'use strict';

import MainModel from '../main.model.js';

import { table } from '../../components/reject/table.tpl.js';
import { form } from '../../components/reject/form.tpl.js';
import { headerTable } from '../../components/reject/header-table.tpl.js';
import { pageTitle } from '../../components/page-title.tpl.js';

class RejectModel extends MainModel {
	constructor(props) {
		super({ ...props, table });

		({
			object: this.object = {},
			collection: this.collection = new Map(),
		} = props);
	}

	renderForm() {
		const { id } = this.object;

		if (id) {
			for (const item of this.collection.values()) {
				if (+item.id === id) {
					return form(item);
				}
			}
		} else {
			return '';
		}
	}

	render() {
		return `
			${pageTitle(this.object)}
			<form class="form form--page" action="#" method="GET">
				<div class="form__wrap form__wrap--user">${this.renderForm()}</div>
			</form>
			<div class="wrap wrap--content wrap--content-reject">
				<div class="main__wrap-info">
					<div class="main__cards">${this.renderCount()}</div>
					<div class="main__switchies">${this.renderSwitch()}</div>
				</div>
				<div class="wrap wrap--table">
					<div class="table">
						<header class="table__header">${headerTable(this.object)}</header>
						<div class="table__body">${this.renderTable()}</div>
					</div>
				</div>
			</div>
			<div class="info info--page">${this.renderInfo()}</div>
			<div class="main__btns">
				<button class="btn btn--submit" type="button">Отправить</button>
			</div>
		`;
	}
}

export default RejectModel;
