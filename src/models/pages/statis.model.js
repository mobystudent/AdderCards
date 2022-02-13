'use strict';

import { form } from '../../components/statis/form.tpl.js';
import { filter } from '../../components/statis/filter.tpl.js';
import { pageTitle } from '../../components/page-title.tpl.js';

class StatisModel {
	constructor(props) {
		({
			object: this.object = {},
			countTypes: this.countTypes,
			dynamicInfo: this.dynamicInfo,
			filterArrs: {
				departs: this.departs = [],
				types: this.types = []
			} = {}
		} = props);
	}

	renderForm() {
		const filters = [
			{
				select: 'departs',
				array: this.departs
			},
			{
				select: 'types',
				array: this.types
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

	renderRelationInfo() {
		return Object.values(this.countTypes).reduce((content, { title, count, percent }) => {
			content += `<li class="diagrams__li">${title}: ${count} шт./${percent}%</li>`;

			return content;
		}, '');
	}

	renderDynamicInfo() {
		return Object.values(this.dynamicInfo).reduce((content, { title, count }) => {
			content += `<li class="diagrams__li">${title}: ${count} шт.</li>`;

			return content;
		}, '');
	}

	render() {
		return `
			${pageTitle(this.object)}
			<div class="wrap wrap--content wrap--content-statis">
				<form class="form form--filter" action="#" method="GET">${this.renderForm()}</form>
				<div class="diagrams">
					<div class="diagrams__item diagrams__item--dynamic">
						<div class="diagrams__canvas diagrams__canvas--dynamic">
							<canvas height="300" width="740" id="dynamic"></canvas>
						</div>
						<ul class="diagrams__list">${this.renderDynamicInfo()}</ul>
					</div>
					<div class="diagrams__item diagrams__item--relation">
						<div class="diagrams__canvas diagrams__canvas--relation">
							<canvas height="300" id="relation"></canvas>
						</div>
						<ul class="diagrams__list">${this.renderRelationInfo()}</ul>
					</div>
				</div>
			</div>
		`;
	}
}

export default StatisModel;
