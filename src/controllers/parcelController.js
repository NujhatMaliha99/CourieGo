const { sql, poolPromise } = require('../config/database');

async function getAllParcels(req, res, next) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT *
      FROM dbo.parcels
      ORDER BY created_at DESC, parcel_id DESC
    `);

    return res.status(200).json({
      message: 'Parcels retrieved successfully.',
      data: result.recordset,
    });
  } catch (error) {
    next(error);
  }
}

async function getParcelById(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Parcel ID must be a positive integer.' });
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input('parcel_id', sql.Int, id)
      .query('SELECT * FROM dbo.parcels WHERE parcel_id = @parcel_id');

    if (!result.recordset.length) {
      return res.status(404).json({ message: 'Parcel not found.' });
    }

    return res.status(200).json({
      message: 'Parcel retrieved successfully.',
      data: result.recordset[0],
    });
  } catch (error) {
    next(error);
  }
}

async function createParcel(req, res, next) {
  try {
    const { sender_id, receiver_id, tracking_id, parcel_type, weight, charge, status } = req.body;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('sender_id', sql.Int, Number(sender_id))
      .input('receiver_id', sql.Int, Number(receiver_id))
      .input('tracking_id', sql.VarChar(50), tracking_id.trim())
      .input('parcel_type', sql.VarChar(50), parcel_type.trim())
      .input('weight', sql.Decimal(10, 2), Number(weight))
      .input('charge', sql.Decimal(10, 2), Number(charge))
      .input('status', sql.VarChar(30), status)
      .query(`
        INSERT INTO dbo.parcels
          (sender_id, receiver_id, tracking_id, parcel_type, weight, charge, status)
        OUTPUT INSERTED.*
        VALUES
          (@sender_id, @receiver_id, @tracking_id, @parcel_type, @weight, @charge, @status)
      `);

    return res.status(201).json({
      message: 'Parcel created successfully.',
      data: result.recordset[0],
    });
  } catch (error) {
    next(error);
  }
}
async function updateParcel(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Parcel ID must be a positive integer.' });
    }

    const { sender_id, receiver_id, tracking_id, parcel_type, weight, charge, status } = req.body;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('parcel_id', sql.Int, id)
      .input('sender_id', sql.Int, Number(sender_id))
      .input('receiver_id', sql.Int, Number(receiver_id))
      .input('tracking_id', sql.VarChar(50), tracking_id.trim())
      .input('parcel_type', sql.VarChar(50), parcel_type.trim())
      .input('weight', sql.Decimal(10, 2), Number(weight))
      .input('charge', sql.Decimal(10, 2), Number(charge))
      .input('status', sql.VarChar(30), status)
      .query(`
        UPDATE dbo.parcels
        SET sender_id = @sender_id,
            receiver_id = @receiver_id,
            tracking_id = @tracking_id,
            parcel_type = @parcel_type,
            weight = @weight,
            charge = @charge,
            status = @status,
            updated_at = SYSDATETIME()
        OUTPUT INSERTED.*
        WHERE parcel_id = @parcel_id
      `);

    if (!result.recordset.length) {
      return res.status(404).json({ message: 'Parcel not found.' });
    }

    return res.status(200).json({
      message: 'Parcel updated successfully.',
      data: result.recordset[0],
    });
  } catch (error) {
    next(error);
  }
}
async function deleteParcel(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: 'Parcel ID must be a positive integer.'
      });
    }

    const pool = await poolPromise;

    const result = await pool.request()
      .input('parcel_id', sql.Int, id)
      .query(`
        DELETE FROM dbo.parcels
        OUTPUT DELETED.*
        WHERE parcel_id = @parcel_id
      `);

    if (!result.recordset.length) {
      return res.status(404).json({
        message: 'Parcel not found.'
      });
    }

    return res.status(200).json({
      message: 'Parcel deleted successfully.',
      data: result.recordset[0],
    });
  } catch (error) {
    next(error);
  }
}
module.exports = { getAllParcels, getParcelById, createParcel, updateParcel, deleteParcel };