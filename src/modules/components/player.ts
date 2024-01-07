/** @noSelfInFile **/

/**
 * Player Component.
 * Logic and appearance of the player character.
 */

import * as utils from '../utils';
import * as state from '../state';
import { bullets } from './bullets';
import { type ItemType, items } from './items';

let entity: PlayerType | undefined = undefined;

const PLAYER_INITIAL_HP = 50;
const PLAYER_MAX_HP = 100;

const PLAYER_TAG = 'player';
const PLAYER_ALIVE_TAG = 'player-alive';

const FREEZE_TIMER = 3;
const HEAL_AMOUNT = 25;

const ANGLE_TOP = 0;
const ANGLE_TOP_RIGHT = -45;
const ANGLE_RIGHT = -90;
const ANGLE_BOTTOM_RIGHT = -135;
const ANGLE_BOTTOM = -180;
const ANGLE_BOTTOM_LEFT = -225;
const ANGLE_LEFT = -270;
const ANGLE_TOP_LEFT = -315;

const input = {
	x: 0,
	y: 0,
};

const inputUp = () => {
	input.y = 1;
};

const inputRight = () => {
	input.x = 1;
};

const inputDown = () => {
	input.y = -1;
};

const inputLeft = () => {
	input.x = -1;
};

const inputResetX = () => {
	// Don't reset if one of the keys that affects the X-axis is still held.
	// Otherwise, switching from holding left to right will zero out movement.
	if (
		is_key_down('key_right') ||
		is_key_down('key_d') ||
		is_key_down('key_left') ||
		is_key_down('key_a')
	) {
		return;
	}
	input.x = 0;
};

