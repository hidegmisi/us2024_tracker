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
	input: 'src/main.js',
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
				scss: {
					
                },
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
		// we'll extract any component CSS out into
		// a separate file - better for performance
		css({ output: 'bundle.css' }),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
			browser: true,
			dedupe: ['svelte'],
			exportConditions: ['svelte']
		}),
		commonjs(),

		// In dev mode, call `npm run start` once
		// the bundle has been generated
		!production && serve({
			open: true,
			contentBase: ['public'],
			historyApiFallback: true,
		  }),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		!production && livereload('public'),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser()
	],
	watch: {
		clearScreen: false
	}
};
