'use strict';

// class Convert {
// 	constructor() {
// 		this.cardField = $('.table__input');
// 		this.viewConvertCardId();
// 	}

function convertCardId(cardNum) {
	if (cardNum.includes('-') || cardNum.trim().length != 10 || isNaN(cardNum)) return false;

	const hexCode = parseInt(cardNum).toString(16);
	const partOne = hexCode.slice(0, 2);
	const partTwo = hexCode.slice(2);

	let partOneHEX = parseInt(partOne, 16).toString();
	let partTwoHEX = parseInt(partTwo, 16).toString();

	partOneHEX = addZeroinNum(partOneHEX, 3);
	partTwoHEX = addZeroinNum(partTwoHEX, 5);

	const converCore = `${partOneHEX}-${partTwoHEX}`;
	const encrypCode = encryptionCardName(converCore);

	return encrypCode;
}

function addZeroinNum(item, numLength) {
	if (item.length < numLength) {
		const diff = numLength - item.length;

		for (let i = 0; i < diff; i++) {
			item = `0${item}`;
		}
	}

	return item;
}

function encryptionCardName(cardName) {
	const arrSymbols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
	const fullCode = cardName.replace('-', '');
	const firstPartCode = fullCode.slice(0, 4);
	const secondPartCode = fullCode.slice(4);
	const inter = +firstPartCode % 15;
	const interSymb = inter > 9 ? 'D' : 'S';
	const interFr = inter % 10;
	let firstSymb = 0;
	let secondSymb = 0;

	if (+firstPartCode > 0) {
		const fraction = Math.ceil(+firstPartCode / 15);
		const mainFr = Math.ceil(fraction / arrSymbols.length);
		const subFr = fraction % arrSymbols.length;

		firstSymb = arrSymbols[mainFr - 1];
		secondSymb = arrSymbols[subFr - 1];
	} else {
		firstSymb = arrSymbols[0];
		secondSymb = arrSymbols[0];
	}

	return `${firstSymb}${secondSymb}${interSymb}${interFr}${secondPartCode}`;
}

export default {
	convertCardId
};

// }

// export default Convert;
