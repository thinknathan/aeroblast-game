/** @noSelfInFile **/

/**
 * Enemies Component.
 * Logic and appearance of enemies that oppose the player.
 */

import * as utils from '../utils';
import * as state from '../state';

const ENEMY_TAG = 'enemy';
const ENEMY_ALIVE_TAG = 'enemy-active';
const ENEMY_DEAD_TAG = 'enemy-inactive';

// By default, there's a max of 128 sprites and physics objects in the engine.
// We've increased the sprite limit, but we're still trying to keep within a relatively small limit.
const MAX_ENEMIES = 80;

// New enemies spawn this often, in seconds
const SPAWN_INTERVAL = 10;

// The coordinates the enemies will be stored when inactive
const INACTIVE_X1 = -500;
const INACTIVE_X2 = -1000;
const INACTIVE_Y1 = -500;
const INACTIVE_Y2 = -1000;

// Duration of the visual effect when hit by bullets
const HURT_VFX_DURATION = 0.33;

const OFFSCREEN_PADDING = 16;

const FIRST_SPAWN_DELAY = 0.017;

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

const activateFn = (obj: EnemyType) => {
	if (obj.area_url !== undefined) {
		physics.set_group(obj.area_url, 'enemy');
		physics.set_maskbit(obj.area_url, 'player', true);
	} else {
		print('enemies.ts Error: No area_url in enemy');
	}

	obj.use(ENEMY_ALIVE_TAG);
	obj.unuse(ENEMY_DEAD_TAG);
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	const [x, y] = getPosition(randi(0, 3));
	obj.opacity = 1;
	obj.pos.x = x;
	obj.pos.y = y;

	obj.play(getSprite());

	if (obj.hurtTween) {
		obj.hurtTween.cancel();
	}
	obj.color.r = 1;
	obj.color.g = 1;
	obj.color.b = 1;
	obj.hp = getHp();
	obj.moveSpeed = getSpeed();
	obj.scale_to(1);
};

const SCORE_BASE = 1;

const deactivateFn = (obj: EnemyType) => {
	state.game.score += SCORE_BASE * state.game.difficulty;
	obj.unuse(ENEMY_ALIVE_TAG);
	obj.use(ENEMY_DEAD_TAG);
	obj.opacity = 0;
	obj.pos.x = randi(INACTIVE_X1, INACTIVE_X2);
	obj.pos.y = randi(INACTIVE_Y1, INACTIVE_Y2);
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
	[SpriteComp, PosComp, AreaComp, ColorComp, OpacityComp, ScaleComp, HealthComp]
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
	const areaContent = { shape: 'auto' } as const;

	// Fill up a pool with inactive enemies
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	for (const _ of $range(1, MAX_ENEMIES)) {
		const enemyObj = add([
			sprite(getSprite(), atlasContent),
			pos(randi(INACTIVE_X1, INACTIVE_X2), randi(INACTIVE_Y1, INACTIVE_Y2)),
			area(areaContent),
			color(1, 1, 1, 1),
			opacity(0),
			health(1),
			scale(1),
			ENEMY_TAG,
			ENEMY_DEAD_TAG,
		]) as EnemyType;
		enemyObj.on_hurt(() => {
			hurtEffect(enemyObj);
		});
		enemyObj.on_death(() => {
			deactivateFn(enemyObj);
		});
		entities.add(enemyObj);
		enemyObj.moveSpeed = getSpeed();
		enemyObj.on_collide('bullet-active', () => {
			enemyObj.hurt(state.game.player.attackPower);
		});
	}
	// On a regular interval, activate 10 enemies
	const loopMinute = add([timer(SPAWN_INTERVAL, spawnEnemies)]);
	loopMinute.loop(SPAWN_INTERVAL, spawnEnemies);
	// Spawn once, on the next frame
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

const spawnEnemies = () => {
	if (state.game.player.isAlive === false) {
		return;
	}
	const target = 10;
	let activated = 0;
	for (const obj of entities) {
		if (obj.is(ENEMY_DEAD_TAG)) {
			activateFn(obj);
			activated++;
			if (activated >= target) return;
		}
	}
};

const getSprite = () => {
	if (state.game.difficulty === 1) {
		return 'enemy01';
		// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	} else if (state.game.difficulty === 2) {
		return 'enemy02';
		// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	} else if (state.game.difficulty === 3) {
		return 'enemy03';
		// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	} else if (state.game.difficulty === 4) {
		return 'enemy04';
		// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	} else if (state.game.difficulty === 5) {
		return 'enemy05';
	}
	print('enemies.ts error: Difficulty is higher than expected (>= 6)');
	return 'enemy01';
};

const ENEMY_HP_BASE = 1;
const ENEMY_HP_MULTIPLIER = 2;

/** @inlineStart @removeReturn */
const getHp = () => ENEMY_HP_BASE + ENEMY_HP_MULTIPLIER * state.game.difficulty;
/** @inlineEnd */

// Enemies will be at least this fast
const ENEMY_SPEED_BASE = 1800;

// We want the game to get harder over time
// so this value will be multiplied by the difficulty
// to gradually give you faster enemies
const ENEMY_SPEED_MULTIPLIER = 150;

/** @inlineStart @removeReturn */
const getSpeed = () =>
	ENEMY_SPEED_BASE + ENEMY_SPEED_MULTIPLIER * state.game.difficulty;
/** @inlineEnd */

const entities: LuaSet<EnemyType> = new LuaSet();

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
