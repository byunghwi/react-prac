import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    // 파일 복사 플러그인 설정
    // viteStaticCopy({
    //   targets: [
    //     { src: 'node_modules/cesium/Build/Cesium/Workers', dest: 'public/Workers' },
    //     { src: 'node_modules/cesium/Build/Cesium/ThirdParty', dest: 'public/ThirdParty' },
    //     { src: 'node_modules/cesium/Build/Cesium/Assets', dest: 'public/Assets' },
    //     { src: 'node_modules/cesium/Build/Cesium/Widgets', dest: 'public/Widgets' },
    //     { src: 'src/assets/glb', dest: 'public/glb' },
    //   ],
    //   hook: 'buildStart', // 복사를 빌드 시작 시 수행
    // }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Vue의 @ 경로를 React에서 사용
    },
    fallback: {
      util: 'util/', // 필요한 경우 util 모듈 설정
      fs: false, // 파일 시스템 모듈 비활성화
    },
  },
  build: {
    outDir: 'build', // 빌드 디렉토리
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://211.189.132.21:7080',
        changeOrigin: true,
      },
      '/ws2': {
        target: 'ws://211.189.132.21:7080',
        changeOrigin: true,
        ws: true,
      },
    },
  },
});