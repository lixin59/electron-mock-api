import { rmSync } from 'node:fs';
import { defineConfig, loadEnv } from 'vite';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import { getRootPath, getSrcPath, setupVitePlugins, viteDefine } from './build';
import pkg from './package.json';

export default defineConfig(configEnv => {
  rmSync('dist-electron', { recursive: true, force: true });
  const viteEnv = loadEnv(configEnv.mode, process.cwd()) as unknown as ImportMetaEnv;

  const rootPath = getRootPath();
  const srcPath = getSrcPath();

  const isServe = configEnv.command === 'serve';
  const isBuild = configEnv.command === 'build';
  const sourcemap = isServe || Boolean(process.env.VSCODE_DEBUG);
  const dependencies: Record<string, any> = 'dependencies' in pkg ? pkg.dependencies : Object.create({});

  return {
    resolve: {
      alias: {
        '~': rootPath,
        '@': srcPath,
        'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js'
      }
    },
    define: viteDefine,
    plugins: [
      ...setupVitePlugins(viteEnv),
      electron([
        {
          // Main-Process entry file of the Electron App.
          entry: 'electron/main/index.ts',
          onstart(options) {
            if (process.env.VSCODE_DEBUG) {
              // eslint-disable-next-line no-console
              console.log(/* For `.vscode/.debug.script.mjs` */ '[startup] Electron App');
            } else {
              options.startup();
            }
          },
          vite: {
            build: {
              sourcemap,
              minify: isBuild,
              outDir: 'dist-electron/main',
              rollupOptions: {
                external: Object.keys(dependencies)
              }
            }
          }
        },
        {
          entry: 'electron/preload/index.ts',
          onstart(options) {
            // Notify the Renderer-Process to reload the page when the Preload-Scripts build is complete,
            // instead of restarting the entire Electron App.
            options.reload();
          },
          vite: {
            build: {
              sourcemap: sourcemap ? 'inline' : undefined, // #332
              minify: isBuild,
              outDir: 'dist-electron/preload',
              rollupOptions: {
                external: Object.keys(dependencies)
              }
            }
          }
        }
      ]),
      // Use Node.js API in the Renderer-process
      renderer({
        nodeIntegration: false
      })
    ],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "./src/styles/scss/global.scss" as *;`
        }
      }
    },
    server:
      process.env.VSCODE_DEBUG &&
      (() => {
        return {
          host: '127.0.0.1',
          port: 3344
        };
      })(),
    optimizeDeps: {
      include: [
        '@antv/data-set',
        '@antv/g2',
        '@better-scroll/core',
        'echarts',
        'swiper',
        'swiper/vue',
        'vditor',
        'wangeditor',
        'xgplayer'
      ]
    }
  };
});
