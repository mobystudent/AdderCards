'use strict';

import MainModel from '../main.model.js';

import { table } from '../../components/request/table.tpl.js';
import { tabs } from '../../components/tabs.tpl.js';
import { headerTable } from '../../components/request/header-table.tpl.js';
import { pageTitle } from '../../components/page-title.tpl.js';

class RequestModel extends MainModel {
	constructor(props) {
		super({ ...props, table });

		({
			object: this.object = {},
			departmentCollection: this.departmentCollection = new Map(),
			filterArrs: {
				departs: this.departs = []
			} = {}
		} = props);
	}

	renderTabs() {
		if (this.departs.length > 1) {
			return this.departs.reduce((content, item) => {
				let tabItem;

				this.departmentCollection.forEach(({ nameid = '', shortname = '' }) => {
					if (item === nameid) {
						tabItem = {
							nameid,
							shortname,
							status: this.object.nameid === nameid
						};
					}
				});

				content += tabs(tabItem);

				return content;
			}, '');
		} else {
			return '';
		}
	}

	render() {
		return `
			${pageTitle(this.object)}
			<div class="wrap wrap--content wrap--content-request">
				<div class="main__wrap-info">
					<div class="main__cards">${this.renderCount()}</div>
					<div class="main__switchies">${this.renderSwitch()}</div>
				</div>
				<div class="wrap wrap--table">
					<header class="tab">${this.renderTabs()}</header>
					<div class="table">
						<header class="table__header">${headerTable(this.object)}</header>
						<div class="table__body">${this.renderTable()}</div>
					</div>
				</div>
			</div>
			<div class="info info--page">${this.renderInfo()}</div>
			<div class="main__btns">
				<button class="btn btn--submit" type="button">Подтвердить</button>
			</div>
		`;
	}
}

export default RequestModel;
