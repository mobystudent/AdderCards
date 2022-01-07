'use strict';

import $ from 'jquery';
import service from '../../js/service.js';

import Personnel from '../personnel.ctrl.js';
import DownloadModel from '../../models/pages/download.model.js';

class Download extends Personnel {
	constructor(props) {
		super(props);

		({
			page: this.page = ''
		} = props);

		this.parseQRCollection = new Map(); // БД загруженых qr-кодов
		this.dbQRCodesCollection = new Map();  // Коллекция всех добавленных qr-кодов
		this.object = {
			title: 'Загрузка QR-кодов',
			textqr: '',
			errors: []
		};
		this.parseCount = {
			item: {
				title: 'Количество загруженых qr-кодов:&nbsp',
				get count() {
					return this.collection.size;
				},
				set count({ collection }) {
					this.collection = collection;
				}
			}
		};
		this.count = {
			item: {
				title: 'Количество сгенерированных qr-кодов:&nbsp',
				get count() {
					return this.collection.size;
				},
				set count({ collection }) {
					this.collection = collection;
				}
			}
		};
		this.info = [
			{
				type: 'warn',
				title: 'have',
				message: 'Предупреждение! QR-код с такими данными уже сгенерирован!'
			},
			{
				type: 'warn',
				title: 'contains',
				message: 'Предупреждение! QR-код с такими данными был присвоена ранее!'
			},
			{
				type: 'error',
				title: 'codepicture',
				message: 'Ошибка! Не верно введена строка с кодом для QR изображения. <br> Должен быть код для QR изображения. Например: N-9533263293161909169-16909647123891645267'
			},
			{
				type: 'error',
				title: 'cardid',
				message: 'Ошибка! Не верно введена строка с кодом для QR ID. <br> Код должен состоять из 10 цифр и букв. Например: 31788A8476'
			},
			{
				type: 'error',
				title: 'cardname',
				message: 'Ошибка! Не верно введена строка с кодом для QR name. <br> Код из 16 цифр и букв. Например: E3918631788A8476'
			},
			{
				type: 'error',
				title: 'missed',
				message: 'Ошибка! Пропущена одна из трех обязательных частей qr-кода, для конвертирования.'
			}
		];
		this.untouchable = ['title', 'errors'];
		this.counter = 0;

		this.parseCount.item.count = {
			collection: this.parseQRCollection
		};
		this.count.item.count = {
			collection: this.collection
		};

		this.showDataFromStorage();
	}

	render() {
		const downloadModel = new DownloadModel({
				object: this.object,
				checkNameId: 'single',
				collection: this.collection,
				parseCount: this.parseCount,
				count: this.count,
				info: this.info,
				errors: this.object.errors,
				emptyMess: 'Новых данных нет'
			});

		$(`.main[data-name=${this.page}]`).html('');
		$(`.main[data-name=${this.page}]`).append(downloadModel.render());

		this.deleteUser();
		this.countQRCodes();
		this.addQRCodesInTable();
		this.submitIDinBD();
	}

	countQRCodes() {
		$(`.main[data-name=${this.page}] .form__item--textarea`).bind('input', ({ currentTarget }) => {
			const itemCodesContext = $(currentTarget).val();
			const itemCodes = itemCodesContext.split('\n');
			this.object.textqr = itemCodesContext ? itemCodesContext : '';

			itemCodes.filter((item) => item).forEach((item, i) => {
				this.parseQRCollection.set(i, item.split(' '));
			});

			this.render();
		});
	}

	addQRCodesInTable() {
		$('#addQRCodes').click(() => {
			const correctCount = [...this.parseQRCollection.values()].every((code) => code.length >= 3);
			const correctCodePicture = [...this.parseQRCollection.values()].every((code) => code.find((elem) => elem.includes('N-') && elem.length === 42));
			const correctIDQR = [...this.parseQRCollection.values()].every((code) => code.find((elem) => elem.length === 10));
			const correctNameQR = [...this.parseQRCollection.values()].every((code) => code.find((elem) => elem.length === 16));
			const errorsArr = [];

			if (!correctCount) errorsArr.push('missed');
			if (!correctCodePicture) errorsArr.push('codepicture');
			if (!correctIDQR) errorsArr.push('cardid');
			if (!correctNameQR) errorsArr.push('cardname');

			if (!errorsArr.length) {
				this.getQRCodesFromDB();
				this.codeFromForm();
			} else {
				this.object.errors = errorsArr;

				this.render();
			}
		});
	}

	codeFromForm() {
		this.parseQRCollection.forEach((elem) => {
			const codePicture = elem.find((obj) => obj.includes('N-') && obj.length === 42);
			const idQR = elem.find((obj) => obj.length === 10);
			const nameQR = elem.find((obj) => obj.length === 16);
			const uniqueCode = [...this.collection.values()].some(({ cardid }) => idQR === cardid);
			const containsCode = [...this.dbQRCodesCollection.values()].some(({ cardid }) => idQR === cardid);

			if (uniqueCode) {
				this.object.errors = ['have'];

				this.render();

				return;
			} else {
				this.object.errors = [];
			}

			if (containsCode) {
				this.object.errors = ['contains'];

				this.render();

				return;
			} else {
				this.object.errors = [];
			}

			this.collection.set(this.counter, {
				id: this.counter,
				codepicture: codePicture,
				cardid: idQR,
				cardname: nameQR
			});

			this.counter++;
			this.parseQRCollection.clear();

			super.dataAdd();
			this.setDataInStorage();
			this.clearObject();
		});
	}

	setDataInStorage() {
		localStorage.setItem(this.page, JSON.stringify({
			collection: [...this.collection.values()]
		}));
	}

	submitIDinBD() {
		$('.btn--submit').click(() => {
			if (!this.collection.size) return;

			this.setAddUsersInDB([...this.collection.values()], 'download', 'add');

			this.collection.clear();
			this.render();

			localStorage.removeItem(this.page);
			this.counter = 0;
		});
	}

	setAddUsersInDB(array, nameTable, action) {
		$.ajax({
			url: "./php/change-user-request.php",
			method: "post",
			dataType: "html",
			async: false,
			data: {
				action,
				nameTable,
				array
			},
			success: () => {
				service.modal('success');
			},
			error: () => {
				service.modal('error');
			}
		});
	}

	getQRCodesFromDB() {
		$.ajax({
			url: "./php/output-request.php",
			method: "post",
			dataType: "html",
			async: false,
			data: {
				nameTable: 'contains-qr'
			},
			success: (data) => {
				const dataFromDB = JSON.parse(data);

				dataFromDB.forEach((item, i) => {
					this.dbQRCodesCollection.set(i + 1, item);
				});
			},
			error: () => {
				service.modal('download');
			}
		});
	}
}

export default Download;
