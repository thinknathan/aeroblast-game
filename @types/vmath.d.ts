/** @noSelfInFile */

/**
 * Operator Map Types for Vector Math
 * @link https://typescripttolua.github.io/docs/advanced/language-extensions#operator-map-types
 */
declare namespace vmath {
	export const add: LuaAddition<vmath.matrix4, vmath.matrix4, vmath.matrix4> &
		LuaAddition<vmath.quaternion, vmath.quaternion, vmath.quaternion> &
		LuaAddition<vmath.vector3, vmath.vector3, vmath.vector3> &
		LuaAddition<vmath.vector4, vmath.vector4, vmath.vector4>;
	export const sub: LuaSubtraction<
		vmath.matrix4,
		vmath.matrix4,
		vmath.matrix4
	> &
		LuaSubtraction<vmath.quaternion, vmath.quaternion, vmath.quaternion> &
		LuaSubtraction<vmath.vector3, vmath.vector3, vmath.vector3> &
		LuaSubtraction<vmath.vector4, vmath.vector4, vmath.vector4>;
	export const mul: LuaMultiplication<
		vmath.matrix4,
		vmath.matrix4,
		vmath.matrix4
	> &
		LuaMultiplication<vmath.matrix4, number, vmath.matrix4> &
		LuaMultiplication<vmath.quaternion, number, vmath.quaternion> &
		LuaMultiplication<vmath.quaternion, vmath.quaternion, vmath.quaternion> &
		LuaMultiplication<vmath.vector3, number, vmath.vector3> &
		LuaMultiplication<vmath.vector3, vmath.vector3, vmath.vector3> &
		LuaMultiplication<vmath.vector4, number, vmath.vector4> &
		LuaMultiplication<vmath.vector4, vmath.vector4, vmath.vector4>;
	export const div: LuaDivision<vmath.matrix4, number, vmath.matrix4> &
		LuaDivision<vmath.matrix4, vmath.matrix4, vmath.matrix4> &
		LuaDivision<vmath.quaternion, number, vmath.quaternion> &
		LuaDivision<vmath.quaternion, vmath.quaternion, vmath.quaternion> &
		LuaDivision<vmath.vector3, number, vmath.vector3> &
		LuaDivision<vmath.vector3, vmath.vector3, vmath.vector3> &
		LuaDivision<vmath.vector4, number, vmath.vector4> &
		LuaDivision<vmath.vector4, vmath.vector4, vmath.vector4>;
}
