import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig(({ mode, isSsrBuild }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [vue()],
    resolve: {
      alias: [
        { find: /^@\//, replacement: fileURLToPath(new URL('./src/', import.meta.url)) },
        // SSR 验证构建：以无操作桩替代 element-plus，避免 Node 环境缺 DOM
        ...(isSsrBuild
          ? [{ find: /^element-plus$/, replacement: fileURLToPath(new URL('./scripts/element-plus-node-shim.js', import.meta.url)) }]
          : [])
      ]
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      open: false,
      // 后端为 Spring Boot 3.x（默认 8080），关闭 mock 后由代理转发真实 API
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET || 'http://localhost:8080',
          changeOrigin: true
        }
      }
    },
    build: {
      outDir: 'dist',
      chunkSizeWarningLimit: 1500,
      // SSR 场景（脚本验证）需要顶层 await 支持
      target: isSsrBuild ? 'es2022' : 'modules',
      rollupOptions: isSsrBuild
        ? {}
        : {
            output: {
              manualChunks: {
                vue: ['vue', 'vue-router', 'pinia'],
                element: ['element-plus', '@element-plus/icons-vue'],
                echarts: ['echarts']
              }
            }
          }
    }
  }
})
