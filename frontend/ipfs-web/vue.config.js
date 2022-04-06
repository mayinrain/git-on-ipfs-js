const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/cors': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        ws:true,
        pathRewrite: {
          '^/cors': ''
        }
      }
    }
  }
})
