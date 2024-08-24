import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { spawn } from 'child_process';
import svelte from 'rollup-plugin-svelte';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import css from 'rollup-plugin-css-only';
import typescript from '@rollup/plugin-typescript';
import { sveltePreprocess } from 'svelte-preprocess';
import postcss from 'rollup-plugin-postcss';

const production = !process.env.ROLLUP_WATCH;

const sassPath = path.resolve(__dirname, 'src', 'lib', 'style');

function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = spawn('npm', ['run', 'start', '--', '--dev'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}

export default {
	input: 'src/main.ts', // Update the input to use TypeScript
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: 'docs/build/bundle.js' // Output bundle for embedding
	},
	plugins: [
		alias({
            entries: [
                { find: '$lib', replacement: path.resolve(__dirname, 'src/lib') },
            ]
        }),
		svelte({
			preprocess: sveltePreprocess({
				scss: {},
				typescript: true, // Enable TypeScript preprocessing in Svelte
            }),
			compilerOptions: {
				dev: !production,
				css: css => {
					css.write('bundle.css');
				},
			}
        }),
		postcss({
			extensions: ['.scss', '.css'],
            extract: true,
            minimize: production,
            sourceMap: true,
            use: [
                ['sass', {
                    includePaths: [
                        path.join(__dirname, 'src', 'lib', 'style')
                    ]
                }]
            ]
		}),
		typescript({
			sourceMap: !production,
			inlineSources: !production,
		}),
		css({ output: 'bundle.css' }),

		resolve({
			browser: true,
			dedupe: ['svelte'],
			exportConditions: ['svelte']
		}),
		commonjs(),

		!production && serve({
			open: true,
			contentBase: ['public'],
			historyApiFallback: true,
		  }),

		!production && livereload('public'),

		production && terser()
	],
	watch: {
		clearScreen: false
	}
};
