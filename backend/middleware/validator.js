const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Validasi gagal',
        details: error.details.map((detail) => detail.message),
      });
    }

    next();
  };
};

module.exports = { validate }; // ← WAJIB seperti ini!
