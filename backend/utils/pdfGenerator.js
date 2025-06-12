const PDFDocument = require('pdfkit');
const moment = require('moment');

class PDFGenerator {
    static async generateAbsensiReport(absensiData, stream) {
        const doc = new PDFDocument();
        doc.pipe(stream);

        // Header dengan Logo Sekolah (opsional)
        doc.fontSize(16).text('LAPORAN ABSENSI SISWA', { align: 'center' });
        doc.fontSize(14).text('SMKN 4 TASIKMALAYA', { align: 'center' });
        doc.fontSize(12).text('Jl. Raya Cikunir No.72, Singaparna', { align: 'center' });
        doc.moveDown();

        // Info Detail
        doc.fontSize(12).text(`Kelas: ${absensiData.kelas}`);
        doc.text(`Mata Pelajaran: ${absensiData.mataPelajaran || '-'}`);
        doc.text(`Guru: ${absensiData.namaGuru || '-'}`);
        doc.text(`Periode: ${moment(absensiData.startDate).format('DD/MM/YYYY')} - ${moment(absensiData.endDate).format('DD/MM/YYYY')}`);
        doc.moveDown();

        // Statistik Kehadiran
        doc.text('Statistik Kehadiran:');
        doc.text(`Total Pertemuan: ${absensiData.totalPertemuan || '-'}`);
        doc.text(`Rata-rata Kehadiran: ${absensiData.rataKehadiran || '-'}%`);
        doc.moveDown();

        // Tabel Absensi
        const tableTop = 250;
        const tableLeft = 50;
        const rowHeight = 30;
        const colWidth = 85;

        // Header Tabel
        doc.rect(tableLeft, tableTop, colWidth * 6, rowHeight).stroke();
        let currentLeft = tableLeft;
        ['No', 'NIS', 'Nama', 'Hadir', 'Sakit', 'Izin', 'Alpha'].forEach(header => {
            doc.text(header, currentLeft + 5, tableTop + 10);
            currentLeft += colWidth;
        });

        // Isi Tabel
        let currentTop = tableTop + rowHeight;
        absensiData.siswa.forEach((siswa, index) => {
            currentLeft = tableLeft;
            doc.rect(tableLeft, currentTop, colWidth * 6, rowHeight).stroke();

            // No
            doc.text(index + 1, currentLeft + 5, currentTop + 10);
            currentLeft += colWidth;

            // NIS
            doc.text(siswa.nis, currentLeft + 5, currentTop + 10);
            currentLeft += colWidth;

            // Nama
            doc.text(siswa.nama, currentLeft + 5, currentTop + 10);
            currentLeft += colWidth;

            // Status Kehadiran
            doc.text(String(siswa.hadir || 0), currentLeft + 5, currentTop + 10);
            currentLeft += colWidths[3];

            doc.text(String(siswa.sakit || 0), currentLeft + 5, currentTop + 10);
            currentLeft += colWidths[4];

            doc.text(String(siswa.izin || 0), currentLeft + 5, currentTop + 10);
            currentLeft += colWidths[5];

            doc.text(String(siswa.alpa || 0), currentLeft + 5, currentTop + 10);
            currentLeft += colWidths[6];
            
            // Persentase
            doc.text(`${siswa.persentase || 0}%`, currentLeft + 5, currentTop + 10);
            currentTop += rowHeight;
        });

        // Catatan
        doc.moveDown(2);
        doc.fontSize(10).text('Keterangan:', tableLeft);
        doc.text('H = Hadir', tableLeft + 20);
        doc.text('S = Sakit', tableLeft + 20);
        doc.text('I = Izin', tableLeft + 20);
        doc.text('A = Alpha', tableLeft + 20);

        // Footer dan Tanda Tangan
        doc.moveDown();
        const today = moment().format('DD MMMM YYYY');
        doc.fontSize(10).text(`Tasikmalaya, ${today}`, { align: 'right' });
        doc.moveDown(2);

        // Tanda tangan Wali Kelas dan Guru Mata Pelajaran
        const signatureLeft = doc.page.width - 200;
        const signatureRight = doc.page.width - 400;

        doc.text('Guru Mata Pelajaran', signatureRight);
        doc.moveDown(2);
        doc.text('(___________________)', signatureRight);
        doc.text('NIP.', signatureRight);

        doc.text('Wali Kelas', signatureLeft);
        doc.moveDown(2);
        doc.text('(___________________)', signatureLeft);
        doc.text('NIP.', signatureLeft);

        doc.end();
    }

