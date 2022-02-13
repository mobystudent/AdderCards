'use strict';

import $ from 'jquery';
import service from '../../js/service.js';

import StatisModel from '../../models/pages/statis.model.js';

class Statis {
	constructor(props) {
		({
			page: this.page = ''
		} = props);

		this.filterCollection = new Map(); // БД для вывода значений в фильтры
		this.departmentCollection = new Map();  // Коллекция подразделений
		this.collection = new Map();
		this.object = {
			title: 'Статистика',
			departtitle: '',
			departid: '',
			datetitle: '',
			typeid: '',
			typetitle: '',
			filters: {}
		};
		this.untouchable = ['nameid', 'longname', 'title'];

		this.getDepartmentFromDB();
		this.filterUsersFromDB();
	}

	render() {
		console.log(this.filterTypes());
		const statisModel = new StatisModel({
			object: this.object,
			countTypes: this.percentTypeIdentify(),
			dynamicInfo: this.countDymanicTypes(),
			filterArrs: {
				departs: this.getDeparts(),
				types: this.filterTypes()
			}
		});

		$(`.main[data-name=${this.page}]`).html('');
		$(`.main[data-name=${this.page}]`).append(statisModel.render());

		// this.countTypesPerMonth();
		this.toggleSelect();
		this.drawRelationDiagram();
		this.drawDynamicDiagram();
	}

	userFromDB(array, filter = '') {
		array.forEach((item, i) => {
			this.collection.set(i, item);
			if (filter) {
				this.filterCollection.set(i, item);
			}
		});
		// console.log(this.collection);
		// console.log(this.filterCollection);
		// super.dataAdd();

		this.render();
	}

	toggleSelect() {
		$(`.main[data-name=${this.page}] .select__header`).click(({ currentTarget }) => {
			$(currentTarget).next().slideToggle().toggleClass('select__header--active');
		});

		this.clickSelectItem();
	}

	clickSelectItem() {
		$(`.main[data-name=${this.page}] .select__item`).click(({ currentTarget }) => {
			const title = $(currentTarget).find('.select__name').data('title');
			const select = $(currentTarget).parents('.select').data('select');
			const statusid = $(currentTarget).find('.select__name').data(select);

			if (select === 'fio') {
				const id = $(currentTarget).find('.select__name').data('id');

				this.getAddUsersInDB(id); // вывести должность в скрытое поле
			}

			this.setDataAttrSelectedItem(title, select, statusid);
		});
	}

	setDataAttrSelectedItem(title, select, statusid) {
		if (select === 'depart') {
			this.object.departtitle = title;
			this.object.departid = statusid;
			this.object.filters.departs = statusid;
		} else {
			this.object.typetitle = title;
			this.object.typeid = statusid;
			this.object.filters.types = statusid;
		}
	}

	// countTypesPerMonth() {
	// 	const allTypes = [...this.filterCollection.values()].map(({ statusid, date }) => [statusid, date]);
	// 	const typeIdentify = ['newCard', 'newQR', 'timeCard', 'changeQR', 'changeCard'];
	// 	const filterStatus = allTypes.filter(([statusid]) => typeIdentify.includes(statusid));
	// 	const getDate = filterStatus.map((item) => {
	// 		const date = item[1].slice(0, item[1].indexOf(' '));
	// 		const day = date.slice(0, date.indexOf('-'));
	// 		const month = date.slice(date.indexOf('-') + 1, date.lastIndexOf('-'));
	// 		const year = date.slice(date.lastIndexOf('-') + 1);
	//
	// 		return [day, month, year];
	// 	});
	// 	// console.log(getDate);
	//
	// 	const days = new Date(2022, 1, 0).getDate();
	// 	const month = new Date().getMonth() + 1;
	//
	// 	// console.log(month);
	// 	// console.log(days);
	//
	// 	const monthTypes = getDate.filter((item) => +item[1] === month - 1);
	// }

