import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import sveltePreprocess from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';
import css from 'rollup-plugin-css-only';
import image from '@rollup/plugin-image';
import copy from 'rollup-plugin-copy';
import versionInjector from 'rollup-plugin-version-injector';

const production = !process.env.ROLLUP_WATCH;

function serve() {
  let server;

  function toExit() {
    if (server) server.kill(0);
  }

  return {
    writeBundle() {
      if (server) return;
      server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
        stdio: ['ignore', 'inherit', 'inherit'],
        shell: true,
      });

      process.on('SIGTERM', toExit);
      process.on('exit', toExit);
    },
  };
}

const genBundleConfig = (name) => ({
  input: `src/${name}.ts`,
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: `public/build/${name}.js`,
  },
  plugins: [
    copy({
      targets: [
        { src: 'node_modules/bootstrap/dist/css/bootstrap.min.css*', dest: 'public/build/' },
      ],
    }),
    versionInjector(),
    svelte({
      preprocess: sveltePreprocess({ sourceMap: !production }),
      compilerOptions: {
        // enable run-time checks when not in production
        dev: !production,
      },
    }),
    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      browser: true,
      dedupe: ['svelte'],
    }),
    commonjs(),
    typescript({
      // sourceMap: !production,
      sourceMap: true,
      // inlineSources: !production
      inlineSources: true,
    }),
    // we'll extract any component CSS out into
    // a separate file - better for performance
    css({ output: `${name}.css` }),
    image(),
    // In dev mode, call `npm run start` once
    // the bundle has been generated
    !production && serve(),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    !production && livereload('public'),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser(),
  ],
  watch: {
    clearScreen: false,
  },
});

export default [genBundleConfig('bingo'), genBundleConfig('create')];
