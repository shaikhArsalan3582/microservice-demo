const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const swaggerUi = require('swagger-ui-express');
const authenticate = require('./middlewares/auth');
require('dotenv').config();

const app = express();

// Utility: should this route be public?
function isPublicRoute(req) {
  const method = req.method;
  const urlPath = req.path;

  return (
    urlPath === '/' || // root path public
    urlPath.startsWith('/api-docs') || // swagger UI + assets public
    urlPath === '/swagger.json' || // swagger json public
    (method === 'POST' && urlPath === '/users/register') ||
    (method === 'POST' && urlPath === '/users/login') ||
    (method === 'GET' && /^\/products\/[^/]+$/.test(urlPath)) // GET /products/:id public
  );
}

// Global auth middleware wrapper — skip auth for public routes
app.use((req, res, next) => {
  if (isPublicRoute(req)) {
    return next();
  }
  return authenticate(req, res, next);
});

// Setup logs directory and streams
const logDirectory = path.join(__dirname, 'logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}
const accessLogStream = fs.createWriteStream(
  path.join(logDirectory, 'access.log'),
  { flags: 'a' }
);

// Setup morgan logging
app.use(morgan('dev'));
app.use(morgan('combined', { stream: accessLogStream }));

// Proxy logger
const proxyLogger = {
  debug: (msg) => {
    console.debug(msg);
    fs.appendFileSync(path.join(logDirectory, 'proxy.log'), `[DEBUG] ${msg}\n`);
  },
  info: (msg) => {
    console.info(msg);
    fs.appendFileSync(path.join(logDirectory, 'proxy.log'), `[INFO] ${msg}\n`);
  },
  warn: (msg) => {
    console.warn(msg);
    fs.appendFileSync(path.join(logDirectory, 'proxy.log'), `[WARN] ${msg}\n`);
  },
  error: (msg) => {
    console.error(msg);
    fs.appendFileSync(path.join(logDirectory, 'proxy.log'), `[ERROR] ${msg}\n`);
  },
};

// Microservices swagger URLs
const swaggerUrls = {
  user: 'http://localhost:3001/swagger.json',
  product: 'http://localhost:3002/swagger.json',
  order: 'http://localhost:3003/swagger.json',
};

let combinedSwaggerSpec = null;

// Fetch and combine swagger specs without prefixing
async function fetchAndCombineSwagger() {
  try {
    const [userSpec, productSpec, orderSpec] = await Promise.all([
      axios.get(swaggerUrls.user).then(res => res.data),
      axios.get(swaggerUrls.product).then(res => res.data),
      axios.get(swaggerUrls.order).then(res => res.data),
    ]);

    combinedSwaggerSpec = {
      openapi: '3.0.0',
      info: {
        title: 'Combined API',
        version: '1.0.0',
        description: 'Gateway combined API documentation',
      },
      servers: [{ url: 'http://localhost:3000' }],
      tags: [
        ...(userSpec.tags || []),
        ...(productSpec.tags || []),
        ...(orderSpec.tags || []),
      ],
      paths: {
        ...userSpec.paths,
        ...productSpec.paths,
        ...orderSpec.paths,
      },
      components: {
        schemas: {
          ...userSpec.components?.schemas,
          ...productSpec.components?.schemas,
          ...orderSpec.components?.schemas,
        },
        securitySchemes: {
          ...userSpec.components?.securitySchemes,
          ...productSpec.components?.securitySchemes,
          ...orderSpec.components?.securitySchemes,
        }
      },
      security: userSpec.security || [],
    };

    console.log('✅ Combined OpenAPI specs (3.0.0) loaded without prefixed paths');
  } catch (error) {
    console.error('❌ Failed to load swagger specs:', error.message);
  }
}

(async () => {
  await fetchAndCombineSwagger();

  // Serve combined Swagger UI and JSON
  app.use('/api-docs', (req, res, next) => {
    if (!combinedSwaggerSpec) {
      return res.status(503).send('Swagger spec not ready');
    }
    next();
  }, swaggerUi.serve, swaggerUi.setup(combinedSwaggerSpec));

  app.get('/swagger.json', (req, res) => {
    if (!combinedSwaggerSpec) {
      return res.status(503).send('Swagger spec not ready');
    }
    res.setHeader('Content-Type', 'application/json');
    res.send(combinedSwaggerSpec);
  });

  // Root route
  app.get('/', (req, res) => {
    res.send('API Gateway is running!');
  });

  // Proxy middlewares
  app.use('/users', createProxyMiddleware({
    target: 'http://localhost:3001/users',
    changeOrigin: true,
    logLevel: 'debug',
    logger: proxyLogger,
  }));

  app.use('/orders', createProxyMiddleware({
    target: 'http://localhost:3003/orders',
    changeOrigin: true,
    logLevel: 'debug',
    logger: proxyLogger,
    onProxyReq: (proxyReq, req) => {
      // Forward auth header
      if (req.headers.authorization) {
        proxyReq.setHeader('Authorization', req.headers.authorization);
      }
    }
  }));

  app.use('/products', createProxyMiddleware({
    target: 'http://localhost:3002/products',
    changeOrigin: true,
    logLevel: 'debug',
    logger: proxyLogger,
  }));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 API Gateway listening on http://localhost:${PORT}`);
    console.log(`📘 Swagger UI available at http://localhost:${PORT}/api-docs`);
  });
})();
