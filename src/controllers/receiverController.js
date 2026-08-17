const pool = require('../config/database');

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

module.exports = { createReceiver };
