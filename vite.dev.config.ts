import { defineConfig } from 'vite';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: resolve(__dirname, 'example'),
  resolve: {
    alias: {
      '@core': resolve(__dirname, 'src/core'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@overlay': resolve(__dirname, 'src/overlay'),
      '@services': resolve(__dirname, 'src/services'),
      '@theme': resolve(__dirname, 'src/theme'),
      '@components': resolve(__dirname, 'src/components'),
    },
  },
});
