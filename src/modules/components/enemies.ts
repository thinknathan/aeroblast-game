/* Copyright (c) Nathan Bolton (GPL-3.0 OR MPL-2.0) | https://github.com/thinknathan/aeroblast-game */
/** @noSelfInFile **/

/**
 * Enemies Component.
 * Logic and appearance of enemies that oppose the player.
 */

import * as utils from '../utils';
import * as state from '../state';

const entities: LuaSet<EnemyType> = new LuaSet();

const ENEMY_TAG = 'enemy';
const ENEMY_ALIVE_TAG = 'enemy-active';
const ENEMY_DEAD_TAG = 'enemy-inactive';

// By default, there's a max of 128 sprites and physics objects in the engine.
// You can increase the limit, but for this project we'll try to stay under 128 total objects.
const MAX_ENEMIES = 80;

// Chance to spawn enemies this often, in seconds
const SPAWN_INTERVAL = 1;

// The coordinates the enemies will be stored when inactive
const INACTIVE_X1 = -750;
const INACTIVE_Y1 = -750;

// Duration of the visual effect when hit by bullets
const HURT_VFX_DURATION = 0.33;

// Enemies will be at least this fast
const ENEMY_SPEED_BASE = 1800;

// We want the game to get harder over time
// so this value will be multiplied by the difficulty
// to gradually give you faster enemies
const ENEMY_SPEED_MULTIPLIER = 150;

const OFFSCREEN_PADDING = 16;

const FIRST_SPAWN_DELAY = 0.5;

