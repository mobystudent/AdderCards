'use strict';

import { count } from '../components/count.tpl.js';
import { switchElem } from '../components/switch.tpl.js';

class MainModel {
	constructor(props) {
		({
			object: this.object = {},
			checkNameId: this.checkNameId = '',
			collection: this.collection = new Map(),
			count: this.count = 0,
			switchItem: this.switch = {},
			info: this.info = [],
			errors: this.errors = [],
			emptyMess: this.emptyMess = '',
			table: this.table
		} = props);
	}

	renderTable() {
		if (!this.collection.size) {
			return `<p class="table__nothing">${this.emptyMess}</p>`;
		} else {
			return [...this.collection.values()].reduce((content, item) => {
				switch (this.checkNameId) {
					case 'check':
						if (item.nameid === this.object.nameid) {
							content += this.table(item);
						}
						break;
					case 'double-check':
						if (item.nameid === this.object.nameid) {
							content += this.table(item, this.object);
						}
						break;
					case 'double':
						content += this.table(item, this.object);
						break;
					case 'single':
						content += this.table(item);
						break;
				}

				return content;
			}, '');
		}
	}

	renderSwitch() {
		return Object.values(this.switch).reduce((content, item) => {
			let switchText;
			let tooltip;

			if (item.type === 'assign') {
				switchText = item.status ? 'Ручное присвоение' : 'Автоприсвоение';
				tooltip = 'Если в данной опции выставлено автоприсвоение, тогда коды будут автоматически присвоены пользователям. Важно! При нехватке кодов для всех пользователей данная ф-я будет отключена. <br/> Если в данной опции выставлено ручное присваивание, тогда код будет присваеватся для каждого пользоватебя в отдельности.';
			} else {
				switchText = 'Автообновление';
				tooltip = 'Если данная опция включена, тогда при поступлении новых данных, они автоматически отобразятся в таблице. Перезагружать страницу не нужно.<br/> Рекомендуется отключить данную функцию при работе с данными в таблице!';
			}

			const switchItem = {
				switchText,
				tooltip,
				key: item
			};

			content += switchElem(switchItem);

			return content;
		}, '');
	}

	renderCount() {
		return Object.values(this.count).reduce((content, item) => {
			content += count(item);

			return content;
		}, '');
	}

	renderInfo() {
		return this.info.reduce((content, item) => {
			const { type, title, message } = item;

			for (const error of this.errors) {
				if (error === title) {
					content += `<p class="info__item info__item--${type}">${message}</p>`;
				}
			}

			return content;
		}, '');
	}
}

export default MainModel;
