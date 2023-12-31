/** @noSelfInFile **/

/**
 * Effects Utility.
 * Visual effects that can be applied to other components.
 */

import { hasOpacity, type BoomHasOpacity } from './checkTypes';

const TRANSPARENT = 0.5;
const OPAQUE = 1;

/**
 * Visually fade object to 50% and back to 100%.
 * @param obj
 * @param duration
 */
export const pulse = (
	obj: BoomBlankGameObject & Partial<BoomComponent>,
	duration: number,
) => {
	if (hasOpacity(obj)) {
		fadeIn(obj, duration);
	} else {
		print('effects.ts Error: Add OpacityComp to object before using pulse');
	}
};

const fadeIn = (obj: BoomHasOpacity, duration: number) => {
	const fadeInTween = tween(
		TRANSPARENT,
		OPAQUE,
		duration,
		undefined,
		(opacity) => {
			obj.opacity = opacity;
		},
	);
	fadeInTween.on_end(() => {
		fadeOut(obj, duration);
	});
};

const fadeOut = (obj: BoomHasOpacity, duration: number) => {
	const fadeOutTween = tween(
		OPAQUE,
		TRANSPARENT,
		duration,
		undefined,
		(opacity) => {
			obj.opacity = opacity;
		},
	);
	fadeOutTween.on_end(() => {
		fadeIn(obj, duration);
	});
};
