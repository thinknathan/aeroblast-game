// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.recommendedTypeChecked,
	{
		plugins: {
			'@typescript-eslint': tseslint.plugin,
		},
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				project: true,
			},
		},
		rules: {
			eqeqeq: 'error',
			'@typescript-eslint/ban-types': [
				'error',
				{
					types: {
						null: {
							message: "Use `undefined` as the equivalent to Lua's `nil`",
							fixWith: 'undefined',
							suggest: ['undefined'],
						},
					},
					extendDefaults: true,
				},
			],
			'@typescript-eslint/no-confusing-non-null-assertion': 'warn',
			'@typescript-eslint/non-nullable-type-assertion-style': 'warn',
			'@typescript-eslint/sort-type-constituents': 'warn',
			'@typescript-eslint/prefer-literal-enum-member': 'error',
			'@typescript-eslint/prefer-ts-expect-error': 'error',
			'@typescript-eslint/require-array-sort-compare': 'error',
			'@typescript-eslint/no-require-imports': 'error',
			'@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'error',
			'prefer-destructuring': 'off',
			'@typescript-eslint/prefer-destructuring': 'warn',
			'no-shadow': 'off',
			'@typescript-eslint/no-shadow': 'warn',
			'@typescript-eslint/no-magic-numbers': [
				'warn',
				{
					ignore: [-1, 0, 1],
					ignoreEnums: true,
				},
			],
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					args: 'all',
					argsIgnorePattern: '^_',
					caughtErrors: 'all',
					caughtErrorsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					ignoreRestSiblings: true,
				},
			],
			'@typescript-eslint/strict-boolean-expressions': [
				'error',
				{
					allowString: false,
					allowNumber: false,
				},
			],
			'@typescript-eslint/restrict-plus-operands': 'off',
			'@typescript-eslint/no-explicit-any': ['error', { ignoreRestArgs: true }],
		},
	},
);
