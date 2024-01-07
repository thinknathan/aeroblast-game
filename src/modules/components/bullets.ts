/** @noSelfInFile **/

/**
 * Bullets Component.
 * Logic and appearance of bullets shot by the player.
 */

import * as utils from '../utils';
import * as state from '../state';

const entities: LuaSet<BulletType> = new LuaSet();

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
// You can increase the limit, but for this project we'll try to stay under 128 total objects.
const MAX_BULLETS = 5;

// The duration a shot stays active, in seconds
const SHOT_DURATION = 1.5;

// The coordinates the bullets will be stored when inactive
const INACTIVE_X1 = -500;
const INACTIVE_Y1 = -500;

type BulletType = BoomGameObject<
	[
		SpriteComp,
		PosComp,
		AreaComp,
		RotateComp,
		AnchorComp,
		OpacityComp,
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

const playerGroup = hash('player');
const enemyGroup = hash('enemy');
const itemGroup = hash('item');
const bulletGroup = hash('bullet');
const FRAME = 0.03;

/** @inlineStart */
function setPhysicsGroup(bullet: BulletType) {
	physics.set_group(bullet.area_url!, bulletGroup);
	physics.set_maskbit(bullet.area_url!, enemyGroup, true);
	physics.set_maskbit(bullet.area_url!, bulletGroup, false);
	physics.set_maskbit(bullet.area_url!, itemGroup, false);
	physics.set_maskbit(bullet.area_url!, playerGroup, false);
}
/** @inlineEnd */

const deactivateFn = (obj: BulletType) => {
	obj.unuse(BULLET_ALIVE_TAG);
	obj.use(BULLET_DEAD_TAG);
	obj.opacity = 0;
	obj.speed = 0;
	obj.pos.x = INACTIVE_X1;
	obj.pos.y = INACTIVE_Y1;
};

const initFn = () => {
	// Create a URL for the audio controller so we can do audio!
	if (audioController === '') {
		audioController = msg.url('/audio_controller#script');
	}

	// Declare some info outside of the loop
	const atlasContent = { atlas: utils.constants.ATLAS } as const;
	const areaContent = { width: 20, height: 20, shape: 'rect' } as const;
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
			pos(INACTIVE_X1, INACTIVE_Y1),
			area(areaContent),
			rotate(0),
			anchor('center'),
			opacity(0),
			move(vec2(0, 0), state.game.player.attackVelocity),
			timerObj,
			BULLET_TAG,
			BULLET_DEAD_TAG,
		]) as BulletType;

		bullet.add([
			timer(FRAME, () => {
				// Set physics group so objects don't collide with others of the same type
				if (bullet.area_url !== undefined) {
					setPhysicsGroup(bullet);
				} else {
					print('bullets.ts Error: No area_url in bullet');
					// Fallback: try again in a second
					timer(1, () => {
						// Set physics group so objects don't collide with others of the same type
						if (bullet.area_url !== undefined) {
							setPhysicsGroup(bullet);
						}
					});
				}
			}),
		]);

		if (timerObj.init) {
			bullet.lifeTimerReset = timerObj.init;
		} else {
			bullet.lifeTimerReset = lifeTimerError;
		}
		entities.add(bullet);
	}
};

const activateFn = (
	bullet: BulletType,
	x: number,
	y: number,
	rotation: number,
	dirX: number,
	dirY: number,
) => {
	bullet.unuse(BULLET_DEAD_TAG);
	bullet.use(BULLET_ALIVE_TAG);

	bullet.lifeTimerReset();

	bullet.pos.x = x;
	bullet.pos.y = y;

	bullet.rotate(rotation);

	bullet.opacity = 1;

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

	bullet.direction.x = dirX;
	bullet.direction.y = dirY;

	bullet.speed = state.game.player.attackVelocity;

	// Change sprite once the player's attack power is +50%
	if (state.game.player.attackPower >= POWER_THRESHOLD_FOR_BIGGER_SPRITE) {
		bullet.play('bullet02');
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
