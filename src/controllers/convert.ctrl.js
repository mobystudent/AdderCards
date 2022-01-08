'use strict';

class Convert {
	constructor() {
	}

	static convertCardId(cardNum) {
		if (cardNum.includes('-') || cardNum.trim().length != 10 || isNaN(cardNum)) return false;

		const hexCode = parseInt(cardNum).toString(16).padStart(3, 0);
		const partOne = hexCode.slice(0, 2);
		const partTwo = hexCode.slice(2);
		const partOneHEX = parseInt(partOne, 16).toString().padStart(3, 0);
		const partTwoHEX = parseInt(partTwo, 16).toString().padStart(5, 0);

		const converCore = `${partOneHEX}-${partTwoHEX}`;
		const encrypCode = this._encryptionCardName(converCore);

		return encrypCode;
	}

	static _encryptionCardName(cardName) {
		const arrSymbols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
		const fullCode = cardName.replace('-', '');
		const firstPartCode = fullCode.slice(0, 4);
		const secondPartCode = fullCode.slice(4);
		const inter = +firstPartCode % 15;
		const interSymb = inter > 9 ? 'D' : 'S';
		const interFr = inter % 10;
		let firstSymb = 0;
		let secondSymb = 0;

		if (+firstPartCode) {
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
}

export default Convert;
