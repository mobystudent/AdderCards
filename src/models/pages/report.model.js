'use strict';

import MainModel from '../main.model.js';

import { table } from '../../components/report/table.tpl.js';
import { headerTable } from '../../components/report/header-table.tpl.js';
import { form } from '../../components/report/form.tpl.js';
import { filter } from '../../components/report/filter.tpl.js';
import { pageTitle } from '../../components/page-title.tpl.js';

class ReportModel extends MainModel {
	constructor(props) {
		super({ ...props, table });

		({
			object: this.object = {},
			filterArrs: {
				posts: this.posts = [],
				status: this.status = []
			} = {}
		} = props);
	}

	renderForm() {
		const filters = [
			{
				select: 'post',
				array: this.posts
			},
			{
				select: 'statusid',
				array: this.status
			}
		];

		const stateForm = filters.reduce((contentObj, { select, array }) => {
			contentObj[select] = array.reduce((content, item) => {
				content += filter({ select, item });

				return content;
			}, '');

			return contentObj;
		}, {});

		return form(this.object, stateForm);
	}

	render() {
		return `
			${pageTitle(this.object)}
			<div class="wrap wrap--content wrap--content-report-item">
				<form class="form form--filter" action="#" method="GET">${this.renderForm()}</form>
				<div class="main__wrap-info">
					<div class="main__cards">${this.renderCount()}</div>
					<div class="main__switchies">${this.renderSwitch()}</div>
				</div>
				<div class="wrap wrap--table">
					<div class="table">
						<header class="table__header">${headerTable()}</header>
						<div class="table__body">${this.renderTable()}</div>
					</div>
				</div>
			</div>
		`;
	}
}

export default ReportModel;
