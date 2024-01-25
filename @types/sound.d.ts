/* Copyright (c) Nathan Bolton (GPL-3.0 OR MPL-2.0) | https://github.com/thinknathan/aeroblast-game */
/** @noSelfInFile */

declare type SoundKey =
	| 'bgm_gameover'
	| 'bgm_gameplay'
	| 'bgm_title'
	| 'sfx_creatureHurt'
	| 'sfx_creatureHurt1'
	| 'sfx_creatureHurt2'
	| 'sfx_creatureHurt3'
	| 'sfx_creatureHurt4'
	| 'sfx_explosion'
	| 'sfx_laser'
	| 'sfx_lose3'
	| 'sfx_pickup1'
	| 'sfx_pickup2'
	| 'sfx_pickup3'
	| 'sfx_pickup4'
	| 'sfx_pickup5';

declare type SoundTable = {
	play: SoundKey | '';
	pan: number;
	speed: number;
};
