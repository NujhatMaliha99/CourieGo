const { sql, poolPromise } = require('../config/database');

const DELIVERY_AGENT_ROLE_NAME = 'delivery_agent';
const AVAILABILITY_STATUSES = ['available', 'assigned', 'offline'];

async function getOrCreateRoleId(transaction, roleName) {
  const lookup = await new sql.Request(transaction)
    .input('role_name', sql.VarChar(50), roleName)
    .query('SELECT role_id FROM dbo.roles WHERE role_name = @role_name');

  if (lookup.recordset.length) {
    return lookup.recordset[0].role_id;
  }

  const inserted = await new sql.Request(transaction)
    .input('role_name', sql.VarChar(50), roleName)
    .query(`
      INSERT INTO dbo.roles (role_name)
      OUTPUT INSERTED.role_id
      VALUES (@role_name)
    `);

  return inserted.recordset[0].role_id;
}

async function getAllDeliveryAgents(req, res, next) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT
        da.agent_id,
        da.user_id,
        u.full_name,
        u.email,
        u.phone,
        u.address,
        da.vehicle_number,
        da.availability_status
      FROM dbo.delivery_agents da
      JOIN dbo.users u ON u.user_id = da.user_id
      ORDER BY da.agent_id DESC
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
      return res.status(400).json({ message: 'Agent ID must be a positive integer.' });
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input('agent_id', sql.Int, id)
      .query(`
        SELECT
          da.agent_id,
          da.user_id,
          u.full_name,
          u.email,
          u.phone,
          u.address,
          da.vehicle_number,
          da.availability_status
        FROM dbo.delivery_agents da
        JOIN dbo.users u ON u.user_id = da.user_id
        WHERE da.agent_id = @agent_id
      `);

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
  const { full_name, email, phone, address, vehicle_number, availability_status } = req.body;
  const status = availability_status || 'available';

  if (!full_name?.trim() || !email?.trim()) {
    return res.status(400).json({ message: 'full_name and email are required.' });
  }

  if (!AVAILABILITY_STATUSES.includes(status)) {
    return res.status(400).json({
      message: `availability_status must be one of: ${AVAILABILITY_STATUSES.join(', ')}.`,
    });
  }

  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const role_id = await getOrCreateRoleId(transaction, DELIVERY_AGENT_ROLE_NAME);

    const userResult = await new sql.Request(transaction)
      .input('role_id', sql.Int, role_id)
      .input('full_name', sql.VarChar(100), full_name.trim())
      .input('email', sql.VarChar(120), email.trim())
      .input('phone', sql.VarChar(20), phone?.trim() || null)
      .input('address', sql.VarChar(255), address?.trim() || null)
      .query(`
        INSERT INTO dbo.users (role_id, full_name, email, phone, address)
        OUTPUT INSERTED.*
        VALUES (@role_id, @full_name, @email, @phone, @address)
      `);

    const user = userResult.recordset[0];

    const agentResult = await new sql.Request(transaction)
      .input('user_id', sql.Int, user.user_id)
      .input('vehicle_number', sql.VarChar(50), vehicle_number?.trim() || null)
      .input('availability_status', sql.VarChar(30), status)
      .query(`
        INSERT INTO dbo.delivery_agents (user_id, vehicle_number, availability_status)
        OUTPUT INSERTED.*
        VALUES (@user_id, @vehicle_number, @availability_status)
      `);

    await transaction.commit();

    const agent = agentResult.recordset[0];

    return res.status(201).json({
      message: 'Delivery agent created successfully.',
      data: {
        agent_id: agent.agent_id,
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        vehicle_number: agent.vehicle_number,
        availability_status: agent.availability_status,
      },
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}

async function updateDeliveryAgent(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: 'Agent ID must be a positive integer.' });
  }

  const { full_name, email, phone, address, vehicle_number, availability_status } = req.body;
  const status = availability_status || 'available';

  if (!full_name?.trim() || !email?.trim()) {
    return res.status(400).json({ message: 'full_name and email are required.' });
  }

  if (!AVAILABILITY_STATUSES.includes(status)) {
    return res.status(400).json({
      message: `availability_status must be one of: ${AVAILABILITY_STATUSES.join(', ')}.`,
    });
  }

  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const agentLookup = await new sql.Request(transaction)
      .input('agent_id', sql.Int, id)
      .query('SELECT user_id FROM dbo.delivery_agents WHERE agent_id = @agent_id');

    if (!agentLookup.recordset.length) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Delivery agent not found.' });
    }

    const { user_id } = agentLookup.recordset[0];

    const userResult = await new sql.Request(transaction)
      .input('user_id', sql.Int, user_id)
      .input('full_name', sql.VarChar(100), full_name.trim())
      .input('email', sql.VarChar(120), email.trim())
      .input('phone', sql.VarChar(20), phone?.trim() || null)
      .input('address', sql.VarChar(255), address?.trim() || null)
      .query(`
        UPDATE dbo.users
        SET full_name = @full_name,
            email = @email,
            phone = @phone,
            address = @address
        OUTPUT INSERTED.*
        WHERE user_id = @user_id
      `);

    const agentResult = await new sql.Request(transaction)
      .input('agent_id', sql.Int, id)
      .input('vehicle_number', sql.VarChar(50), vehicle_number?.trim() || null)
      .input('availability_status', sql.VarChar(30), status)
      .query(`
        UPDATE dbo.delivery_agents
        SET vehicle_number = @vehicle_number,
            availability_status = @availability_status
        OUTPUT INSERTED.*
        WHERE agent_id = @agent_id
      `);

    await transaction.commit();

    const user = userResult.recordset[0];
    const agent = agentResult.recordset[0];

    return res.status(200).json({
      message: 'Delivery agent updated successfully.',
      data: {
        agent_id: agent.agent_id,
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        vehicle_number: agent.vehicle_number,
        availability_status: agent.availability_status,
      },
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}

async function deleteDeliveryAgent(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Agent ID must be a positive integer.' });
    }

    const pool = await poolPromise;

    const agentLookup = await pool.request()
      .input('agent_id', sql.Int, id)
      .query('SELECT user_id FROM dbo.delivery_agents WHERE agent_id = @agent_id');

    if (!agentLookup.recordset.length) {
      return res.status(404).json({ message: 'Delivery agent not found.' });
    }

    const { user_id } = agentLookup.recordset[0];

    // Deleting the linked user cascades to delivery_agents (ON DELETE CASCADE).
    const result = await pool.request()
      .input('user_id', sql.Int, user_id)
      .query(`
        DELETE FROM dbo.users
        OUTPUT DELETED.*
        WHERE user_id = @user_id
      `);

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