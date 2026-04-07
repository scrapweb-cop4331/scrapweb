const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.port;

app.use(cors());
app.use(express.json());

const userRoutes = require('./routes/user');
const mediaRoutes = require('./routes/media');

app.use('/api', userRoutes);
app.use('/api/media', mediaRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
