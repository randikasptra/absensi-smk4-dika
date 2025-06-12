const Joi = require('joi');

const createAbsensiSchema = Joi.object({
  tanggal: Joi.date().required(),
  kelas: Joi.string().required(),
  siswa: Joi.array().items(
    Joi.object({
      id_siswa: Joi.number().required(),
      status: Joi.string().valid('hadir', 'izin', 'sakit', 'alpa').required()
    })
  ).required()
});

const updateDetailSchema = Joi.object({
  status: Joi.string().valid('hadir', 'izin', 'sakit', 'alpa').required()
});

const getRekapSchema = Joi.object({
  tanggal_mulai: Joi.date().required(),
  tanggal_selesai: Joi.date().required(),
  kelas: Joi.string().required()
});

const generateReportSchema = Joi.object({
  tanggal_mulai: Joi.date().required(),
  tanggal_selesai: Joi.date().required(),
  kelas: Joi.string().required()
});

module.exports = {
  createAbsensiSchema,
  updateDetailSchema,
  getRekapSchema,
  generateReportSchema
};
