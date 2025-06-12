const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const protect = async (req, res, next) => {
  try {
    console.log('Auth headers:', req.headers); // Tambahkan logging
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [user] = await pool.execute('SELECT * FROM users WHERE id = ?', [decoded.id]);
    
    if (!user[0]) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user[0];
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = { protect };