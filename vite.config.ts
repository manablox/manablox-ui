import { defineConfig } from 'vite';
import { resolve, dirname } from 'node:path';
import { copyFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import dts from 'vite-plugin-dts';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    dts({
      include: ['src/**/*.ts'],
      exclude: ['**/*.styles.ts'],
      rollupTypes: true,
    }),
    {
      name: 'copy-theme-css',
      apply: 'build',
      closeBundle() {
        function copyDir(src: string, dest: string) {
          mkdirSync(dest, { recursive: true });
          for (const entry of readdirSync(src)) {
            const srcPath = resolve(src, entry);
            const destPath = resolve(dest, entry);

            if (statSync(srcPath).isDirectory()) {
              copyDir(srcPath, destPath);
            } else if (entry.endsWith('.css')) {
              copyFileSync(srcPath, destPath);
            }
          }
        }

        copyDir(resolve(__dirname, 'src/theme'), resolve(__dirname, 'dist/theme'));
      },
    },
  ],
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
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['@floating-ui/dom', 'tabbable'],
      output: {
        preserveModules: false,
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'theme/[name][extname]';
          }
          return '[name][extname]';
        },
      },
    },
    sourcemap: true,
    target: 'es2022',
    cssCodeSplit: true,
  },
});
