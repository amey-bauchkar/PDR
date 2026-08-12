const { createProxyMiddleware } = require('http-proxy-middleware');
const express = require('express');

const app = express();
app.use('/cdn/storage', createProxyMiddleware({ 
  target: 'https://gfzknettmaclomxyimjf.supabase.co', 
  changeOrigin: true, 
  pathRewrite: { '^/cdn/storage': '/storage/v1/object/public' } 
}));

const server = app.listen(0, async () => { 
  const port = server.address().port; 
  try {
    const r = await fetch(`http://localhost:${port}/cdn/storage/product-images/doesnotexist.jpg`);
    console.log('STATUS:', r.status);
  } catch (err) {
    console.error(err);
  } finally {
    server.close();
  }
});
