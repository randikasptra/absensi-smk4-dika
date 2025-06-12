const pool = require('../config/database');

// Get all kelas
const getAllKelas = async (req, res) => {
  try {
    const [kelas] = await pool.execute(`
      SELECT k.*, 
             s.id as siswa_id, s.nis,
             u.nama_lengkap as siswa_nama
      FROM kelas k
      LEFT JOIN siswa s ON s.kelas_id = k.id
      LEFT JOIN users u ON s.user_id = u.id
      ORDER BY k.id, s.id
    `);

    // Restructure the data to group siswa by kelas
    const kelasMap = new Map();
    kelas.forEach(row => {
      if (!kelasMap.has(row.id)) {
        kelasMap.set(row.id, {
          id: row.id,
          nama_kelas: row.nama_kelas,
          jurusan: row.jurusan,
          tahun_ajaran: row.tahun_ajaran,
          siswa: []
        });
      }
      if (row.siswa_id) {
        kelasMap.get(row.id).siswa.push({
          id: row.siswa_id,
          nis: row.nis,
          nama_lengkap: row.siswa_nama
        });
      }
    });

    // Tambahkan properti jumlah_siswa ke setiap kelas
    const kelasArray = Array.from(kelasMap.values()).map(kelas => ({
      ...kelas,
      jumlah_siswa: kelas.siswa.length
    }));

    res.json(kelasArray);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get kelas by ID
const getKelasById = async (req, res) => {
  try {
    const [kelas] = await pool.execute(`
      SELECT k.*, 
             s.id as siswa_id, s.nis,
             u.nama_lengkap as siswa_nama
      FROM kelas k
      LEFT JOIN siswa s ON s.kelas_id = k.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE k.id = ?
    `, [req.params.id]);

    if (kelas.length === 0) {
      return res.status(404).json({ message: 'Kelas not found' });
    }

    // Restructure the data
    const result = {
      id: kelas[0].id,
      nama_kelas: kelas[0].nama_kelas,
      jurusan: kelas[0].jurusan,
      tahun_ajaran: kelas[0].tahun_ajaran,
      siswa: kelas.map(row => row.siswa_id ? {
        id: row.siswa_id,
        nis: row.nis,
        nama_lengkap: row.siswa_nama
      } : null).filter(Boolean)
    };

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new kelas
const createKelas = async (req, res) => {
  try {
    const { nama_kelas, jurusan, tahun_ajaran } = req.body;
    
    const [result] = await pool.execute(
      'INSERT INTO kelas (nama_kelas, jurusan, tahun_ajaran) VALUES (?, ?, ?)',
      [nama_kelas, jurusan, tahun_ajaran]
    );

    // Notify connected clients
    req.app.get('io').emit('kelasUpdated', { 
      type: 'CREATE', 
      data: {
        id: result.insertId,
        nama_kelas,
        jurusan,
        tahun_ajaran
      }
    });

    res.status(201).json({
      id: result.insertId,
      nama_kelas,
      jurusan,
      tahun_ajaran
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update kelas
const updateKelas = async (req, res) => {
  try {
    const { nama_kelas, jurusan, tahun_ajaran } = req.body;
    
    const [result] = await pool.execute(
      'UPDATE kelas SET nama_kelas = ?, jurusan = ?, tahun_ajaran = ? WHERE id = ?',
      [nama_kelas, jurusan, tahun_ajaran, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Kelas not found' });
    }

    // Notify connected clients
    req.app.get('io').emit('kelasUpdated', { 
      type: 'UPDATE', 
      data: {
        id: req.params.id,
        nama_kelas,
        jurusan,
        tahun_ajaran
      }
    });

    res.json({ message: 'Kelas updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete kelas
const deleteKelas = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Check if kelas exists and has no associated siswa
    const [siswa] = await connection.execute('SELECT COUNT(*) as count FROM siswa WHERE kelas_id = ?', [req.params.id]);
    if (siswa[0].count > 0) {
      return res.status(400).json({ message: 'Cannot delete kelas with associated siswa' });
    }

    const [result] = await connection.execute('DELETE FROM kelas WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Kelas not found' });
    }

    await connection.commit();

    // Notify connected clients
    req.app.get('io').emit('kelasUpdated', { 
      type: 'DELETE', 
      data: { id: req.params.id }
    });

    res.json({ message: 'Kelas deleted successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    connection.release();
  }
};

module.exports = {
  getAllKelas,
  getKelasById,
  createKelas,
  updateKelas,
  deleteKelas
};