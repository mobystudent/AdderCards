'use strict';

import MainModel from '../main.model.js';

import { table } from '../../components/remove/table.tpl.js';
import { form } from '../../components/remove/form.tpl.js';
import { headerTable } from '../../components/remove/header-table.tpl.js';
import { pageTitle } from '../../components/page-title.tpl.js';

class RemoveModel extends MainModel {
	constructor(props) {
		super({ ...props, table });

		({
			pageName: this.page = '',
			object: this.object = {},
			collection: this.collection = new Map()
		} = props);
	}

	renderForm() {
		const reasonList = [
			{
				title: 'Перевод в другое подразделение',
				type: 'reason',
				typevalue: 'changeDepart'
			},
			{
				title: 'Увольнение/отчисление',
				type: 'reason',
				typevalue: 'remove'
			}
		];
		const selectList = {
			reasonList: this.renderSelect(reasonList)
		};

		return form(this.object, selectList);
	}

	renderSelect(array) {
		return array.reduce((content, item) => {
			const { title, type, typevalue } = item;

			content += `
				<li class="select__item">
					<span class="select__name select__name--form" data-title="${title}" data-${type}="${typevalue}">${title}</span>
				</li>
			`;

			return content;
		}, '');
	}

	classHeaderTable() {
		this.object.statusnewdepart = [...this.collection.values()].some(({ newdepart }) => newdepart);
		this.object.statuscardvalidto = [...this.collection.values()].some(({ cardvalidto }) => cardvalidto);
		const newdepartMod = this.object.statusnewdepart ? '-newdepart' : '';
		const cardvalidtoMod = this.object.statuscardvalidto ? '-cardvalidto' : '';

		return `wrap wrap--content wrap--content-${this.page}${newdepartMod}${cardvalidtoMod}`;
	}

	render() {
		return `
			${pageTitle(this.object)}
			<form class="form form--page" action="#" method="GET">
				<div class="form__wrap form__wrap--user">${this.renderForm()}</div>
				<div class="main__btns">
					<button class="btn" id="removeUser" type="button" data-type="remove-user">Удалить</button>
				</div>
			</form>
			<div class="info info--page">${this.renderInfo()}</div>
			<div class="${this.classHeaderTable()}">
				<div class="main__wrap-info">
					<div class="main__cards">${this.renderCount()}</div>
				</div>
				<div class="wrap wrap--table">
					<div class="table">
						<header class="table__header">${headerTable(this.object)}</header>
						<div class="table__body">${this.renderTable()}</div>
					</div>
				</div>
			</div>
			<div class="main__btns">
				<button class="btn btn--submit" type="button">Подтвердить и отправить</button>
			</div>
		`;
	}
}

export default RemoveModel;
