/* Copyright (c) Nathan Bolton (AGPL-3.0-or-later) | https://github.com/thinknathan/aeroblast-game */

declare type IsDeactivateable = {
	this: void;
	deactivate: () => void;
	_active: boolean;
};

declare type IsActivateable = {
	this: void;
	activate: () => void;
	_active: boolean;
};
