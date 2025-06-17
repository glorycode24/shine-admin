// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api', // 👈 This will now ONLY proxy requests starting with /api
    createProxyMiddleware({
      target: 'http://localhost:8080', // Your Spring Boot backend
      changeOrigin: true,
    })
  );
};