const getPosition = (pick: number) => {
	if (pick === 1)
		// Top edge of screen, anywhere on the X axis
		return $multi(
			randi(
				utils.camera.lEdge() - OFFSCREEN_PADDING,
				utils.camera.rEdge() + OFFSCREEN_PADDING,
			),
			utils.camera.tEdge() + OFFSCREEN_PADDING,
		);
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	if (pick === 2)
		// Right edge of screen, anywhere on the Y axis
		return $multi(
			utils.camera.rEdge() + OFFSCREEN_PADDING,
			randi(
				utils.camera.tEdge() + OFFSCREEN_PADDING,
				utils.camera.bEdge() - OFFSCREEN_PADDING,
			),
		);
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	if (pick === 3)
		// Bottom edge of screen, anywhere on the X axis
		return $multi(
			randi(
				utils.camera.lEdge() - OFFSCREEN_PADDING,
				utils.camera.rEdge() + OFFSCREEN_PADDING,
			),
			utils.camera.bEdge() - OFFSCREEN_PADDING,
		);

	// Left edge of screen, anywhere on the Y axis
	return $multi(
		utils.camera.lEdge() - OFFSCREEN_PADDING,
		randi(
			utils.camera.tEdge() + OFFSCREEN_PADDING,
			utils.camera.bEdge() - OFFSCREEN_PADDING,
		),
	);
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
const RANDOM_HARDER_ENEMY_THRESHOLD = 0.96;
// const RANDOM_CHAMPION_ENEMY_THRESHOLD = 0.98;

/** @inlineStart */
function setPhysicsGroup(enemyObj: EnemyType) {
	physics.set_group(enemyObj.area_url!, enemyGroup);
	physics.set_maskbit(enemyObj.area_url!, playerGroup, true);
	physics.set_maskbit(enemyObj.area_url!, enemyGroup, false);
	physics.set_maskbit(enemyObj.area_url!, itemGroup, false);
	physics.set_maskbit(enemyObj.area_url!, bulletGroup, true);
}
/** @inlineEnd */

// Spawn at least this many enemies each wave
const ENEMY_SPAWN_MINIMUM = 7;

let enemySpawnCounter = 9;
const ENEMY_BASE_SPAWN_RATE = 11;

const spawnEnemies = () => {
	if (state.game.player.isAlive === false) {
		return;
	}
	// Increment counter
	enemySpawnCounter++;

	// Only spawn enemies if the counter reaches target value
	// Enemies arrive more quickly at higher difficulties
	if (enemySpawnCounter >= ENEMY_BASE_SPAWN_RATE - state.game.difficulty) {
		// Increase enemy wave size based on difficulty
		const target = state.game.difficulty + ENEMY_SPAWN_MINIMUM;
		let activated = 0;
		for (const obj of entities) {
			if (obj.is(ENEMY_DEAD_TAG)) {
				activateFn(obj);
				activated++;
				// Reset counter
				enemySpawnCounter = 0;
				if (activated >= target) return;
			}
		}
	}
};

const getSprite = (difficulty: number) => {
	if (difficulty === 1) {
		return 'enemy01';
		// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	} else if (difficulty === 2) {
		return 'enemy02';
		// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	} else if (difficulty === 3) {
		return 'enemy03';
		// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	} else if (difficulty === 4) {
		return 'enemy04';
		// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	} else if (difficulty === 5) {
		return 'enemy05';
	}
	print('enemies.ts error: Difficulty is higher than expected (>= 6)');
	return 'enemy01';
};

const ENEMY_HP_BASE = 1;
const ENEMY_HP_MULTIPLIER = 2;
const CHAMPION_HP_MULTIPLIER = 3;

const getHp = (effectiveDifficulty: number, champion?: boolean) =>
	champion === true
		? ENEMY_HP_BASE +
			ENEMY_HP_MULTIPLIER * CHAMPION_HP_MULTIPLIER * effectiveDifficulty
		: ENEMY_HP_BASE + ENEMY_HP_MULTIPLIER * effectiveDifficulty;

/** @inlineStart @removeReturn */
const getSpeed = (effectiveDifficulty: number) =>
	ENEMY_SPEED_BASE + ENEMY_SPEED_MULTIPLIER * effectiveDifficulty;
/** @inlineEnd */

const activateFn = (enemyObj: EnemyType) => {
	enemyObj.use(ENEMY_ALIVE_TAG);
	enemyObj.unuse(ENEMY_DEAD_TAG);
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	const [x, y] = getPosition(randi(0, 3));
	enemyObj.opacity = 1;
	enemyObj.pos.x = x;
	enemyObj.pos.y = y;

	let effectiveDifficulty = state.game.difficulty;

	if (Math.random() >= RANDOM_HARDER_ENEMY_THRESHOLD) {
		// Small chance to spawn a more difficult than expected enemy
		effectiveDifficulty++;
		// Make sure it's less than max difficulty
		if (effectiveDifficulty > state.game.difficultyMax) {
			effectiveDifficulty = state.game.difficultyMax;
		}
	}

	enemyObj.play(getSprite(effectiveDifficulty));

	if (enemyObj.hurtTween) {
		enemyObj.hurtTween.cancel();
	}
	enemyObj.color.r = 1;
	enemyObj.color.g = 1;
	enemyObj.color.b = 1;
	enemyObj.hp = getHp(effectiveDifficulty);
	enemyObj.moveSpeed = getSpeed(effectiveDifficulty);
};

const SCORE_BASE = 1;

const deactivateFn = (obj: EnemyType) => {
	state.game.score += SCORE_BASE * state.game.difficulty;
	obj.unuse(ENEMY_ALIVE_TAG);
	obj.use(ENEMY_DEAD_TAG);
	obj.opacity = 0;
	obj.pos.x = INACTIVE_X1;
	obj.pos.y = INACTIVE_Y1;
	obj.moveSpeed = 0;
};

const hurtEffect = (obj: EnemyType) => {
	audioRandomize();
	if (obj.anim === 'enemy01') {
		audioTable.play = 'sfx_creatureHurt';
		msg.post(audioController, PLAY_SFX, audioTable);
	} else if (obj.anim === 'enemy02') {
		audioTable.play = 'sfx_creatureHurt1';
		msg.post(audioController, PLAY_SFX, audioTable);
	} else if (obj.anim === 'enemy03') {
		audioTable.play = 'sfx_creatureHurt2';
		msg.post(audioController, PLAY_SFX, audioTable);
	} else if (obj.anim === 'enemy04') {
		audioTable.play = 'sfx_creatureHurt3';
		msg.post(audioController, PLAY_SFX, audioTable);
	} else if (obj.anim === 'enemy05') {
		audioTable.play = 'sfx_creatureHurt4';
		msg.post(audioController, PLAY_SFX, audioTable);
	}
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

type EnemyType = BoomGameObject<
	[SpriteComp, PosComp, AreaComp, ColorComp, OpacityComp, HealthComp, TimerComp]
> & {
	moveSpeed: number;
	hurtTween?: Tween;
};

const initFn = () => {
	// Create a URL for the audio controller so we can do audio!
	if (audioController === '') {
		audioController = msg.url('/audio_controller#script');
	}

	// Declare some info outside of the loop
	const atlasContent = { atlas: utils.constants.ATLAS } as const;
	const areaContent = { width: 20, height: 20, shape: 'rect' } as const;

	// Fill up a pool with inactive enemies
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	for (const _ of $range(1, MAX_ENEMIES)) {
		const enemyObj = add([
			sprite(getSprite(1), atlasContent),
			pos(INACTIVE_X1, INACTIVE_Y1),
			area(areaContent),
			color(1, 1, 1, 1),
			opacity(0),
			health(1),
			ENEMY_TAG,
			ENEMY_DEAD_TAG,
		]) as EnemyType;
		enemyObj.on_hurt(() => {
			hurtEffect(enemyObj);
		});
		enemyObj.on_death(() => {
			deactivateFn(enemyObj);
		});
		enemyObj.add([
			timer(FRAME, () => {
				// Set physics group so objects don't collide with others of the same type
				if (enemyObj.area_url !== undefined) {
					setPhysicsGroup(enemyObj);
				} else {
					print('enemies.ts Error: No area_url in enemy');
					// Fallback: try again in a second
					timer(1, () => {
						// Set physics group so objects don't collide with others of the same type
						if (enemyObj.area_url !== undefined) {
							setPhysicsGroup(enemyObj);
						}
					});
				}
			}),
		]);
		entities.add(enemyObj);
		enemyObj.moveSpeed = 0;
		enemyObj.on_collide('bullet-active', () => {
			enemyObj.hurt(state.game.player.attackPower);
		});
	}
	// On a regular interval, spawn enemies
	const spawnLoop = add([timer(SPAWN_INTERVAL, spawnEnemies)]);
	spawnLoop.loop(SPAWN_INTERVAL, spawnEnemies);
	// Spawn once when the game begins
	add([timer(FIRST_SPAWN_DELAY, spawnEnemies)]);

	let x = 0;
	let y = 0;

	let randomMovement = 0;
	// Bigger numbers mean less randomness
	const RANDOM_MOVE_RATE = 15;

	// When enemies are active, walk towards the player
	on_update(ENEMY_ALIVE_TAG, (oneEnemy, cancel) => {
		if (state.game.player.isAlive === false) {
			(oneEnemy as EnemyType).move(0, 0);
			cancel();
			return;
		}

		if (state.game.enemies.isFrozen === true) {
			(oneEnemy as EnemyType).color.b = 2;
		} else {
			(oneEnemy as EnemyType).color.b = 1;
		}

		x = state.game.player.position.x - (oneEnemy as EnemyType).pos.x;
		y = state.game.player.position.y - (oneEnemy as EnemyType).pos.y;
		if (x > 0) {
			x = 1;
		} else if (x < 0) {
			x = -1;
		}
		if (y > 0) {
			y = 1;
		} else if (y < 0) {
			y = -1;
		}
		randomMovement = randi(1, RANDOM_MOVE_RATE);
		if (randomMovement === 1) {
			x = 1;
			// eslint-disable-next-line @typescript-eslint/no-magic-numbers
		} else if (randomMovement === 2) {
			y = 1;
			// eslint-disable-next-line @typescript-eslint/no-magic-numbers
		} else if (randomMovement === 3) {
			x = -1;
			// eslint-disable-next-line @typescript-eslint/no-magic-numbers
		} else if (randomMovement === 4) {
			y = -1;
		}
		if (state.game.enemies.isFrozen === true) {
			x = 0;
			y = 0;
		}
		(oneEnemy as EnemyType).move(
			x * (oneEnemy as EnemyType).moveSpeed * dt(),
			y * (oneEnemy as EnemyType).moveSpeed * dt(),
		);
	});
};

interface Enemies {
	activate: (this: void, obj: EnemyType) => void;
	deactivate: (this: void, obj: EnemyType) => void;
	init: (this: void) => void;
}

export const enemies: Enemies = {
	activate: activateFn,
	deactivate: deactivateFn,
	init: initFn,
} as const;
