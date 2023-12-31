/** @noSelfInFile **/

/**
 * Render Script.
 * Modified from @britzl's `boom` script.
 * Intended to be more optimized, but not yet profiled.
 */

type renderScript = {
	tile_pred: predicate;
	screen_pred: predicate;
	clear_color: vmath.vector4;
	view: vmath.matrix4;
	projection: vmath.matrix4;
	window_width: number;
	window_height: number;
	frustum_table: { frustum: vmath.matrix4 };
	clear_table: {
		[key: typeof render.BUFFER_COLOR_BIT]: vmath.vector4 | number;
		[key: typeof render.BUFFER_DEPTH_BIT]: number;
		[key: typeof render.BUFFER_STENCIL_BIT]: number;
	};
};

export type setViewProjectionMessage = {
	view: vmath.matrix4;
	projection: vmath.matrix4;
};

const CLEAR_COLOR_HASH = hash('clear_color');
const SET_VIEW_PROJ_HASH = hash('set_view_projection');

export function init(this: renderScript) {
	this.tile_pred = render.predicate(['tile']);
	this.screen_pred = render.predicate(['screen']);

	this.clear_color = vmath.vector4(0, 0, 0, 0);
	this.clear_color.x = sys.get_config_int('render.clear_color_red', 0);
	this.clear_color.y = sys.get_config_int('render.clear_color_green', 0);
	this.clear_color.z = sys.get_config_int('render.clear_color_blue', 0);
	this.clear_color.w = sys.get_config_int('render.clear_color_alpha', 0);

	this.view = vmath.matrix4();
	this.projection = vmath.matrix4();

	this.window_width = 0;
	this.window_height = 0;

	this.frustum_table = { frustum: vmath.mul(this.view, this.projection) };
	this.clear_table = {
		[render.BUFFER_COLOR_BIT]: this.clear_color,
		[render.BUFFER_DEPTH_BIT]: 1,
		[render.BUFFER_STENCIL_BIT]: 0,
	};
}

export function update(this: renderScript) {
	this.window_width = render.get_window_width();
	this.window_height = render.get_window_height();
	if (this.window_width === 0 || this.window_height === 0) {
		return;
	}

	// clear screen buffers
	render.set_depth_mask(true);
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	render.set_stencil_mask(0xff);

	this.clear_table[render.BUFFER_COLOR_BIT] = this.clear_color;
	render.clear(this.clear_table);

	render.set_viewport(0, 0, this.window_width, this.window_height);

	// render world (sprites, tilemaps, particles etc)
	const view_world = this.view;
	const proj_world = this.projection;
	render.set_view(view_world);
	render.set_projection(proj_world);
	render.set_depth_mask(false);
	render.disable_state(render.STATE_DEPTH_TEST);
	render.disable_state(render.STATE_STENCIL_TEST);
	render.enable_state(render.STATE_BLEND);
	render.set_blend_func(
		render.BLEND_SRC_ALPHA,
		render.BLEND_ONE_MINUS_SRC_ALPHA,
	);
	render.disable_state(render.STATE_CULL_FACE);

	this.frustum_table.frustum = vmath.mul(proj_world, view_world);
	render.draw(this.tile_pred, this.frustum_table);
	render.draw_debug3d();

	// render screen space
	const view_screen = this.view;
	const proj_screen = this.projection;
	xmath.matrix4_orthographic(
		proj_screen,
		0,
		render.get_width(),
		0,
		render.get_height(),
		-1,
		1,
	);
	render.set_view(view_screen);
	render.set_projection(proj_screen);
	render.set_depth_mask(false);
	render.disable_state(render.STATE_DEPTH_TEST);
	render.disable_state(render.STATE_STENCIL_TEST);
	render.enable_state(render.STATE_BLEND);
	render.set_blend_func(
		render.BLEND_SRC_ALPHA,
		render.BLEND_ONE_MINUS_SRC_ALPHA,
	);
	render.disable_state(render.STATE_CULL_FACE);
	this.frustum_table.frustum = vmath.mul(proj_screen, view_screen);
	render.draw(this.screen_pred, this.frustum_table);
}

export function on_message(
	this: renderScript,
	message_id: hash,
	message: render.clear_color_message | setViewProjectionMessage,
) {
	if (message_id === CLEAR_COLOR_HASH) {
		this.clear_color = (message as render.clear_color_message).color;
	} else if (message_id === SET_VIEW_PROJ_HASH) {
		this.view = (message as setViewProjectionMessage).view;
		this.projection = (message as setViewProjectionMessage).projection;
	}
}
