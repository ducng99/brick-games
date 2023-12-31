module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "standard-with-typescript",
        "plugin:svelte/recommended"
    ],
    "ignorePatterns": [ "vite-env.d.ts" ],
    "overrides": [
        {
            "files": [ "*.svelte" ],
            "parser": "svelte-eslint-parser",
            // Parse the `<script>` in `.svelte` as TypeScript by adding the following configuration.
            "parserOptions": {
                "parser": "@typescript-eslint/parser"
            }
        },
        {
            "files": [ "*.ts" ],
            "rules": {
                "no-unused-vars": "off"
            }
        }
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module",
        "project": "tsconfig.json",
        "tsconfigRootDir": __dirname,
        "extraFileExtensions": [ ".svelte" ]
    },
    "rules": {
        "indent": [
            "error",
            4,
            {
                "SwitchCase": 1
            }
        ],
        "@typescript-eslint/indent": [
            "error",
            4,
            {
                "SwitchCase": 1
            }
        ],
        "semi": [
            "error",
            "always"
        ],
        "@typescript-eslint/semi": [
            "error",
            "always"
        ],
        "space-before-function-paren": [
            "error",
            {
                "anonymous": "always",
                "named": "never",
                "asyncArrow": "always"
            }
        ],
        "@typescript-eslint/space-before-function-paren": [
            "error",
            {
                "anonymous": "always",
                "named": "never",
                "asyncArrow": "always"
            }
        ],
        "@next/next/no-img-element": "off",
        "eqeqeq": "off",
        "camelcase": "off",
        "no-prototype-builtins": "warn",
        "no-unused-vars": "warn",
        "no-undef": "warn",
        "multiline-ternary": "off",
        "react-hooks/exhaustive-deps": "off",
        "no-new": "off",
        "@typescript-eslint/member-delimiter-style": [
            "error",
            {
                "multiline": {
                    "delimiter": "semi",
                    "requireLast": true
                },
                "singleline": {
                    "delimiter": "semi",
                    "requireLast": false
                }
            }
        ],
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/strict-boolean-expressions": "off",
        "@typescript-eslint/no-floating-promises": [
            "error",
            {
                "ignoreIIFE": true
            }
        ],
        "@typescript-eslint/naming-convention": "off",
        "@typescript-eslint/promise-function-async": "off",
        "new-cap": [
            "error",
            {
                "newIsCapExceptionPattern": "\\.default$"
            }
        ]
    }
}
