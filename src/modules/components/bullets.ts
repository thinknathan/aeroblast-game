/** @noSelfInFile **/

/**
 * Bullets Component.
 * Logic and appearance of bullets shot by the player.
 */

import * as utils from '../utils';
import * as state from '../state';

const BULLET_TAG = 'bullet';
const BULLET_ALIVE_TAG = 'bullet-active';
const BULLET_DEAD_TAG = 'bullet-inactive';

const POWER_THRESHOLD_FOR_BIGGER_SPRITE = 1.5;

const ANGLE_TOP = 0;
const ANGLE_TOP_RIGHT = -45;
const ANGLE_RIGHT = -90;
const ANGLE_BOTTOM_RIGHT = -135;
const ANGLE_BOTTOM = -180;
const ANGLE_BOTTOM_LEFT = -225;
const ANGLE_LEFT = -270;
const ANGLE_TOP_LEFT = -315;

// By default, there's a max of 128 sprites and physics objects in the engine.
// We've increased the sprite limit, but we're still trying to keep within a relatively small limit.
const MAX_BULLETS = 20;

// The duration a shot stays active, in seconds
const SHOT_DURATION = 1.5;

// The maximum scale value for bullets
const MAX_SCALE = 2;

// The coordinates the bullets will be stored when inactive
const INACTIVE_X1 = -50;
const INACTIVE_X2 = -250;
const INACTIVE_Y1 = -50;
const INACTIVE_Y2 = -250;

type BulletType = BoomGameObject<
	[
		SpriteComp,
		PosComp,
		AreaComp,
		RotateComp,
		AnchorComp,
		OpacityComp,
		ScaleComp,
		MoveComp,
		TimerComp,
	]
> & {
	lifeTimerReset: (this: void) => void;
};

// Set up for audio
let audioController: url | string = '';
const PLAY_SFX = hash('playSFX');
const audioTable: SoundTable = {
	play: '',
	pan: 0,
	speed: 1,
};
/** @inlineStart */
const audioRandomize = () => {
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	audioTable.pan = utils.getRandomNumber(-0.1, 0.1);
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	audioTable.speed = utils.getRandomNumber(0.9, 1.1);
};
/** @inlineEnd */

const initFn = () => {
	// Create a URL for the audio controller so we can do audio!
	if (audioController === '') {
		audioController = msg.url('/audio_controller#script');
	}

	// Declare some info outside of the loop
	const atlasContent = { atlas: utils.constants.ATLAS } as const;
	const areaContent = { shape: 'auto' } as const;
	const lifeTimerError = () => {
		print(
			'bullets.ts Error: The init function on the timer object was not found',
		);
	};

	// Time to loop and create a bunch of objects
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	for (const _ of $range(1, MAX_BULLETS)) {
		const timerObj = timer(SHOT_DURATION, () => {
			deactivateFn(bullet);
		});
		const bullet = add([
			sprite('bullet01', atlasContent),
			pos(randi(INACTIVE_X1, INACTIVE_X2), randi(INACTIVE_Y1, INACTIVE_Y2)),
			area(areaContent),
			rotate(0),
			anchor('center'),
			opacity(0),
			scale(1),
			move(vec2(0, 0), state.game.player.attackVelocity),
			timerObj,
			BULLET_TAG,
			BULLET_DEAD_TAG,
		]) as BulletType;

		if (timerObj.init) {
			bullet.lifeTimerReset = timerObj.init;
		} else {
			bullet.lifeTimerReset = lifeTimerError;
		}
		entities.add(bullet);
	}
};

const deactivateFn = (obj: BulletType) => {
	obj.unuse(BULLET_ALIVE_TAG);
	obj.use(BULLET_DEAD_TAG);
	obj.opacity = 0;
	obj.speed = 0;
	obj.pos.x = randi(INACTIVE_X1, INACTIVE_X2);
	obj.pos.y = randi(INACTIVE_Y1, INACTIVE_Y2);
};

const activateFn = (
	obj: BulletType,
	x: number,
	y: number,
	rotation: number,
	dirX: number,
	dirY: number,
) => {
	if (obj.area_url !== undefined) {
		physics.set_group(obj.area_url, 'player');
		physics.set_maskbit(obj.area_url, 'enemy', true);
	} else {
		print('bullets.ts Error: No area_url in bullet');
	}

	obj.unuse(BULLET_DEAD_TAG);
	obj.use(BULLET_ALIVE_TAG);

	obj.lifeTimerReset();

	obj.pos.x = x;
	obj.pos.y = y;

	obj.rotate(rotation);

	obj.opacity = 1;

	obj.scale_to(1);

	if (dirX === 0 && dirY === 0) {
		if (rotation === ANGLE_TOP) {
			dirY = 1;
		} else if (rotation === ANGLE_TOP_RIGHT) {
			dirX = 1;
			dirY = 1;
		} else if (rotation === ANGLE_RIGHT) {
			dirX = 1;
		} else if (rotation === ANGLE_BOTTOM_RIGHT) {
			dirY = -1;
			dirX = 1;
		} else if (rotation === ANGLE_BOTTOM) {
			dirY = -1;
		} else if (rotation === ANGLE_BOTTOM_LEFT) {
			dirY = -1;
			dirX = -1;
		} else if (rotation === ANGLE_LEFT) {
			dirX = -1;
		} else if (rotation === ANGLE_TOP_LEFT) {
			dirY = 1;
			dirX = -1;
		}
	}

	obj.direction.x = dirX;
	obj.direction.y = dirY;

	obj.speed = state.game.player.attackVelocity;

	// Change sprite once the player's attack power is +50%
	if (state.game.player.attackPower >= POWER_THRESHOLD_FOR_BIGGER_SPRITE) {
		obj.play('bullet02');
	}

	if (state.game.player.attackPower < MAX_SCALE) {
		// Increase size of bullet according to player's attack power
		// But only if it's less than max scale
		obj.scale_to(state.game.player.attackPower, state.game.player.attackPower);
	}

	// Play sound for every projectile fired
	audioRandomize();
	audioTable.play = 'sfx_laser';
	msg.post(audioController, PLAY_SFX, audioTable);
};

const fireBulletFn = (
	x: number,
	y: number,
	rotation: number,
	dirX: number,
	dirY: number,
) => {
	for (const obj of entities) {
		if (obj.is(BULLET_DEAD_TAG)) {
			activateFn(obj, x, y, rotation, dirX, dirY);
			return;
		}
	}
};

const entities: LuaSet<BulletType> = new LuaSet();

interface Bullets {
	activate: (
		this: void,
		x: number,
		y: number,
		rotation: number,
		dirX: number,
		dirY: number,
	) => void;
	deactivate: (this: void, obj: BulletType) => void;
	init: (this: void) => void;
}

export const bullets: Bullets = {
	activate: fireBulletFn,
	deactivate: deactivateFn,
	init: initFn,
} as const;