	countTypeIdentify() {
		const allTypes = [...this.filterCollection.values()].map(({ statusid, statustitle }) => [statusid, statustitle]);
		const typeIdentify = ['newCard', 'newQR', 'timeCard', 'changeQR', 'changeCard'];
		const filterStatus = allTypes.filter(([statusid]) => typeIdentify.includes(statusid));
		const typeObj = {};

		typeIdentify.forEach((name) => {
			let i = 0;

			if (filterStatus.some((item) => item[0] === name)) {
				filterStatus.forEach((item) => {
					if (name === item[0]) {
						typeObj[item[0]] = {};
						typeObj[item[0]].title = item[1];
						typeObj[item[0]].count = ++i;
					}
				});
			}
		});

		return typeObj;
	}

	percentTypeIdentify() {
		const typeObj = this.countTypeIdentify();
		const allCount = Object.values(typeObj).reduce((sum, { count }) => sum += count, 0);

		for (const type in typeObj) {
			typeObj[type].percent = Math.round((typeObj[type].count * 100) / allCount);
		}

		return typeObj;
	}

	drawRelationDiagram() {
		const canvas = $('#relation').get(0);
		const context = canvas.getContext('2d');
		const percentObj = this.percentTypeIdentify();
		const colors = ['yellow', 'red', 'green', 'orange', 'purple'];
		const radius = $(canvas).parent().width() / 2;
		let startAngle = 0;
		let newAngle = 0;

		Object.values(percentObj).forEach(({ percent }, i) => {
			newAngle += percent;
			const endAngle = (Math.PI / 180) * Math.round(3.6 * newAngle);

			context.beginPath();
			context.moveTo(radius, radius);
			context.arc(radius, radius, radius, startAngle, endAngle, false);
			context.lineTo(radius, radius);
			context.fillStyle = colors[i];
			context.fill();

			startAngle = endAngle;
		});
	}

	drawDynamicDiagram() {
		const canvas = $('#dynamic').get(0);
		const context = canvas.getContext('2d');
		const widthDynamic = 690;
		const heightDynamic = 240;
		const objCounts = this.getTypesPerMonth();
		const countDays = new Date(2022, 1, 0).getDate();
		const maxCount = Math.max(...Object.values(objCounts).map((key) => +key));
		const getMaxLimit = maxCount % 5;
		const countCards = getMaxLimit ? Math.ceil(maxCount / 5) * 5 : maxCount + 5;
		const fractionX = (widthDynamic / countDays).toFixed(2);
		const fractionY = (heightDynamic / countCards).toFixed(2);

		console.log(+fractionX);

		this.drawCoordinateSystem(context, countDays, countCards, fractionX, fractionY);
		this.drawDynamicDots(objCounts, context, countDays, fractionX, fractionY);
	}

	drawCoordinateSystem(context, countDays, countCards, fractionX, fractionY) {
		// Отрисовка системы координат
		context.beginPath();
		context.moveTo(20, 10);
		context.lineTo(20, 280);
		context.stroke();
		context.moveTo(20, 280);
		context.lineTo(730, 280);
		context.closePath();
		context.stroke();
		// Стрелочки вверху У
		context.beginPath();
		context.moveTo(20, 10);
		context.lineTo(15, 20);
		context.moveTo(20, 10);
		context.lineTo(25, 20);
		context.closePath();
		context.stroke();
		// Стрелочки внизу Х
		context.beginPath();
		context.moveTo(730, 280);
		context.lineTo(720, 275);
		context.moveTo(730, 280);
		context.lineTo(720, 285);
		context.closePath();
		context.stroke();

		for (let i = 1; i < countDays + 1; i++) {
			const indentText = i < 10 ? 16 : 12;

			context.beginPath();
			context.moveTo(+fractionX * i + 20, 275);
			context.lineTo(+fractionX * i + 20, 285);
			context.closePath();
			context.stroke();
			context.font = '12px sans-serif';
			context.fillText(i, +fractionX * i + indentText, 295);
		}

		for (let i = 0; i < countCards + 1; i++) {
			const indentText = i < 10 ? 5 : 1;

			context.beginPath();
			context.moveTo(15, 270 - (+fractionY * i));
			context.lineTo(25, 270 - (+fractionY * i));
			context.closePath();
			context.stroke();

			if (!(i % 5)) {
				context.font = '12px sans-serif';
				context.fillText(i, indentText, 275 - (+fractionY * i));
			}
		}
	}

