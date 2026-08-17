const pool = require('../config/database');

async function getAllParcels(req, res, next) {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM parcels ORDER BY created_at DESC, parcel_id DESC'
    );

    return res.status(200).json({
      message: 'Parcels retrieved successfully.',
      data: rows,
    });
  } catch (error) {
    next(error);
  }
}

async function getParcelById(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT * FROM parcels WHERE parcel_id = ?', [id]);

    if (!rows.length) {
      return res.status(404).json({ message: 'Parcel not found.' });
    }

    return res.status(200).json({
      message: 'Parcel retrieved successfully.',
      data: rows[0],
    });
  } catch (error) {
    next(error);
  }
}

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

module.exports = { getAllParcels, getParcelById, createParcel };