const inputResetY = () => {
	if (
		is_key_down('key_up') ||
		is_key_down('key_w') ||
		is_key_down('key_down') ||
		is_key_down('key_s')
	) {
		return;
	}
	input.y = 0;
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

const DEATH_SCALE = 2;

const onDeathFn = () => {
	if (state.game.player.isAlive === true && entity !== undefined) {
		// Remove tag to stop updates
		entity.unuse(PLAYER_ALIVE_TAG);
		// Stop player movement
		entity.move(0, 0);
		entity.play('explosion');
		entity.scale_to(DEATH_SCALE, DEATH_SCALE);
		// Announce player death via public boolean
		state.game.player.isAlive = false;
		audioRandomize();
		audioTable.play = 'sfx_explosion';
		msg.post(audioController, PLAY_SFX, audioTable);
	}
};

// Duration of the visual effect when hit by enemies
const HURT_VFX_DURATION = 0.33;
const hurtEffect = (obj: PlayerType) => {
	audioRandomize();
	audioTable.play = 'sfx_lose3';
	msg.post(audioController, PLAY_SFX, audioTable);

	obj.color.r = 1;
	obj.color.g = 0;
	obj.color.b = 0;
	obj.hurtTween = tween(
		0,
		1,
		HURT_VFX_DURATION,
		undefined,
		(endValue: number) => {
			obj.color.g = endValue;
			obj.color.b = endValue;
		},
	);
};

// Duration of the visual effect when collecting a powerup
const POWERUP_VFX_DURATION = 0.33;
const powerupEffect = (obj: PlayerType) => {
	obj.color.r = 1;
	obj.color.g = 1;
	obj.color.b = 0;
	obj.hurtTween = tween(
		0,
		1,
		POWERUP_VFX_DURATION,
		undefined,
		(endValue: number) => {
			obj.color.b = endValue;
		},
	);
};

// Duration of the visual effect when getting a powerup
const HEAL_VFX_DURATION = 0.33;
const healEffect = (obj: PlayerType) => {
	obj.color.r = 0;
	obj.color.g = 1;
	obj.color.b = 0;
	obj.healTween = tween(
		0,
		1,
		HEAL_VFX_DURATION,
		undefined,
		(endValue: number) => {
			obj.color.r = endValue;
			obj.color.b = endValue;
		},
	);
};

const playerGroup = hash('player');
const enemyGroup = hash('enemy');
const itemGroup = hash('item');
const bulletGroup = hash('bullet');
const FRAME = 0.03;

/** @inlineStart */
function setPhysicsGroup(playerObj: PlayerType) {
	physics.set_group(playerObj.area_url!, playerGroup);
	physics.set_maskbit(playerObj.area_url!, enemyGroup, true);
	physics.set_maskbit(playerObj.area_url!, playerGroup, false);
	physics.set_maskbit(playerObj.area_url!, bulletGroup, false);
	physics.set_maskbit(playerObj.area_url!, itemGroup, true);
}
/** @inlineEnd */

// The player is a combination of a game object and many components
type PlayerType = BoomGameObject<
	[
		SpriteComp,
		PosComp,
		AreaComp,
		OpacityComp,
		RotateComp,
		AnchorComp,
		HealthComp,
		ColorComp,
		ScaleComp,
		TimerComp,
	]
> & {
	hurtTween?: Tween;
	powerupTween?: Tween;
	healTween?: Tween;
	powerupText?: BoomGameObject<[TextComp, OpacityComp, PosComp]>;
};

/**
 * Construct the player game object and its controls.
 * This must be called from within boom().
 */
const initFn = () => {
	// Create a URL for the audio controller so we can do audio!
	if (audioController === '') {
		audioController = msg.url('/audio_controller#script');
	}

	const playerObj = add([
		sprite('player', { atlas: utils.constants.ATLAS }),
		// eslint-disable-next-line @typescript-eslint/no-magic-numbers
		pos(utils.camera.centerX(), utils.camera.centerY()),
		// Reduce size of collision to be smaller than graphic to make it easier to dodge enemies
		area({ radius: 5, shape: 'circle' }),
		opacity(1),
		health(PLAYER_INITIAL_HP),
		rotate(0),
		scale(1, 1),
		anchor('center'),
		color(1, 1, 1, 1),
		PLAYER_TAG,
		PLAYER_ALIVE_TAG,
	]) as PlayerType;

	playerObj.add([
		timer(FRAME, () => {
			// Set physics group to collide with the correct objects
			if (playerObj.area_url !== undefined) {
				setPhysicsGroup(playerObj);
			} else {
				print('player.ts Error: No area_url in player');
				// Fallback: try again in a second
				timer(1, () => {
					// Set physics group to collide with the correct objects
					if (playerObj.area_url !== undefined) {
						setPhysicsGroup(playerObj);
					}
				});
			}
		}),
	]);

	playerObj.on_hurt(() => {
		if (state.game.player.isAlive === false) {
			return;
		}
		hurtEffect(playerObj);
		state.game.player.hp = playerObj.hp;
	});
	state.game.player.hp = playerObj.hp;
	playerObj.on_death(onDeathFn);

	playerObj.on_heal(() => {
		if (playerObj.hp > PLAYER_MAX_HP) {
			playerObj.hp = PLAYER_MAX_HP;
		}
		healEffect(playerObj);
		state.game.player.hp = playerObj.hp;
	});

	playerObj.on_collide('enemy-active', () => {
		if (state.game.player.isVulnerable === true) {
			playerObj.hurt(1); // To-do change based on strength of enemy
		}
	});

	playerObj.powerupText = add([
		text('', { align: 'center' }),
		opacity(0),
		pos(0, 0),
	]);

	const POWER_UP_TEXT_FADE_DURATION = 2;

	let vanishTween: Tween | undefined = undefined;

	const hidePowerupText = () => {
		if (vanishTween !== undefined) {
			vanishTween.cancel();
		}
		vanishTween = tween(
			1,
			0,
			POWER_UP_TEXT_FADE_DURATION,
			undefined,
			(opacity) => {
				if (playerObj.powerupText === undefined) return;
				playerObj.powerupText.opacity = opacity;
			},
		);
		vanishTween.on_end(() => {
			vanishTween = undefined;
		});
	};
	const showPowerupText = (textString: string) => {
		if (playerObj.powerupText === undefined) return;
		playerObj.powerupText.text = textString;
		playerObj.powerupText.opacity = 1;
		playerObj.powerupText.pos.x = playerObj.pos.x;
		playerObj.powerupText.pos.y = playerObj.pos.y;
		hidePowerupText();
	};

	playerObj.on_collide('item-damage-up', (collision) => {
		items.deactivate(collision.target as ItemType);
		state.game.player.attackPower *= 1.1;
		powerupEffect(playerObj);
		showPowerupText('Damage Up');
		audioRandomize();
		audioTable.play = 'sfx_pickup1';
		msg.post(audioController, PLAY_SFX, audioTable);
	});
	playerObj.on_collide('item-damage-rate-up', (collision) => {
		items.deactivate(collision.target as ItemType);
		state.game.player.attackRate *= 0.9;
		powerupEffect(playerObj);
		showPowerupText('Fire Rate Up');
		audioRandomize();
		audioTable.play = 'sfx_pickup2';
		msg.post(audioController, PLAY_SFX, audioTable);
	});
	playerObj.on_collide('item-move-rate-up', (collision) => {
		items.deactivate(collision.target as ItemType);
		state.game.player.moveVelocity *= 1.1;
		powerupEffect(playerObj);
		showPowerupText('Move Speed Up');
		audioRandomize();
		audioTable.play = 'sfx_pickup3';
		msg.post(audioController, PLAY_SFX, audioTable);
	});
	playerObj.on_collide('item-freeze', (collision) => {
		items.deactivate(collision.target as ItemType);
		state.game.enemies.isFrozen = true;
		add([
			timer(FREEZE_TIMER, () => {
				state.game.enemies.isFrozen = false;
			}),
		]);
		showPowerupText('Enemies Frozen');
		audioRandomize();
		audioTable.play = 'sfx_pickup4';
		msg.post(audioController, PLAY_SFX, audioTable);
	});
	playerObj.on_collide('item-hp-restore', (collision) => {
		items.deactivate(collision.target as ItemType);
		playerObj.heal(HEAL_AMOUNT);
		showPowerupText('HP Restored');
		audioRandomize();
		audioTable.play = 'sfx_pickup5';
		msg.post(audioController, PLAY_SFX, audioTable);
	});

	// Update input when key is pressed
	on_key_press('key_up', inputUp);
	on_key_press('key_right', inputRight);
	on_key_press('key_down', inputDown);
	on_key_press('key_left', inputLeft);
	on_key_press('key_w', inputUp);
	on_key_press('key_d', inputRight);
	on_key_press('key_s', inputDown);
	on_key_press('key_a', inputLeft);

	// Reset input when key is released
	on_key_release('key_up', inputResetY);
	on_key_release('key_right', inputResetX);
	on_key_release('key_down', inputResetY);
	on_key_release('key_left', inputResetX);
	on_key_release('key_w', inputResetY);
	on_key_release('key_d', inputResetX);
	on_key_release('key_s', inputResetY);
	on_key_release('key_a', inputResetX);

	let x = 0;
	let y = 0;
	let currentAngle = 0;
	let targetAngle = 0;
	const smoothingFactor = 20;
	let fireTimer = 0;

	// Run movement every frame
	on_update(PLAYER_ALIVE_TAG, (_, cancel) => {
		if (state.game.player.isAlive === false) {
			playerObj.move(0, 0);
			cancel();
			return;
		}

		x = input.x; // eslint-disable-line @typescript-eslint/prefer-destructuring
		y = input.y; // eslint-disable-line @typescript-eslint/prefer-destructuring

		// If the player is about to go off-screen, stop movement
		// Check right edge
		if (playerObj.pos.x >= utils.camera.rEdge() && x > 0) {
			x = 0;
		}
		// Check left edge
		if (playerObj.pos.x <= utils.camera.lEdge() && x < 0) {
			x = 0;
		}
		// Check top edge
		if (playerObj.pos.y >= utils.camera.tEdge() && y > 0) {
			y = 0;
		}
		// Check bottom edge
		if (playerObj.pos.y <= utils.camera.bEdge() && y < 0) {
			y = 0;
		}

		// Move the player
		playerObj.move(
			x * state.game.player.moveVelocity * dt(),
			y * state.game.player.moveVelocity * dt(),
		);

		// Handle rotation if directions are pressed
		if (x !== 0 || y !== 0) {
			if (y === 1 && x === 0) {
				targetAngle = ANGLE_TOP;
			} else if (y === 1 && x === 1) {
				targetAngle = ANGLE_TOP_RIGHT;
			} else if (y === 0 && x === 1) {
				targetAngle = ANGLE_RIGHT;
			} else if (y === -1 && x === 1) {
				targetAngle = ANGLE_BOTTOM_RIGHT;
			} else if (y === -1 && x === 0) {
				targetAngle = ANGLE_BOTTOM;
			} else if (y === -1 && x === -1) {
				targetAngle = ANGLE_BOTTOM_LEFT;
			} else if (y === 0 && x === -1) {
				targetAngle = ANGLE_LEFT;
			} else if (y === 1 && x === -1) {
				targetAngle = ANGLE_TOP_LEFT;
			}

			// Interpolate to give smoother visual rotation
			currentAngle =
				currentAngle + (targetAngle - currentAngle) * smoothingFactor * dt();

			playerObj.rotate(currentAngle);
		}

		// Copy postion to public object
		state.game.player.position.x = playerObj.pos.x;
		state.game.player.position.y = playerObj.pos.y;

		// Handle firing
		fireTimer += dt();
		if (fireTimer >= state.game.player.attackRate) {
			fireTimer = 0;
			// Use the target angle instead of current angle
			// To give the feel of more arcade-y instant controls
			// Without having to wait for the player graphic to finish rotating
			bullets.activate(playerObj.pos.x, playerObj.pos.y, targetAngle, x, y);
		}
	});

	entity = playerObj;
};

interface Player {
	init: (this: void) => void;
}

export const player: Player = {
	/**
	 * Construct the player game object and its controls.
	 */
	init: initFn,
} as const;
