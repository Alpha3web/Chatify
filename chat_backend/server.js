require("dotenv").config();
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('./SocketEvent');
const mongoose = require('mongoose');
const router = require("./routes");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const { authenticateToken } = require("./middleware/authMiddleware");
const compression = require("compression");

mongoose.connect(process.env.DB_CONNECTION_STRING);

const db = mongoose.connection;

db.on('error', (err) => {
  console.error(err);
});

db.once('open', () => {
  console.log('Connected to MongoDB');
});

app.use(compression());
app.use(express.urlencoded({ extended: true, limit: '100MB' }));
app.use(express.json({ limit: '100MB' }));
app.use(cors());

// Middleware and routes will go here
app.use("/api", router);
app.use(cookieParser());

app.use(authenticateToken);


server.listen(process.env.PORT, () => {
  console.log('Server listening on port 3001');
});

io.listen(server);
