const bcrypt = require('bcrypt');
const pool = require('../config/database');

// Get all siswa
const getAllSiswa = async (req, res) => {
  try {
    console.log('Fetching all siswa...');
    const [siswa] = await pool.execute(`
      SELECT s.*, u.username, u.nama_lengkap, u.email,
             k.nama_kelas, k.jurusan, k.tahun_ajaran
      FROM siswa s
      JOIN users u ON s.user_id = u.id
      JOIN kelas k ON s.kelas_id = k.id
    `);
    console.log('Siswa data fetched:', siswa.length, 'records');
    res.json(siswa);
  } catch (error) {
    console.error('Error in getAllSiswa:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get siswa by ID
const getSiswaById = async (req, res) => {
  try {
    const [siswa] = await pool.execute(`
      SELECT s.*, u.username, u.nama_lengkap, u.email,
             k.nama_kelas, k.jurusan, k.tahun_ajaran
      FROM siswa s
      JOIN users u ON s.user_id = u.id
      JOIN kelas k ON s.kelas_id = k.id
      WHERE s.id = ?
    `, [req.params.id]);

    if (siswa.length === 0) {
      return res.status(404).json({ message: 'Siswa not found' });
    }
    res.json(siswa[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new siswa
const createSiswa = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { username, password, nama_lengkap, email, nis, kelas_id, jenis_kelamin, alamat, no_telp } = req.body;

    // Create user account
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [userResult] = await connection.execute(
      'INSERT INTO users (username, password, nama_lengkap, email, role) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, nama_lengkap, email, 'siswa']
    );

    // Create siswa profile
    const [siswaResult] = await connection.execute(
      'INSERT INTO siswa (user_id, nis, kelas_id, jenis_kelamin, alamat, no_telp) VALUES (?, ?, ?, ?, ?, ?)',
      [userResult.insertId, nis, kelas_id, jenis_kelamin, alamat, no_telp]
    );

    await connection.commit();

    // Notify connected clients
    req.app.get('io').emit('siswaUpdated', { 
      type: 'CREATE', 
      data: {
        id: siswaResult.insertId,
        user_id: userResult.insertId,
        nis,
        kelas_id,
        jenis_kelamin,
        alamat,
        no_telp,
        username,
        nama_lengkap,
        email
      }
    });

    res.status(201).json({
      message: 'Siswa created successfully',
      data: {
        id: siswaResult.insertId,
        user_id: userResult.insertId,
        nis,
        kelas_id,
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

// Update siswa
const updateSiswa = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [siswa] = await connection.execute('SELECT * FROM siswa WHERE id = ?', [req.params.id]);
    if (siswa.length === 0) {
      return res.status(404).json({ message: 'Siswa not found' });
    }

    const { nis, kelas_id, jenis_kelamin, alamat, no_telp, nama_lengkap, email } = req.body;

    // Update siswa profile
    await connection.execute(
      'UPDATE siswa SET nis = ?, kelas_id = ?, jenis_kelamin = ?, alamat = ?, no_telp = ? WHERE id = ?',
      [nis, kelas_id, jenis_kelamin, alamat, no_telp, req.params.id]
    );

    // Update user data
    if (nama_lengkap || email) {
      await connection.execute(
        'UPDATE users SET nama_lengkap = ?, email = ? WHERE id = ?',
        [nama_lengkap, email, siswa[0].user_id]
      );
    }

    await connection.commit();

    // Notify connected clients
    req.app.get('io').emit('siswaUpdated', { 
      type: 'UPDATE', 
      data: {
        id: req.params.id,
        nis,
        kelas_id,
        jenis_kelamin,
        alamat,
        no_telp,
        nama_lengkap,
        email
      }
    });

    res.json({ message: 'Siswa updated successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    connection.release();
  }
};

// Delete siswa
const deleteSiswa = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [siswa] = await connection.execute('SELECT * FROM siswa WHERE id = ?', [req.params.id]);
    if (siswa.length === 0) {
      return res.status(404).json({ message: 'Siswa not found' });
    }

    // Delete user account and siswa profile
    await connection.execute('DELETE FROM users WHERE id = ?', [siswa[0].user_id]);
    await connection.execute('DELETE FROM siswa WHERE id = ?', [req.params.id]);

    await connection.commit();

    // Notify connected clients
    req.app.get('io').emit('siswaUpdated', { 
      type: 'DELETE', 
      data: { id: req.params.id }
    });

    res.json({ message: 'Siswa deleted successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    connection.release();
  }
};

// Tambahkan fungsi ini di siswaController.js

// Get siswa by kelas
const getSiswaByKelas = async (req, res) => {
  try {
    const [siswa] = await pool.execute(`
      SELECT s.*, u.username, u.nama_lengkap, u.email,
             k.nama_kelas, k.jurusan, k.tahun_ajaran
      FROM siswa s
      JOIN users u ON s.user_id = u.id
      JOIN kelas k ON s.kelas_id = k.id
      WHERE s.kelas_id = ?
    `, [req.params.kelasId]);
    
    res.json(siswa);
  } catch (error) {
    console.error('Error in getSiswaByKelas:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Tambahkan getSiswaByKelas ke exports
module.exports = {
  getAllSiswa,
  getSiswaById,
  getSiswaByKelas, // Tambahkan ini
  createSiswa,
  updateSiswa,
  deleteSiswa
};