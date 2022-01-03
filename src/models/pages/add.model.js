'use strict';

import MainModel from '../main.model.js';

import { table } from '../../components/add/table.tpl.js';
import { form } from '../../components/add/form.tpl.js';
import { headerTable } from '../../components/add/header-table.tpl.js';
import { pageTitle } from '../../components/page-title.tpl.js';

class AddModel extends MainModel {
	constructor(props) {
		super({ ...props, table });

		({
			pageName: this.page = '',
			object: this.object = {},
			collection: this.collection = new Map()
		} = props);
	}

	renderForm() {
		const cardvalidtoList = [
			{
				title: 'Ввести дату',
				type: 'cardvalidto',
				typevalue: 'date'
			},
			{
				title: 'Безвременно',
				type: 'cardvalidto',
				typevalue: 'infinite'
			}
		];
		const typeList = [
			{
				title: 'Новая карта',
				type: 'type',
				typevalue: 'newCard'
			},
			{
				title: 'Новый QR-код',
				type: 'type',
				typevalue: 'newQR'
			}
		];
		const selectList = {
			cardvalidtoList: this.renderSelect(cardvalidtoList),
			typeList: this.renderSelect(typeList)
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
		this.object.statuscardvalidto = [...this.collection.values()].some(({ cardvalidtoid }) => cardvalidtoid === 'date');
		const cardvalidtoMod = this.object.statuscardvalidto ? '-cardvalidto' : '';

		return `wrap wrap--content wrap--content-${this.page}${cardvalidtoMod}`;
	}

	render() {
		return `
			${pageTitle(this.object)}
			<form class="form form--page" action="#" method="GET">
				<div class="form__wrap form__wrap--user">${this.renderForm()}</div>
				<div class="main__btns">
					<button class="btn" id="addUser" type="button" data-type="add-user">Добавить</button>
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

export default AddModel;
