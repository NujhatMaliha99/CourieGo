const { poolPromise } = require('../config/database');

// Query 1: 100% Pure Senders (Customers who are neither Receivers nor Delivery Agents)
async function getPureSenders(req, res, next) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT u.full_name, u.phone, u.email 
      FROM dbo.users u
      INNER JOIN dbo.roles r ON u.role_id = r.role_id
      WHERE r.role_name = 'customer' AND u.phone IS NOT NULL

      EXCEPT

      SELECT full_name, phone, email FROM dbo.receivers WHERE phone IS NOT NULL

      EXCEPT

      SELECT full_name, phone, email FROM dbo.delivery_agents WHERE phone IS NOT NULL;
    `);
    res.json({ data: result.recordset });
  } catch (error) {
    next(error);
  }
}

// Query 2: Inactive Registered Customers (Users who registered as customers but never sent a parcel)
async function getInactiveCustomers(req, res, next) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT u.full_name, u.email, u.phone
      FROM dbo.users u
      INNER JOIN dbo.roles r ON u.role_id = r.role_id
      WHERE r.role_name = 'customer'

      EXCEPT

      SELECT u.full_name, u.email, u.phone
      FROM dbo.users u
      INNER JOIN dbo.parcels p ON u.user_id = p.sender_id;
    `);
    res.json({ data: result.recordset });
  } catch (error) {
    next(error);
  }
}

// Query 3: Idle Delivery Agents (Agents who currently have no parcel assignments)
async function getIdleAgents(req, res, next) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT da.full_name, da.phone, da.availability_status
      FROM dbo.delivery_agents da

      EXCEPT

      SELECT da.full_name, da.phone, da.availability_status
      FROM dbo.delivery_agents da
      INNER JOIN dbo.assignments a ON da.agent_id = a.agent_id;
    `);
    res.json({ data: result.recordset });
  } catch (error) {
    next(error);
  }
}

// Query 4: Unregistered Receivers (Parcel receivers who do not have a registered user account)
async function getUnregisteredReceivers(req, res, next) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT r.full_name, r.phone, r.address
      FROM dbo.receivers r
      WHERE r.phone IS NOT NULL

      EXCEPT

      SELECT u.full_name, u.phone, u.address
      FROM dbo.users u
      WHERE u.phone IS NOT NULL;
    `);
    res.json({ data: result.recordset });
  } catch (error) {
    next(error);
  }
}

// Query 5: Pure Senders vs Receivers (Customers who sent parcels but have never received any parcel)
async function getSendersNeverReceived(req, res, next) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT u.full_name, u.phone, u.email
      FROM dbo.users u
      INNER JOIN dbo.parcels p ON u.user_id = p.sender_id
      WHERE u.phone IS NOT NULL

      EXCEPT

      SELECT r.full_name, r.phone, r.email
      FROM dbo.receivers r
      WHERE r.phone IS NOT NULL;
    `);
    res.json({ data: result.recordset });
  } catch (error) {
    next(error);
  }
}

// All-in-one endpoint to fetch all 5 EXCEPT query results at once
async function getAllExceptQueries(req, res, next) {
  try {
    const pool = await poolPromise;

    const [q1, q2, q3, q4, q5] = await Promise.all([
      pool.request().query(`
        SELECT u.full_name, u.phone, u.email 
        FROM dbo.users u
        INNER JOIN dbo.roles r ON u.role_id = r.role_id
        WHERE r.role_name = 'customer' AND u.phone IS NOT NULL
        EXCEPT
        SELECT full_name, phone, email FROM dbo.receivers WHERE phone IS NOT NULL
        EXCEPT
        SELECT full_name, phone, email FROM dbo.delivery_agents WHERE phone IS NOT NULL;
      `),
      pool.request().query(`
        SELECT u.full_name, u.email, u.phone
        FROM dbo.users u
        INNER JOIN dbo.roles r ON u.role_id = r.role_id
        WHERE r.role_name = 'customer'
        EXCEPT
        SELECT u.full_name, u.email, u.phone
        FROM dbo.users u
        INNER JOIN dbo.parcels p ON u.user_id = p.sender_id;
      `),
      pool.request().query(`
        SELECT da.full_name, da.phone, da.availability_status
        FROM dbo.delivery_agents da
        EXCEPT
        SELECT da.full_name, da.phone, da.availability_status
        FROM dbo.delivery_agents da
        INNER JOIN dbo.assignments a ON da.agent_id = a.agent_id;
      `),
      pool.request().query(`
        SELECT r.full_name, r.phone, r.address
        FROM dbo.receivers r
        WHERE r.phone IS NOT NULL
        EXCEPT
        SELECT u.full_name, u.phone, u.address
        FROM dbo.users u
        WHERE u.phone IS NOT NULL;
      `),
      pool.request().query(`
        SELECT u.full_name, u.phone, u.email
        FROM dbo.users u
        INNER JOIN dbo.parcels p ON u.user_id = p.sender_id
        WHERE u.phone IS NOT NULL
        EXCEPT
        SELECT r.full_name, r.phone, r.email
        FROM dbo.receivers r
        WHERE r.phone IS NOT NULL;
      `),
    ]);

    res.json({
      pureSenders: q1.recordset,
      inactiveCustomers: q2.recordset,
      idleAgents: q3.recordset,
      unregisteredReceivers: q4.recordset,
      sendersNeverReceived: q5.recordset,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPureSenders,
  getInactiveCustomers,
  getIdleAgents,
  getUnregisteredReceivers,
  getSendersNeverReceived,
  getAllExceptQueries,
};

