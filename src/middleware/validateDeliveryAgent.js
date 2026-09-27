function validateDeliveryAgent(req, res, next) {
  const {
    full_name, phone, email, address,
    vehicle_number, license_number, availability_status,
  } = req.body;
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
  if (address && typeof address !== 'string') {
    errors.push('address must be a valid string.');
  }
  if (vehicle_number && typeof vehicle_number !== 'string') {
    errors.push('vehicle_number must be a valid string.');
  }
  if (license_number && typeof license_number !== 'string') {
    errors.push('license_number must be a valid string.');
  }
  if (
    availability_status &&
    !['available', 'assigned', 'offline'].includes(availability_status.trim())
  ) {
    errors.push('availability_status must be one of: available, assigned, offline.');
  }

  if (errors.length) {
    return res.status(400).json({ message: 'Validation failed.', errors });
  }

  next();
}

module.exports = validateDeliveryAgent;