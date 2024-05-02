/* Copyright (c) Nathan Bolton (AGPL-3.0-or-later) | https://github.com/thinknathan/aeroblast-game */
/** @noSelfInFile **/

import * as state from '../modules/state';

type AudioController = {
	__empty: void;
};

type SoundMessage = {
	play: SoundKey;
	delay?: number;
	gain?: number;
	pan?: number;
	speed?: number;
};
type SoundUrlTable = LuaMap<SoundKey, url>;
type SoundTimers = LuaMap<SoundKey, number>;

const HUNDO = 100;
const GATE_TIME = 0.3;
const PLAY_BGM = hash('playBGM');
const PLAY_SFX = hash('playSFX');
const STOP_BGM = hash('stopBGM');
const RESTART_BGM = hash('restartBGM');
const BGM_TYPE = 'BGM';
const SFX_TYPE = 'SFX';

let currentBgm: SoundKey | '' = '';
const soundUrls: SoundUrlTable = new LuaMap();
const activeSounds: SoundTimers = new LuaMap();

// Store global as a local for faster access
const defSoundPlay = sound.play;
const defSoundStop = sound.stop;
const defSoundPause = sound.pause;

// Store a table to re-use to save memory
const soundTable = {
	delay: 0,
	gain: 1,
	pan: 0,
	speed: 1,
};

const playAudio = function (
	soundId: SoundKey,
	type: 'BGM' | 'SFX',
	delay: number | undefined,
	gain: number = 1.0,
	pan: number | undefined,
	speed: number | undefined,
): void {
	// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
	soundTable.delay = delay || soundTable.delay;
	// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
	soundTable.pan = pan || soundTable.pan;
	// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
	soundTable.speed = speed || soundTable.speed;

	if (type === BGM_TYPE) {
		// Check is already playing
		if (currentBgm !== soundId) {
			// Check if the sound url exists
			if (soundUrls.get(soundId) !== undefined) {
				// Stop previous BGM
				if (currentBgm !== '') {
					print('Stopping playing', currentBgm);
					defSoundStop(soundUrls.get(currentBgm)!);
				}
				currentBgm = soundId;
				soundTable.gain = (state.options.get('musicVolume')! / HUNDO) * gain;
				print('Starting playing', currentBgm);
				defSoundPlay(soundUrls.get(soundId)!, soundTable);
			} else {
				print(`audioController.script.ts: Could not find sound ${soundId}`);
			}
		} else {
			print(`Already playing ${soundId}`);
		}
	} else {
		// Only play sounds that are not currently in the gating table.
		if (activeSounds.get(soundId) === undefined) {
			// Store sound timer in the table
			activeSounds.set(soundId, GATE_TIME);

			// Check if the sound url exists
			if (soundUrls.get(soundId) !== undefined) {
				soundTable.gain = (state.options.get('sfxVolume')! / HUNDO) * gain;
				defSoundPlay(soundUrls.get(soundId)!, soundTable);
			} else {
				print(`audioController.script.ts: Could not find sound ${soundId}`);
			}
		} else {
			// An attempt to play a sound was gated
			print(`audioController.script.ts: Gated ${soundId}`);
		}
	}
};

export const init: ScriptInit<AudioController> = function (this) {
	// BGM
	soundUrls.set('bgm_gameover', msg.url('/audio_controller#bgm_gameover'));
	soundUrls.set('bgm_gameplay', msg.url('/audio_controller#bgm_gameplay'));
	soundUrls.set('bgm_title', msg.url('/audio_controller#bgm_title'));
	// SFX
	soundUrls.set(
		'sfx_creatureHurt',
		msg.url('/audio_controller#sfx_creatureHurt'),
	);
	soundUrls.set(
		'sfx_creatureHurt1',
		msg.url('/audio_controller#sfx_creatureHurt1'),
	);
	soundUrls.set(
		'sfx_creatureHurt2',
		msg.url('/audio_controller#sfx_creatureHurt2'),
	);
	soundUrls.set(
		'sfx_creatureHurt3',
		msg.url('/audio_controller#sfx_creatureHurt3'),
	);
	soundUrls.set(
		'sfx_creatureHurt4',
		msg.url('/audio_controller#sfx_creatureHurt4'),
	);
	soundUrls.set('sfx_explosion', msg.url('/audio_controller#sfx_explosion'));
	soundUrls.set('sfx_laser', msg.url('/audio_controller#sfx_laser'));
	soundUrls.set('sfx_lose3', msg.url('/audio_controller#sfx_lose3'));
	soundUrls.set('sfx_pickup1', msg.url('/audio_controller#sfx_pickup1'));
	soundUrls.set('sfx_pickup2', msg.url('/audio_controller#sfx_pickup2'));
	soundUrls.set('sfx_pickup3', msg.url('/audio_controller#sfx_pickup3'));
	soundUrls.set('sfx_pickup4', msg.url('/audio_controller#sfx_pickup4'));
	soundUrls.set('sfx_pickup5', msg.url('/audio_controller#sfx_pickup5'));

	// Mute BGM when losing focus
	window.set_listener(function (this: AudioController, event, _data) {
		if (event === window.WINDOW_EVENT_FOCUS_GAINED) {
			if (currentBgm !== '') {
				print('Resuming BGM:', currentBgm);
				defSoundPause(soundUrls.get(currentBgm)!, false);
			}
		} else if (event === window.WINDOW_EVENT_FOCUS_LOST) {
			if (currentBgm !== '') {
				print('Pausing BGM:', currentBgm);
				defSoundPause(soundUrls.get(currentBgm)!, true);
			}
		}
	});
};

export const update: ScriptUpdate<AudioController> = function (this, dt): void {
	// Count down the stored timers
	for (const [key] of activeSounds) {
		activeSounds.set(key, activeSounds.get(key)! - dt);
		if (activeSounds.get(key)! < 0) {
			activeSounds.delete(key);
		}
	}
};

/** @inlineStart @removeReturn */
const testSfxMessage = (
	message_id: hash,
	message: unknown,
): message is SoundMessage => {
	return message_id === PLAY_SFX;
};
/** @inlineEnd @inlineStart @removeReturn */
const testBgmMessage = (
	message_id: hash,
	message: unknown,
): message is SoundMessage => {
	return message_id === PLAY_BGM;
};
/** @inlineEnd */

export const on_message: ScriptOnMessage<AudioController> = function (
	this,
	message_id,
	message,
	_sender,
): void {
	if (testSfxMessage(message_id, message)) {
		playAudio(
			message.play,
			SFX_TYPE,
			message.delay,
			message.gain,
			message.pan,
			message.speed,
		);
	} else if (testBgmMessage(message_id, message)) {
		playAudio(
			message.play,
			BGM_TYPE,
			message.delay,
			message.gain,
			message.pan,
			message.speed,
		);
	} else if (message_id === STOP_BGM) {
		if (currentBgm !== '') {
			print('Stopping playing', currentBgm);
			defSoundStop(soundUrls.get(currentBgm)!);
		}
	} else if (message_id === RESTART_BGM) {
		if (currentBgm !== '') {
			print('Resuming playing', currentBgm);
			defSoundPlay(soundUrls.get(currentBgm)!, soundTable);
		}
	}
};
