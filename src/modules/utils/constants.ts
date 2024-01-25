/* Copyright (c) Nathan Bolton (GPL-3.0 OR MPL-2.0) | https://github.com/thinknathan/aeroblast-game */
/** @noSelfInFile **/

// eslint @typescript-eslint/no-magic-numbers: 0

/**
 * Contants Utility.
 * Shared between various components. Constants don't change!
 */

export const constants = {
	ATLAS: 'mainAtlas',
	CAMERA_ZOOM: 2,
	SCREEN_PADDING: 16,
	GAME_NAME: 'survivors',
	SAVE_FILE_NAME: 'options',
} as const;
