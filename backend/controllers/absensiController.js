const mysql = require('mysql2/promise');
const PDFGenerator = require('../utils/pdfGenerator');
const pool = require('../config/database');
const socketIO = require('../socket');

// Helper function untuk validasi status kehadiran
function validateStatus(status) {
  const validStatuses = ['hadir', 'sakit', 'izin', 'alpa'];
  return validStatuses.includes(status);
}

// Helper function untuk menghitung persentase kehadiran
function calculateAttendancePercentage(totalHadir, totalPertemuan) {
  return totalPertemuan > 0 ? ((totalHadir / totalPertemuan) * 100).toFixed(2) : '0.00';
}

// Helper function untuk update rekap absensi
async function updateRekapAbsensi(connection, absensiId) {
  try {
    // 1. Dapatkan informasi absensi
    const [absensiInfo] = await connection.execute(`
      SELECT a.id, a.tanggal, a.jadwal_id, j.kelas_id, j.mata_pelajaran_id, mp.guru_id
      FROM absensi a
      JOIN jadwal j ON a.jadwal_id = j.id
      JOIN mata_pelajaran mp ON j.mata_pelajaran_id = mp.id
      WHERE a.id = ?
    `, [absensiId]);

    if (!absensiInfo.length) {
      throw new Error('Data absensi tidak ditemukan');
    }

    const { tanggal, jadwal_id, kelas_id, mata_pelajaran_id, guru_id } = absensiInfo[0];

    // 2. Hitung status kehadiran
    const [statusCount] = await connection.execute(`
      SELECT 
        COUNT(da.id) as total_siswa,
        SUM(CASE WHEN da.status = 'hadir' THEN 1 ELSE 0 END) as total_hadir,
        SUM(CASE WHEN da.status = 'sakit' THEN 1 ELSE 0 END) as total_sakit,
        SUM(CASE WHEN da.status = 'izin' THEN 1 ELSE 0 END) as total_izin,
        SUM(CASE WHEN da.status = 'alpa' THEN 1 ELSE 0 END) as total_alpa
      FROM detail_absensi da
      WHERE da.absensi_id = ?
    `, [absensiId]);

    if (!statusCount.length) {
      throw new Error('Detail absensi tidak ditemukan');
    }

    const { total_siswa, total_hadir, total_sakit, total_izin, total_alpa } = statusCount[0];
    const persentase_kehadiran = calculateAttendancePercentage(total_hadir, total_siswa);

    // 3. Update atau insert rekap
    const [existingRekap] = await connection.execute(`
      SELECT id FROM rekap_absensi 
      WHERE tanggal = ? AND jadwal_id = ?
    `, [tanggal, jadwal_id]);

    if (existingRekap.length > 0) {
      await connection.execute(`
        UPDATE rekap_absensi SET 
          total_siswa = ?, 
          total_hadir = ?, 
          total_sakit = ?, 
          total_izin = ?, 
          total_alpa = ?,
          persentase_kehadiran = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [total_siswa, total_hadir, total_sakit, total_izin, total_alpa,
        persentase_kehadiran, existingRekap[0].id]);
    } else {
      await connection.execute(`
        INSERT INTO rekap_absensi (
          tanggal, jadwal_id, kelas_id, mata_pelajaran_id, guru_id,
          total_siswa, total_hadir, total_sakit, total_izin, total_alpa,
          persentase_kehadiran, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [tanggal, jadwal_id, kelas_id, mata_pelajaran_id, guru_id,
        total_siswa, total_hadir, total_sakit, total_izin, total_alpa,
        persentase_kehadiran]);
    }

    return true;
  } catch (error) {
    console.error('Gagal update rekap absensi:', error);
    throw error;
  }
}

// Controller untuk membuat absensi baru
const createAbsensi = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { jadwalId, tanggal, detail_absensi } = req.body;

    // Validasi input
    if (!jadwalId || !tanggal || !Array.isArray(detail_absensi)) {
      throw new Error('Data input tidak valid');
    }

    // Validasi setiap detail absensi
    for (const detail of detail_absensi) {
      if (!detail.siswa_id || !validateStatus(detail.status)) {
        throw new Error(`Data absensi tidak valid untuk siswa ${detail.siswa_id}`);
      }
    }

    await connection.beginTransaction();

    // Cek absensi yang sudah ada
    const [existingAbsensi] = await connection.execute(
      'SELECT id FROM absensi WHERE jadwal_id = ? AND tanggal = ?',
      [jadwalId, tanggal]
    );

    let absensiId;

    if (existingAbsensi.length > 0) {
      absensiId = existingAbsensi[0].id;
      // Hapus detail absensi lama
      await connection.execute(
        'DELETE FROM detail_absensi WHERE absensi_id = ?',
        [absensiId]
      );
    } else {
      // Buat absensi baru
      const [result] = await connection.execute(
        'INSERT INTO absensi (jadwal_id, tanggal, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
        [jadwalId, tanggal]
      );
      absensiId = result.insertId;
    }

    // Simpan detail absensi
    for (const detail of detail_absensi) {
      await connection.execute(
        'INSERT INTO detail_absensi (absensi_id, siswa_id, status, keterangan, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [absensiId, detail.siswa_id, detail.status, detail.keterangan || null]
      );
    }

    // Update rekap absensi
    await updateRekapAbsensi(connection, absensiId);

    await connection.commit();

    // Kirim notifikasi real-time
    const io = socketIO.getIO();
    if (io) {
      const [jadwalInfo] = await connection.execute(
        'SELECT kelas_id FROM jadwal WHERE id = ?',
        [jadwalId]
      );

      if (jadwalInfo.length > 0) {
        io.to(`kelas-${jadwalInfo[0].kelas_id}`).emit('absensi-update', {
          tanggal,
          kelasId: jadwalInfo[0].kelas_id
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Absensi berhasil disimpan',
      absensiId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Gagal menyimpan absensi:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Gagal menyimpan absensi'
    });
  } finally {
    connection.release();
  }
};

// Controller untuk update detail absensi
const updateDetailAbsensi = async (req, res) => {
  const { detail_absensiId } = req.params;
  const { status, keterangan } = req.body;

  let connection;
  try {
    // Validasi input
    if (!status || !validateStatus(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status tidak valid. Harus: hadir, sakit, izin, atau alpa'
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Update detail absensi
    const [result] = await connection.execute(
      'UPDATE detail_absensi SET status = ?, keterangan = ?, updated_at = NOW() WHERE id = ?',
      [status, keterangan || null, detail_absensiId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Detail absensi tidak ditemukan');
    }

    // Dapatkan absensi_id untuk update rekap
    const [detailResult] = await connection.execute(
      'SELECT absensi_id FROM detail_absensi WHERE id = ?',
      [detail_absensiId]
    );

    if (detailResult.length > 0) {
      // Update rekap absensi
      await updateRekapAbsensi(connection, detailResult[0].absensi_id);

      // Kirim notifikasi real-time
      const io = socketIO.getIO();
      if (io) {
        io.emit('absensiUpdated', {
          absensiId: detailResult[0].absensi_id
        });
      }
    }

    await connection.commit();

    res.status(200).json({
      success: true,
      message: 'Detail absensi berhasil diperbarui'
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Gagal memperbarui detail absensi:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Gagal memperbarui detail absensi'
    });
  } finally {
    if (connection) connection.release();
  }
};

// Controller untuk mendapatkan rekap absensi
const getRekapAbsensi = async (req, res) => {
  try {
    const { startDate, endDate, kelasId, mapelId } = req.query;

    let whereClause = '';
    let params = [];

    if (startDate && endDate) {
      whereClause += 'WHERE ra.tanggal BETWEEN ? AND ?';
      params.push(startDate, endDate);

      if (kelasId) {
        whereClause += ' AND ra.kelas_id = ?';
        params.push(kelasId);
      }

      if (mapelId) {
        whereClause += ' AND ra.mata_pelajaran_id = ?';
        params.push(mapelId);
      }
    } else if (kelasId) {
      whereClause += 'WHERE ra.kelas_id = ?';
      params.push(kelasId);

      if (mapelId) {
        whereClause += ' AND ra.mata_pelajaran_id = ?';
        params.push(mapelId);
      }
    } else if (mapelId) {
      whereClause += 'WHERE ra.mata_pelajaran_id = ?';
      params.push(mapelId);
    }

    const [rekapData] = await pool.execute(
      `SELECT 
        ra.id, ra.tanggal, ra.total_siswa, ra.total_hadir, 
        ra.total_sakit, ra.total_izin, ra.total_alpa, 
        ra.persentase_kehadiran,
        k.nama_kelas, k.jurusan,
        mp.nama as mapel_nama, mp.kode as mapel_kode,
        g.nip, u.nama_lengkap as guru_nama,
        j.hari, j.jam_mulai, j.jam_selesai
      FROM rekap_absensi ra
      JOIN kelas k ON ra.kelas_id = k.id
      JOIN mata_pelajaran mp ON ra.mata_pelajaran_id = mp.id
      JOIN guru g ON ra.guru_id = g.id
      JOIN users u ON g.user_id = u.id
      JOIN jadwal j ON ra.jadwal_id = j.id
      ${whereClause}
      ORDER BY ra.tanggal DESC, j.jam_mulai ASC`,
      params
    );

    res.json({
      success: true,
      data: rekapData
    });
  } catch (error) {
    console.error('Gagal mendapatkan rekap absensi:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Gagal mendapatkan rekap absensi'
    });
  }
};

const generateLaporan = async (req, res) => {
  try {
    const { startDate, endDate, kelasId, mapelId } = req.body;

    // Ambil data rekap dari database (bisa reuse logic getRekapAbsensi)
    let whereClause = '';
    let params = [];

    if (startDate && endDate) {
      whereClause += 'WHERE ra.tanggal BETWEEN ? AND ?';
      params.push(startDate, endDate);

      if (kelasId) {
        whereClause += ' AND ra.kelas_id = ?';
        params.push(kelasId);
      }

      if (mapelId) {
        whereClause += ' AND ra.mata_pelajaran_id = ?';
        params.push(mapelId);
      }
    }

    const [rekapData] = await pool.execute(
      `SELECT 
        ra.tanggal, k.nama_kelas, mp.nama AS mapel,
        ra.total_siswa, ra.total_hadir, ra.total_sakit, 
        ra.total_izin, ra.total_alpa, ra.persentase_kehadiran
      FROM rekap_absensi ra
      JOIN kelas k ON ra.kelas_id = k.id
      JOIN mata_pelajaran mp ON ra.mata_pelajaran_id = mp.id
      ${whereClause}
      ORDER BY ra.tanggal ASC`,
      params
    );

    if (rekapData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tidak ada data rekap untuk dicetak.'
      });
    }

    // Generate PDF pakai helper
    const pdfBuffer = await PDFGenerator.generateRekapAbsensiPDF(rekapData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=laporan_absensi.pdf');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Gagal generate laporan absensi:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Gagal generate laporan absensi'
    });
  }
};

const getById = async (req, res) => {
  const { id } = req.params;
  try {
    const [data] = await pool.execute(
      `SELECT * FROM absensi WHERE id = ?`,
      [id]
    );

    if (data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Absensi tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: data[0]
    });
  } catch (error) {
    console.error('Gagal mengambil data absensi:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data absensi'
    });
  }
};


// ... (kode sebelumnya tetap sama)

module.exports = {
  create: createAbsensi,
  updateDetail: updateDetailAbsensi,
  getRekap: getRekapAbsensi,
  updateRekap: updateRekapAbsensi,
  generateLaporan,
  getById
};