'use strict';

import { count } from '../components/count.tpl.js';
import { switchElem } from '../components/switch.tpl.js';

class MainModel {
	constructor(props) {
		({
			collection: this.collection = new Map(),
			count: this.count = 0,
			switchItem: this.switchItem,
			table: this.table
		} = props);
	}

	renderTable() {
		if (!this.collection.size) {
			return `<p class="table__nothing">Новых данных нет</p>`;
		} else {
			return [...this.collection.values()].reduce((content, item) => {
				content += this.table(item);

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
}

export default MainModel;
