/* Copyright (c) Nathan Bolton (GPL-3.0 OR MPL-2.0) | https://github.com/thinknathan/aeroblast-game */
/** @noSelfInFile **/

/**
 * Game Script.
 * The main game logic that kicks everything off.
 */

import { boom } from 'boom.boom';
import * as utils from '../modules/utils';
import * as scenes from '../modules/scenes';

interface Game {
	this: void;
	readonly __mainAtlas: hash;
}

export const init: ScriptInit<Game> = function (this: Game): void {
	// Create properties that can be set in the editor.
	go.property('mainAtlas', resource.atlas());

	// Run all game logic inside `boom`.
	boom(() => {
		// Initialize all scenes
		scenes.start();
		scenes.options();
		scenes.gameplay();

		// We're a pixel art game, so it will look better zoomed-in
		cam_zoom(utils.constants.CAMERA_ZOOM);

		// Show the start screen
		show('start');
	});
};
