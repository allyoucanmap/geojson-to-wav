/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {},
  plugins: [
    '@snowpack/plugin-svelte'
  ],
  routes: [],
  optimize: {
    "bundle": true,
    "minify": true
  },
  packageOptions: {},
  devOptions: {},
  buildOptions: {},
  exclude: [
    '.git/**/*',
    '**/node_modules/**/*',
    'package-lock.json',
    'workspace.code-workspace',
    'yarn.lock',
    'package.json',
    'snowpack.config.js',
    '.gitignore',
  ],
};
