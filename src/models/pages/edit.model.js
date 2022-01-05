'use strict';

import MainModel from '../main.model.js';

import { table } from '../../components/edit/table.tpl.js';
import { form } from '../../components/edit/form.tpl.js';
import { headerTable } from '../../components/edit/header-table.tpl.js';
import { pageTitle } from '../../components/page-title.tpl.js';

class EditModel extends MainModel {
	constructor(props) {
		super({ ...props, table });

		({
			pageName: this.page = '',
			object: this.object = {},
			collection: this.collection = new Map()
		} = props);
	}

	renderForm() {
		const changeList = [
			{
				title: 'Утеря пластиковой карты',
				type: 'change',
				typevalue: 'changeCard'
			},
			{
				title: 'Утеря QR-кода',
				type: 'change',
				typevalue: 'changeQR'
			},
			{
				title: 'Изменение ФИО',
				type: 'change',
				typevalue: 'changeFIO'
			},
			{
				title: 'Изменение должности',
				type: 'change',
				typevalue: 'changePost'
			},
			{
				title: 'Изменение фото',
				type: 'change',
				typevalue: 'changeImage'
			}
		];
		const selectList = {
			changeList: this.renderSelect(changeList)
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
		this.object.statusnewfio = [...this.collection.values()].some(({ newfio }) => newfio);
		this.object.statusnewpost = [...this.collection.values()].some(({ newpost }) => newpost);
		this.object.statusnewphotofile = [...this.collection.values()].some(({ newphotofile }) => newphotofile);
		const newfioMod = this.object.statusnewfio ? '-newfio' : '';
		const newpostMod = this.object.statusnewpost ? '-newpost' : '';
		const photofileMod = this.object.statusnewphotofile ? '-photofile' : '';

		return `wrap wrap--content wrap--content-${this.page}${newfioMod}${newpostMod}${photofileMod}`;
	}

	render() {
		return `
			${pageTitle(this.object)}
			<form class="form form--page" action="#" method="GET">
				<div class="form__wrap form__wrap--user">${this.renderForm()}</div>
				<div class="main__btns">
					<button class="btn" id="editUser" type="button" data-type="edit-user">Редактировать</button>
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

export default EditModel;
