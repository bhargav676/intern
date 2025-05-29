const express = require('express');
const cors = require('cors');
const connectDB = require('./db/connect');
const apiRoutes = require('./routes/api');
require('dotenv').config();

const app = express();


connectDB();

// Middleware
app.use(cors());
app.use(express.json());


app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));