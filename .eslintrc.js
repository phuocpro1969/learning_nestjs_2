module.exports = {
	parser: "@typescript-eslint/parser",
	parserOptions: {
		project: "tsconfig.json",
		sourceType: "module",
	},
	plugins: ["@typescript-eslint/eslint-plugin", "prettier"],
	extends: [
		"plugin:@typescript-eslint/recommended",
		"plugin:prettier/recommended",
		"plugin:import/typescript",
		"prettier",
	],
	root: true,
	env: {
		node: true,
		jest: true,
		es2021: true,
	},
	ignorePatterns: [".eslintrc.js"],
	rules: {
		"@typescript-eslint/interface-name-prefix": "off",
		"@typescript-eslint/explicit-function-return-type": "off",
		"@typescript-eslint/explicit-module-boundary-types": "off",
		"@typescript-eslint/no-explicit-any": "off",
		quotes: [
			"error",
			"double",
			{
				avoidEscape: true,
			},
		],
	},
};
