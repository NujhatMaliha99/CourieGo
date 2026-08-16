const pool = require('../config/database');

const PARCEL_COLUMNS = `
  parcel_id, sender_id, receiver_id, tracking_id,
  parcel_type, weight, charge, status, created_at, updated_at
`;

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
    const [rows] = await pool.execute(
      `SELECT ${PARCEL_COLUMNS} FROM parcels WHERE parcel_id = ?`,
      [result.insertId]
    );

    return res.status(201).json({ message: 'Parcel created successfully.', data: rows[0] });
  } catch (error) {
    next(error);
  }
}

// GET /api/parcels - return all parcels, newest first.
async function getAllParcels(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT ${PARCEL_COLUMNS} FROM parcels ORDER BY parcel_id DESC`
    );
    return res.json({ count: rows.length, data: rows });
  } catch (error) {
    next(error);
  }
}

// GET /api/parcels/:id - return one parcel by primary key.
async function getParcelById(req, res, next) {
  try {
    const [rows] = await pool.execute(
      `SELECT ${PARCEL_COLUMNS} FROM parcels WHERE parcel_id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Parcel not found.' });
    }
    return res.json({ data: rows[0] });
  } catch (error) {
    next(error);
  }
}

// PUT /api/parcels/:id - replace all editable fields of one parcel.
async function updateParcel(req, res, next) {
  try {
    const { sender_id, receiver_id, tracking_id, parcel_type, weight, charge, status } = req.body;
    const sql = `
      UPDATE parcels
      SET sender_id = ?, receiver_id = ?, tracking_id = ?, parcel_type = ?,
          weight = ?, charge = ?, status = ?
      WHERE parcel_id = ?
    `;
    const values = [
      sender_id, receiver_id, tracking_id.trim(), parcel_type.trim(),
      weight, charge, status, req.params.id,
    ];
    const [result] = await pool.execute(sql, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Parcel not found.' });
    }
    const [rows] = await pool.execute(
      `SELECT ${PARCEL_COLUMNS} FROM parcels WHERE parcel_id = ?`,
      [req.params.id]
    );
    return res.json({ message: 'Parcel updated successfully.', data: rows[0] });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/parcels/:id - permanently delete one parcel.
async function deleteParcel(req, res, next) {
  try {
    const [result] = await pool.execute('DELETE FROM parcels WHERE parcel_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Parcel not found.' });
    }
    return res.json({ message: 'Parcel deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

module.exports = { createParcel, getAllParcels, getParcelById, updateParcel, deleteParcel };
