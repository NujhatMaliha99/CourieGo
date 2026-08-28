const { sql, poolPromise } = require('../config/database');

async function getAllSenders(req, res, next) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT u.user_id, u.full_name, u.email, u.phone, u.address
      FROM dbo.users AS u
      INNER JOIN dbo.roles AS r ON u.role_id = r.role_id
      WHERE r.role_name = 'customer'
      ORDER BY u.user_id DESC
    `);

    return res.status(200).json({
      message: 'Senders retrieved successfully.',
      data: result.recordset,
    });
  } catch (error) {
    next(error);
  }
}

async function createSender(req, res, next) {
  try {
    const { full_name, email, phone, address } = req.body;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('full_name', sql.VarChar(100), full_name.trim())
      .input('email', sql.VarChar(120), email.trim())
      .input('phone', sql.VarChar(20), phone?.trim() || null)
      .input('address', sql.VarChar(255), address?.trim() || null)
      .query(`
        INSERT INTO dbo.users (role_id, full_name, email, phone, address)
        OUTPUT INSERTED.user_id, INSERTED.full_name, INSERTED.email,
               INSERTED.phone, INSERTED.address
        SELECT role_id, @full_name, @email, @phone, @address
        FROM dbo.roles
        WHERE role_name = 'customer'
      `);

    if (!result.recordset.length) {
      return res.status(500).json({ message: 'Customer role does not exist.' });
    }

    return res.status(201).json({
      message: 'Sender created successfully.',
      data: result.recordset[0],
    });
  } catch (error) {
    next(error);
  }
}

async function getSenderById(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Sender ID must be a positive integer.' });
    }
    const pool = await poolPromise;
    const result = await pool.request()
      .input('user_id', sql.Int, id)
      .query(`
        SELECT u.user_id, u.full_name, u.email, u.phone, u.address
        FROM dbo.users AS u
        INNER JOIN dbo.roles AS r ON u.role_id = r.role_id
        WHERE u.user_id = @user_id AND r.role_name = 'customer'
      `);
    if (!result.recordset.length) return res.status(404).json({ message: 'Sender not found.' });
    return res.status(200).json({ message: 'Sender retrieved successfully.', data: result.recordset[0] });
  } catch (error) {
    next(error);
  }
}

async function updateSender(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Sender ID must be a positive integer.' });
    }
    const { full_name, email, phone, address } = req.body;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('user_id', sql.Int, id)
      .input('full_name', sql.VarChar(100), full_name.trim())
      .input('email', sql.VarChar(120), email.trim())
      .input('phone', sql.VarChar(20), phone?.trim() || null)
      .input('address', sql.VarChar(255), address?.trim() || null)
      .query(`
        UPDATE u
        SET full_name = @full_name, email = @email, phone = @phone, address = @address
        OUTPUT INSERTED.user_id, INSERTED.full_name, INSERTED.email,
               INSERTED.phone, INSERTED.address
        FROM dbo.users AS u
        INNER JOIN dbo.roles AS r ON u.role_id = r.role_id
        WHERE u.user_id = @user_id AND r.role_name = 'customer'
      `);
    if (!result.recordset.length) return res.status(404).json({ message: 'Sender not found.' });
    return res.status(200).json({ message: 'Sender updated successfully.', data: result.recordset[0] });
  } catch (error) {
    next(error);
  }
}

async function deleteSender(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: 'Sender ID must be a positive integer.',
      });
    }

    const pool = await poolPromise;

    const result = await pool.request()
      .input('user_id', sql.Int, id)
      .query(`
        DELETE u
        OUTPUT DELETED.user_id, DELETED.full_name, DELETED.email,
               DELETED.phone, DELETED.address
        FROM dbo.users AS u
        INNER JOIN dbo.roles AS r ON u.role_id = r.role_id
        WHERE u.user_id = @user_id
          AND r.role_name = 'customer'
      `);

    if (!result.recordset.length) {
      return res.status(404).json({
        message: 'Sender not found.',
      });
    }

    return res.status(200).json({
      message: 'Sender deleted successfully.',
      data: result.recordset[0],
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllSenders,
  getSenderById,
  createSender,
  updateSender,
  deleteSender,
};