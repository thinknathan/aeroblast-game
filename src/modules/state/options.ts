/* Copyright (c) Nathan Bolton (AGPL-3.0-or-later) | https://github.com/thinknathan/aeroblast-game */
/** @noSelfInFile **/

/**
 * Options State.
 * Settings set by the player. Saved and loaded from file.
 */

import * as utils from '../utils';

type optionsKeys = 'highScore' | 'musicVolume' | 'sfxVolume';
type optionsMap = LuaMap<optionsKeys, number>;

const DEFAULT_VOLUME = 50;

const isNumber = (value: unknown): value is number => {
	return type(value) === 'number';
};

export const options: optionsMap = new LuaMap();
const filename = sys.get_save_file(
	utils.constants.GAME_NAME,
	utils.constants.SAVE_FILE_NAME,
);
const data = sys.load(filename) as unknown as optionsMap;

const dataHighScore = data.get('highScore');
options.set('highScore', dataHighScore ?? 0);

const dataSFXVolume = data.get('sfxVolume') ?? DEFAULT_VOLUME;
if (isNumber(dataSFXVolume)) {
	options.set('sfxVolume', dataSFXVolume);
}

const dataMusicVolume = data.get('musicVolume') ?? DEFAULT_VOLUME;
if (isNumber(dataMusicVolume)) {
	options.set('musicVolume', dataMusicVolume);
}

export const saveOptions = () => {
	sys.save(filename, options);
};
