import { defineConfig } from 'vitest/config';
import path from 'path';
import { transformWithEsbuild } from 'vite';

// Custom plugin to handle JSX in .js files (this project uses .js for JSX components).
// Runs before Vite's import-analysis so the JSX is already transformed.
function jsxInJs() {
  return {
    name: 'treat-js-as-jsx',
    enforce: 'pre',
    async transform(code, id) {
      if (!id.endsWith('.js') || id.includes('node_modules')) return;
      if (!/[<]/.test(code)) return;
      return transformWithEsbuild(code, id + '.jsx', {
        jsx: 'automatic',
        jsxImportSource: 'react',
      });
    },
  };
}

export default defineConfig({
  plugins: [jsxInJs()],
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
  resolve: {
    conditions: ['development', 'browser'],
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('test'),
  },
  test: {
    environment: 'jsdom',
    globals: true,
    pool: 'forks',
    setupFiles: ['./src/test/setup.js'],
    css: false,
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    alias: {
      '@/': path.resolve(__dirname, 'src') + '/',
      components: path.resolve(__dirname, 'src/components'),
      features: path.resolve(__dirname, 'src/features'),
      hooks: path.resolve(__dirname, 'src/Hooks'),
      catalyst: path.resolve(__dirname, 'src/components/catalyst'),
      utils: path.resolve(__dirname, 'src/utils'),
      assets: path.resolve(__dirname, 'src/assets'),
      lib: path.resolve(__dirname, 'src/lib'),
      ui: path.resolve(__dirname, 'src/components/ui'),
    },
  },
});
