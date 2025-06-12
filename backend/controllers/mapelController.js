const mysql = require('mysql2/promise');
const pool = require('../config/database');
// Hapus import socketIO jika tidak digunakan
// const socketIO = require('../socket');

const mapelController = {
    // Get all mapel
    getAll: async (req, res) => {
        try {
            const [mapel] = await pool.execute(`
                SELECT m.*, u.nama_lengkap as guru_nama
                FROM mata_pelajaran m
                LEFT JOIN guru g ON m.guru_id = g.id
                LEFT JOIN users u ON g.user_id = u.id
            `);
            
            res.json(mapel);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Get mapel by ID
    getById: async (req, res) => {
        try {
            const [mapel] = await pool.execute(`
                SELECT m.*, u.nama_lengkap as guru_nama
                FROM mata_pelajaran m
                LEFT JOIN guru g ON m.guru_id = g.id
                LEFT JOIN users u ON g.user_id = u.id
                WHERE m.id = ?
            `, [req.params.id]);

            if (!mapel.length) {
                return res.status(404).json({ message: 'Mata pelajaran tidak ditemukan' });
            }
            res.json(mapel[0]);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Create new mapel
    create: async (req, res) => {
        const connection = await pool.getConnection();
        try {
            const { nama, kode, guruId } = req.body;
            
            await connection.beginTransaction();
            
            // Create mapel
            const [result] = await connection.execute(
                'INSERT INTO mata_pelajaran (nama, kode, guru_id) VALUES (?, ?, ?)',
                [nama, kode, guruId]
            );
            
            // Get created mapel with guru data
            const [mapel] = await connection.execute(`
                SELECT m.*, u.nama_lengkap as guru_nama
                FROM mata_pelajaran m
                LEFT JOIN guru g ON m.guru_id = g.id
                LEFT JOIN users u ON g.user_id = u.id
                WHERE m.id = ?
            `, [result.insertId]);
            
            await connection.commit();
            
            // Emit real-time update - PERBAIKAN DI SINI
            req.app.get('io').emit('newMapel', mapel[0]);
            
            res.status(201).json(mapel[0]);
        } catch (error) {
            await connection.rollback();
            res.status(400).json({ message: error.message });
        } finally {
            connection.release();
        }
    },

    // Update mapel
    update: async (req, res) => {
        const connection = await pool.getConnection();
        try {
            const { nama, kode, guruId } = req.body;
            
            await connection.beginTransaction();
            
            // Check if mapel exists
            const [existingMapel] = await connection.execute(
                'SELECT * FROM mata_pelajaran WHERE id = ?',
                [req.params.id]
            );
            
            if (!existingMapel.length) {
                await connection.rollback();
                return res.status(404).json({ message: 'Mata pelajaran tidak ditemukan' });
            }
            
            // Update mapel
            await connection.execute(
                'UPDATE mata_pelajaran SET nama = ?, kode = ?, guru_id = ? WHERE id = ?',
                [nama, kode, guruId, req.params.id]
            );
            
            // Get updated mapel with guru data
            const [mapel] = await connection.execute(`
                SELECT m.*, u.nama_lengkap as guru_nama
                FROM mata_pelajaran m
                LEFT JOIN guru g ON m.guru_id = g.id
                LEFT JOIN users u ON g.user_id = u.id
                WHERE m.id = ?
            `, [req.params.id]);
            
            await connection.commit();
            
            // Emit real-time update - PERBAIKAN DI SINI
            req.app.get('io').emit('updateMapel', mapel[0]);
            
            res.json(mapel[0]);
        } catch (error) {
            await connection.rollback();
            res.status(400).json({ message: error.message });
        } finally {
            connection.release();
        }
    },

    // Delete mapel
    delete: async (req, res) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            
            // Check if mapel exists
            const [mapel] = await connection.execute(
                'SELECT * FROM mata_pelajaran WHERE id = ?',
                [req.params.id]
            );
            
            if (!mapel.length) {
                await connection.rollback();
                return res.status(404).json({ message: 'Mata pelajaran tidak ditemukan' });
            }
            
            // Delete mapel
            await connection.execute(
                'DELETE FROM mata_pelajaran WHERE id = ?',
                [req.params.id]
            );
            
            await connection.commit();
            
            // Emit real-time update - PERBAIKAN DI SINI
            req.app.get('io').emit('deleteMapel', req.params.id);
            
            res.json({ message: 'Mata pelajaran berhasil dihapus' });
        } catch (error) {
            await connection.rollback();
            res.status(500).json({ message: error.message });
        } finally {
            connection.release();
        }
    },
    
    // Tambahkan fungsi baru untuk mendapatkan mata pelajaran berdasarkan guru
    getByGuru: async (req, res) => {
        try {
            const { guruId } = req.params;
            
            const [mapel] = await pool.execute(`
                SELECT m.*, u.nama_lengkap as guru_nama
                FROM mata_pelajaran m
                LEFT JOIN guru g ON m.guru_id = g.id
                LEFT JOIN users u ON g.user_id = u.id
                WHERE m.guru_id = ?
            `, [guruId]);
            
            res.json(mapel);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = mapelController;