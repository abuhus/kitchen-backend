const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const userRoutes = require('./routes/users');
const calorieRoutes = require('./routes/calories');


dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.use('/api/users', userRoutes);
app.use('/api/calories', calorieRoutes);

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});

