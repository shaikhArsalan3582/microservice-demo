const connectDb = require("./config/db");
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

connectDb();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/swagger.json', (req, res) => { //used by api-gateway to combine swagger
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});
app.use('/users', userRoutes);

module.exports = app;