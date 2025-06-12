   const bcrypt = require('bcrypt');
const pool = require('../config/database');

// Get all guru
const getAllGuru = async (req, res) => {
  try {
    const [guru] = await pool.execute(`
      SELECT g.*, u.username, u.nama_lengkap, u.email 
      FROM guru g 
      JOIN users u ON g.user_id = u.id
    `);
    res.json(guru);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get guru by ID
const getGuruById = async (req, res) => {
  try {
    const [guru] = await pool.execute(`
      SELECT g.*, u.username, u.nama_lengkap, u.email 
      FROM guru g 
      JOIN users u ON g.user_id = u.id 
      WHERE g.id = ?
    `, [req.params.id]);

    if (guru.length === 0) {
      return res.status(404).json({ message: 'Guru not found' });
    }
    res.json(guru[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new guru
const createGuru = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { username, password, nama_lengkap, email, nip, jenis_kelamin, alamat, no_telp } = req.body;

    // Create user account
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [userResult] = await connection.execute(
      'INSERT INTO users (username, password, nama_lengkap, email, role) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, nama_lengkap, email, 'guru']
    );

    // Create guru profile
    const [guruResult] = await connection.execute(
      'INSERT INTO guru (user_id, nip, jenis_kelamin, alamat, no_telp) VALUES (?, ?, ?, ?, ?)',
      [userResult.insertId, nip, jenis_kelamin, alamat, no_telp]
    );

    await connection.commit();

    // Notify connected clients
    req.app.get('io').emit('guruUpdated', { 
      type: 'CREATE', 
      data: {
        id: guruResult.insertId,
        user_id: userResult.insertId,
        nip,
        jenis_kelamin,
        alamat,
        no_telp,
        username,
        nama_lengkap,
        email
      }
    });

    res.status(201).json({
      message: 'Guru created successfully',
      data: {
        id: guruResult.insertId,
        user_id: userResult.insertId,
        nip,
        jenis_kelamin,
        alamat,
        no_telp,
        user: {
          username,
          nama_lengkap,
          email
        }
      }
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    connection.release();
  }
};

// Update guru
const updateGuru = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [guru] = await connection.execute('SELECT * FROM guru WHERE id = ?', [req.params.id]);
    if (guru.length === 0) {
      return res.status(404).json({ message: 'Guru not found' });
    }

    const { nip, jenis_kelamin, alamat, no_telp, nama_lengkap, email } = req.body;

    // Update guru profile
    await connection.execute(
      'UPDATE guru SET nip = ?, jenis_kelamin = ?, alamat = ?, no_telp = ? WHERE id = ?',
      [nip, jenis_kelamin, alamat, no_telp, req.params.id]
    );

    // Update user data
    if (nama_lengkap || email) {
      await connection.execute(
        'UPDATE users SET nama_lengkap = ?, email = ? WHERE id = ?',
        [nama_lengkap, email, guru[0].user_id]
      );
    }

    await connection.commit();

    // Notify connected clients
    req.app.get('io').emit('guruUpdated', { 
      type: 'UPDATE', 
      data: {
        id: req.params.id,
        nip,
        jenis_kelamin,
        alamat,
        no_telp,
        nama_lengkap,
        email
      }
    });

    res.json({ message: 'Guru updated successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    connection.release();
  }
};

// Delete guru
const deleteGuru = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [guru] = await connection.execute('SELECT * FROM guru WHERE id = ?', [req.params.id]);
    if (guru.length === 0) {
      return res.status(404).json({ message: 'Guru not found' });
    }

    // Delete user account and guru profile
    await connection.execute('DELETE FROM users WHERE id = ?', [guru[0].user_id]);
    await connection.execute('DELETE FROM guru WHERE id = ?', [req.params.id]);

    await connection.commit();

    // Notify connected clients
    req.app.get('io').emit('guruUpdated', { 
      type: 'DELETE', 
      data: { id: req.params.id }
    });

    res.json({ message: 'Guru deleted successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    connection.release();
  }
};

module.exports = {
  getAllGuru,
  getGuruById,
  createGuru,
  updateGuru,
  deleteGuru
};