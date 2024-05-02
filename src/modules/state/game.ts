/* Copyright (c) Nathan Bolton (AGPL-3.0-or-later) | https://github.com/thinknathan/aeroblast-game */
/** @noSelfInFile **/
/* eslint-disable @typescript-eslint/no-magic-numbers */

type PlayerState = {
	hp: number;
	isAlive: boolean;
	isVulnerable: boolean;
	attackPower: number;
	attackRate: number;
	attackVelocity: number;
	moveVelocity: number;
	position: { x: number; y: number };
};
type EnemiesState = { isFrozen: boolean };

/**
 * Game State.
 * Shared between various components. Values can change at run-time.
 */
export const game = {
	difficulty: 1,
	difficultyMax: 5,
	currentTime: 10 * 60,
	score: 0,
	gameIsOver: false as boolean,
	player: {
		hp: 1,
		isAlive: true as boolean,
		isVulnerable: true as boolean,
		attackPower: 1,
		attackRate: 1,
		attackVelocity: 800,
		moveVelocity: 4000,
		position: {
			x: 0,
			y: 0,
		},
	} satisfies PlayerState,
	enemies: {
		isFrozen: false as boolean,
	} satisfies EnemiesState,
} satisfies Record<string, EnemiesState | PlayerState | boolean | number>;
