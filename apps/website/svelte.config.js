import adapter from '@sveltejs/adapter-static';
import path from 'node:path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    alias: {
      '@arcivo/ui-components': path.resolve('../../libs/ui-components/src/index.ts'),
    },
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: '200.html',
      precompress: false,
      strict: true,
    }),
  },
};

export default config;
