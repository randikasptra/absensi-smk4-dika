const mysql = require('mysql2/promise');
const pool = require('../config/database');

const jadwalController = {
    // Get all jadwal
    getAll: async (req, res) => {
        try {
            const [jadwal] = await pool.execute(`
                SELECT 
                    j.id, j.hari, j.jam_mulai, j.jam_selesai, 
                    j.mata_pelajaran_id, j.kelas_id,
                    m.nama, m.kode, 
                    k.nama_kelas, k.jurusan, k.tahun_ajaran,
                    u.nama_lengkap as guru_nama
                FROM jadwal j
                LEFT JOIN mata_pelajaran m ON j.mata_pelajaran_id = m.id
                LEFT JOIN guru g ON m.guru_id = g.id
                LEFT JOIN users u ON g.user_id = u.id
                LEFT JOIN kelas k ON j.kelas_id = k.id
                ORDER BY 
                    CASE j.hari
                        WHEN 'Senin' THEN 1
                        WHEN 'Selasa' THEN 2
                        WHEN 'Rabu' THEN 3
                        WHEN 'Kamis' THEN 4
                        WHEN 'Jumat' THEN 5
                        WHEN 'Sabtu' THEN 6
                    END,
                    j.jam_mulai
            `);
            
            res.json(jadwal);
        } catch (error) {
            console.error('Error fetching jadwal:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Get jadwal by ID
    getById: async (req, res) => {
        try {
            const [jadwal] = await pool.execute(`
                SELECT 
                    j.id, j.hari, j.jam_mulai, j.jam_selesai, 
                    j.mata_pelajaran_id, j.kelas_id,
                    m.nama, m.kode, 
                    k.nama_kelas, k.jurusan, k.tahun_ajaran,
                    u.nama_lengkap as guru_nama
                FROM jadwal j
                LEFT JOIN mata_pelajaran m ON j.mata_pelajaran_id = m.id
                LEFT JOIN guru g ON m.guru_id = g.id
                LEFT JOIN users u ON g.user_id = u.id
                LEFT JOIN kelas k ON j.kelas_id = k.id
                WHERE j.id = ?
            `, [req.params.id]);

            if (!jadwal.length) {
                return res.status(404).json({ message: 'Jadwal tidak ditemukan' });
            }
            res.json(jadwal[0]);
        } catch (error) {
            console.error('Error fetching jadwal by ID:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Create new jadwal
    create: async (req, res) => {
        const connection = await pool.getConnection();
        try {
            let { hari, jam_mulai, jam_selesai, mata_pelajaran_id, kelas_id } = req.body;
            
            // Validasi input
            if (!hari || !jam_mulai || !jam_selesai || !mata_pelajaran_id || !kelas_id) {
                return res.status(400).json({ message: 'Semua field harus diisi' });
            }
            
            // Pastikan format hari sesuai dengan ENUM di database
            const validHari = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            if (!validHari.includes(hari)) {
                // Coba konversi format (kapital di awal)
                hari = hari.charAt(0).toUpperCase() + hari.slice(1).toLowerCase();
                if (!validHari.includes(hari)) {
                    return res.status(400).json({ 
                        message: 'Format hari tidak valid. Gunakan: Senin, Selasa, Rabu, Kamis, Jumat, Sabtu' 
                    });
                }
            }
            
            // Pastikan mata_pelajaran_id dan kelas_id adalah integer
            mata_pelajaran_id = parseInt(mata_pelajaran_id, 10);
            kelas_id = parseInt(kelas_id, 10);
            
            if (isNaN(mata_pelajaran_id) || isNaN(kelas_id)) {
                return res.status(400).json({ 
                    message: 'ID mata pelajaran dan kelas harus berupa angka' 
                });
            }
            
            console.log('Creating jadwal with data:', { hari, jam_mulai, jam_selesai, mata_pelajaran_id, kelas_id });
            
            await connection.beginTransaction();
            
            // Create jadwal
            const [result] = await connection.execute(
                'INSERT INTO jadwal (hari, jam_mulai, jam_selesai, mata_pelajaran_id, kelas_id) VALUES (?, ?, ?, ?, ?)',
                [hari, jam_mulai, jam_selesai, mata_pelajaran_id, kelas_id]
            );
            
            // Get created jadwal with related data
            const [jadwal] = await connection.execute(`
                SELECT 
                    j.id, j.hari, j.jam_mulai, j.jam_selesai, 
                    j.mata_pelajaran_id, j.kelas_id,
                    m.nama, m.kode, 
                    k.nama_kelas, k.jurusan, k.tahun_ajaran,
                    u.nama_lengkap as guru_nama
                FROM jadwal j
                LEFT JOIN mata_pelajaran m ON j.mata_pelajaran_id = m.id
                LEFT JOIN guru g ON m.guru_id = g.id
                LEFT JOIN users u ON g.user_id = u.id
                LEFT JOIN kelas k ON j.kelas_id = k.id
                WHERE j.id = ?
            `, [result.insertId]);
            
            await connection.commit();
            
            // Emit real-time update if socket is available
            if (req.app.get('io')) {
                req.app.get('io').emit('newJadwal', jadwal[0]);
            }
            
            res.status(201).json(jadwal[0]);
        } catch (error) {
            await connection.rollback();
            console.error('Error creating jadwal:', error);
            res.status(400).json({ message: error.message });
        } finally {
            connection.release();
        }
    },

    // Update jadwal
    update: async (req, res) => {
        const connection = await pool.getConnection();
        try {
            let { hari, jam_mulai, jam_selesai, mata_pelajaran_id, kelas_id } = req.body;
            const jadwalId = req.params.id;
            
            // Validasi input
            if (!hari || !jam_mulai || !jam_selesai || !mata_pelajaran_id || !kelas_id) {
                return res.status(400).json({ message: 'Semua field harus diisi' });
            }
            
            // Pastikan format hari sesuai dengan ENUM di database
            const validHari = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            if (!validHari.includes(hari)) {
                // Coba konversi format (kapital di awal)
                hari = hari.charAt(0).toUpperCase() + hari.slice(1).toLowerCase();
                if (!validHari.includes(hari)) {
                    return res.status(400).json({ 
                        message: 'Format hari tidak valid. Gunakan: Senin, Selasa, Rabu, Kamis, Jumat, Sabtu' 
                    });
                }
            }
            
            // Pastikan mata_pelajaran_id dan kelas_id adalah integer
            mata_pelajaran_id = parseInt(mata_pelajaran_id, 10);
            kelas_id = parseInt(kelas_id, 10);
            
            if (isNaN(mata_pelajaran_id) || isNaN(kelas_id)) {
                return res.status(400).json({ 
                    message: 'ID mata pelajaran dan kelas harus berupa angka' 
                });
            }
            
            console.log('Updating jadwal with ID:', jadwalId);
            console.log('Data yang diterima:', { hari, jam_mulai, jam_selesai, mata_pelajaran_id, kelas_id });
            
            await connection.beginTransaction();
            
            // Check if jadwal exists
            const [existingJadwal] = await connection.execute(
                'SELECT * FROM jadwal WHERE id = ?',
                [jadwalId]
            );
            
            if (!existingJadwal.length) {
                await connection.rollback();
                return res.status(404).json({ message: 'Jadwal tidak ditemukan' });
            }
            
            // Update jadwal
            await connection.execute(
                'UPDATE jadwal SET hari = ?, jam_mulai = ?, jam_selesai = ?, mata_pelajaran_id = ?, kelas_id = ? WHERE id = ?',
                [hari, jam_mulai, jam_selesai, mata_pelajaran_id, kelas_id, jadwalId]
            );
            
            // Get updated jadwal with related data
            const [jadwal] = await connection.execute(`
                SELECT 
                    j.id, j.hari, j.jam_mulai, j.jam_selesai, 
                    j.mata_pelajaran_id, j.kelas_id,
                    m.nama, m.kode, 
                    k.nama_kelas, k.jurusan, k.tahun_ajaran,
                    u.nama_lengkap as guru_nama
                FROM jadwal j
                LEFT JOIN mata_pelajaran m ON j.mata_pelajaran_id = m.id
                LEFT JOIN guru g ON m.guru_id = g.id
                LEFT JOIN users u ON g.user_id = u.id
                LEFT JOIN kelas k ON j.kelas_id = k.id
                WHERE j.id = ?
            `, [jadwalId]);
            
            await connection.commit();
            
            // Emit real-time update if socket is available
            if (req.app.get('io')) {
                req.app.get('io').emit('updateJadwal', jadwal[0]);
            }
            
            res.json(jadwal[0]);
        } catch (error) {
            await connection.rollback();
            console.error('Error updating jadwal:', error);
            res.status(400).json({ message: error.message });
        } finally {
            connection.release();
        }
    },

    // Delete jadwal
    delete: async (req, res) => {
        const connection = await pool.getConnection();
        try {
            const jadwalId = req.params.id;
            
            console.log('Deleting jadwal with ID:', jadwalId);
            
            await connection.beginTransaction();
            
            // Check if jadwal exists
            const [jadwal] = await connection.execute(
                'SELECT * FROM jadwal WHERE id = ?',
                [jadwalId]
            );
            
            if (!jadwal.length) {
                await connection.rollback();
                return res.status(404).json({ message: 'Jadwal tidak ditemukan' });
            }
            
            // Delete jadwal
            await connection.execute(
                'DELETE FROM jadwal WHERE id = ?',
                [jadwalId]
            );
            
            await connection.commit();
            
            // Emit real-time update if socket is available
            if (req.app.get('io')) {
                req.app.get('io').emit('deleteJadwal', jadwalId);
            }
            
            res.json({ message: 'Jadwal berhasil dihapus', id: jadwalId });
        } catch (error) {
            await connection.rollback();
            console.error('Error deleting jadwal:', error);
            res.status(500).json({ message: error.message });
        } finally {
            connection.release();
        }
    },

    // Get jadwal by kelas
    getByKelas: async (req, res) => {
        try {
            const kelasId = req.params.kelasId;
            
            const [jadwal] = await pool.execute(`
                SELECT 
                    j.id, j.hari, j.jam_mulai, j.jam_selesai, 
                    j.mata_pelajaran_id, j.kelas_id,
                    m.nama, m.kode, 
                    k.nama_kelas, k.jurusan, k.tahun_ajaran,
                    u.nama_lengkap as guru_nama
                FROM jadwal j
                LEFT JOIN mata_pelajaran m ON j.mata_pelajaran_id = m.id
                LEFT JOIN guru g ON m.guru_id = g.id
                LEFT JOIN users u ON g.user_id = u.id
                LEFT JOIN kelas k ON j.kelas_id = k.id
                WHERE j.kelas_id = ?
                ORDER BY 
                    CASE j.hari
                        WHEN 'Senin' THEN 1
                        WHEN 'Selasa' THEN 2
                        WHEN 'Rabu' THEN 3
                        WHEN 'Kamis' THEN 4
                        WHEN 'Jumat' THEN 5
                        WHEN 'Sabtu' THEN 6
                    END,
                    j.jam_mulai
            `, [kelasId]);
            
            res.json(jadwal);
        } catch (error) {
            console.error('Error fetching jadwal by kelas:', error);
            res.status(500).json({ message: error.message });
        }
    },
    
    // Get jadwal by guru
    getByGuru: async (req, res) => {
        try {
            const guruId = req.params.guruId;
            
            // Pertama, dapatkan ID guru dari user_id
            const [guru] = await pool.execute(
                'SELECT id FROM guru WHERE user_id = ?',
                [guruId]
            );
            
            if (!guru.length) {
                return res.status(404).json({ message: 'Guru tidak ditemukan' });
            }
            
            const guruIdFromDb = guru[0].id;
            
            // Kemudian ambil jadwal berdasarkan guru_id dari mata pelajaran
            const [jadwal] = await pool.execute(`
                SELECT 
                    j.id, j.hari, j.jam_mulai, j.jam_selesai, 
                    j.mata_pelajaran_id, j.kelas_id,
                    m.nama, m.kode, 
                    k.nama_kelas, k.jurusan, k.tahun_ajaran,
                    u.nama_lengkap as guru_nama
                FROM jadwal j
                LEFT JOIN mata_pelajaran m ON j.mata_pelajaran_id = m.id
                LEFT JOIN guru g ON m.guru_id = g.id
                LEFT JOIN users u ON g.user_id = u.id
                LEFT JOIN kelas k ON j.kelas_id = k.id
                WHERE m.guru_id = ?
                ORDER BY 
                    CASE j.hari
                        WHEN 'Senin' THEN 1
                        WHEN 'Selasa' THEN 2
                        WHEN 'Rabu' THEN 3
                        WHEN 'Kamis' THEN 4
                        WHEN 'Jumat' THEN 5
                        WHEN 'Sabtu' THEN 6
                    END,
                    j.jam_mulai
            `, [guruIdFromDb]);
            
            res.json(jadwal);
        } catch (error) {
            console.error('Error fetching jadwal by guru:', error);
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = jadwalController;