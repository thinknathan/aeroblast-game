/* Copyright (c) Nathan Bolton (AGPL-3.0-or-later) | https://github.com/thinknathan/aeroblast-game */
/** @noSelfInFile **/

/**
 * Start Scene.
 * Logic and GUI for entering other scenes.
 */

import * as utils from '../utils';
import * as state from '../state';

const PULSE_RATE = 2;

// Set up for audio
let audioController: url | string = '';
const PLAY_BGM = hash('playBGM');
const audioTable: SoundTable = {
	play: '',
	pan: 0,
	speed: 1,
};

const goToOptions = () => {
	show('options');
};

const goToGame = () => {
	show('game');
};

const exitGame = () => {
	sys.exit(0);
};

const alignTable: { align: 'center' | 'left' | 'right' } = {
	align: 'center',
};

const shapeTable = {
	shape: 'auto',
} as const;

const atlasContent = { atlas: utils.constants.ATLAS } as const;

const LINE_HEIGHT_DOUBLE = 2;
const LINE_HEIGHT_TRIPLE = 3;

export const start = () => {
	scene('start', () => {
		// Create a URL for the audio controller so we can do audio!
		if (audioController === '') {
			audioController = msg.url('/audio_controller#script');
		}
		audioTable.play = 'bgm_title';
		msg.post(audioController, PLAY_BGM, audioTable);

		// Title background
		add([
			sprite('title3', atlasContent),
			pos(utils.camera.centerX(), utils.camera.centerY()),
		]);

		// Start game text
		alignTable.align = 'left';

		const prompt = add([
			text('Press anything to start', alignTable),
			pos(
				utils.camera.lEdge() + utils.constants.SCREEN_PADDING,
				utils.camera.bEdge() +
					utils.constants.SCREEN_PADDING * LINE_HEIGHT_TRIPLE,
			),
			opacity(1),
		]);

		// Animate text
		utils.pulse(prompt, PULSE_RATE);

		on_key_release('*', goToGame);
		on_mouse_release(goToGame);

		// Add options text
		const options = add([
			text('o - Options', alignTable),
			pos(
				utils.camera.lEdge() + utils.constants.SCREEN_PADDING,
				utils.camera.bEdge() +
					utils.constants.SCREEN_PADDING * LINE_HEIGHT_DOUBLE,
			),
			area(shapeTable),
		]);

		options.on_click(goToOptions);

		on_key_press('key_o', goToOptions);

		// Check if we're an HTML5 build or not
		const systemInfo = sys.get_sys_info() satisfies { system_name: string };
		if (systemInfo.system_name !== 'HTML5') {
			// Add exit text
			const exit = add([
				text('q - Quit', alignTable),
				pos(
					utils.camera.lEdge() + utils.constants.SCREEN_PADDING,
					utils.camera.bEdge() + utils.constants.SCREEN_PADDING,
				),
				area(shapeTable),
			]);

			exit.on_click(exitGame);

			on_key_press('key_q', exitGame);
		}

		alignTable.align = 'right';

		// Credits!
		add([
			text('Game by Nathan Bolton', alignTable),
			pos(
				utils.camera.rEdge() - utils.constants.SCREEN_PADDING,
				utils.camera.tEdge() - utils.constants.SCREEN_PADDING,
			),
		]);
		add([
			text('Additional Scripts by @britzl, @thejustinwalsh', alignTable),
			pos(
				utils.camera.rEdge() - utils.constants.SCREEN_PADDING,
				utils.camera.tEdge() -
					utils.constants.SCREEN_PADDING * LINE_HEIGHT_DOUBLE,
			),
		]);

		alignTable.align = 'left';

		// High Score
		add([
			text(`High Score: ${state.options.get('highScore')}`, alignTable),
			pos(
				utils.camera.lEdge() + utils.constants.SCREEN_PADDING,
				utils.camera.tEdge() - utils.constants.SCREEN_PADDING,
			),
		]);
	});
};