	drawDynamicDots(objCounts, context, countDays, fractionX, fractionY) {
		const indentX = 20;
		const indentY = 270;

		// отрисовка точек
		Object.entries(objCounts).forEach(([ day, count ]) => {
			const coordX = +((day * +fractionX + indentX).toFixed(2));
			const coordY = indentY - (count * +fractionY).toFixed(2);

			context.beginPath();
			context.arc(coordX, coordY, 3, 0, Math.PI * 2, true);
			context.fill();
			context.closePath();
		});

		// отрисовка линий связи
		context.beginPath();
		context.moveTo(+fractionX + indentX, indentY);

		for (let i = 1; i < countDays + 1; i++) {
			const coordX = +((i * +fractionX + indentX).toFixed(2));

			if (Object.keys(objCounts).includes(String(i))) {
				const coordY = indentY - (objCounts[i] * +fractionY).toFixed(2);

				context.lineTo(coordX, coordY);
			} else {
				context.lineTo(coordX, indentY);
			}
		}

		context.stroke();
	}

	getTypesPerMonth() {
		const allTypes = [...this.filterCollection.values()].map(({ statusid, date }) => [statusid, date]);
		const typeIdentify = ['newCard', 'newQR', 'timeCard', 'changeQR', 'changeCard'];
		const filterStatus = allTypes.filter(([statusid]) => typeIdentify.includes(statusid));
		const getDate = filterStatus.map((item) => {
			const date = item[1].slice(0, item[1].indexOf(' '));
			const day = date.slice(0, date.indexOf('-'));
			const month = date.slice(date.indexOf('-') + 1, date.lastIndexOf('-'));
			const year = date.slice(date.lastIndexOf('-') + 1);

			return [day, month, year];
		});
		const daysTypes = getDate.filter((item) => {
			if (+item[1] === 1) return item[0];
		});
		let count = 1;

		return daysTypes.reduce((obj, [ item ]) => {
			if (obj[item]) {
				obj[item] = ++count;
			} else {
				obj[item] = 1;
				count = 1;
			}

			return obj;
		}, {});
	}

	countDymanicTypes() {
		const objCounts = this.getTypesPerMonth();
		const peakValue = Math.max(...Object.values(objCounts).map((key) => +key));
		const totalTypes = Object.values(objCounts).reduce((sum, value) => sum += value, 0);

		return {
			peak: {
				title: 'Пиковое значение',
				count: peakValue
			},
			total: {
				title: 'Общее количество',
				count: totalTypes
			}
		};
	}

	filterTypes() {
		const statusUsers = [...this.filterCollection.values()].map(({ statusid, statustitle }) => [statusid, statustitle]);
		const typeIdentify = ['newCard', 'newQR', 'timeCard', 'changeQR', 'changeCard'];
		const filterStatus = [];

		statusUsers.forEach(([statusid, statustitle]) => {
			if (!filterStatus.map(({ statusid }) => statusid).includes(statusid)) {
				filterStatus.push({ title: statustitle, statusid: statusid });
			}
		});

		return filterStatus.filter(({ statusid }) => typeIdentify.includes(statusid));
	}

	getDeparts() {
		return  [...this.departmentCollection].map((item) => {
			const { nameid = '', longname = '' } = item[1];
			const quoteName = longname.replace(/["']/g, '&quot;');

			return {
				title: quoteName,
				statusid: nameid
			};
		});
	}

	filterUsersFromDB() {
		$.ajax({
			url: "./php/output-request.php",
			method: "post",
			dataType: "html",
			data: {
				nameTable: 'all-report',
				options: this.object.filters
			},
			success: (data) => {
				const dataFromDB = JSON.parse(data);

				this.collection.clear();
				this.userFromDB(dataFromDB, 'filter');
			},
			error: () => {
				service.modal('download');
			}
		});
	}

	async getDepartmentFromDB() {
		await $.ajax({
			url: "./php/output-request.php",
			method: "post",
			dataType: "html",
			data: {
				nameTable: 'department'
			},
			success: (data) => {
				const dataFromDB = JSON.parse(data);

				dataFromDB.forEach((item, i) => {
					this.departmentCollection.set(i + 1, item);
				});
			},
			error: () => {
				service.modal('download');
			}
		});
	}
}

export default Statis;
