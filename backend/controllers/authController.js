const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const register = async (req, res) => {
  const { username, password, nama_lengkap, role, email } = req.body;
  
  try {
    // Check if user exists
    const [users] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await pool.execute(
      'INSERT INTO users (username, password, nama_lengkap, role, email) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, nama_lengkap, role, email]
    );

    // Get inserted user
    const [newUser] = await pool.execute('SELECT * FROM users WHERE id = ?', [result.insertId]);
    const user = newUser[0];

    // Notify connected clients
    req.app.get('io').emit('userUpdated', { type: 'CREATE', data: {
      id: user.id,
      username: user.username,
      nama_lengkap: user.nama_lengkap,
      role: user.role,
      email: user.email
    }});

    res.status(201).json({
      id: user.id,
      username: user.username,
      nama_lengkap: user.nama_lengkap,
      role: user.role,
      email: user.email,
      token: generateToken(user.id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const [users] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
    const user = users[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    res.json({
      id: user.id,
      username: user.username,
      nama_lengkap: user.nama_lengkap,
      role: user.role,
      email: user.email,
      token: generateToken(user.id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Tambahkan di bagian atas file bersama fungsi lainnya
const getMe = async (req, res) => {
  try {
    const [users] = await pool.execute('SELECT id, username, nama_lengkap, role, email FROM users WHERE id = ?', [req.user.id]);
    const user = users[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Tambahkan getMe ke module.exports
module.exports = { register, login, getMe };

// Tambahkan fungsi register yang dapat diakses admin
register: async (req, res) => {
  try {
    const { username, nama_lengkap, email, password, role } = req.body;
    
    // Validasi input
    if (!username || !nama_lengkap || !email || !password || !role) {
      return res.status(400).json({ message: 'Semua field harus diisi' });
    }
    
    // Cek apakah email sudah terdaftar
    const [existingUsers] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Simpan user baru
    const [result] = await pool.execute(
      'INSERT INTO users (username, nama_lengkap, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [username, nama_lengkap, email, hashedPassword, role]
    );
    
    const userId = result.insertId;
    
    // Ambil data user yang baru dibuat (tanpa password)
    const [newUsers] = await pool.execute('SELECT id, username, nama_lengkap, email, role FROM users WHERE id = ?', [userId]);
    const newUser = newUsers[0];
    
    // Notify connected clients about the new user
    req.app.get('io').emit('userUpdated', { 
      type: 'CREATE', 
      data: newUser
    });
    
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}