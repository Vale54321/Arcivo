import adapter from '@sveltejs/adapter-static';
import path from 'node:path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		alias: {
			'@arcivo/api-contracts': path.resolve('../../libs/api-contracts/src/index.ts'),
			'@arcivo/ui-components': path.resolve('../../libs/ui-components/src/index.ts')
		},
		adapter: adapter({
			// default options are shown. On some platforms
			// these options are set automatically - see below
			pages: 'build',
			assets: 'build',
			fallback: '200.html',
			precompress: false,
			strict: true
		})
	}
};

export default config;
