/** @noSelfInFile */

/**
 * Script lifecycle types
 * @link https://defold.com/manuals/script/
 */

/**
 * Called when the component is initialized.
 */
declare type ScriptInit<T> = (this: T) => void;

/**
 * Called once each frame. dt contains the delta time since the last frame.
 */
declare type ScriptUpdate<T> = (this: T, dt: number) => void;

/**
 * Frame-rate independent update. dt contains the delta time since the last update.
 */
declare type ScriptFixedUpdate<T> = (this: T, dt: number) => void;

/**
 * When messages are sent to the script component through msg.post() the engine calls this function of the receiver component.
 * @link https://defold.com/manuals/message-passing
 */
declare type ScriptOnMessage<T> = (
	this: T,
	message_id: hash,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	message: any,
	sender: url,
) => void;

/**
 * If this component has acquired input focus (see `acquire_input_focus`) the engine calls this function when input is registered.
 * @link https://defold.com/ref/go/#acquire_input_focus
 * @link https://defold.com/manuals/input
 */
declare type ScriptOnInput<T> = (
	this: T,
	action_id: hash,
	action: go.input_message,
) => void;

/**
 * This function is called when the script is reloaded through the hot reload editor function.
 * @link https://defold.com/manuals/hot-reload
 */
declare type ScriptOnReload<T> = (this: T) => void;

/**
 * Called when the component is deleted.
 */
declare type ScriptFinal<T> = (this: T) => void;
