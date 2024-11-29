module.exports = {
  // ... 다른 설정들
  devServer: {
    proxy: {
      '^/api': {
        target: 'http://localhost:6080',
        changeOrigin: true
      },
      '^/ws2': {
        target: 'ws://localhost:6080',
        ws: true,
        changeOrigin: true
      }
    }
  }
};