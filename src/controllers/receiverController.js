const pool = require('../config/database');

async function getAllReceivers(req, res, next) {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM receivers ORDER BY receiver_id DESC'
    );

    return res.status(200).json({
      message: 'Receivers retrieved successfully.',
      data: rows,
    });
  } catch (error) {
    next(error);
  }
}

async function getReceiverById(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(
      'SELECT * FROM receivers WHERE receiver_id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Receiver not found.' });
    }

    return res.status(200).json({
      message: 'Receiver retrieved successfully.',
      data: rows[0],
    });
  } catch (error) {
    next(error);
  }
}

async function createReceiver(req, res, next) {
  try {
    const { full_name, phone, email, address } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO receivers (full_name, phone, email, address) VALUES (?, ?, ?, ?)',
      [full_name.trim(), phone.trim(), email?.trim() || null, address.trim()]
    );

    return res.status(201).json({
      message: 'Receiver created successfully.',
      data: {
        receiver_id: result.insertId,
        full_name: full_name.trim(),
        phone: phone.trim(),
        email: email?.trim() || null,
        address: address.trim(),
      },
    });
  } catch (error) {
    next(error);
  }
}
async function updateReceiver(req, res, next) {
  try {
    const { id } = req.params;
    const { full_name, phone, email, address } = req.body;

    const [existing] = await pool.execute(
      'SELECT * FROM receivers WHERE receiver_id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Receiver not found.' });
    }

    await pool.execute(
      `UPDATE receivers
       SET full_name = ?, phone = ?, email = ?, address = ?
       WHERE receiver_id = ?`,
      [full_name.trim(), phone.trim(), email?.trim() || null, address.trim(), id]
    );

    const [updatedRows] = await pool.execute(
      'SELECT * FROM receivers WHERE receiver_id = ?',
      [id]
    );

    return res.status(200).json({
      message: 'Receiver updated successfully.',
      data: updatedRows[0],
    });
  } catch (error) {
    next(error);
  }
}


module.exports = { getAllReceivers, getReceiverById, createReceiver, updateReceiver };
