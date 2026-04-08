const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const mainRouter = require('./src/router');
const errorHandler = require('./src/middleware/errorHandler');
const prisma = require('./src/config/db');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(path.join(__dirname, 'uploads')));

app.use('/api', mainRouter);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
