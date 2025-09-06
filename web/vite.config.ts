import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(), 
        tailwindcss(),
        // 打包分析工具（可选）
        visualizer({
            filename: 'dist/stats.html',
            open: false,
            gzipSize: true,
            brotliSize: true
        })
    ],
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
            }
        }
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    build: {

        // 启用压缩
        minify: 'terser',
        terserOptions: {
            compress: {
                // 移除 console
                drop_console: true,
                // 移除 debugger
                drop_debugger: true,
                // 移除未使用的代码
                dead_code: true,
                // 移除无用的 import
                unused: true
            },
            mangle: {
                // 混淆变量名
                toplevel: true
            }
        },
        // 启用 CSS 代码分割
        cssCodeSplit: true,
        // 设置 chunk 大小警告限制
        chunkSizeWarningLimit: 1000,
        // 启用 source map（生产环境可以关闭）
        sourcemap: false
    }
})
