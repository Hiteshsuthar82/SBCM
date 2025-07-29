const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');
const fs = require('fs');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: process.env.CORS_ORIGIN } });

const db = require('./config/db');
db.connect();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files securely
app.use('/uploads', express.static(path.join(__dirname, 'uploads')), (req, res, next) => {
  // Add auth if needed for file serving
  next();
});

// General rate limiting
const generalLimiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW,
  max: process.env.RATE_LIMIT_MAX,
});
app.use(generalLimiter);

// Routes
app.use('/api', require('./routes/index'));

// Swagger
const swaggerDocument = YAML.parse(fs.readFileSync('./tests/swagger.yaml', 'utf8'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Error handling
app.use(require('./middleware/errorMiddleware'));

// WebSocket for real-time
io.on('connection', (socket) => {
  console.log('User connected');
  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`Joined room: ${room}`);
  });
  socket.on('disconnect', () => console.log('User disconnected'));
});

// Global io for use in services
global.io = io;

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));