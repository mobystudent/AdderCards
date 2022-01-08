'use strict';

import MainModel from '../main.model.js';

import { table } from '../../components/time/table.tpl.js';
import { headerTable } from '../../components/time/header-table.tpl.js';
import { pageTitle } from '../../components/page-title.tpl.js';

class TimeModel extends MainModel {
	constructor(props) {
		super({ ...props, table });

		({
			object: this.object = {}
		} = props);
	}

	render() {
		return `
			${pageTitle(this.object)}
			<div class="wrap wrap--content wrap--content-time">
				<div class="main__wrap-info">
					<div class="main__cards">${this.renderCount()}</div>
					<button class="main__btn" id="addTimeCard" type="button">
						<svg class="icon icon--plus">
							<use class="icon__item" xlink:href="./images/sprite.svg#plus"></use>
						</svg>
						<span class="main__btn-text">Добавить карту</span>
					</button>
				</div>
				<div class="wrap wrap--table">
					<div class="table">
						<header class="table__header">${headerTable()}</header>
						<div class="table__body">${this.renderTable()}</div>
					</div>
				</div>
			</div>
			<div class="info info--page">${this.renderInfo()}</div>
			<div class="main__btns">
				<button class="btn btn--submit" type="button">Добавить</button>
			</div>
		`;
	}
}

export default TimeModel;
