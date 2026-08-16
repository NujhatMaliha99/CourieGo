const pool = require('../config/database');

// POST /api/parcels - create one parcel.
async function createParcel(req, res, next) {
  try {
    const { sender_id, receiver_id, tracking_id, parcel_type, weight, charge, status } = req.body;
    const sql = `
      INSERT INTO parcels
        (sender_id, receiver_id, tracking_id, parcel_type, weight, charge, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [sender_id, receiver_id, tracking_id.trim(), parcel_type.trim(), weight, charge, status];
    const [result] = await pool.execute(sql, values);

    return res.status(201).json({
      message: 'Parcel created successfully.',
      data: { parcel_id: result.insertId, ...req.body },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { createParcel };
