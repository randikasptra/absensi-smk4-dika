const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const http = require('http');
const socketIO = require('./socket');
const pool = require('./config/database');

dotenv.config();

// Pastikan bagian ini sudah ada dan berfungsi dengan baik
const app = express();
const server = http.createServer(app);
const io = socketIO.init(server);

// Make io available in req object
app.set('io', io);

// Deklarasi PORT
const PORT = process.env.PORT || 5000;

// Make io available in req object
app.set('io', io);

// Security Middleware
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// CORS Configuration
app.use(cors({
  origin: '*', // Untuk debugging, izinkan semua origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Import routes
const authRoutes = require('./routes/authRoutes');
const guruRoutes = require('./routes/guruRoutes');
const siswaRoutes = require('./routes/siswaRoutes');
const kelasRoutes = require('./routes/kelasRoutes');
const mapelRoutes = require('./routes/mapelRoutes');
const jadwalRoutes = require('./routes/jadwalRoutes');
const absensiRoutes = require('./routes/absensiRoutes');
const userRoutes = require('./routes/userRoutes'); // Tambahkan import userRoutes

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/guru', guruRoutes);
app.use('/api/siswa', siswaRoutes);
app.use('/api/kelas', kelasRoutes);
app.use('/api/mapel', mapelRoutes);
app.use('/api/jadwal', jadwalRoutes);
app.use('/api/absensi', absensiRoutes);
app.use('/api/users', userRoutes); // Tambahkan penggunaan userRoutes

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Tambahkan sebelum app.listen
// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('Database connection successful');
    connection.release();
  })
  .catch(err => {
    console.error('Database connection failed:', err.message);
  });

// Pindahkan server.listen ke bagian paling bawah
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});