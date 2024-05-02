/* Copyright (c) Nathan Bolton (AGPL-3.0-or-later) | https://github.com/thinknathan/aeroblast-game */
/** @noSelfInFile **/

type MergedPoolItem<T> = IsActivateable & IsDeactivateable & T;

export const poolGenerator: <T>(
	create: () => T,
	deactivate: (obj: T, pool: LuaSet<MergedPoolItem<T>>) => void,
	activate: (obj: T, pool: LuaSet<MergedPoolItem<T>>) => void,
	length: number,
) => Readonly<{
	pool: LuaSet<MergedPoolItem<T>>;
	activateItem: () => MergedPoolItem<T> | undefined;
}> = (create, deactivate, activate, length) => {
	const pool = new LuaSet<MergedPoolItem<ReturnType<typeof create>>>();
	for (const _ of $range(1, length)) {
		const creation = create() as MergedPoolItem<ReturnType<typeof create>>;
		creation.deactivate = () => {
			deactivate(creation, pool);
			creation._active = false;
		};
		creation.activate = () => {
			activate(creation, pool);
			creation._active = true;
		};
		creation._active = false;
		pool.add(creation);
	}
	const activateItem = () => {
		for (const obj of pool) {
			if (obj._active === false) {
				obj.activate();
				return obj;
			}
		}
		return undefined;
	};
	return { pool, activateItem } as const;
};
