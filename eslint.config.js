import { configs, plugins } from 'eslint-config-airbnb-extended';

export default [
  {
    ignores: ['node_modules/**', 'out/**', 'data/**', 'dist/**', 'build/**', 'release/**'],
  },

  // The config objects only carry rules; their plugins register separately.
  plugins.stylistic,
  plugins.importX,
  plugins.node,
  plugins.typescriptEslint,

  ...configs.base.typescript,
  ...configs.node.recommended,

  {
    languageOptions: {
      parserOptions: {
        // This config file is not part of tsconfig's include, so it needs the
        // default project to be type-aware-linted alongside the source.
        projectService: { allowDefaultProject: ['eslint.config.js'] },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // This is a CLI; printing is the point.
      'no-console': 'off',

      // AC's INI keys are literally named __CM_WEATHER_TYPE, __TRACK_GEOTAG_LAT
      // and so on. Renaming them is not an option.
      'no-underscore-dangle': 'off',

      // Node runs .ts directly, so relative imports keep their extension.
      'import-x/extensions': 'off',

      'max-len': ['error', { code: 120, ignoreUrls: true, ignoreStrings: true, ignoreTemplateLiterals: true }],
    },
  },
];
