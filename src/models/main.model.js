'use strict';

import { count } from '../components/count.tpl.js';
import { switchElem } from '../components/switch.tpl.js';

class MainModel {
	constructor(props) {
		({
			object: this.object = {},
			checkNameId: this.checkNameId = false,
			collection: this.collection = new Map(),
			count: this.count = 0,
			switchItem: this.switchItem,
			info: this.info = [],
			errors: this.errors = [],
			table: this.table
		} = props);
	}

	renderTable() {
		if (!this.collection.size) {
			return `<p class="table__nothing">Новых данных нет</p>`;
		} else {
			return [...this.collection.values()].reduce((content, item) => {
				if (this.checkNameId) {
					if (item.nameid === this.object.nameid) {
						content += this.table(item);
					}
				} else {
					content += this.table(item);
				}

				return content;
			}, '');
		}
	}

	renderSwitch() {
		return Object.values(this.switchItem).reduce((content, item) => {
			let switchText;
			let tooltip;

			if (item.type === 'refresh') {
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
