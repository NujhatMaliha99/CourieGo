function validateReceiver(req, res, next) {
  const { full_name, phone, email, address } = req.body;
  const errors = [];

  if (typeof full_name !== 'string' || full_name.trim().length < 2) {
    errors.push('full_name must contain at least 2 characters.');
  }
  if (typeof phone !== 'string' || !/^01\d{9}$/.test(phone.trim())) {
    errors.push('phone must be an 11-digit Bangladeshi mobile number.');
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.push('email must be valid.');
  }
  if (typeof address !== 'string' || address.trim().length < 3) {
    errors.push('address must contain at least 3 characters.');
  }

  if (errors.length) {
    return res.status(400).json({ message: 'Validation failed.', errors });
  }

  next();
}

module.exports = validateReceiver;
