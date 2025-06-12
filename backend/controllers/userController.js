const pool = require('../config/database');

const userController = {
    getAll: async (req, res) => {
        try {
            const [users] = await pool.execute('SELECT * FROM users');
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getById: async (req, res) => {
        try {
            const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [req.params.id]);
            if (users.length === 0) {
                return res.status(404).json({ message: 'User tidak ditemukan' });
            }
            res.json(users[0]);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const { username, nama_lengkap, email, role } = req.body;
            const [result] = await pool.execute(
                'UPDATE users SET username = ?, nama_lengkap = ?, email = ?, role = ? WHERE id = ?',
                [username, nama_lengkap, email, role, req.params.id]
            );
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'User tidak ditemukan' });
            }

            // Notify connected clients about the update
            req.app.get('io').emit('userUpdated', { 
                type: 'UPDATE', 
                data: { id: req.params.id, username, nama_lengkap, email, role }
            });

            res.json({ id: req.params.id, username, nama_lengkap, email, role });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'User tidak ditemukan' });
            }

            // Notify connected clients about the deletion
            req.app.get('io').emit('userUpdated', { 
                type: 'DELETE', 
                data: { id: req.params.id }
            });

            res.json({ message: 'User berhasil dihapus' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    
    // Tambahkan fungsi getGuruByUserId ke dalam objek userController
    getGuruByUserId: async (req, res) => {
      try {
        const [guru] = await pool.execute(`
          SELECT g.*, u.username, u.nama_lengkap, u.email 
          FROM guru g 
          JOIN users u ON g.user_id = u.id 
          WHERE g.user_id = ?
        `, [req.params.userId]);

        if (guru.length === 0) {
          return res.status(404).json({ message: 'Guru not found' });
        }
        res.json(guru[0]);
      } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
      }
    },

    // Tambahkan fungsi getSiswaByUserId ke dalam objek userController
    getSiswaByUserId: async (req, res) => {
      try {
        const [siswa] = await pool.execute(`
          SELECT s.*, u.username, u.nama_lengkap, u.email,
                 k.nama_kelas, k.jurusan, k.tahun_ajaran
          FROM siswa s
          JOIN users u ON s.user_id = u.id
          JOIN kelas k ON s.kelas_id = k.id
          WHERE s.user_id = ?
        `, [req.params.userId]);

        if (siswa.length === 0) {
          return res.status(404).json({ message: 'Siswa not found' });
        }
        res.json(siswa[0]);
      } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
      }
    }
};

module.exports = userController;