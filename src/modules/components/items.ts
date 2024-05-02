/* Copyright (c) Nathan Bolton (AGPL-3.0-or-later) | https://github.com/thinknathan/aeroblast-game */
/** @noSelfInFile **/

/**
 * Items Component.
 * Logic and appearance of items that power-up the player.
 */

import * as utils from '../utils';
import * as state from '../state';

const entities: LuaSet<ItemType> = new LuaSet();

const ITEM_TAG = 'item';
const ITEM_ALIVE_TAG = 'item-active';
const ITEM_DEAD_TAG = 'item-inactive';

// The coordinates the items will be stored when inactive
const INACTIVE_X1 = -1000;
const INACTIVE_Y1 = -1000;

// By default, there's a max of 128 sprites and physics objects in the engine.
// You can increase the limit, but for this project we'll try to stay under 128 total objects.
const MAX_ITEMS = 5;

const ITEM_TYPE_1 = 'item-damage-up';
const ITEM_TYPE_2 = 'item-damage-rate-up';
const ITEM_TYPE_3 = 'item-move-rate-up';
const ITEM_TYPE_4 = 'item-freeze';
const ITEM_TYPE_5 = 'item-hp-restore';

const playerGroup = hash('player');
const enemyGroup = hash('enemy');
const itemGroup = hash('item');
const bulletGroup = hash('bullet');
const FRAME = 0.03;

/** @inlineStart */
function setPhysicsGroup(item: ItemType) {
	physics.set_group(item.area_url!, itemGroup);
	physics.set_maskbit(item.area_url!, playerGroup, true);
	physics.set_maskbit(item.area_url!, itemGroup, false);
	physics.set_maskbit(item.area_url!, enemyGroup, false);
	physics.set_maskbit(item.area_url!, bulletGroup, false);
}
/** @inlineEnd */

// Chance to spawn an item this often, in seconds
const ITEM_SPAWN_TIMER = 1;

const INSIDE_PADDING = 32;
const getSpawnPosition = (): LuaMultiReturn<[number, number]> =>
	$multi(
		randi(
			utils.camera.lEdge() + INSIDE_PADDING,
			utils.camera.rEdge() - INSIDE_PADDING,
		),
		randi(
			utils.camera.bEdge() + INSIDE_PADDING,
			utils.camera.tEdge() - INSIDE_PADDING,
		),
	);

const MAX_ITEM_TYPES = 5;

let randomItem = 0;
const activateFn = (item: ItemType) => {
	item.use(ITEM_ALIVE_TAG);
	item.unuse(ITEM_DEAD_TAG);
	const [x, y] = getSpawnPosition();
	item.opacity = 1;
	item.pos.x = x;
	item.pos.y = y;

	randomItem = randi(1, MAX_ITEM_TYPES);
	if (randomItem === 1) {
		item.play('powerup03');
		item.use(ITEM_TYPE_1);
		// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	} else if (randomItem === 2) {
		item.play('powerup02');
		item.use(ITEM_TYPE_2);
		// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	} else if (randomItem === 3) {
		item.play('powerup05');
		item.use(ITEM_TYPE_3);
		// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	} else if (randomItem === 4) {
		item.play('powerup04');
		item.use(ITEM_TYPE_4);
	} else {
		item.play('powerup01');
		item.use(ITEM_TYPE_5);
	}

	if (item.area_url !== undefined) {
		setPhysicsGroup(item);
	}
};

const deactivateFn = (obj: ItemType) => {
	obj.unuse(ITEM_ALIVE_TAG);
	obj.use(ITEM_DEAD_TAG);
	obj.unuse(ITEM_TYPE_1);
	obj.unuse(ITEM_TYPE_2);
	obj.unuse(ITEM_TYPE_3);
	obj.unuse(ITEM_TYPE_4);
	obj.unuse(ITEM_TYPE_5);
	obj.opacity = 0;
	obj.pos.x = INACTIVE_X1;
	obj.pos.y = INACTIVE_Y1;
};

let itemSpawnCounter = 0;
const ITEM_BASE_SPAWN_RATE = 4;
const ITEM_DIFFICULTY_DELAY_MULTIPLIER = 2;

const spawnItem = () => {
	if (state.game.player.isAlive === false) {
		return;
	}
	// Increment counter
	itemSpawnCounter++;

	// Only spawn an item if the counter reaches target value
	// Power-ups arrive slower at higher difficulties
	if (
		itemSpawnCounter >=
		ITEM_BASE_SPAWN_RATE +
			state.game.difficulty * ITEM_DIFFICULTY_DELAY_MULTIPLIER
	) {
		for (const obj of entities) {
			if (obj.is(ITEM_DEAD_TAG)) {
				activateFn(obj);
				// Reset counter
				itemSpawnCounter = 0;
				return;
			}
		}
	}
};

export type ItemType = BoomGameObject<
	[SpriteComp, PosComp, AreaComp, OpacityComp, TimerComp]
> & {
	is_static: boolean;
};

const initFn = () => {
	// Declare some info outside of the loop
	const atlasContent = { atlas: utils.constants.ATLAS } as const;
	const areaContent = { radius: 18, shape: 'circle' } as const;

	// Time to loop and create a bunch of objects
	for (const _ of $range(1, MAX_ITEMS)) {
		const item = add([
			sprite('powerup01', atlasContent),
			pos(INACTIVE_X1, INACTIVE_Y1),
			// Set area larger than graphics for easier pickup
			area(areaContent),
			opacity(0),
			ITEM_TAG,
			ITEM_DEAD_TAG,
		]) as ItemType;

		item.add([
			timer(FRAME, () => {
				// Set physics group so objects don't collide with others of the same type
				if (item.area_url !== undefined) {
					setPhysicsGroup(item);
				} else {
					print('item.ts Error: No area_url in item');
					// Fallback: try again in a second
					timer(1, () => {
						// Set physics group so objects don't collide with others of the same type
						if (item.area_url !== undefined) {
							setPhysicsGroup(item);
						}
					});
				}
			}),
		]);

		item.is_static = true;

		entities.add(item);
	}

	// On a regular interval, spawn resources
	const itemTimer = add([timer(ITEM_SPAWN_TIMER, spawnItem)]);
	itemTimer.loop(ITEM_SPAWN_TIMER, spawnItem);
};

export const items = {
	deactivate: deactivateFn,
	init: initFn,
} as const;
