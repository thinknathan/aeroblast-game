/** @noSelfInFile **/

/**
 * Gameplay Scene.
 * Logic for gameplay systems and updating the GUI.
 */

import * as state from '../state';
import * as utils from '../utils';
import * as components from '../components';

const DIFFICULTY_MULTIPLIER = 2;
const SECOND = 60;
const DIFFICULTY_TIMER = SECOND * DIFFICULTY_MULTIPLIER - 1;
const GAME_TIMER_RATE = 1;
const PULSE_RATE = 0.5;
const SCALE_DOUBLE = 2;
const LINE_HEIGHT_DOUBLE = 2;
const LINE_HEIGHT_TRIPLE = 3;
const PADDING_SINGLE = 16;
const PADDING_DOUBLE = 32;

// Set up for audio
let audioController: url | string = '';
const PLAY_BGM = hash('playBGM');
const audioTable: SoundTable = {
	play: '',
	pan: 0,
	speed: 1,
};

const difficultyIncrease = () => {
	if (state.game.difficulty < state.game.difficultyMax) {
		state.game.difficulty += 1;
		print('gameplay.ts: Difficulty increased by 1');
	}
};

const countDown = () => {
	if (state.game.currentTime > 0) {
		state.game.currentTime--;
	}
};

const DOUBLE_DIGIT_LIMIT = 10;

const convertToMMSS = (seconds: number): string => {
	const minutes = Math.floor(seconds / SECOND);
	const remainingSeconds = seconds % SECOND;

	const formattedMinutes =
		minutes < DOUBLE_DIGIT_LIMIT ? `0${minutes}` : `${minutes}`;
	const formattedSeconds =
		remainingSeconds < DOUBLE_DIGIT_LIMIT
			? `0${remainingSeconds}`
			: `${remainingSeconds}`;

	return `${formattedMinutes}:${formattedSeconds}`;
};

const updateHighScore = (
	topScoreT: BoomGameObject<[TextComp, OpacityComp]>,
) => {
	print('A new high score!');
	state.options.set('highScore', state.game.score);
	state.saveOptions();
	utils.pulse(topScoreT, PULSE_RATE);
};

let canRestartGameNow = false;
const DELAY_BETWEEN_GAME_OVER_AND_REBOOT = 2;

const restartHandler = () => {
	if (state.game.gameIsOver === true) {
		if (canRestartGameNow === true) {
			sys.reboot();
		}
		add([
			timer(DELAY_BETWEEN_GAME_OVER_AND_REBOOT, () => {
				canRestartGameNow = true;
			}),
		]);
	}
};

const gameOverEvent = (
	finalScoreT: BoomGameObject<[TextComp, OpacityComp]>,
	gameOverT: BoomGameObject<[TextComp, OpacityComp]>,
	topScoreT: BoomGameObject<[TextComp, OpacityComp]>,
) => {
	audioTable.play = 'bgm_gameover';
	msg.post(audioController, PLAY_BGM, audioTable);

	finalScoreT.opacity = 1;
	gameOverT.opacity = 1;
	topScoreT.opacity = 1;
	finalScoreT.text = 'FINAL SCORE: ' + state.game.score.toString();
	state.game.gameIsOver = true;
	state.game.player.isAlive = false;

	let highScore = state.options.get('highScore');
	if (highScore === undefined) {
		highScore = 0;
	}

	if (state.game.score > highScore) {
		updateHighScore(topScoreT);
		highScore = state.game.score;
	}

	topScoreT.text = 'TOP SCORE: ' + highScore;
};

const alignTable: { align: 'center' | 'left' | 'right' } = {
	align: 'left',
};

export const gameplay = () => {
	scene('game', () => {
		// Create a URL for the audio controller so we can do audio!
		if (audioController === '') {
			audioController = msg.url('/audio_controller#script');
		}
		audioTable.play = 'bgm_gameplay';
		msg.post(audioController, PLAY_BGM, audioTable);

		on_key_release('*', restartHandler);

		components.map.init();
		components.bullets.init();
		components.enemies.init();
		components.items.init();
		components.player.init();

		// On a regular interval, increase difficulty
		const difficultyTimer = add([timer(DIFFICULTY_TIMER, difficultyIncrease)]);
		difficultyTimer.loop(DIFFICULTY_TIMER, difficultyIncrease);

		// Every second, countdown timer
		const gameTimer = add([timer(GAME_TIMER_RATE, countDown)]);
		gameTimer.loop(GAME_TIMER_RATE, countDown);

		const LINE_X = utils.camera.lEdge() + utils.constants.SCREEN_PADDING;
		const LINE_ONE_Y = utils.camera.tEdge() - utils.constants.SCREEN_PADDING;
		const LINE_TWO_Y =
			utils.camera.tEdge() -
			utils.constants.SCREEN_PADDING * LINE_HEIGHT_DOUBLE;
		const LINE_THREE_Y =
			utils.camera.tEdge() -
			utils.constants.SCREEN_PADDING * LINE_HEIGHT_TRIPLE;
		alignTable.align = 'left';

		add([text('SCORE: ', alignTable), pos(LINE_X, LINE_ONE_Y)]);
		const scoreDisplay = add([
			text('0', alignTable),
			// eslint-disable-next-line @typescript-eslint/no-magic-numbers
			pos(LINE_X + 28, LINE_ONE_Y),
		]);

		add([text('HP: ', alignTable), pos(LINE_X, LINE_TWO_Y)]);
		const hpDisplay = add([
			text('0', alignTable),
			pos(LINE_X + PADDING_SINGLE, LINE_TWO_Y),
		]);

		add([text('TIME: ', alignTable), pos(LINE_X, LINE_THREE_Y)]);
		const timeDisplay = add([
			text('0', alignTable),
			// eslint-disable-next-line @typescript-eslint/no-magic-numbers
			pos(LINE_X + 24, LINE_THREE_Y),
		]);

		alignTable.align = 'center';

		// Game-over and final score
		const gameOverText = add([
			text('GAME OVER', alignTable),
			opacity(0),
			scale(SCALE_DOUBLE),
			pos(utils.camera.centerX(), utils.camera.centerY() + PADDING_SINGLE),
		]);
		const finalScoreText = add([
			text('', alignTable),
			opacity(0),
			scale(SCALE_DOUBLE),
			pos(utils.camera.centerX(), utils.camera.centerY() - PADDING_SINGLE),
		]);
		const topScoreText = add([
			text('', alignTable),
			opacity(0),
			scale(SCALE_DOUBLE),
			pos(utils.camera.centerX(), utils.camera.centerY() - PADDING_DOUBLE),
		]);

		// Restart prompt
		const prompt = add([
			text('Press anything to restart', alignTable),
			pos(
				utils.camera.centerX(),
				utils.camera.bEdge() + utils.constants.SCREEN_PADDING,
			),
			opacity(0),
		]);

		on_update(() => {
			if (state.game.gameIsOver === true) {
				if (canRestartGameNow === true) {
					prompt.opacity = 1;
				}
				return;
			}
			if (state.game.currentTime <= 0) {
				timeDisplay.text = '0';
				gameOverEvent(finalScoreText, gameOverText, topScoreText);
				return;
			}
			if (state.game.player.isAlive === false) {
				hpDisplay.text = '0';
				gameOverEvent(finalScoreText, gameOverText, topScoreText);
				return;
			}
			hpDisplay.text = state.game.player.hp.toString();
			scoreDisplay.text = state.game.score.toString();
			timeDisplay.text = convertToMMSS(state.game.currentTime);
		});
	});
};
