/* Copyright (c) Nathan Bolton (AGPL-3.0-or-later) | https://github.com/thinknathan/aeroblast-game */
/** @noSelfInFile **/

export const getRandomNumber = (min: number, max: number): number => {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};
