const { sql, poolPromise } = require('../config/database');

async function getAllReceivers(req, res, next) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT * FROM dbo.receivers ORDER BY receiver_id DESC
    `);

    return res.status(200).json({
      message: 'Receivers retrieved successfully.',
      data: result.recordset,
    });
  } catch (error) {
    next(error);
  }
}

async function getReceiverById(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Receiver ID must be a positive integer.' });
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input('receiver_id', sql.Int, id)
      .query('SELECT * FROM dbo.receivers WHERE receiver_id = @receiver_id');

    if (!result.recordset.length) {
      return res.status(404).json({ message: 'Receiver not found.' });
    }

    return res.status(200).json({
      message: 'Receiver retrieved successfully.',
      data: result.recordset[0],
    });
  } catch (error) {
    next(error);
  }
}

async function createReceiver(req, res, next) {
  try {
    const { full_name, phone, email, address } = req.body;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('full_name', sql.VarChar(100), full_name.trim())
      .input('phone', sql.VarChar(20), phone.trim())
      .input('email', sql.VarChar(120), email?.trim() || null)
      .input('address', sql.VarChar(255), address.trim())
      .query(`
        INSERT INTO dbo.receivers (full_name, phone, email, address)
        OUTPUT INSERTED.*
        VALUES (@full_name, @phone, @email, @address)
      `);

    return res.status(201).json({
      message: 'Receiver created successfully.',
      data: result.recordset[0],
    });
  } catch (error) {
    next(error);
  }
}

async function updateReceiver(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Receiver ID must be a positive integer.' });
    }

    const { full_name, phone, email, address } = req.body;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('receiver_id', sql.Int, id)
      .input('full_name', sql.VarChar(100), full_name.trim())
      .input('phone', sql.VarChar(20), phone.trim())
      .input('email', sql.VarChar(120), email?.trim() || null)
      .input('address', sql.VarChar(255), address.trim())
      .query(`
        UPDATE dbo.receivers
        SET full_name = @full_name,
            phone = @phone,
            email = @email,
            address = @address
        OUTPUT INSERTED.*
        WHERE receiver_id = @receiver_id
      `);

    if (!result.recordset.length) {
      return res.status(404).json({ message: 'Receiver not found.' });
    }

    return res.status(200).json({
      message: 'Receiver updated successfully.',
      data: result.recordset[0],
    });
  } catch (error) {
    next(error);
  }
}

async function deleteReceiver(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Receiver ID must be a positive integer.' });
    }
    const pool = await poolPromise;
    const result = await pool.request()
      .input('receiver_id', sql.Int, id)
      .query(`
        DELETE FROM dbo.receivers
        OUTPUT DELETED.*
        WHERE receiver_id = @receiver_id
      `);
    if (!result.recordset.length) return res.status(404).json({ message: 'Receiver not found.' });
    return res.status(200).json({ message: 'Receiver deleted successfully.', data: result.recordset[0] });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAllReceivers, getReceiverById, createReceiver, updateReceiver, deleteReceiver };
