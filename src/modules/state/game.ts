/* Copyright (c) Nathan Bolton (GPL-3.0 OR MPL-2.0) | https://github.com/thinknathan/aeroblast-game */
/** @noSelfInFile **/
/* eslint-disable @typescript-eslint/no-magic-numbers */

/**
 * Game State.
 * Shared between various components. Values can change at run-time.
 */
export const game = {
	difficulty: 1,
	difficultyMax: 5,
	currentTime: 10 * 60,
	score: 0,
	gameIsOver: false,
	player: {
		hp: 1,
		isAlive: true,
		isVulnerable: true,
		attackPower: 1,
		attackRate: 1,
		attackVelocity: 800,
		moveVelocity: 4000,
		position: {
			x: 0,
			y: 0,
		},
	},
	enemies: {
		isFrozen: false,
	},
};
