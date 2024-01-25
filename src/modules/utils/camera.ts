/* Copyright (c) Nathan Bolton (GPL-3.0 OR MPL-2.0) | https://github.com/thinknathan/aeroblast-game */
/** @noSelfInFile **/
/* eslint-disable @typescript-eslint/no-magic-numbers */

/**
 * Camera Utility.
 * Dimensions and edges of the visible screen.
 */

import { constants } from './constants';

export const camera = {
	width: () => width() / constants.CAMERA_ZOOM,
	height: () => height() / constants.CAMERA_ZOOM,
	centerX: () => width() / 2,
	centerY: () => height() / 2,
	// Top Edge
	tEdge: () =>
		height() / constants.CAMERA_ZOOM / 2 + height() / constants.CAMERA_ZOOM,
	// Right Edge
	rEdge: () =>
		width() / constants.CAMERA_ZOOM / 2 + width() / constants.CAMERA_ZOOM,
	// Bottom Edge
	bEdge: () => height() / constants.CAMERA_ZOOM / 2,
	// Left Edge
	lEdge: () => width() / constants.CAMERA_ZOOM / 2,
} as const;
