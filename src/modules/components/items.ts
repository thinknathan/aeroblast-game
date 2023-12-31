/** @noSelfInFile **/

/**
 * Items Component.
 * Logic and appearance of items that power-up the player.
 */

import * as utils from '../utils';
import * as state from '../state';

const ITEM_TAG = 'item';
const ITEM_ALIVE_TAG = 'item-active';
const ITEM_DEAD_TAG = 'item-inactive';

// The coordinates the items will be stored when inactive
const INACTIVE_X1 = -250;
const INACTIVE_X2 = -500;
const INACTIVE_Y1 = -250;
const INACTIVE_Y2 = -500;

// By default, there's a max of 128 sprites and physics objects in the engine.
// We've increased the sprite limit, but we're still trying to keep within a relatively small limit.
const MAX_ITEMS = 5;

const ITEM_TYPE_1 = 'item-damage-up';
const ITEM_TYPE_2 = 'item-damage-rate-up';
const ITEM_TYPE_3 = 'item-move-rate-up';
const ITEM_TYPE_4 = 'item-freeze';
const ITEM_TYPE_5 = 'item-hp-restore';

let randomItem = 0;
const activateFn = (obj: ItemType) => {
	if (obj.area_url !== undefined) {
		physics.set_group(obj.area_url, 'enemy');
		physics.set_maskbit(obj.area_url, 'player', true);
	} else {
		print('item.ts Error: No area_url in item');
	}

	obj.use(ITEM_ALIVE_TAG);
	obj.unuse(ITEM_DEAD_TAG);
	const [x, y] = getSpawnPosition();
	obj.opacity = 1;
	obj.pos.x = x;
	obj.pos.y = y;

	randomItem = randi(1, MAX_ITEMS);
	if (randomItem === 1) {
		obj.play('powerup03');
		obj.use(ITEM_TYPE_1);
		// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	} else if (randomItem === 2) {
		obj.play('powerup02');
		obj.use(ITEM_TYPE_2);
		// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	} else if (randomItem === 3) {
		obj.play('powerup05');
		obj.use(ITEM_TYPE_3);
		// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	} else if (randomItem === 4) {
		obj.play('powerup04');
		obj.use(ITEM_TYPE_4);
	} else {
		obj.play('powerup01');
		obj.use(ITEM_TYPE_5);
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
	obj.pos.x = randi(INACTIVE_X1, INACTIVE_X2);
	obj.pos.y = randi(INACTIVE_Y1, INACTIVE_Y2);
};

const ITEM_SPAWN_TIMER = 5;

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

export type ItemType = BoomGameObject<
	[SpriteComp, PosComp, AreaComp, OpacityComp]
> & {
	is_static: boolean;
};

const initFn = () => {
	// Declare some info outside of the loop
	const atlasContent = { atlas: utils.constants.ATLAS } as const;
	const areaContent = { radius: 18, shape: 'circle' } as const;

	// Time to loop and create a bunch of objects
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	for (const _ of $range(1, MAX_ITEMS)) {
		const item = add([
			sprite('powerup01', atlasContent),
			pos(randi(INACTIVE_X1, INACTIVE_X2), randi(INACTIVE_Y1, INACTIVE_Y2)),
			// Set area larger than graphics for easier pickup
			area(areaContent),
			opacity(0),
			ITEM_TAG,
			ITEM_DEAD_TAG,
		]) as ItemType;
		item.is_static = true;

		entities.add(item);
	}

	// On a regular interval, spawn resources
	const difficultyTimer = add([timer(ITEM_SPAWN_TIMER, spawnItem)]);
	difficultyTimer.loop(ITEM_SPAWN_TIMER, spawnItem);
};

const spawnItem = () => {
	if (state.game.player.isAlive === false) {
		return;
	}
	for (const obj of entities) {
		if (obj.is(ITEM_DEAD_TAG)) {
			activateFn(obj);
			return;
		}
	}
};

const entities: LuaSet<ItemType> = new LuaSet();

interface Items {
	activate: (this: void, obj: ItemType) => void;
	deactivate: (this: void, obj: ItemType) => void;
	init: (this: void) => void;
}

export const items: Items = {
	activate: activateFn,
	deactivate: deactivateFn,
	init: initFn,
} as const;
