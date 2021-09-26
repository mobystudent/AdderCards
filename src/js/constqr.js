'use strict';

import $ from 'jquery';
import QRCode from 'qrcode';

const qrCollection = new Map(); // БД пользователей которым разрешили выдачу qr-кодов
const departmentCollection = new Map();  // Коллекци подразделений

$(window).on('load', () => {
	getDatainDB('const', 'qr');
});

function userFromDB(array) {
	const objToCollection = {
		id: '',
		fio: '',
		post: '',
		nameid: '',
		cardid: '',
		cardname: '',
		statusid: '',
		statustitle: '',
		department: ''
	};

	array.forEach((elem, i) => {
		const itemObject = Object.assign({}, objToCollection);

		for (const itemField in itemObject) {
			for (const key in elem) {
				if (itemField === key.toLocaleLowerCase()) {
					itemObject[itemField] = elem[key];
				} else if (itemField === 'id') {
					itemObject[itemField] = i;
				}
			}
		}

		qrCollection.set(i, itemObject);
	});

	dataAdd('#tableQR');
}

function templateQRTable(data) {
	const { id = '', fio = '', post  = '', cardid = '', cardname = '', statustitle = '' } = data;

	return `
		<div class="table__row table__row--time" data-id="${id}">
			<div class="table__cell table__cell--body table__cell--fio">
				<span class="table__text table__text--body">${fio}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--post">
				<span class="table__text table__text--body">${post}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--cardid">
				<span class="table__text table__text--body">${cardid}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--cardname">
				<span class="table__text table__text--body">${cardname}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--statustitle">
				<span class="table__text table__text--body">${statustitle}</span>
			</div>
			<div class="table__cell table__cell--body table__cell--signature">
				<span class="table__text table__text--body">Подпись</span>
			</div>
		</div>
	`;
}

function dataAdd(nameTable) {
	const filterNameDepart = filterDepart(qrCollection);

	viewAllCount(qrCollection, 'qr');

	if (qrCollection.size) {
		$(`${nameTable} .table__nothing`).hide();
	} else {
		$(nameTable).addClass('table__body--empty').html('');
		$(nameTable).append(`
			<p class="table__nothing">Новых данных нет</p>
		`);

		countItems(filterNameDepart[0], 'qr');

		return;
	}

	if (filterNameDepart.length > 1) {
		addTabs(qrCollection, 'qr');
		showActiveDataOnPage(qrCollection ,nameTable, 'qr', filterNameDepart[0]);
		changeTabs(nameTable, 'qr');
	} else {
		$(nameTable).html('');
		$(nameTable).append(`
			<div class="table__content table__content--active">
			</div>
		`);
		$(`.tab--qr`).html('');

		qrCollection.forEach((user) => {
			const { nameid = '', department = '' } = user;

			showTitleDepart(department, nameid, 'qr');

			$(`${nameTable} .table__content--active`).append(templateQRTable(user));
		});
	}

	getDepartmentInDB('department');
}

function showActiveDataOnPage(collection, nameTable, modDepart, nameDepart) {
	$(nameTable).html('');
	$(`.tab--${modDepart} .tab__item`).removeClass('tab__item--active');
	$(nameTable).append(`
		<div class="table__content table__content--active">
		</div>
	`);
	$(`.tab__item[data-depart=${nameDepart}]`).addClass('tab__item--active');

	collection.forEach((user) => {
		if (user.nameid == nameDepart) {
			$(`${nameTable} .table__content--active`).append(templateQRTable(user));
		}
	});

	departmentCollection.forEach((depart) => {
		const { nameid = '', longname = '' } = depart;

		if (nameid == nameDepart) {
			showTitleDepart(longname, nameid, modDepart);
		}
	});

	countItems(nameDepart, modDepart);
}

function showTitleDepart(depart, id, modDepart) {
	$(`.main__depart--${modDepart}`).text(depart).attr({'data-depart': depart, 'data-id': id});
}

function createQRCode(arrCodes) {
	const canvasArray = $('.canvas__code');

	[...canvasArray].forEach((item, i) => {
		QRCode.toDataURL(arrCodes[i])
		.then(url => {
			$(item).attr('src', url);
		})
		.catch(err => {
			console.error(err);
		});
	});
}

// function focusNext(item) {
// 	const nextRow = $(item).parents('.table__row').next();
//
// 	if (nextRow) {
// 		$(nextRow).find('.table__input').focus();
// 	}
// }

// Общие функции с картами и кодами
function countItems(idDepart, modDepart) {
	const countItemfromDep = [...qrCollection.values()].filter((user) => user.nameid === idDepart);

	$(`.main__count--${modDepart}`).text(countItemfromDep.length);
}

function viewAllCount(collection, modDepart) {
	$(`.main__count--all-${modDepart}`).text(collection.size);
}

function addTabs(collection, modDepart) {
	const filterNameDepart = filterDepart(collection);

	$(`.tab--${modDepart}`).html('');

	if (filterNameDepart.length > 1) {
		filterNameDepart.forEach((item) => {
			departmentCollection.forEach((depart) => {
				const { nameid = '', shortname = '' } = depart;

				if (item == nameid) {
					$(`.tab--${modDepart}`).append(`
						<button class="tab__item" type="button" data-depart=${nameid}>
							<span class="tab__name">${shortname}</span>
						</button>
					`);
				}
			});
		});
	}
}

function changeTabs(nameTable, modDepart) {
	$(`.tab--${modDepart}`).click((e) => {
		if (!$(e.target).parents('.tab__item').length && !$(e.target).hasClass('tab__item')) return;

		const nameDepart = $(e.target).closest('.tab__item').data('depart');

		showActiveDataOnPage(qrCollection, nameTable, modDepart, nameDepart);
	});
}

function filterDepart(collection) {
	const arrayDepart = [...collection.values()].reduce((acc, item) => {
		acc.push(item.nameid);
		return acc;
	}, []);
	const filterIdDepart = new Set(arrayDepart);

	return [...filterIdDepart];
}

function getDatainDB(nameTable, typeTable) {
	$.ajax({
		url: "./php/output-request.php",
		method: "post",
		data: {
			nameTable: nameTable,
			typeTable: typeTable
		},
		success: function(data) {
			const dataFromDB = JSON.parse(data);

			userFromDB(dataFromDB);
		},
		error: function(data) {
			console.log(data);
		}
	});
}

function getDepartmentInDB(nameTable) {
	$.ajax({
		url: "./php/output-request.php",
		method: "post",
		dataType: "html",
		async: false,
		data: {
			nameTable: nameTable
		},
		success: (data) => {
			const dataFromDB = JSON.parse(data);

			dataFromDB.forEach((item, i) => {
				departmentCollection.set(i + 1, item);
			});
		},
		error: () => {
			service.modal('download');
		}
	});
}

export default {

};
