/* Copyright (c) Nathan Bolton (AGPL-3.0-or-later) | https://github.com/thinknathan/aeroblast-game */
/** @noSelfInFile **/

/**
 * Options Scene.
 * Logic for saving and loading settings.
 */

import * as utils from '../utils';
import * as state from '../state';

// Set up for audio
let audioController: url | string = '';
const PLAY_BGM = hash('playBGM');
const audioTable: SoundTable = {
	play: '',
	pan: 0,
	speed: 1,
};

const filename = sys.get_save_file(
	utils.constants.GAME_NAME,
	utils.constants.SAVE_FILE_NAME,
);

const backToStart = () => {
	// Save before leaving
	sys.save(filename, state.options);

	// Back to start
	show('start');
};

const alignTable: { align: 'center' | 'left' | 'right' } = {
	align: 'center',
};

const shapeTable = {
	shape: 'auto',
} as const;

const DEFAULT_VOLUME = 50;
const MUSIC_OFF = 0;
const STOP_BGM = hash('stopBGM');
const RESTART_BGM = hash('restartBGM');

const musicToggle = () => {
	if (state.options.get('musicVolume') === DEFAULT_VOLUME) {
		state.options.set('musicVolume', MUSIC_OFF);
		msg.post(audioController, STOP_BGM, audioTable);
	} else {
		state.options.set('musicVolume', DEFAULT_VOLUME);
		msg.post(audioController, RESTART_BGM, audioTable);
	}

	state.saveOptions();
	show('options');
};

const soundToggle = () => {
	if (state.options.get('sfxVolume') === DEFAULT_VOLUME) {
		state.options.set('sfxVolume', MUSIC_OFF);
	} else {
		state.options.set('sfxVolume', DEFAULT_VOLUME);
	}

	state.saveOptions();
	show('options');
};

export const options = () => {
	scene('options', () => {
		// Create a URL for the audio controller so we can do audio!
		if (audioController === '') {
			audioController = msg.url('/audio_controller#script');
		}
		audioTable.play = 'bgm_title';
		msg.post(audioController, PLAY_BGM, audioTable);

		alignTable.align = 'center';

		const musicV = state.options.get('musicVolume');
		const musicText = add([
			text(
				`m - Music: ${musicV === DEFAULT_VOLUME ? 'On' : 'Off'}`,
				alignTable,
			),
			pos(
				utils.camera.centerX(),
				utils.camera.centerY() + utils.constants.SCREEN_PADDING,
			),
			area(shapeTable),
		]);
		musicText.on_click(musicToggle);
		on_key_press('key_m', musicToggle);

		const soundV = state.options.get('sfxVolume');
		const soundText = add([
			text(
				`s - Sound: ${soundV === DEFAULT_VOLUME ? 'On' : 'Off'}`,
				alignTable,
			),
			pos(utils.camera.centerX(), utils.camera.centerY()),
			area(shapeTable),
		]);
		soundText.on_click(soundToggle);
		on_key_press('key_s', soundToggle);

		alignTable.align = 'right';

		// Exit controls
		add([
			text('esc - Back', alignTable),
			pos(
				utils.camera.rEdge() - utils.constants.SCREEN_PADDING,
				utils.camera.bEdge() + utils.constants.SCREEN_PADDING,
			),
			area(shapeTable),
		]);
		on_key_release('key_esc', backToStart);
	});
};
