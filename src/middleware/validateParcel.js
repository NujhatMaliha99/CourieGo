const ALLOWED_STATUSES = [
  'pending',
  'picked_up',
  'in_transit',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

// Validate the parcel body before it reaches a controller.
function validateParcel(req, res, next) {
  const {
    sender_id,
    receiver_id,
    tracking_id,
    parcel_type,
    weight,
    charge,
    status,
  } = req.body;

  const errors = [];

  if (!Number.isInteger(Number(sender_id)) || Number(sender_id) <= 0) {
    errors.push('sender_id must be a positive integer.');
  }
  if (!Number.isInteger(Number(receiver_id)) || Number(receiver_id) <= 0) {
    errors.push('receiver_id must be a positive integer.');
  }
  if (typeof tracking_id !== 'string' || tracking_id.trim().length < 3) {
    errors.push('tracking_id must be a string with at least 3 characters.');
  }
  if (typeof parcel_type !== 'string' || parcel_type.trim() === '') {
    errors.push('parcel_type is required.');
  }
  if (weight === '' || !Number.isFinite(Number(weight)) || Number(weight) <= 0) {
    errors.push('weight must be a number greater than 0.');
  }
  if (charge === '' || !Number.isFinite(Number(charge)) || Number(charge) < 0) {
    errors.push('charge must be a non-negative number.');
  }
  if (!ALLOWED_STATUSES.includes(status)) {
    errors.push(`status must be one of: ${ALLOWED_STATUSES.join(', ')}.`);
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed.', errors });
  }

  next();
}

module.exports = validateParcel;
