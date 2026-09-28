const { sql, poolPromise } = require('../config/database');

async function getAllDeliveryAgents(req, res, next) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT * FROM dbo.delivery_agents ORDER BY agent_id DESC
    `);

    return res.status(200).json({
      message: 'Delivery agents retrieved successfully.',
      data: result.recordset,
    });
  } catch (error) {
    next(error);
  }
}

async function getDeliveryAgentById(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Delivery agent ID must be a positive integer.' });
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input('agent_id', sql.Int, id)
      .query('SELECT * FROM dbo.delivery_agents WHERE agent_id = @agent_id');

    if (!result.recordset.length) {
      return res.status(404).json({ message: 'Delivery agent not found.' });
    }

    return res.status(200).json({
      message: 'Delivery agent retrieved successfully.',
      data: result.recordset[0],
    });
  } catch (error) {
    next(error);
  }
}

async function createDeliveryAgent(req, res, next) {
  try {
    const {
      full_name, phone, email, address,
      vehicle_number, license_number, availability_status,
    } = req.body;

    const pool = await poolPromise;
    const result = await pool.request()
      .input('full_name', sql.VarChar(100), full_name.trim())
      .input('phone', sql.VarChar(20), phone.trim())
      .input('email', sql.VarChar(120), email?.trim() || null)
      .input('address', sql.VarChar(255), address?.trim() || null)
      .input('vehicle_number', sql.VarChar(50), vehicle_number?.trim() || null)
      .input('license_number', sql.VarChar(50), license_number?.trim() || null)
      .input('availability_status', sql.VarChar(30), availability_status?.trim() || 'available')
      .query(`
        DECLARE @Inserted TABLE (
          agent_id INT, full_name VARCHAR(100), phone VARCHAR(20), email VARCHAR(120), address VARCHAR(255),
          vehicle_number VARCHAR(50), license_number VARCHAR(50), availability_status VARCHAR(30), created_at DATETIME2
        );
        INSERT INTO dbo.delivery_agents
          (full_name, phone, email, address, vehicle_number, license_number, availability_status)
        OUTPUT INSERTED.* INTO @Inserted
        VALUES
          (@full_name, @phone, @email, @address, @vehicle_number, @license_number, @availability_status);
        SELECT * FROM @Inserted;
      `);

    return res.status(201).json({
      message: 'Delivery agent created successfully.',
      data: result.recordset[0],
    });
  } catch (error) {
    next(error);
  }
}

async function updateDeliveryAgent(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Delivery agent ID must be a positive integer.' });
    }

    const {
      full_name, phone, email, address,
      vehicle_number, license_number, availability_status,
    } = req.body;

    const pool = await poolPromise;
    const result = await pool.request()
      .input('agent_id', sql.Int, id)
      .input('full_name', sql.VarChar(100), full_name.trim())
      .input('phone', sql.VarChar(20), phone.trim())
      .input('email', sql.VarChar(120), email?.trim() || null)
      .input('address', sql.VarChar(255), address?.trim() || null)
      .input('vehicle_number', sql.VarChar(50), vehicle_number?.trim() || null)
      .input('license_number', sql.VarChar(50), license_number?.trim() || null)
      .input('availability_status', sql.VarChar(30), availability_status?.trim() || 'available')
      .query(`
        DECLARE @Updated TABLE (
          agent_id INT, full_name VARCHAR(100), phone VARCHAR(20), email VARCHAR(120), address VARCHAR(255),
          vehicle_number VARCHAR(50), license_number VARCHAR(50), availability_status VARCHAR(30), created_at DATETIME2
        );
        UPDATE dbo.delivery_agents
        SET full_name = @full_name,
            phone = @phone,
            email = @email,
            address = @address,
            vehicle_number = @vehicle_number,
            license_number = @license_number,
            availability_status = @availability_status
        OUTPUT INSERTED.* INTO @Updated
        WHERE agent_id = @agent_id;
        SELECT * FROM @Updated;
      `);

    if (!result.recordset.length) {
      return res.status(404).json({ message: 'Delivery agent not found.' });
    }

    return res.status(200).json({
      message: 'Delivery agent updated successfully.',
      data: result.recordset[0],
    });
  } catch (error) {
    next(error);
  }
}

async function deleteDeliveryAgent(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: 'Delivery agent ID must be a positive integer.',
      });
    }

    const pool = await poolPromise;

    const result = await pool.request()
      .input('agent_id', sql.Int, id)
      .query(`
        DECLARE @Deleted TABLE (
          agent_id INT, full_name VARCHAR(100), phone VARCHAR(20), email VARCHAR(120), address VARCHAR(255),
          vehicle_number VARCHAR(50), license_number VARCHAR(50), availability_status VARCHAR(30), created_at DATETIME2
        );
        DELETE FROM dbo.delivery_agents
        OUTPUT DELETED.* INTO @Deleted
        WHERE agent_id = @agent_id;
        SELECT * FROM @Deleted;
      `);

    if (!result.recordset.length) {
      return res.status(404).json({
        message: 'Delivery agent not found.',
      });
    }

    return res.status(200).json({
      message: 'Delivery agent deleted successfully.',
      data: result.recordset[0],
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllDeliveryAgents,
  getDeliveryAgentById,
  createDeliveryAgent,
  updateDeliveryAgent,
  deleteDeliveryAgent,
};