    // Tambahkan fungsi baru untuk laporan semester
    static async generateSemesterReport(semesterData, stream) {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        doc.pipe(stream);
    
        // Header dengan Logo Sekolah
        // Header dengan Logo Sekolah (opsional)
        doc.fontSize(16).text('LAPORAN ABSENSI SISWA', { align: 'center' });
        doc.fontSize(14).text('SMKN 4 TASIKMALAYA', { align: 'center' });
        doc.fontSize(12).text('Jl. Depok, Kel. Sukamenak, Kec. Purbaratu, Kota Tasikmalaya', { align: 'center' });
        doc.fontSize(10).text('Telp. (0265) 312059 | Website: www.smkn4-tsm.sch.id | Email: info@smkn4-tsm.sch.id', { align: 'center' });
        doc.fontSize(10).text('Kota Tasikmalaya - 46196', { align: 'center' });
        doc.moveDown();
    
        // Info Detail
        doc.fontSize(12).text(`Kelas: ${semesterData.kelas}`);
        doc.text(`Jurusan: ${semesterData.jurusan}`);
        doc.text(`Semester: ${semesterData.semester}`);
        doc.text(`Tahun Ajaran: ${semesterData.tahunAjaran}`);
        
        // Perbaiki penanganan format periode
        let periodeStart, periodeEnd;
        if (typeof semesterData.periode === 'string') {
            // Jika periode adalah string (format: "startDate s/d endDate")
            doc.text(`Periode: ${semesterData.periode}`);
        } else if (semesterData.periode && semesterData.periode.startDate) {
            // Jika periode adalah objek dengan startDate dan endDate
            periodeStart = moment(semesterData.periode.startDate).format('DD/MM/YYYY');
            periodeEnd = moment(semesterData.periode.endDate).format('DD/MM/YYYY');
            doc.text(`Periode: ${periodeStart} - ${periodeEnd}`);
        }
        doc.moveDown();
    
        // Statistik Kehadiran
        doc.text('Statistik Kehadiran:');
        doc.text(`Total Pertemuan: ${semesterData.totalPertemuan || 0}`);
        doc.text(`Rata-rata Kehadiran: ${semesterData.rataKehadiran || 0}%`);
        doc.moveDown();
    
        // Tabel Absensi
        const tableTop = 250;
        const tableLeft = 50;
        const rowHeight = 30;
        const colWidths = [30, 60, 150, 50, 50, 50, 50, 60]; // Sesuaikan lebar kolom
    
        // Header Tabel
        let currentLeft = tableLeft;
        let currentTop = tableTop;
    
        // Gambar header tabel
        doc.rect(tableLeft, currentTop, colWidths.reduce((a, b) => a + b, 0), rowHeight).stroke();
        
        // Isi header tabel
        const headers = ['No', 'NIS', 'Nama', 'Hadir', 'Sakit', 'Izin', 'Alpa', 'Persentase'];
        headers.forEach((header, i) => {
            doc.text(header, currentLeft + 5, currentTop + 10);
            currentLeft += colWidths[i];
        });
    
        // Isi Tabel
        currentTop += rowHeight;
        semesterData.siswa.forEach((siswa, index) => {
            currentLeft = tableLeft;
            
            // Gambar baris tabel
            doc.rect(tableLeft, currentTop, colWidths.reduce((a, b) => a + b, 0), rowHeight).stroke();
            
            // No
            doc.text(index + 1, currentLeft + 5, currentTop + 10);
            currentLeft += colWidths[0];
    
            // NIS
            doc.text(siswa.nis, currentLeft + 5, currentTop + 10);
            currentLeft += colWidths[1];
    
            // Nama
            doc.text(siswa.nama, currentLeft + 5, currentTop + 10);
            currentLeft += colWidths[2];
    
            // Perbaiki penanganan nilai (sekitar baris 174-187)
            doc.text(String(siswa.hadir || 0), currentLeft + 5, currentTop + 10);
            currentLeft += colWidths[3];
    
            doc.text(String(siswa.sakit || 0), currentLeft + 5, currentTop + 10);
            currentLeft += colWidths[4];
    
            doc.text(String(siswa.izin || 0), currentLeft + 5, currentTop + 10);
            currentLeft += colWidths[5];
    
            doc.text(String(siswa.alpa || 0), currentLeft + 5, currentTop + 10);
            currentLeft += colWidths[6];
    
            // Persentase
            doc.text(`${siswa.persentase || 0}%`, currentLeft + 5, currentTop + 10);
    
            currentTop += rowHeight;
            
            // Jika halaman penuh, buat halaman baru
            if (currentTop > doc.page.height - 100) {
                doc.addPage();
                currentTop = 50;
            }
        });
    
        // Catatan
        doc.moveDown(2);
        doc.fontSize(10).text('Keterangan:', tableLeft);
        doc.text('Hadir = Siswa hadir di kelas', tableLeft + 20);
        doc.text('Sakit = Siswa tidak hadir karena sakit', tableLeft + 20);
        doc.text('Izin = Siswa tidak hadir dengan izin', tableLeft + 20);
        doc.text('Alpa = Siswa tidak hadir tanpa keterangan', tableLeft + 20);
    
        // Footer dan Tanda Tangan
        doc.moveDown();
        const today = moment().format('DD MMMM YYYY');
        doc.fontSize(10).text(`Tasikmalaya, ${today}`, { align: 'right' });
        doc.moveDown(2);
    
        // Tanda tangan Wali Kelas dan Kepala Sekolah
        const signatureLeft = doc.page.width - 200;
        const signatureRight = doc.page.width - 400;
    
        doc.text('Wali Kelas', signatureRight);
        doc.moveDown(2);
        doc.text('(___________________)', signatureRight);
        doc.text('NIP.', signatureRight);
    
        doc.text('Kepala Sekolah', signatureLeft);
        doc.moveDown(2);
        doc.text('(___________________)', signatureLeft);
        doc.text('NIP.', signatureLeft);
    
        doc.end();
    }
}

module.exports = PDFGenerator;