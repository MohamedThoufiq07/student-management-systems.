const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');


dotenv.config();


connectDB();

const app = express();


app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));


app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
