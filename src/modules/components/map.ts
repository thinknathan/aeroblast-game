/* Copyright (c) Nathan Bolton (GPL-3.0 OR MPL-2.0) | https://github.com/thinknathan/aeroblast-game */
/** @noSelfInFile **/

/**
 * Map Component.
 * Appearance of the map that appears behind the gameplay scene.
 */

import * as utils from '../utils';

const TILE_WIDTH = 48;
const TILE_HEIGHT = 48;
const SYMBOL_LIST = ['!', '@', '#', '%', '^', '&'] as const;
const SYMBOL_PROB = [
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	0.425, 0.425, 0.05, 0.033333333333333, 0.033333333333333, 0.033333333333333,
] as const;
const COLUMNS = 21;
const ROWS = 12;

const generateStringArray = (
	x: number,
	y: number,
	symbols: typeof SYMBOL_LIST,
	probabilities: typeof SYMBOL_PROB,
) => {
	const result: string[] = [];
	let newString = '';

	// Loop through each column
	for (let i = 0; i < y; i++) {
		// Clear string at start of every column
		newString = '';
		// Loop through each row
		for (let j = 0; j < x; j++) {
			const randomProbability = Math.random();
			let symbolIndex = 0;
			let [cumulativeProbability] = probabilities;

			while (
				randomProbability > cumulativeProbability &&
				symbolIndex < symbols.length - 1
			) {
				symbolIndex++;
				// Opted out of type safety by asserting this is non-null
				cumulativeProbability += probabilities[symbolIndex]!;
			}

			newString += symbols[symbolIndex];
		}
		result.push(newString);
	}

	return result;
};

const atlasContent = { atlas: utils.constants.ATLAS } as const;

const initFn = () => {
	const map = generateStringArray(COLUMNS, ROWS, SYMBOL_LIST, SYMBOL_PROB);
	const tiles: BoomTiles = {
		'!': () => [anchor('topleft'), z(-1), sprite('cluster01', atlasContent)],
		'@': () => [anchor('topleft'), z(-1), sprite('cluster02', atlasContent)],
		'#': () => [anchor('topleft'), z(-1), sprite('cluster03', atlasContent)],
		'%': () => [anchor('topleft'), z(-1), sprite('cluster04', atlasContent)],
		'^': () => [anchor('topleft'), z(-1), sprite('cluster05', atlasContent)],
		'&': () => [anchor('topleft'), z(-1), sprite('cluster06', atlasContent)],
	};
	add_level(map, {
		tile_width: TILE_WIDTH,
		tile_height: TILE_HEIGHT,
		tiles: tiles,
	});
};

export const map = {
	init: initFn,
};
